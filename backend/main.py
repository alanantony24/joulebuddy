# ─────────────────────────────────────────────────────────────────────────────
# WattWise ML Backend
#
# Serves appliance-classification predictions to the React Native app.
# Reads REAL energy data from ClickHouse Cloud, runs the trained ML model
# for appliance classification, and returns the breakdown.
#
# Usage:
#   1. pip install -r requirements.txt
#   2. Fill in backend/.env with your ClickHouse credentials
#   3. Copy your .joblib model file into this folder
#   4. python main.py
#   5. Test: http://localhost:8000/api/energy?period=monthly
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import os

app = FastAPI(title="WattWise ML API")

# Allow all origins so Expo Go can connect from any device
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Environment / Config ────────────────────────────────────────────────────

# Load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass

CLICKHOUSE_HOST = os.environ.get("CLICKHOUSE_HOST", "")
CLICKHOUSE_PORT = int(os.environ.get("CLICKHOUSE_PORT", "8443"))
CLICKHOUSE_USER = os.environ.get("CLICKHOUSE_USER", "default")
CLICKHOUSE_PASSWORD = os.environ.get("CLICKHOUSE_PASSWORD", "")

# ── ClickHouse Client ───────────────────────────────────────────────────────

CH_CLIENT = None

try:
    import clickhouse_connect
    CH_CLIENT = clickhouse_connect.get_client(
        host=CLICKHOUSE_HOST,
        port=CLICKHOUSE_PORT,
        username=CLICKHOUSE_USER,
        password=CLICKHOUSE_PASSWORD,
        secure=True,
        connect_timeout=15,
        send_receive_timeout=30,
    )
    row_count = CH_CLIENT.command("SELECT count() FROM energy_consumption_table")
    print(f"✓ Connected to ClickHouse Cloud ({row_count:,} rows in energy_consumption_table)")
except Exception as e:
    print(f"⚠ ClickHouse connection failed ({e}). Will use synthetic fallback.")
    CH_CLIENT = None

# ── Model Loading ────────────────────────────────────────────────────────────

MODEL = None
MODEL_ACCURACY = 69  # your reported accuracy

MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_appliance_classifier.joblib")

try:
    import joblib
    MODEL = joblib.load(MODEL_PATH)
    print(f"✓ Loaded ML model from {MODEL_PATH}")
except Exception as e:
    print(f"⚠ Could not load model ({e}). Using rule-based fallback.")
    MODEL = None


# ── Configuration ────────────────────────────────────────────────────────────

APPLIANCE_MAP = {
    0: "Cooling",
    1: "Laundry",
    2: "Kitchen",
    3: "Baseload",
}

FEATURE_COLUMNS = [
    "Global_active_power",
    "hour",
    "day_of_week",
    "month",
    "day_of_year",
    "power_diff_1",
]

CHART_COLORS = {
    "Cooling": "#FF6B6B",
    "Laundry": "#FFB84D",
    "Kitchen": "#4ECDC4",
    "Baseload": "#A78BFA",
}


# ── Data Fetching ────────────────────────────────────────────────────────────

def fetch_from_clickhouse(num_hours: int) -> pd.DataFrame:
    """
    Query real energy data from ClickHouse Cloud.
    Returns a DataFrame with the columns needed for ML prediction.
    """
    # Get a representative sample of rows from the dataset.
    # We use LIMIT + ORDER BY to get a contiguous time window.
    query = f"""
    SELECT
        Global_active_power,
        Global_reactive_power,
        Voltage,
        Global_intensity,
        Sub_metering_1,
        Sub_metering_2,
        Sub_metering_3,
        toUInt8(substring(toString(Time), 1, 2)) AS hour,
        toDayOfWeek(toDate(Date)) AS day_of_week,
        toMonth(toDate(Date)) AS month,
        toDayOfYear(toDate(Date)) AS day_of_year
    FROM energy_consumption_table
    WHERE Global_active_power > 0
    ORDER BY Date DESC, Time DESC
    LIMIT {num_hours}
    """
    result = CH_CLIENT.query(query)
    columns = list(result.column_names) if hasattr(result, 'column_names') else [
        "Global_active_power", "Global_reactive_power", "Voltage",
        "Global_intensity", "Sub_metering_1", "Sub_metering_2", "Sub_metering_3",
        "hour", "day_of_week", "month", "day_of_year",
    ]

    df = pd.DataFrame(result.result_rows, columns=columns)

    # Compute power_diff_1 (difference from previous reading)
    df["power_diff_1"] = df["Global_active_power"].diff().fillna(0)

    # Add legacy columns used by build_breakdown
    df["hour_of_day"] = df["hour"]
    df["power_kw"] = df["Global_active_power"]

    return df


