// ─────────────────────────────────────────────────────────────────────────────
// Energy Data Service
//
// Fetches appliance-breakdown data from the ML backend.
// Falls back to local random generation when the API is unreachable
// (so the app always works, even without the server).
// ─────────────────────────────────────────────────────────────────────────────

// *** Change this to your computer's local IP when running the backend ***
// Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it.
// Expo Go on a phone cannot reach "localhost" — it needs the LAN IP.
const API_BASE = "http://172.29.17.111:8000";

const CHART_COLORS = ["#FF6B6B", "#FFB84D", "#4ECDC4", "#A78BFA"];

// ── API-based fetching ──────────────────────────────────────────────────────

function fetchWithTimeout(url, timeoutMs = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

export async function fetchEnergyFromAPI() {
  console.log("[EnergyService] Attempting to fetch from:", API_BASE);
  try {
    const [daily, weekly, monthly] = await Promise.all([
      fetchWithTimeout(`${API_BASE}/api/energy?period=daily`).then((r) => r.json()),
      fetchWithTimeout(`${API_BASE}/api/energy?period=weekly`).then((r) => r.json()),
      fetchWithTimeout(`${API_BASE}/api/energy?period=monthly`).then((r) => r.json()),
    ]);
    console.log("[EnergyService] ✓ API data received successfully");

    // The API returns data in the same shape the app expects,
    // but insight.text1 needs to be a function (the API sends raw strings).
    // We wrap them here so Home.js doesn't need to change.
    const wrapInsight = (apiData, periodLabel) => {
      const dom = apiData.data.reduce(
        (a, b) => (b.pct > a.pct ? b : a),
        apiData.data[0],
      );
      return {
        ...apiData,
        subtitle: `${apiData.label} by category`,
        insight: {
          text1: (_dom) =>
            `${dom.name} accounted for ${dom.pct}% of your electricity ${periodLabel} — the largest category. (ML model, ${apiData.modelAccuracy}% accuracy)`,
          text2: `Peak usage detected around ${apiData.insight.peak}. This prediction is based on our ML model trained on 100K household readings.`,
          peak: apiData.insight.peak,
          savings: `${apiData.insight.savings}/${periodLabel === "today" ? "day" : periodLabel === "this week" ? "week" : "month"}`,
        },
      };
    };

    return {
      daily: wrapInsight(daily, "today"),
      weekly: wrapInsight(weekly, "this week"),
      monthly: wrapInsight(monthly, "this month"),
      source: "ml-model",
    };
  } catch (err) {
    console.warn("[EnergyService] ✗ API call failed:", err.message);
    console.warn("[EnergyService] Make sure API_BASE IP is your Wi-Fi IP (not VirtualBox). Current:", API_BASE);
    return null;
  }
}

export async function fetchQuickStatsFromAPI() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/quick-stats`);
    return await res.json();
  } catch (err) {
    console.warn("[EnergyService] Quick stats fetch failed:", err.message);
    return null;
  }
}

// ── Local fallback (original random generation) ─────────────────────────────

const CATEGORIES = [
  { name: "Cooling", minPct: 40, maxPct: 48 },
  { name: "Laundry", minPct: 22, maxPct: 28 },
  { name: "Kitchen", minPct: 18, maxPct: 22 },
  { name: "Baseload", minPct: 8, maxPct: 12 },
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function buildCategoryData(totalKwh) {
  const raw = CATEGORIES.map((c) => ({
    name: c.name,
    rawPct: rand(c.minPct, c.maxPct),
  }));
  const sum = raw.reduce((s, r) => s + r.rawPct, 0);

  return raw.map((r, i) => {
    const pct = Math.round((r.rawPct / sum) * 100);
    return {
      name: r.name,
      value: round1((pct / 100) * totalKwh),
      pct,
      color: CHART_COLORS[i],
    };
  });
}

function peakHoursText() {
  const starts = [6, 7, 8];
  const s = starts[Math.floor(Math.random() * starts.length)];
  return `${s} PM – ${s + 3} PM`;
}

export function generateEnergyData() {
  const monthlyTotal = round1(rand(350, 450));
  const weeklyTotal = round1(monthlyTotal / 4.3);
  const dailyTotal = round1(monthlyTotal / 30);

  const today = new Date();
  const day = today.getDate();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mon = monthNames[today.getMonth()];
  const year = today.getFullYear();
  const weekStart = Math.max(1, day - 6);

  const dailyData = buildCategoryData(dailyTotal);
  const weeklyData = buildCategoryData(weeklyTotal);
  const monthlyData = buildCategoryData(monthlyTotal);

  const peak = peakHoursText();

  return {
    daily: {
      label: "Today",
      badge: `${day} ${mon} ${year}`,
      subtitle: "Today by category",
      data: dailyData,
      insight: {
        text1: (dom) =>
          `${dom.name} accounted for the highest electricity usage today (${dom.pct}%).`,
        text2: `Most of this usage occurred between ${peak}. This likely corresponds to air conditioning during evening hours.`,
        peak,
        savings: `$${round1(dailyTotal * 0.012)}/day`,
      },
    },
    weekly: {
      label: "This Week",
      badge: `${weekStart} – ${day} ${mon}`,
      subtitle: "This week by category",
      data: weeklyData,
      insight: {
        text1: (dom) =>
          `${dom.name} was your top consumer this week at ${dom.pct}% of total usage.`,
        text2: `Usage peaked on weekday evenings (Mon – Fri, ${peak}). Weekend usage was 30% lower.`,
        peak: "Weekday evenings",
        savings: `$${round1(weeklyTotal * 0.012)}/week`,
      },
    },
    monthly: {
      label: "This Month",
      badge: `${mon} ${year}`,
      subtitle: "This month by category",
      data: monthlyData,
      insight: {
        text1: (dom) =>
          `${dom.name} accounted for ${dom.pct}% of your electricity this month — the largest category.`,
        text2:
          "Your cooling usage is 8% higher than the neighbourhood average. Adjusting AC temperature could yield significant savings.",
        peak: `Evenings, ${peak}`,
        savings: `$${round1(monthlyTotal * 0.012)}/month`,
      },
    },
    source: "local",
  };
}

export function computeQuickStats(monthlyData) {
  const totalKwh = monthlyData.reduce((s, d) => s + d.value, 0);
  const efficiency = Math.round(rand(82, 94));
  const saved = round1(totalKwh * 0.012 * rand(0.8, 1.2));
  const carbon = Math.round(totalKwh * 0.11);

  return [
    { label: "Avg. Efficiency", value: `${efficiency}%` },
    { label: "Total Saved", value: `$${saved}` },
    { label: "Carbon Offset", value: `${carbon} kg` },
    { label: "Peak Hours", value: "7–10 PM" },
  ];
}
