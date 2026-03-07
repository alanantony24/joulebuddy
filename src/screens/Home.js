import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import {
  Menu,
  Bell,
  Zap,
  Leaf,
  DollarSign,
  Clock,
  ChevronRight,
  TriangleAlert,
} from "lucide-react-native";
import StyledCard from "../components/StyledCard";
import StatCard from "../components/StatCard";
import {
  COLORS,
  GRADIENTS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../theme/theme";
import { useGP } from "../context/GPContext";

// ── Donut chart mock data ────────────────────────────────────────────────────

const CONSUMPTION_DATA = [
  { name: "Air Conditioning", value: 154, pct: 45, color: "#22c55e" },
  { name: "Water Heater", value: 68, pct: 20, color: "#14b8a6" },
  { name: "Lighting", value: 51, pct: 15, color: "#fbbf24" },
  { name: "Appliances", value: 68, pct: 20, color: "#86efac" },
];

const TOTAL_KWH = CONSUMPTION_DATA.reduce((s, d) => s + d.value, 0);

// ── Donut chart (react-native-svg) ───────────────────────────────────────────

function DonutChart({ data, size = 200, sw = 28 }) {
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  const GAP_LEN = (4 / 360) * C; // 4° visual gap per segment

  let cumPct = 0;

  return (
    <View style={donut.wrap}>
      <Svg width={size} height={size}>
        {/* faint background ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={COLORS.borderLight}
          strokeWidth={sw}
          fill="none"
        />
        {data.map((item, i) => {
          const pct = item.value / total;
          const segLen = Math.max(pct * C - GAP_LEN, 0);
          const gapLen = C - segLen;
          const rotation = -90 + cumPct * 360;
          cumPct += pct;
          return (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              stroke={item.color}
              strokeWidth={sw}
              strokeDasharray={`${segLen} ${gapLen}`}
              strokeLinecap="round"
              fill="none"
              rotation={rotation}
              origin={`${cx}, ${cy}`}
            />
          );
        })}
      </Svg>

      {/* Centre label */}
      <View style={donut.center}>
        <Text style={donut.total}>{TOTAL_KWH}</Text>
        <Text style={donut.unit}>kWh total</Text>
      </View>
    </View>
  );
}

const donut = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", marginVertical: SPACING.sm },
  center: { position: "absolute", alignItems: "center" },
  total: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textHeading,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 2,
  },
});

// ── Quick stats data ────────────────────────────────────────────────────────

const QUICK_STATS = [
  {
    Icon: Zap,
    label: "Avg. Efficiency",
    value: "87%",
    accent: COLORS.mint,
    bg: COLORS.mintPale,
  },
  {
    Icon: DollarSign,
    label: "Total Saved",
    value: "$24.80",
    accent: "#14b8a6",
    bg: "#F0FDFA",
  },
  {
    Icon: Leaf,
    label: "Carbon Offset",
    value: "42 kg",
    accent: COLORS.mint,
    bg: COLORS.mintLight,
  },
  {
    Icon: Clock,
    label: "Peak Hours",
    value: "2–4 PM",
    accent: COLORS.warning,
    bg: COLORS.warningLight,
  },
];

// ── Lightweight fade-up wrapper (replaces MotiView) ──────────────────────────