def generate_readings(num_hours: int) -> pd.DataFrame:
    """
    Synthetic fallback when ClickHouse is unavailable.
    """
    now = datetime.now()
    rows = []
    prev_power = 0.4

    for i in range(num_hours):
        ts = now - timedelta(hours=num_hours - i)
        hour = ts.hour
        dow = ts.weekday()
        month = ts.month
        doy = ts.timetuple().tm_yday

        base = 0.4
        if 7 <= hour <= 9 or 18 <= hour <= 23:
            base = 1.5
        if 12 <= hour <= 14:
            base = 1.0

        power = max(0.1, base + random.gauss(0, 0.5))
        power_diff = power - prev_power
        prev_power = power

        rows.append({
            "Global_active_power": round(power, 3),
            "hour": hour,
            "day_of_week": dow,
            "month": month,
            "day_of_year": doy,
            "power_diff_1": round(power_diff, 3),
            "hour_of_day": hour,
            "power_kw": round(power, 3),
        })

    return pd.DataFrame(rows)


def get_readings(num_hours: int) -> tuple[pd.DataFrame, str]:
    """
    Try ClickHouse first, fall back to synthetic data.
    Returns (dataframe, source_label).
    """
    if CH_CLIENT is not None:
        try:
            df = fetch_from_clickhouse(num_hours)
            if len(df) > 0:
                return df, "clickhouse"
        except Exception as e:
            print(f"⚠ ClickHouse query failed: {e}")
    return generate_readings(num_hours), "synthetic"


# ── Prediction helpers ───────────────────────────────────────────────────────

def rule_based_predict(df: pd.DataFrame) -> list:
    """Fallback when the ML model is not loaded."""
    preds = []
    for _, row in df.iterrows():
        h = row["hour_of_day"]
        p = row["power_kw"]
        if p > 2.0 and 18 <= h <= 23:
            preds.append(0)
        elif 7 <= h <= 10 or 18 <= h <= 20:
            preds.append(1)
        elif 11 <= h <= 14 or 17 <= h <= 19:
            preds.append(2)
        else:
            preds.append(3)
    return preds


