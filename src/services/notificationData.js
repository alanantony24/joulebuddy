// ─────────────────────────────────────────────────────────────────────────────
// Smart Notification Generator
//
// Generates realistic energy-monitoring notifications: spike alerts,
// usage trend comparisons, and pattern observations.
// ─────────────────────────────────────────────────────────────────────────────

// Average daily kWh for a Singapore 4-room HDB flat
const AVG_DAILY_KWH = 13;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate smart notifications from daily energy breakdown data.
 * @param {Array} dailyData — array of { name, value, pct, color }
 * @returns {Array} notification objects
 */
export function generateSmartNotifications(dailyData) {
  if (!dailyData || dailyData.length === 0) return fallbackNotifications();

  const totalKwh = dailyData.reduce((s, d) => s + d.value, 0);
  const dominant = [...dailyData].sort((a, b) => b.pct - a.pct)[0];
  const notifications = [];
  let id = 1;

  // ── 1. Spike alert (if total usage is above average) ──────────────────
  if (totalKwh > AVG_DAILY_KWH) {
    const spikeHour = pick(["2 AM", "3 AM", "4 AM", "11 PM", "1 AM"]);
    notifications.push({
      id: `n${id++}`,
      title: "Unusual spike detected",
      body: `Unusual electricity spike detected at ${spikeHour}. This could be a faulty appliance or forgotten device.`,
      time: "1h ago",
      read: false,
      icon: "Zap",
      type: "nudge",
    });
  }

  // ── 2. Trend comparison ───────────────────────────────────────────────
  const trendPct = randInt(8, 35);
  const trendUp = totalKwh > AVG_DAILY_KWH * 0.95;

  if (trendUp) {
    notifications.push({
      id: `n${id++}`,
      title: "Usage trending up",
      body: `You've used ${trendPct}% more electricity compared to the past 10 days.`,
      time: "3h ago",
      read: false,
      icon: "Zap",
      type: "nudge",
    });
  } else {
    notifications.push({
      id: `n${id++}`,
      title: "Below your average",
      body: `Your usage is ${trendPct}% lower than your 10-day average. Keep it going!`,
      time: "3h ago",
      read: true,
      icon: "Leaf",
      type: "congrats",
    });
  }

  // ── 3. Dominant category insight ──────────────────────────────────────
  if (dominant.pct >= 35) {
    const tips = {
      Cooling: "Try setting your AC to 25°C or using a fan during cooler hours.",
      Kitchen: "Batch cooking and using lids can cut kitchen energy by up to 30%.",
      Laundry: "Running full loads after 10 PM saves the most energy.",
      Baseload: "Check for devices left on standby — they add up overnight.",
    };
    notifications.push({
      id: `n${id++}`,
      title: `${dominant.name} is ${dominant.pct}% of your usage`,
      body: tips[dominant.name] || "Consider optimising this category to save more.",
      time: "5h ago",
      read: true,
      icon: "Sparkles",
      type: "info",
    });
  }

  // ── 4. Congrats if under daily average ────────────────────────────────
  if (totalKwh <= AVG_DAILY_KWH) {
    notifications.push({
      id: `n${id++}`,
      title: "Great energy day",
      body: `Only ${totalKwh.toFixed(1)} kWh used so far — that's below the daily average of ${AVG_DAILY_KWH} kWh.`,
      time: "Today",
      read: true,
      icon: "Leaf",
      type: "congrats",
    });
  }

  // ── 5. Bill reminder (always present) ─────────────────────────────────
  notifications.push({
    id: `n${id}`,
    title: "Bill due in 5 days",
    body: "Your March bill of $142.50 is due on 13 Mar.",
    time: "1d ago",
    read: true,
    icon: "Receipt",
    type: "info",
  });

  return notifications;
}

/** Static fallback when no energy data is available yet */
function fallbackNotifications() {
  return [
    {
      id: "f1",
      title: "Welcome to WattWise",
      body: "We're analysing your energy data — check back soon for insights.",
      time: "Just now",
      read: false,
      icon: "Sparkles",
      type: "info",
    },
  ];
}
