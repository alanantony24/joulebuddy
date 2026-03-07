import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import {
  Menu,
  Bell,
  Zap,
  Leaf,
  DollarSign,
  Clock,
  TriangleAlert,
  Thermometer,
  Camera,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Bot,
  X,
  Home as HomeIcon,
  Receipt,
  BatteryCharging,
  User,
  Flame,
  Globe,
  TreePine,
  Car,
  ChevronRight,
  Target,
  CircleCheckBig,
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
import { generateEnergyData, computeQuickStats, fetchEnergyFromAPI, fetchQuickStatsFromAPI, fetchAIInsight } from "../services/energyDataService";
import { generateSmartNotifications } from "../services/notificationData";
import { USER_PROFILE } from "../data/profileData";

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;

// ── Notification icon resolver ───────────────────────────────────────────────

const NOTIF_ICONS = {
  Receipt: Receipt,
  Leaf: Leaf,
  Zap: Zap,
  Flame: Flame,
  Sparkles: Sparkles,
};

// ── Donut chart (react-native-svg) ───────────────────────────────────────────

function DonutChart({ data, totalKwh, size = 200, sw = 28 }) {
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  const GAP_LEN = (4 / 360) * C;

  let cumPct = 0;

  // Format: 5.2 → "5.2",  154 → "154"
  const display = totalKwh % 1 === 0 ? String(totalKwh) : totalKwh.toFixed(1);

  return (
    <View style={donut.wrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={COLORS.borderLight} strokeWidth={sw} fill="none"
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
              cx={cx} cy={cy} r={r}
              stroke={item.color} strokeWidth={sw}
              strokeDasharray={`${segLen} ${gapLen}`}
              strokeLinecap="round" fill="none"
              rotation={rotation} origin={`${cx}, ${cy}`}
            />
          );
        })}
      </Svg>
      <View style={donut.center}>
        <Text style={donut.total}>{display}</Text>
        <Text style={donut.unit}>kWh total</Text>
      </View>
    </View>
  );
}

const donut = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", marginVertical: SPACING.sm },
  center: { position: "absolute", alignItems: "center" },
  total: { fontSize: 30, fontWeight: "800", color: COLORS.textHeading, letterSpacing: -0.5 },
  unit: { fontSize: 10, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 2 },
});

// ── Period selector (inline segmented pills) ────────────────────────────────

const PERIOD_OPTIONS = [
  { key: "daily",   short: "Day" },
  { key: "weekly",  short: "Week" },
  { key: "monthly", short: "Month" },
];