def build_breakdown(df: pd.DataFrame, predictions: list) -> tuple:
    """Convert predictions into the JSON shape the app expects."""
    df = df.copy()

    df["appliance"] = [
        p if isinstance(p, str) else APPLIANCE_MAP.get(p, "Other")
        for p in predictions
    ]

    grouped = df.groupby("appliance")["power_kw"].sum()
    total = float(grouped.sum())

    data = []
    for appliance in ["Cooling", "Laundry", "Kitchen", "Baseload"]:
        kwh = float(grouped.get(appliance, 0))
        pct = int(round((kwh / total) * 100)) if total > 0 else 0
        data.append({
            "name": appliance,
            "value": round(kwh, 1),
            "pct": pct,
            "color": CHART_COLORS.get(appliance, "#94a3b8"),
        })

    data.sort(key=lambda x: x["pct"], reverse=True)
    return data, round(total, 1)


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/energy")
def get_energy_breakdown(period: str = "monthly"):
    """
    Returns appliance energy breakdown for the requested period.
    Queries real data from ClickHouse and runs the ML model.
    """
    period_config = {
        "daily":   {"hours": 24,      "label": "Today"},
        "weekly":  {"hours": 24 * 7,  "label": "This Week"},
        "monthly": {"hours": 24 * 30, "label": "This Month"},
    }
    cfg = period_config.get(period, period_config["monthly"])

    now = datetime.now()
    if period == "daily":
        badge = now.strftime("%d %b %Y")
    elif period == "weekly":
        start = now - timedelta(days=6)
        badge = f"{start.strftime('%d')} – {now.strftime('%d %b')}"
    else:
        badge = now.strftime("%b %Y")

    # Fetch real data from ClickHouse (falls back to synthetic)
    df, source = get_readings(cfg["hours"])

    # Run predictions
    if MODEL is not None:
        expected_columns = list(MODEL.feature_names_in_)
        features = df[expected_columns]
        predictions = MODEL.predict(features).tolist()
    else:
        predictions = rule_based_predict(df)

    data, total_kwh = build_breakdown(df, predictions)
    dominant = data[0]
    peak = f"{random.choice([6, 7, 8])} PM – {random.choice([9, 10, 11])} PM"

    return {
        "label": cfg["label"],
        "badge": badge,
        "subtitle": f"{cfg['label']} by category",
        "data": data,
        "insight": {
            "dominant": dominant["name"],
            "dominantPct": dominant["pct"],
            "peak": peak,
            "savings": f"${round(total_kwh * 0.012, 1)}",
        },
        "totalKwh": total_kwh,
        "modelAccuracy": MODEL_ACCURACY,
        "modelLoaded": MODEL is not None,
        "dataSource": source,
    }


@app.get("/api/quick-stats")
def get_quick_stats():
    """Summary stats for the dashboard header."""
    energy = get_energy_breakdown("monthly")
    total = energy["totalKwh"]
    efficiency = random.randint(82, 94)
    saved = round(total * 0.012 * random.uniform(0.8, 1.2), 1)
    carbon = round(total * 0.11)

    return [
        {"label": "Avg. Efficiency", "value": f"{efficiency}%"},
        {"label": "Total Saved", "value": f"${saved}"},
        {"label": "Carbon Offset", "value": f"{carbon} kg"},
        {"label": "Peak Hours", "value": "7–10 PM"},
    ]


@app.get("/api/health")
def health_check():
    """Quick health check endpoint."""
    return {
        "status": "ok",
        "model_loaded": MODEL is not None,
        "model_accuracy": MODEL_ACCURACY,
        "clickhouse_connected": CH_CLIENT is not None,
    }


# ── Gemini AI Chat ───────────────────────────────────────────────────────

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

GEMINI_CLIENT = None
try:
    import google.generativeai as genai
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_CLIENT = genai.GenerativeModel("gemini-2.0-flash")
        print("✓ Gemini AI configured")
    else:
        print("⚠ No GEMINI_API_KEY set. Chat will use fallback responses.")
except ImportError:
    print("⚠ google-generativeai not installed. Chat will use fallback responses.")

def get_energy_context() -> str:
    """Build a summary of the user's energy data for the AI system prompt."""
    try:
        energy = get_energy_breakdown("monthly")
        breakdown = ", ".join(
            f"{d['name']}: {d['pct']}% ({d['value']} kWh)" for d in energy["data"]
        )
        return (
            f"User's monthly energy: {energy['totalKwh']} kWh total. "
            f"Breakdown — {breakdown}. "
            f"Dominant category: {energy['insight']['dominant']} "
            f"({energy['insight']['dominantPct']}%). "
            f"Peak usage: {energy['insight']['peak']}. "
            f"Data source: {energy['dataSource']}."
        )
    except Exception:
        return "Energy data unavailable."

SYSTEM_PROMPT = (
    "You are JouleBuddy, a friendly and knowledgeable energy-saving AI assistant "
    "for the WattWise app in Singapore. You help users understand their electricity "
    "usage, suggest ways to save energy and money, and answer questions about "
    "sustainable living. Keep responses concise and practical. "
    "Use the user's real energy data when available to give personalized advice."
)

import json as _json
import time as _time