function FadeInView({ delay = 0, translateFrom = 20, duration = 420, style, children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateFrom)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [autoShift, setAutoShift] = useState(true);
  const { totalGP } = useGP();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.mint} />

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={GRADIENTS.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          {/* Menu button */}
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Menu size={20} color={COLORS.textHeading} strokeWidth={2} />
          </TouchableOpacity>

          {/* Centre greeting */}
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingText}>Hi, Alex 👋</Text>
            <Text style={styles.subText}>Welcome back</Text>
          </View>

          {/* Bell + notification dot */}
          <View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Bell size={20} color={COLORS.textHeading} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.notifDot} />
          </View>
        </View>

        {/* GP pill below greeting */}
        <View style={styles.gpRow}>
          <View style={styles.gpPill}>
            <Leaf size={12} color={COLORS.mintDark} strokeWidth={2.5} />
            <Text style={styles.gpPillText}>
              {totalGP.toLocaleString()} GP
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card: Monthly Consumption Donut ── */}
        <StyledCard delay={0}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Monthly Consumption</Text>
              <Text style={styles.cardSub}>Breakdown by category</Text>
            </View>
            <View style={styles.monthBadge}>
              <Text style={styles.monthText}>Mar 2026</Text>
            </View>
          </View>

          <DonutChart data={CONSUMPTION_DATA} />

          {/* Legend 2×2 */}
          <View style={styles.legendGrid}>
            {CONSUMPTION_DATA.map((d) => (
              <View key={d.name} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: d.color }]}
                />
                <Text style={styles.legendName} numberOfLines={1}>
                  {d.name}
                </Text>
                <Text style={styles.legendPct}>{d.pct}%</Text>
              </View>
            ))}
          </View>
        </StyledCard>

        {/* ── AI Insights Card ── */}
        <FadeInView delay={100}>
          <LinearGradient
            colors={["#0f172a", "#14291f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCard}
          >
            {/* Header row */}
            <View style={styles.aiHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>✨ AI Optimization</Text>
                <Text style={styles.aiSub}>Smart usage recommendations</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>

            {/* Toggle row */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Auto-shift peak usage</Text>
                <Text style={styles.toggleSub}>Reduces bill by ~18%</Text>
              </View>
              <Switch
                value={autoShift}
                onValueChange={setAutoShift}
                trackColor={{ false: "#475569", true: COLORS.mintLight }}
                thumbColor={autoShift ? COLORS.mint : "#94a3b8"}
              />
            </View>

            {/* Tips CTA */}
            <TouchableOpacity
              style={styles.tipsCta}
              activeOpacity={0.7}
            >
              <Zap size={14} color={COLORS.mint} strokeWidth={2} />
              <Text style={styles.tipsCtaText}>
                3 more optimisation tips available
              </Text>
              <ChevronRight
                size={14}
                color={COLORS.textMuted}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </LinearGradient>
        </FadeInView>

        {/* ── Quick Stats 2×2 ── */}
        <View>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            {QUICK_STATS.map(({ Icon, label, value, accent, bg }, i) => (
              <StatCard
                key={label}
                style={styles.halfCard}
                icon={<Icon size={16} color={accent} strokeWidth={2.2} />}
                label={label}
                value={value}
                accent={bg}
                delay={200 + i * 60}
              />
            ))}
          </View>
        </View>

        {/* ── Maintenance Alert ── */}
        <FadeInView delay={420} translateFrom={14} duration={380}>
          <View style={styles.alertCard}>
            <TriangleAlert
              size={20}
              color={COLORS.warning}
              strokeWidth={2}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Scheduled Maintenance</Text>
              <Text style={styles.alertBody}>
                15 Mar 2026 · 10 PM – 2 AM. MySP services may be briefly
                unavailable.
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* ── UOB One Card Promo ── */}
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={["#C62828", "#E53935"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoCard}
          >
            <View style={styles.promoLeft}>
              <Text style={styles.promoEyebrow}>FEATURED OFFER</Text>
              <Text style={styles.promoTitle}>UOB One Card</Text>
              <Text style={styles.promoSub}>
                Up to 10% cashback on utilities
              </Text>
            </View>
            <View style={styles.promoBadge}>
              <Text style={styles.promoPct}>10%</Text>
              <Text style={styles.promoCb}>cashback</Text>
              <ChevronRight
                size={18}
                color="rgba(255,255,255,0.80)"
                strokeWidth={2.5}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.mint },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  // ── Gradient header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  greetingBlock: { alignItems: "center", gap: 2 },
  greetingText: { ...TYPOGRAPHY.h2, color: COLORS.textWhite },
  subText: { ...TYPOGRAPHY.caption, color: COLORS.textWhiteSub },
  notifDot: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.orange,
    borderWidth: 2,
    borderColor: COLORS.mint,
  },
  gpRow: { alignItems: "flex-start" },
  gpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  gpPillText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },

  // ── Card internals
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  cardTitle: { ...TYPOGRAPHY.h4, color: COLORS.textHeading },
  cardSub: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  monthBadge: {
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  monthText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: "500" },

  // ── Legend
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "46%",
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { ...TYPOGRAPHY.caption, color: COLORS.textBody, flex: 1 },
  legendPct: { ...TYPOGRAPHY.captionBold, color: COLORS.textHeading },

  // ── AI card
  aiCard: {
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    gap: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.lg,
  },
  aiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  aiTitle: { ...TYPOGRAPHY.h4, color: COLORS.textWhite },
  aiSub: { ...TYPOGRAPHY.caption, color: "#94a3b8", marginTop: 2 },
  activePill: {
    backgroundColor: "rgba(34,197,94,0.20)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeText: { fontSize: 11, fontWeight: "600", color: "#4ade80" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  toggleLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.textWhite },
  toggleSub: { ...TYPOGRAPHY.caption, color: "#94a3b8", marginTop: 2 },
  tipsCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  tipsCtaText: { ...TYPOGRAPHY.bodySm, color: "#cbd5e1", flex: 1 },

  // ── Section
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textHeading,
    marginBottom: SPACING.sm,
  },

  // ── Stats grid
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  halfCard: { width: "47.6%" },

  // ── Alert
  alertCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.card,
    padding: SPACING.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    ...SHADOWS.xs,
  },
  alertTitle: { ...TYPOGRAPHY.captionBold, color: COLORS.warning },
  alertBody: {
    ...TYPOGRAPHY.caption,
    color: "#78350F",
    marginTop: 2,
    lineHeight: 16,
  },

  // ── Promo
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  promoLeft: { gap: 3 },
  promoEyebrow: { ...TYPOGRAPHY.micro, color: "rgba(255,255,255,0.65)" },
  promoTitle: { ...TYPOGRAPHY.h3, color: COLORS.textWhite },
  promoSub: { ...TYPOGRAPHY.caption, color: "rgba(255,255,255,0.75)" },
  promoBadge: { alignItems: "center", gap: 3 },
  promoPct: { fontSize: 28, fontWeight: "800", color: COLORS.textWhite },
  promoCb: { ...TYPOGRAPHY.micro, color: "rgba(255,255,255,0.80)" },
});
