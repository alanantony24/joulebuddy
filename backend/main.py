# ─────────────────────────────────────────────────────────────────────────────
# WattWise ML Backend
#
# Serves appliance-classification predictions to the React Native app.
# Uses the trained ML model exported from the Jupyter notebook.
#
# Usage:
#   1. pip install -r requirements.txt
#   2. Copy your .joblib model file into this folder
#   3. Update APPLIANCE_MAP and FEATURE_COLUMNS below to match YOUR model
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

# ── Model Loading ────────────────────────────────────────────────────────────
# Try to load the real model; fall back to a mock if not found.
# This means the backend ALWAYS works, even without the .joblib file.

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
# *** CHANGE THESE to match your actual model ***

# Map your model's numeric output labels → appliance names
# Look at your notebook to see what labels the model outputs
APPLIANCE_MAP = {
    0: "Cooling",
    1: "Laundry",
    2: "Kitchen",
    3: "Baseload",
}

# The feature columns your model expects (in the correct order)
# Look at what you pass to model.fit() / model.predict() in your notebook
# The exact columns your model was trained on in the Jupyter notebook
FEATURE_COLUMNS = [
    "Global_active_power", 
    "hour", 
    "day_of_week", 
    "month", 
    "day_of_year", 
    "power_diff_1"
]

CHART_COLORS = {
    "Cooling": "#FF6B6B",
    "Laundry": "#FFB84D",
    "Kitchen": "#4ECDC4",
    "Baseload": "#A78BFA",
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def generate_readings(num_hours: int) -> pd.DataFrame:
    """
    Generate synthetic meter readings to feed into the model.
    Includes the specific feature columns the .joblib model expects.
    """
    now = datetime.now()
    rows = []
    prev_power = 0.4  # Starting point for power_diff_1

    for i in range(num_hours):
        ts = now - timedelta(hours=num_hours - i)
        
        # Time features expected by the model
        hour = ts.hour
        dow = ts.weekday()
        month = ts.month
        doy = ts.timetuple().tm_yday
        
        # Simulate realistic power draw — higher during waking hours
        base = 0.4
        if 7 <= hour <= 9 or 18 <= hour <= 23:
            base = 1.5  # morning rush + evening
        if 12 <= hour <= 14:
            base = 1.0  # midday cooking
            
        power = max(0.1, base + random.gauss(0, 0.5))
        
        # Calculate the difference from the previous hour (power_diff_1)
        power_diff = power - prev_power
        prev_power = power

        rows.append({
            # --- Features for the ML Model ---
            "Global_active_power": round(power, 3),
            "hour": hour,
            "day_of_week": dow,
            "month": month,
            "day_of_year": doy,
            "power_diff_1": round(power_diff, 3),
            
            # --- Legacy features for the backend's internal math ---
            "hour_of_day": hour,
            "power_kw": round(power, 3),
        })
        
    return pd.DataFrame(rows)


def rule_based_predict(df: pd.DataFrame) -> list:
    """
    Simple rule-based fallback when the real ML model is not loaded.
    Mimics the kind of time-based classification your model does.
    """
    preds = []
    for _, row in df.iterrows():
        h = row["hour_of_day"]
        p = row["power_kw"]
        if p > 2.0 and 18 <= h <= 23:
            preds.append(0)  # Cooling (evening AC)
        elif 7 <= h <= 10 or 18 <= h <= 20:
            preds.append(1)  # Laundry (morning/evening)
        elif 11 <= h <= 14 or 17 <= h <= 19:
            preds.append(2)  # Kitchen (meal times)
        else:
            preds.append(3)  # Baseload (fridge, standby)
    return preds


def build_breakdown(df: pd.DataFrame, predictions: list) -> list:
    """Convert predictions into the JSON shape the app expects."""
    df = df.copy()
    
    # FIX 1: Safety net in case your model predicts strings instead of ints
    df["appliance"] = [
        p if isinstance(p, str) else APPLIANCE_MAP.get(p, "Other") 
        for p in predictions
    ]

    # power_kw for 1 hour ≈ kWh
    grouped = df.groupby("appliance")["power_kw"].sum()
    
    # FIX 2: Explicitly cast the Pandas sum (np.float64) to a native Python float
    total = float(grouped.sum())

    data = []
    for appliance in ["Cooling", "Laundry", "Kitchen", "Baseload"]:
        kwh = float(grouped.get(appliance, 0))
        
        # FIX 3: Explicitly cast the percentage to a native Python int
        pct = int(round((kwh / total) * 100)) if total > 0 else 0
        
        data.append({
            "name": appliance,
            "value": round(kwh, 1),
            "pct": pct,
            "color": CHART_COLORS.get(appliance, "#94a3b8"),
        })

    # Sort descending by percentage
    data.sort(key=lambda x: x["pct"], reverse=True)
    return data, round(total, 1)


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/energy")
def get_energy_breakdown(period: str = "monthly"):
    """
    Returns appliance energy breakdown for the requested period.
    Runs the ML model on synthetic readings.
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

    # Generate synthetic readings
    df = generate_readings(cfg["hours"])

    # Run predictions
    # Run predictions
    if MODEL is not None:
        # FIX: Ask the model exactly what columns it wants and in what order
        expected_columns = list(MODEL.feature_names_in_)
        
        # Slicing the dataframe with this list automatically reorders the columns perfectly!
        features = df[expected_columns] 
        
        predictions = MODEL.predict(features).tolist()
    else:
        predictions = rule_based_predict(df)

    data, total_kwh = build_breakdown(df, predictions)
    dominant = data[0]  # already sorted descending
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
    }


# ── Run directly with: python main.py ────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n🔋 WattWise ML Backend starting...")
    print("   Docs:   http://localhost:8000/docs")
    print("   Test:   http://localhost:8000/api/energy?period=monthly")
    print("   Health: http://localhost:8000/api/health\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