# Cache AI insight for 10 minutes to avoid Gemini rate limits
_ai_cache = {}        # key = period, value = response dict
_ai_cache_ts = {}     # key = period, value = timestamp
AI_CACHE_TTL = 600    # 10 minutes

@app.get("/api/ai-insight")
def get_ai_insight(period: str = "monthly"):
    """
    Uses Gemini to generate personalized JouleBuddy insight, recommended action,
    and notification content based on the user's real energy data.
    Returns structured JSON with insight text, action, and notifications.
    Caches results for 10 minutes to avoid hitting Gemini rate limits.
    """
    # Return cached response if still fresh
    now = _time.time()
    if period in _ai_cache and (now - _ai_cache_ts.get(period, 0)) < AI_CACHE_TTL:
        return _ai_cache[period]
    energy_context = get_energy_context()

    prompt = f"""{SYSTEM_PROMPT}

Current energy data: {energy_context}

Based on this data, generate a JSON response with EXACTLY this structure (no markdown, just raw JSON):
{{
  "insight": {{
    "text1": "One sentence about the user's dominant energy category and its percentage.",
    "text2": "One sentence with a specific, actionable observation about their usage pattern."
  }},
  "action": {{
    "title": "Short action title (3-5 words)",
    "body": "One specific, practical recommendation sentence.",
    "metric1": "e.g. -12% cooling",
    "metric2": "e.g. ~$4/mo saved"
  }},
  "notifications": [
    {{
      "type": "nudge",
      "title": "Short alert title",
      "body": "One sentence nudge about usage pattern.",
      "icon": "zap"
    }},
    {{
      "type": "congrats",
      "title": "Short praise title",
      "body": "One sentence congratulating a good habit.",
      "icon": "check"
    }},
    {{
      "type": "tip",
      "title": "Short tip title",
      "body": "One sentence energy-saving tip relevant to their data.",
      "icon": "lightbulb"
    }}
  ]
}}

Period context: {period}. Tailor the insight to this time period.
Make every response unique and specific to the data. Avoid generic advice.
Icon values must be one of: zap, check, lightbulb, thermometer, clock, trending-up, trending-down."""

    if GEMINI_CLIENT is not None:
        try:
            response = GEMINI_CLIENT.generate_content(prompt)
            text = response.text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                text = text.rsplit("```", 1)[0]
            data = _json.loads(text)
            result = {"source": "gemini", **data}
            _ai_cache[period] = result
            _ai_cache_ts[period] = _time.time()
            return result
        except Exception as e:
            print(f"⚠ Gemini AI insight failed ({e}), using fallback")

    # Fallback
    return {
        "source": "fallback",
        "insight": {
            "text1": "Cooling accounts for the highest electricity usage this period.",
            "text2": "Most usage occurs during evening hours when AC runs continuously.",
        },
        "action": {
            "title": "Optimise AC Usage",
            "body": "Set your air conditioner to 25°C and switch to Eco Mode.",
            "metric1": "-12% cooling",
            "metric2": "~$4/mo saved",
        },
        "notifications": [
            {
                "type": "nudge",
                "title": "Usage trending up",
                "body": "Your energy usage is higher than your 10-day average.",
                "icon": "trending-up",
            },
            {
                "type": "congrats",
                "title": "Great energy day",
                "body": "Your usage today is below the daily average. Keep it up!",
                "icon": "check",
            },
            {
                "type": "tip",
                "title": "Evening tip",
                "body": "Try setting your AC to 25°C during peak hours to save energy.",
                "icon": "thermometer",
            },
        ],
    }


# ── Run directly with: python main.py ────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n🔋 WattWise ML Backend starting...")
    print(f"   ClickHouse: {'connected' if CH_CLIENT else 'not connected'}")
    print(f"   ML Model:   {'loaded' if MODEL else 'fallback'}")
    print("   Docs:   http://localhost:8000/docs")
    print("   Test:   http://localhost:8000/api/energy?period=monthly")
    print("   Health: http://localhost:8000/api/health\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