function PeriodPills({ selected, onSelect }) {
  return (
    <View style={seg.track}>
      {PERIOD_OPTIONS.map(({ key, short }) => {
        const active = key === selected;
        return (
          <TouchableOpacity
            key={key}
            style={[seg.pill, active && seg.pillActive]}
            activeOpacity={0.7}
            onPress={() => onSelect(key)}
          >
            <Text style={[seg.pillText, active && seg.pillTextActive]}>
              {short}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const seg = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  pillActive: {
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
  },
  pillText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: COLORS.mint,
  },
});

// ── Quick stats icon mapping ────────────────────────────────────────────────

const STAT_ICONS = [
  { Icon: Zap,        accent: COLORS.mint,    bg: COLORS.mintPale },
  { Icon: DollarSign, accent: "#14b8a6",      bg: "#F0FDFA" },
  { Icon: Leaf,       accent: COLORS.mint,    bg: COLORS.mintLight },
  { Icon: Clock,      accent: COLORS.warning, bg: COLORS.warningLight },
];

// ── Lightweight fade-up wrapper ──────────────────────────────────────────────

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

export default function HomeScreen({ navigation }) {
  const [taskDone, setTaskDone] = useState(false);
  const [period, setPeriod] = useState("daily");
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const [impactVisible, setImpactVisible] = useState(false);
  const { totalGP, completeQuest, completedQuestIds } = useGP();

  const greenUpDone = taskDone || completedQuestIds.has("ac25");

  // Energy data — try ML API first, fall back to local generation
  const [energyData, setEnergyData] = useState(() => generateEnergyData());
  const [dataSource, setDataSource] = useState("local");
  const [quickStatsData, setQuickStatsData] = useState(() =>
    computeQuickStats(generateEnergyData().monthly.data),
  );
  const [aiInsight, setAiInsight] = useState(null);

  useEffect(() => {
    let cancelled = false;
    console.log("[Home] Fetching energy data + AI insight in parallel...");

    // Fetch energy data and AI insight in parallel
    const energyPromise = (async () => {
      const apiData = await fetchEnergyFromAPI();
      if (apiData && !cancelled) {
        console.log("[Home] ✓ Using ML model data");
        setEnergyData(apiData);
        setDataSource("ml-model");
        const apiStats = await fetchQuickStatsFromAPI();
        if (apiStats && !cancelled) setQuickStatsData(apiStats);
        else if (!cancelled) setQuickStatsData(computeQuickStats(apiData.monthly.data));
      } else {
        console.log("[Home] Using local fallback data");
      }
    })();

    const aiPromise = (async () => {
      const ai = await fetchAIInsight("monthly");
      if (ai && !cancelled) {
        console.log("[Home] ✓ AI insight loaded (source:", ai.source, ")");
        setAiInsight(ai);
      }
    })();

    Promise.all([energyPromise, aiPromise]);
    return () => { cancelled = true; };
  }, []);

  const PERIOD_DATA = energyData;

  // Derived data from selected period
  const current = PERIOD_DATA[period];
  const chartData = current.data;
  const totalKwh = useMemo(
    () => chartData.reduce((s, d) => s + d.value, 0),
    [chartData],
  );
  const dominant = useMemo(
    () => chartData.reduce((a, b) => (a.value > b.value ? a : b)),
    [chartData],
  );

  // ── National Impact computed values ──
  const co2SavedToday = useMemo(() => {
    // Average SG household ~13 kWh/day. Savings from optimisation ~8%
    const dailyData = energyData.daily?.data ?? [];
    const dailyKwh = dailyData.reduce((s, d) => s + d.value, 0);
    return Math.round(dailyKwh * 0.08 * 0.4082 * 10) / 10; // 0.4082 kg CO2/kWh SG grid factor
  }, [energyData]);

  // Scale to 10% of ~1.3M SG households
  const nationalTonnes = useMemo(() => Math.round(co2SavedToday * 130000 / 1000), [co2SavedToday]);
  const carKmEquiv = useMemo(() => Math.round(nationalTonnes * 1000 / 0.12), [nationalTonnes]); // ~0.12 kg per km
  const treesEquiv = useMemo(() => Math.round(nationalTonnes * 1000 / 21.77), [nationalTonnes]); // ~21.77 kg per tree/year
  const greenPlan2030Pct = 38; // Singapore Green Plan progress placeholder

  // ── Smart notifications from daily energy data (AI-enhanced) ──
  const notifications = useMemo(() => {
    // If AI insight has notifications, use those
    if (aiInsight?.notifications?.length) {
      return aiInsight.notifications.map((n, i) => ({
        id: `ai-${i}`,
        ...n,
        time: i === 0 ? "Just now" : i === 1 ? "1h ago" : "3h ago",
        read: false,
      }));
    }
    return generateSmartNotifications(energyData.daily?.data ?? []);
  }, [energyData, aiInsight]);
  const hasUnread = notifications.some((n) => !n.read);

  async function handleGreenUpVerify() {
    if (greenUpDone) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "Camera access is required to verify this quest.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled) {
      setTaskDone(true);
      completeQuest("ac25", 10);
    }
  }

  function handleOpenNotifications() {
    setNotifVisible(true);
    setNotifRead(true);
  }

  const NAV_ITEMS = [
    { label: "Home",     screen: "Home",       Icon: HomeIcon },
    { label: "Bills",    screen: "Bills",      Icon: Receipt },
    { label: "EV",       screen: "EV",         Icon: BatteryCharging },
    { label: "Buddy",    screen: "JouleBuddy", Icon: Bot },
    { label: "Profile",  screen: "Profile",    Icon: User },
  ];

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
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={() => setMenuVisible(true)}>
            <Menu size={20} color={COLORS.textHeading} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingText}>Hi, {USER_PROFILE.firstName} 👋</Text>
            <Text style={styles.subText}>Welcome back</Text>
          </View>
          <View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={handleOpenNotifications}>
              <Bell size={20} color={COLORS.textHeading} strokeWidth={2} />
            </TouchableOpacity>
            {!notifRead && hasUnread && <View style={styles.notifDot} />}
          </View>
        </View>
        <View style={styles.gpRow}>
          <View style={styles.gpPill}>
            <Leaf size={12} color={COLORS.mintDark} strokeWidth={2.5} />
            <Text style={styles.gpPillText}>{totalGP.toLocaleString()} GP</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ──────────────────────────────────────────────────────────────── */}
        {/* SECTION 1: Appliance Energy Breakdown                          */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <StyledCard delay={0} style={styles.breakdownCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Energy Breakdown</Text>
            <PeriodPills selected={period} onSelect={setPeriod} />
          </View>
          <Text style={styles.cardSub}>
            {current.subtitle} · {current.badge}
          </Text>

          {dataSource === "ml-model" && (
            <View style={styles.mlBadge}>
              <Bot size={12} color={COLORS.mint} strokeWidth={2} />
              <Text style={styles.mlBadgeText}>ML-Powered Prediction</Text>
            </View>
          )}

          <DonutChart data={chartData} totalKwh={totalKwh} />

          {/* Dominant highlight */}
          <View style={styles.dominantRow}>
            <TriangleAlert size={14} color={COLORS.warning} strokeWidth={2.5} />
            <Text style={styles.dominantText}>
              <Text style={{ fontWeight: "700", color: COLORS.textHeading }}>
                {dominant.name} ({dominant.pct}%)
              </Text>
              {" "}is your highest usage category
            </Text>
          </View>

          {/* Legend */}
          <View style={styles.legendGrid}>
            {chartData.map((d) => (
              <View key={d.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                <Text style={styles.legendName} numberOfLines={1}>{d.name}</Text>
                <Text style={styles.legendPct}>
                  {d.value % 1 === 0 ? d.value : d.value.toFixed(1)} kWh
                </Text>
              </View>
            ))}
          </View>
        </StyledCard>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* SECTION 2: JouleBuddy Insight                                */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <FadeInView delay={80}>
          <LinearGradient
            colors={["#0f172a", "#14291f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCard}
          >
            <View style={styles.aiHeaderRow}>
              <View style={styles.aiIconCircle}>
                <Bot size={18} color={COLORS.mint} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>JouleBuddy</Text>
                <Text style={styles.aiSub}>Personalised insight</Text>
              </View>
              <View style={styles.activePill}>
                <Sparkles size={10} color="#4ade80" strokeWidth={2.5} />
                <Text style={styles.activeText}>Live</Text>
              </View>
            </View>

            <View style={styles.insightBlock}>
              <Text style={styles.insightText}>
                <Text style={styles.insightBold}>
                  {aiInsight?.insight?.text1 ?? current.insight.text1(dominant)}
                </Text>
              </Text>
              <Text style={[styles.insightText, { marginTop: 8 }]}>
                {aiInsight?.insight?.text2 ?? current.insight.text2}
              </Text>
            </View>

            <View style={styles.savingsRow}>
              <TrendingDown size={14} color={COLORS.mint} strokeWidth={2} />
              <Text style={styles.savingsText}>
                Potential savings:{" "}
                <Text style={{ fontWeight: "700", color: COLORS.mint }}>
                  {current.insight.savings}
                </Text>
              </Text>
            </View>

            {aiInsight?.source === "gemini" && (
              <View style={styles.aiPoweredRow}>
                <Sparkles size={10} color="rgba(74,222,128,0.6)" strokeWidth={2} />
                <Text style={styles.aiPoweredText}>Powered by Gemini AI</Text>
              </View>
            )}
          </LinearGradient>
        </FadeInView>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* SECTION 3: Recommended Action                                  */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <FadeInView delay={160}>
          <View style={styles.recoCard}>
            <View style={styles.recoIconCircle}>
              <Thermometer size={20} color={COLORS.mint} strokeWidth={2} />
            </View>
            <Text style={styles.recoTitle}>
              {aiInsight?.action?.title ?? "Recommended Action"}
            </Text>
            <Text style={styles.recoBody}>
              {aiInsight?.action?.body ?? (
                <>
                  Set your air conditioner to{" "}
                  <Text style={{ fontWeight: "700", color: COLORS.textHeading }}>25 °C</Text>
                  {" "}and switch to{" "}
                  <Text style={{ fontWeight: "700", color: COLORS.textHeading }}>Eco Mode</Text>.
                </>
              )}
            </Text>
            <View style={styles.recoMetrics}>
              <View style={styles.recoMetricPill}>
                <TrendingDown size={12} color={COLORS.mint} strokeWidth={2.5} />
                <Text style={styles.recoMetricText}>
                  {aiInsight?.action?.metric1 ?? "-12% cooling"}
                </Text>
              </View>
              <View style={styles.recoMetricPill}>
                <DollarSign size={12} color="#14b8a6" strokeWidth={2.5} />
                <Text style={styles.recoMetricText}>
                  {aiInsight?.action?.metric2 ?? "~$4/mo saved"}
                </Text>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* SECTION 4: GreenUp Task                                        */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <FadeInView delay={240}>
          <View style={[styles.greenUpCard, greenUpDone && styles.greenUpCardDone]}>
            <View style={styles.greenUpHeader}>
              <View style={styles.greenUpIconCircle}>
                <Leaf size={18} color={COLORS.textWhite} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.greenUpLabel}>GreenUp Task</Text>
                <Text style={styles.greenUpTitle}>Tonight: Set your AC to 25 °C</Text>
              </View>
              <View style={styles.greenUpGpPill}>
                <Text style={styles.greenUpGpText}>+10 GP</Text>
              </View>
            </View>

            <Text style={styles.greenUpBody}>
              Snap a photo of your thermostat to earn GreenUp credits.
            </Text>

            {greenUpDone ? (
              <View style={styles.greenUpDoneBanner}>
                <Zap size={16} color={COLORS.mint} strokeWidth={2.5} />
                <Text style={styles.greenUpDoneText}>
                  Verified! +10 GreenUp credits awarded
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.greenUpBtn}
                activeOpacity={0.8}
                onPress={handleGreenUpVerify}
              >
                <Camera size={16} color={COLORS.textWhite} strokeWidth={2.5} />
                <Text style={styles.greenUpBtnText}>Verify with Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </FadeInView>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* SECTION 4.5: National Impact Card                              */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <FadeInView delay={280}>
          <TouchableOpacity
            style={styles.impactCard}
            activeOpacity={0.85}
            onPress={() => setImpactVisible(true)}
          >
            <View style={styles.impactHeader}>
              <View style={styles.impactIconCircle}>
                <Globe size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.impactTitle}>National Impact</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} strokeWidth={2} />
            </View>

            <View style={styles.impactStatsRow}>
              <View style={styles.impactStatItem}>
                <Text style={styles.impactStatValue}>{co2SavedToday} kg</Text>
                <Text style={styles.impactStatLabel}>CO2 saved today</Text>
              </View>
              <View style={styles.impactDivider} />
              <View style={styles.impactStatItem}>
                <Text style={styles.impactStatValue}>{nationalTonnes}t</Text>
                <Text style={styles.impactStatLabel}>if 10% adopt</Text>
              </View>
            </View>

            <View style={styles.impactFooter}>
              <Text style={styles.impactFooterText}>
                Singapore Green Plan 2030
              </Text>
              <ChevronRight size={14} color="#00897B" strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </FadeInView>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* SECTION 5: Quick Stats                                         */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <View>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            {quickStatsData.map(({ label, value }, i) => {
              const { Icon, accent, bg } = STAT_ICONS[i];
              return (
                <StatCard
                  key={label}
                  style={styles.halfCard}
                  icon={<Icon size={16} color={accent} strokeWidth={2.2} />}
                  label={label}
                  value={value}
                  accent={bg}
                  delay={320 + i * 60}
                />
              );
            })}
          </View>
        </View>

        {/* ── Maintenance Alert ── */}
        <FadeInView delay={560} translateFrom={14} duration={380}>
          <View style={styles.alertCard}>
            <TriangleAlert size={20} color={COLORS.warning} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Scheduled Maintenance</Text>
              <Text style={styles.alertBody}>
                15 Mar 2026 · 10 PM – 2 AM. MySP services may be briefly
                unavailable.
              </Text>
            </View>
          </View>
        </FadeInView>
      </ScrollView>

      {/* ── Menu Drawer Modal ── */}
      <Modal visible={menuVisible} animationType="fade" transparent onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.drawerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuVisible(false)} />
          <View style={styles.drawerPanel}>
            {/* User info */}
            <View style={styles.drawerUserSection}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerInitials}>{USER_PROFILE.initials}</Text>
              </View>
              <Text style={styles.drawerName}>{USER_PROFILE.name}</Text>
              <Text style={styles.drawerEmail}>{USER_PROFILE.email}</Text>
              <View style={styles.drawerGpPill}>
                <Leaf size={12} color={COLORS.mintDark} strokeWidth={2.5} />
                <Text style={styles.drawerGpText}>{totalGP.toLocaleString()} GP</Text>
              </View>
            </View>

            <View style={styles.drawerDivider} />

            {/* Navigation links */}
            {NAV_ITEMS.map(({ label, screen, Icon }) => (
              <TouchableOpacity
                key={screen}
                style={styles.drawerItem}
                activeOpacity={0.7}
                onPress={() => { setMenuVisible(false); navigation.navigate(screen); }}
              >
                <Icon size={20} color={COLORS.mint} strokeWidth={2} />
                <Text style={styles.drawerItemText}>{label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.drawerDivider} />
            <Text style={styles.drawerVersion}>WattWise v3.2.1</Text>
          </View>
        </View>
      </Modal>

      {/* ── Notification Panel Modal ── */}
      <Modal visible={notifVisible} animationType="slide" transparent onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.notifOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setNotifVisible(false)} />
          <View style={styles.notifSheet}>
            <View style={styles.notifHandle} />
            <View style={styles.notifHeader}>
              <Bell size={20} color={COLORS.mint} strokeWidth={2} />
              <Text style={styles.notifTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)} style={{ padding: SPACING.xs }}>
                <X size={20} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {notifications.map((notif) => {
                const NIcon = NOTIF_ICONS[notif.icon] ?? Bell;
                const isNudge = notif.type === "nudge";
                const isCongrats = notif.type === "congrats";
                return (
                  <View key={notif.id} style={[
                    styles.notifItem,
                    isNudge && styles.notifItemNudge,
                    isCongrats && styles.notifItemCongrats,
                  ]}>
                    <View style={[
                      styles.notifIconCircle,
                      isNudge && { backgroundColor: "#FEF3C7" },
                      isCongrats && { backgroundColor: COLORS.mintPale },
                    ]}>
                      {isNudge ? (
                        <TrendingUp size={16} color="#D97706" strokeWidth={2} />
                      ) : isCongrats ? (
                        <CircleCheckBig size={16} color={COLORS.mint} strokeWidth={2} />
                      ) : (
                        <NIcon size={16} color={COLORS.mint} strokeWidth={2} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.notifItemHeader}>
                        <Text style={styles.notifItemTitle}>{notif.title}</Text>
                        {!notif.read && <View style={styles.notifUnreadDot} />}
                      </View>
                      <Text style={styles.notifItemBody}>{notif.body}</Text>
                      <Text style={styles.notifItemTime}>{notif.time}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── National Impact Detail Modal ── */}
      <Modal visible={impactVisible} animationType="slide" transparent onRequestClose={() => setImpactVisible(false)}>
        <View style={styles.impactModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setImpactVisible(false)} />
          <View style={styles.impactModalSheet}>
            <View style={styles.notifHandle} />
            <View style={styles.impactModalHeader}>
              <Globe size={22} color={COLORS.mint} strokeWidth={2} />
              <Text style={styles.impactModalTitle}>National Impact</Text>
              <TouchableOpacity onPress={() => setImpactVisible(false)} style={{ padding: SPACING.xs }}>
                <X size={20} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Green Plan 2030 Progress */}
              <View style={styles.impactProgressSection}>
                <Text style={styles.impactSectionLabel}>Singapore Green Plan 2030</Text>
                <View style={styles.impactRingWrap}>
                  <Svg width={130} height={130}>
                    <Circle
                      cx={65} cy={65} r={52}
                      stroke={COLORS.borderLight} strokeWidth={12} fill="none"
                    />
                    <Circle
                      cx={65} cy={65} r={52}
                      stroke={COLORS.mint} strokeWidth={12} fill="none"
                      strokeDasharray={`${(greenPlan2030Pct / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                      strokeLinecap="round"
                      rotation={-90} origin="65, 65"
                    />
                  </Svg>
                  <View style={styles.impactRingCenter}>
                    <Text style={styles.impactRingPct}>{greenPlan2030Pct}%</Text>
                    <Text style={styles.impactRingLabel}>Progress</Text>
                  </View>
                </View>
                <Text style={styles.impactProgressSub}>
                  Household energy optimisation target
                </Text>
              </View>

              {/* Your Savings Today */}
              <View style={styles.impactDetailCard}>
                <Target size={18} color={COLORS.mint} strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.impactDetailLabel}>Your Savings Today</Text>
                  <Text style={styles.impactDetailValue}>{co2SavedToday} kg CO2</Text>
                </View>
              </View>

              {/* National Projection */}
              <View style={styles.impactProjectionCard}>
                <Text style={styles.impactProjectionHeader}>
                  If 10% of Singapore households adopt this
                </Text>
                <Text style={styles.impactProjectionValue}>
                  {nationalTonnes} tonnes CO2/day
                </Text>

                <View style={styles.impactEquivRow}>
                  <View style={styles.impactEquivItem}>
                    <View style={[styles.impactEquivIcon, { backgroundColor: "#EFF6FF" }]}>
                      <Car size={18} color="#3B82F6" strokeWidth={2} />
                    </View>
                    <Text style={styles.impactEquivValue}>{carKmEquiv.toLocaleString()}</Text>
                    <Text style={styles.impactEquivLabel}>car km removed</Text>
                  </View>
                  <View style={styles.impactEquivItem}>
                    <View style={[styles.impactEquivIcon, { backgroundColor: COLORS.mintPale }]}>
                      <TreePine size={18} color={COLORS.mint} strokeWidth={2} />
                    </View>
                    <Text style={styles.impactEquivValue}>{treesEquiv.toLocaleString()}</Text>
                    <Text style={styles.impactEquivLabel}>trees planted equiv.</Text>
                  </View>
                </View>
              </View>

              {/* 1.5°C Global Goal */}
              <View style={styles.impactGoalCard}>
                <View style={styles.impactGoalHeader}>
                  <Thermometer size={16} color="#EF4444" strokeWidth={2} />
                  <Text style={styles.impactGoalTitle}>Global 1.5°C Goal</Text>
                </View>
                <Text style={styles.impactGoalBody}>
                  Singapore aims to halve emissions by 2030 and achieve net zero
                  by 2050. Every kWh saved contributes to keeping warming below 1.5°C.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.mint },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },

  // ── Gradient header
  header: { paddingHorizontal: SPACING.lg, paddingTop: STATUS_BAR_HEIGHT + SPACING.sm, paddingBottom: SPACING.xl, gap: SPACING.md },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: {
    width: 42, height: 42, borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center", justifyContent: "center", ...SHADOWS.sm,
  },
  greetingBlock: { alignItems: "center", gap: 2 },
  greetingText: { ...TYPOGRAPHY.h2, color: COLORS.textWhite },
  subText: { ...TYPOGRAPHY.caption, color: COLORS.textWhiteSub },
  notifDot: {
    position: "absolute", top: 3, right: 3, width: 10, height: 10,
    borderRadius: 5, backgroundColor: COLORS.orange,
    borderWidth: 2, borderColor: COLORS.mint,
  },
  gpRow: { alignItems: "flex-start" },
  gpPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 7,
  },
  gpPillText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },

  // ── Chart card
  breakdownCard: {},
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  cardTitle: { ...TYPOGRAPHY.h4, color: COLORS.textHeading },
  cardSub: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginBottom: SPACING.xs },

  // ML-powered badge
  mlBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    backgroundColor: COLORS.mintPale,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: SPACING.xs,
  },
  mlBadgeText: { ...TYPOGRAPHY.micro, color: COLORS.mint, fontSize: 9, fontWeight: "700" },

  // Dominant highlight
  dominantRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.warningLight, borderRadius: RADIUS.md,
    padding: SPACING.sm, marginTop: SPACING.sm,
  },
  dominantText: { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, flex: 1 },

  // Legend
  legendGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.sm },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6, width: "46%" },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { ...TYPOGRAPHY.caption, color: COLORS.textBody, flex: 1 },
  legendPct: { ...TYPOGRAPHY.captionBold, color: COLORS.textHeading },

  // ── JouleBuddy card
  aiCard: { borderRadius: RADIUS.card, padding: SPACING.lg, gap: SPACING.md, overflow: "hidden", ...SHADOWS.lg },
  aiHeaderRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  aiIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,191,165,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  aiTitle: { ...TYPOGRAPHY.h4, color: COLORS.textWhite },
  aiSub: { ...TYPOGRAPHY.caption, color: "#94a3b8", marginTop: 1 },
  activePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(34,197,94,0.20)", borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  activeText: { fontSize: 11, fontWeight: "600", color: "#4ade80" },
  insightBlock: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: RADIUS.lg, padding: SPACING.md },
  insightText: { ...TYPOGRAPHY.bodySm, color: "#cbd5e1", lineHeight: 20 },
  insightBold: { fontWeight: "700", color: COLORS.textWhite },
  savingsRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  savingsText: { ...TYPOGRAPHY.bodySm, color: "#94a3b8" },
  aiPoweredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: SPACING.sm,
  },
  aiPoweredText: { ...TYPOGRAPHY.micro, color: "rgba(74,222,128,0.6)", fontSize: 9 },

  // ── Recommended Action card
  recoCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.card,
    padding: SPACING.lg, gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.md,
  },
  recoIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.mintPale,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  recoTitle: { ...TYPOGRAPHY.h4, color: COLORS.textHeading },
  recoBody: { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 20 },
  recoSub: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, lineHeight: 18 },
  recoMetrics: { flexDirection: "row", gap: SPACING.sm, marginTop: 4 },
  recoMetricPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: COLORS.mintPale, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  recoMetricText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },

  // ── GreenUp Task card
  greenUpCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.card,
    padding: SPACING.lg, gap: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.mint, ...SHADOWS.md,
  },
  greenUpCardDone: { borderColor: COLORS.borderLight },
  greenUpHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  greenUpIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.mint,
    alignItems: "center", justifyContent: "center",
  },
  greenUpLabel: { ...TYPOGRAPHY.micro, color: COLORS.mint, textTransform: "uppercase", letterSpacing: 1 },
  greenUpTitle: { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading, fontWeight: "700" },
  greenUpGpPill: { backgroundColor: COLORS.mintPale, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  greenUpGpText: { ...TYPOGRAPHY.captionBold, color: COLORS.mint },
  greenUpBody: { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 20 },
  greenUpBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: COLORS.mint,
    borderRadius: RADIUS.md, paddingVertical: 14, ...SHADOWS.mint,
  },
  greenUpBtnText: { ...TYPOGRAPHY.bodyMd, color: COLORS.textWhite, fontWeight: "700" },
  greenUpDoneBanner: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    backgroundColor: COLORS.mintPale, borderRadius: RADIUS.md, padding: SPACING.md,
  },
  greenUpDoneText: { ...TYPOGRAPHY.bodyMd, color: COLORS.mintDark, fontWeight: "600" },

  // ── Section
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.textHeading, marginBottom: SPACING.sm },

  // ── Stats grid
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  halfCard: { width: "47.6%" },

  // ── Alert
  alertCard: {
    flexDirection: "row", alignItems: "flex-start", gap: SPACING.md,
    backgroundColor: COLORS.warningLight, borderRadius: RADIUS.card,
    padding: SPACING.base, ...SHADOWS.xs,
  },
  alertTitle: { ...TYPOGRAPHY.captionBold, color: COLORS.warning },
  alertBody: { ...TYPOGRAPHY.caption, color: "#78350F", marginTop: 2, lineHeight: 16 },

  // ── Menu Drawer
  drawerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  drawerPanel: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: "75%",
    backgroundColor: COLORS.card, paddingTop: STATUS_BAR_HEIGHT + SPACING.lg,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, ...SHADOWS.lg,
  },
  drawerUserSection: { alignItems: "center", gap: SPACING.xs, marginBottom: SPACING.md },
  drawerAvatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.mint,
    alignItems: "center", justifyContent: "center", marginBottom: SPACING.xs,
  },
  drawerInitials: { ...TYPOGRAPHY.h2, color: COLORS.textWhite },
  drawerName: { ...TYPOGRAPHY.h4, color: COLORS.textHeading },
  drawerEmail: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  drawerGpPill: {
    flexDirection: "row", alignItems: "center", gap: 5, marginTop: SPACING.xs,
    backgroundColor: COLORS.mintPale, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  drawerGpText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },
  drawerDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.md },
  drawerItem: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  drawerItemText: { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading },
  drawerVersion: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: "center", marginTop: SPACING.sm },

  // ── Notification Panel
  notifOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  notifSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl, paddingTop: SPACING.md,
    gap: SPACING.md, ...SHADOWS.lg,
  },
  notifHandle: {
    alignSelf: "center", width: 40, height: 4, borderRadius: RADIUS.full,
    backgroundColor: COLORS.border, marginBottom: SPACING.sm,
  },
  notifHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  notifTitle: { ...TYPOGRAPHY.h3, color: COLORS.textHeading, flex: 1 },
  notifItem: {
    flexDirection: "row", alignItems: "flex-start", gap: SPACING.md,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  notifItemUnread: { backgroundColor: COLORS.mintPale, marginHorizontal: -SPACING.lg, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md },
  notifItemNudge: {
    backgroundColor: "#FFFBEB", marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md,
  },
  notifItemCongrats: {
    backgroundColor: COLORS.mintPale, marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md,
  },
  notifIconCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.mintLight,
    alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
  },
  notifItemHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  notifItemTitle: { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading, fontWeight: "600" },
  notifUnreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.mint },
  notifItemBody: { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 18, marginTop: 2 },
  notifItemTime: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 4 },

  // ── National Impact Card (on dashboard)
  impactCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.card,
    padding: SPACING.lg, gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.md,
  },
  impactHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  impactIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#00897B",
    alignItems: "center", justifyContent: "center",
  },
  impactLabel: { ...TYPOGRAPHY.micro, color: "#00897B", letterSpacing: 1 },
  impactTitle: { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading, fontWeight: "700" },
  impactStatsRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.mintPale, borderRadius: RADIUS.md, padding: SPACING.md,
  },
  impactStatItem: { flex: 1, alignItems: "center" },
  impactStatValue: { ...TYPOGRAPHY.h3, color: "#00897B" },
  impactStatLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  impactDivider: { width: 1, height: 32, backgroundColor: COLORS.border },
  impactFooter: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
  },
  impactFooterText: { ...TYPOGRAPHY.captionBold, color: "#00897B" },

  // ── Impact Detail Modal
  impactModalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  impactModalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl, paddingTop: SPACING.md,
    maxHeight: "85%", ...SHADOWS.lg,
  },
  impactModalHeader: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  impactModalTitle: { ...TYPOGRAPHY.h3, color: COLORS.textHeading, flex: 1 },

  impactProgressSection: { alignItems: "center", marginBottom: SPACING.lg },
  impactSectionLabel: { ...TYPOGRAPHY.h4, color: COLORS.textHeading, marginBottom: SPACING.md },
  impactRingWrap: { alignItems: "center", justifyContent: "center", marginBottom: SPACING.sm },
  impactRingCenter: { position: "absolute", alignItems: "center" },
  impactRingPct: { fontSize: 28, fontWeight: "800", color: COLORS.mint },
  impactRingLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  impactProgressSub: { ...TYPOGRAPHY.bodySm, color: COLORS.textMuted, textAlign: "center" },

  impactDetailCard: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: COLORS.mintPale, borderRadius: RADIUS.md, padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  impactDetailLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  impactDetailValue: { ...TYPOGRAPHY.h3, color: COLORS.mint, marginTop: 2 },

  impactProjectionCard: {
    backgroundColor: "#F0F4FF", borderRadius: RADIUS.md, padding: SPACING.base,
    marginBottom: SPACING.md, gap: SPACING.sm,
  },
  impactProjectionHeader: { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 20 },
  impactProjectionValue: { ...TYPOGRAPHY.h2, color: COLORS.textHeading },

  impactEquivRow: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xs },
  impactEquivItem: { flex: 1, alignItems: "center", gap: 4 },
  impactEquivIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginBottom: 2,
  },
  impactEquivValue: { ...TYPOGRAPHY.h4, color: COLORS.textHeading },
  impactEquivLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: "center" },

  impactGoalCard: {
    backgroundColor: "#FFF5F5", borderRadius: RADIUS.md, padding: SPACING.base,
    gap: SPACING.sm, marginBottom: SPACING.md,
  },
  impactGoalHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  impactGoalTitle: { ...TYPOGRAPHY.h4, color: "#B91C1C" },
  impactGoalBody: { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 20 },
});
