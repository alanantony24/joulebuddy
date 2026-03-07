// ─────────────────────────────────────────────────────────────────────────────
// Energy Data Service
//
// Generates realistic Singapore household energy consumption data
// simulating aggregation from a 100K-row dataset.
// A typical 4-room HDB flat uses ~350–450 kWh/month.
// ─────────────────────────────────────────────────────────────────────────────

const CHART_COLORS = ["#FF6B6B", "#FFB84D", "#4ECDC4", "#A78BFA"];

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
  // Generate random percentages within bounds, then normalise to 100%
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
  // Monthly: 350–450 kWh
  const monthlyTotal = round1(rand(350, 450));
  // Weekly ≈ monthly / 4.3
  const weeklyTotal = round1(monthlyTotal / 4.3);
  // Daily ≈ monthly / 30
  const dailyTotal = round1(monthlyTotal / 30);

  const today = new Date();
  const day = today.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
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
