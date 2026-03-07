"use client";

/**
 * SP Energy Coach — Web Dashboard
 * Stack: React (Next.js), Tailwind CSS, Recharts, Lucide React, Framer Motion
 *
 * Usage in Next.js App Router:
 *   app/page.jsx → import EnergyCoachDashboard from "@/components/EnergyCoachDashboard";
 *
 * Required dependencies (run in your Next.js project):
 *   npm install recharts framer-motion lucide-react
 *   (Tailwind CSS must already be configured)
 */

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import {
  Menu,
  Bell,
  Zap,
  Leaf,
  BarChart2,
  Settings,
  Home,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────────

const CONSUMPTION_DATA = [
  { name: "Air Conditioning", value: 154, pct: 45 },
  { name: "Water Heater", value: 68, pct: 20 },
  { name: "Lighting", value: 51, pct: 15 },
  { name: "Appliances", value: 68, pct: 20 },
];

const CHART_COLORS = ["#22c55e", "#14b8a6", "#fbbf24", "#86efac"];

const TOTAL_KWH = CONSUMPTION_DATA.reduce((sum, d) => sum + d.value, 0);

const QUICK_STATS = [
  {
    Icon: Zap,
    label: "Avg. Efficiency",
    value: "87%",
    accent: "text-green-500",
    bg: "bg-green-50",
  },
  {
    Icon: DollarSign,
    label: "Total Saved",
    value: "$24.80",
    accent: "text-teal-500",
    bg: "bg-teal-50",
  },
  {
    Icon: Leaf,
    label: "Carbon Offset",
    value: "42 kg",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    Icon: Clock,
    label: "Peak Hours",
    value: "2–4 PM",
    accent: "text-amber-500",
    bg: "bg-amber-50",
  },
];

const NAV_ITEMS = [
  { Icon: Home, label: "Dashboard" },
  { Icon: BarChart2, label: "Analytics" },
  { Icon: Leaf, label: "Energy" },
  { Icon: Settings, label: "Settings" },
];

// ── Framer Motion Variants ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.42, ease: "easeOut" },
  }),
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="bg-white rounded-2xl shadow-lg px-3 py-2 text-sm border border-slate-100">
      <p className="font-semibold text-slate-800">{name}</p>
      <p className="text-slate-500">{value} kWh</p>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
        checked ? "bg-green-400" : "bg-slate-600"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute h-5 w-5 rounded-full bg-white shadow"
        style={{ left: checked ? "calc(100% - 22px)" : "4px" }}
      />
    </button>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function EnergyCoachDashboard() {
  const [autoShift, setAutoShift] = useState(true);
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="min-h-screen bg-green-50 flex justify-center font-sans">
      <div className="w-full max-w-sm relative pb-32 px-4">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-12 pb-6">
          <button className="p-2 rounded-2xl bg-white shadow-sm border border-slate-100 active:scale-95 transition-transform">
            <Menu size={20} className="text-slate-700" />
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Hi, Alex 👋
            </h1>
            <p className="text-sm text-slate-500">Welcome back</p>
          </div>

          <div className="relative">
            <button className="p-2 rounded-2xl bg-white shadow-sm border border-slate-100 active:scale-95 transition-transform">
              <Bell size={20} className="text-slate-700" />
            </button>
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-orange-400 ring-2 ring-green-50" />
          </div>
        </div>

        {/* ── Hero Card: Monthly Consumption Donut ───────────────────────── */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-slate-900">
              Monthly Consumption
            </h2>
            <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full font-medium">
              Mar 2026
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-3">Breakdown by category</p>

          {/* Donut chart with centered label */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={CONSUMPTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  animationBegin={300}
                  animationDuration={900}
                >
                  {CONSUMPTION_DATA.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered total label — absolutely positioned over the SVG */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-slate-900 leading-none">
                {TOTAL_KWH}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                kWh total
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-3">
            {CONSUMPTION_DATA.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CHART_COLORS[i] }}
                />
                <span className="text-xs text-slate-600 truncate leading-tight">
                  {d.name}
                </span>
                <span className="ml-auto text-xs font-bold text-slate-800 flex-shrink-0">
                  {d.pct}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── AI Insights Card ──────────────────────────────────────────────── */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-3xl p-5 mb-4 overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #14291f 100%)",
          }}
        >
          {/* Decorative glow blob */}
          <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-green-500/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />

          {/* Card header */}
          <div className="flex items-start justify-between mb-4 relative">
            <div>
              <h2 className="text-base font-bold text-white mb-0.5">
                ✨ AI Optimization
              </h2>
              <p className="text-sm text-slate-400">
                Smart usage recommendations
              </p>
            </div>
            <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
              Active
            </span>
          </div>

          {/* Toggle row */}
          <div className="flex items-center justify-between bg-white/[0.06] rounded-2xl px-4 py-3 mb-3 relative gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Auto-shift peak usage
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Reduces bill by ~18%
              </p>
            </div>
            <Toggle checked={autoShift} onChange={setAutoShift} />
          </div>

          {/* Tips CTA */}
          <button className="w-full flex items-center gap-2 text-sm text-slate-300 relative group hover:text-green-400 transition-colors">
            <Zap size={14} className="text-green-400 flex-shrink-0" />
            <span>3 more optimisation tips available</span>
            <ChevronRight
              size={14}
              className="ml-auto text-slate-500 group-hover:text-green-400 transition-colors"
            />
          </button>
        </motion.div>

        {/* ── Quick Stats Grid ──────────────────────────────────────────────── */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-base font-bold text-slate-900 mb-3">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_STATS.map(({ Icon, label, value, accent, bg }, i) => (
              <motion.div
                key={label}
                custom={3 + i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2.5"
              >
                <div
                  className={`${bg} h-9 w-9 rounded-2xl flex items-center justify-center`}
                >
                  <Icon size={16} className={accent} strokeWidth={2.2} />
                </div>
                <p className="text-xs text-slate-500 leading-tight">{label}</p>
                <p className={`text-2xl font-extrabold ${accent} leading-none`}>
                  {value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Floating Bottom Navigation ────────────────────────────────────── */}
        <nav
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-full px-5 py-3 flex items-center gap-2 shadow-xl z-50"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.28)" }}
        >
          {NAV_ITEMS.map(({ Icon, label }, i) => {
            const isActive = activeNav === i;
            return (
              <button
                key={label}
                onClick={() => setActiveNav(i)}
                aria-label={label}
                className={`flex items-center justify-center transition-all duration-200 rounded-full ${
                  isActive
                    ? "bg-green-500/20 text-green-400 px-3 py-1.5 gap-1.5"
                    : "text-slate-400 px-2.5 py-1.5 hover:text-slate-200"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold text-green-400 overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
