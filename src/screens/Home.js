import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Leaf,
  Footprints,
  MoreHorizontal,
  TriangleAlert,
  TrendingDown,
  BarChart3,
  Users,
  ChevronRight,
  User,
} from 'lucide-react-native';
import StyledCard  from '../components/StyledCard';
import StatCard    from '../components/StatCard';
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { useGP } from '../context/GPContext';

// ─── EcoChart — Solar/Grid bar chart (Mint Green = active bar per spec) ────────
const SOLAR_DATA = [40, 70, 45, 90, 65, 80, 30];
const SOLAR_LABELS = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm'];
const PEAK_IDX = SOLAR_DATA.indexOf(Math.max(...SOLAR_DATA)); // 3 → '12pm'

function EcoChart() {
  return (
    <View style={chart.wrapper}>
      {SOLAR_DATA.map((h, i) => (
        <View key={i} style={chart.col}>
          {i === PEAK_IDX && (
            <Text style={chart.peakLabel}>Peak</Text>
          )}
          <View
            style={[
              chart.bar,
              {
                height: h,
                backgroundColor: i === PEAK_IDX
                  ? COLORS.mint          // #00BFA5 active/peak bar
                  : COLORS.chartBarInactive, // #E0E0E0 inactive
              },
            ]}
          />
          <Text style={chart.timeLabel}>{SOLAR_LABELS[i]}</Text>
        </View>
      ))}
    </View>
  );
}

const chart = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    justifyContent: 'space-around',
    marginVertical: SPACING.lg,
  },
  col:        { alignItems: 'center', gap: 4 },
  bar:        { width: 12, borderRadius: 6, minHeight: 4 },
  timeLabel:  { ...TYPOGRAPHY.micro, color: COLORS.textMuted, fontSize: 8 },
  peakLabel:  { ...TYPOGRAPHY.micro, color: COLORS.mint, fontSize: 8, marginBottom: 2 },
});

// ─── Monthly HDB chart data (12 bars, no external library) ────────────────────
const HDB_DATA = [
  { m: 'J', v: 62 }, { m: 'F', v: 54 }, { m: 'M', v: 68 }, { m: 'A', v: 78 },
  { m: 'M', v: 88 }, { m: 'J', v: 100 },{ m: 'J', v: 96 }, { m: 'A', v: 105 },
  { m: 'S', v: 90 }, { m: 'O', v: 74 }, { m: 'N', v: 66 }, { m: 'D', v: 71 },
];
const HDB_MAX = Math.max(...HDB_DATA.map((d) => d.v));

// ─── Quick actions ─────────────────────────────────────────────────────────────
const ACTIONS = [
  { Icon: Zap,           label: 'Utilities',       color: COLORS.spBlue,   bg: '#E8F4FC' },
  { Icon: Leaf,          label: 'Green Goals',      color: COLORS.mint,     bg: COLORS.mintPale },
  { Icon: Footprints,    label: 'Carbon\nFootprint',color: COLORS.orange,   bg: COLORS.orangeLight },
  { Icon: MoreHorizontal,label: 'More',             color: COLORS.textMuted,bg: COLORS.borderLight },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { totalGP, completedQuestIds } = useGP();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.mint} />

      {/* ── LinearGradient header — top ~35% of screen ── */}
      <LinearGradient
        colors={GRADIENTS.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        {/* Row 1: greeting + avatar + GP pill */}
        <View style={styles.headerRow}>
          <View style={styles.greetingBlock}>
            <Text style={styles.dateLabel}>
              {new Date().toLocaleDateString('en-SG', {
                weekday: 'long', day: 'numeric', month: 'short',
              })}
            </Text>
            <Text style={styles.greetingText}>Hi, Alex 👋</Text>
          </View>

          <View style={styles.headerRight}>
            {/* GP pill */}
            <View style={styles.gpPill}>
              <Leaf size={12} color={COLORS.mintDark} strokeWidth={2.5} />
              <Text style={styles.gpPillText}>{totalGP.toLocaleString()} GP</Text>
            </View>
            {/* Profile avatar circle */}
            <View style={styles.avatarCircle}>
              <User size={20} color={COLORS.mint} strokeWidth={2} />
            </View>
          </View>
        </View>

        {/* Row 2: hero metric pills */}
        <View style={styles.heroPills}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillValue}>$142.50</Text>
            <Text style={styles.heroPillLabel}>This Month</Text>
          </View>
          <View style={styles.heroPillSep} />
          <View style={styles.heroPill}>
            <Text style={[styles.heroPillValue, { color: '#A5F3EB' }]}>−8%</Text>
            <Text style={styles.heroPillLabel}>vs Last Month</Text>
          </View>
          <View style={styles.heroPillSep} />
          <View style={styles.heroPill}>
            <Text style={styles.heroPillValue}>90 kWh</Text>
            <Text style={styles.heroPillLabel}>Usage</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2×2 Stats Grid (glass cards) ── */}
        <View style={styles.statsGrid}>
          <StatCard
            style={styles.halfCard}
            icon={<Zap size={20} color={COLORS.spBlue} strokeWidth={2} />}
            label="Bill This Month"
            value="$142"
            unit=".50"
            accent="#E8F4FC"
            delay={0}
          />
          <StatCard
            style={styles.halfCard}
            icon={<TrendingDown size={20} color={COLORS.mint} strokeWidth={2} />}
            label="vs Last Month"
            value="−8"
            unit="%"
            accent={COLORS.mintPale}
            delay={60}
          />
          <StatCard
            style={styles.halfCard}
            icon={<Leaf size={20} color={COLORS.mint} strokeWidth={2} />}
            label="GreenPoints"
            value={totalGP.toLocaleString()}
            unit="GP"
            accent={COLORS.mintLight}
            delay={120}
          />
          <StatCard
            style={styles.halfCard}
            icon={<BarChart3 size={20} color={COLORS.purple} strokeWidth={2} />}
            label="Quests Done"
            value={completedQuestIds.size}
            unit="today"
            accent={COLORS.purpleLight}
            delay={180}
          />
        </View>

        {/* ── Solar / Grid Status (EcoChart) ── */}
        <StyledCard delay={80} glow={false}>
          <View style={styles.cardMeta}>
            <View>
              <Text style={styles.cardTitle}>Solar / Grid Status</Text>
              <Text style={styles.cardSub}>Today's energy profile · kW</Text>
            </View>
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <EcoChart />
          <View style={styles.chartLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.mint }]} />
              <Text style={styles.legendLabel}>Peak Generation</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.chartBarInactive }]} />
              <Text style={styles.legendLabel}>Off-Peak</Text>
            </View>
          </View>
        </StyledCard>

        {/* ── Quick Actions ── */}
        <StyledCard delay={120}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {ACTIONS.map(({ Icon, label, color, bg }) => (
              <TouchableOpacity
                key={label}
                style={styles.actionItem}
                activeOpacity={0.75}
              >
                <View style={[styles.actionBubble, { backgroundColor: bg }]}>
                  <Icon size={26} color={color} strokeWidth={2} />
                </View>
                <Text style={styles.actionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </StyledCard>

        {/* ── Maintenance alert ── */}
        <View style={styles.alertCard}>
          <TriangleAlert size={20} color={COLORS.warning} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Scheduled Maintenance</Text>
            <Text style={styles.alertBody}>
              15 Mar 2026 · 10 PM – 2 AM. MySP services may be briefly unavailable.
            </Text>
          </View>
        </View>

        {/* ── Avg. HDB electricity chart (12 months) ── */}
        <StyledCard delay={160}>
          <View style={styles.cardMeta}>
            <View>
              <Text style={styles.cardTitle}>Avg. HDB Electricity</Text>
              <Text style={styles.cardSub}>kWh per month · 2025</Text>
            </View>
            <Users size={18} color={COLORS.textMuted} strokeWidth={2} />
          </View>
          <View style={styles.hdbChart}>
            {HDB_DATA.map((d, i) => {
              const h      = (d.v / HDB_MAX) * 90;
              const isPeak = d.v === HDB_MAX;
              return (
                <View key={i} style={styles.hdbBarCol}>
                  <Text style={styles.hdbBarVal}>{d.v}</Text>
                  <View
                    style={[
                      styles.hdbBar,
                      {
                        height: h,
                        backgroundColor: isPeak ? COLORS.orange : COLORS.mint,
                        opacity: isPeak ? 1 : 0.55,
                      },
                    ]}
                  />
                  <Text style={styles.hdbBarMonth}>{d.m}</Text>
                </View>
              );
            })}
          </View>
          {/* Neighbours comparison */}
          <View style={styles.compareBlock}>
            <View style={styles.compareRow}>
              <Text style={styles.compareName}>You</Text>
              <View style={styles.compareBarTrack}>
                <View style={[styles.compareBarFill, { width: '86%', backgroundColor: COLORS.spBlue }]} />
              </View>
              <Text style={[styles.compareVal, { color: COLORS.spBlue }]}>90 kWh</Text>
            </View>
            <View style={styles.compareRow}>
              <Text style={styles.compareName}>Avg.</Text>
              <View style={styles.compareBarTrack}>
                <View style={[styles.compareBarFill, { width: '72%', backgroundColor: COLORS.mint }]} />
              </View>
              <Text style={[styles.compareVal, { color: COLORS.mint }]}>76 kWh</Text>
            </View>
            <Text style={styles.compareHint}>
              You're 18% above average. Complete today's quests to close the gap!
            </Text>
          </View>
        </StyledCard>

        {/* ── UOB One Card promo ── */}
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={['#C62828', '#E53935']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoCard}
          >
            <View style={styles.promoLeft}>
              <Text style={styles.promoEyebrow}>FEATURED OFFER</Text>
              <Text style={styles.promoTitle}>UOB One Card</Text>
              <Text style={styles.promoSub}>Up to 10% cashback on utilities</Text>
            </View>
            <View style={styles.promoBadge}>
              <Text style={styles.promoPct}>10%</Text>
              <Text style={styles.promoCb}>cashback</Text>
              <ChevronRight size={18} color="rgba(255,255,255,0.80)" strokeWidth={2.5} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.mint },
  scroll:        { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },

  // ── Gradient header ──
  gradientHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.xl,
    gap: SPACING.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingBlock: { gap: 3 },
  dateLabel: { ...TYPOGRAPHY.caption, color: COLORS.textWhiteSub },
  greetingText: { ...TYPOGRAPHY.h1, color: COLORS.textWhite },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  gpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  gpPillText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },

  // Hero metric pills
  heroPills: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  heroPill:       { flex: 1, alignItems: 'center', gap: 3 },
  heroPillValue:  { ...TYPOGRAPHY.h3, color: COLORS.textWhite },
  heroPillLabel:  { ...TYPOGRAPHY.micro, color: COLORS.textWhiteSub, fontSize: 9 },
  heroPillSep:    { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

  // 2×2 stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  halfCard: { width: '47.6%' },

  // Card internals
  cardMeta: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { ...TYPOGRAPHY.h4, color: COLORS.textHeading },
  cardSub:   { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.mintLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.mint },
  liveText: { ...TYPOGRAPHY.micro, color: COLORS.mintDark, fontSize: 9 },

  // Chart legend
  chartLegendRow: { flexDirection: 'row', gap: SPACING.lg },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 8, height: 8, borderRadius: 4 },
  legendLabel:    { ...TYPOGRAPHY.caption, color: COLORS.textMuted },

  // Quick actions
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
  },
  actionBubble: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textBody, textAlign: 'center' },

  // Alert
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.card,
    padding: SPACING.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    ...SHADOWS.xs,
  },
  alertTitle: { ...TYPOGRAPHY.captionBold, color: COLORS.warning },
  alertBody:  { ...TYPOGRAPHY.caption, color: '#78350F', marginTop: 2, lineHeight: 16 },

  // HDB chart
  hdbChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  hdbBarCol:   { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  hdbBar:      { width: '68%', borderRadius: 4, minHeight: 3 },
  hdbBarVal:   { fontSize: 7, color: COLORS.textMuted, marginBottom: 2 },
  hdbBarMonth: { fontSize: 8, color: COLORS.textMuted, marginTop: 3 },

  // Neighbours comparison
  compareBlock: { gap: SPACING.sm, marginTop: SPACING.sm },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  compareName:     { ...TYPOGRAPHY.captionBold, color: COLORS.textBody, width: 34 },
  compareBarTrack: { flex: 1, height: 10, backgroundColor: COLORS.borderLight, borderRadius: RADIUS.full, overflow: 'hidden' },
  compareBarFill:  { height: '100%', borderRadius: RADIUS.full },
  compareVal:      { ...TYPOGRAPHY.captionBold, width: 48, textAlign: 'right' },
  compareHint:     { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 18 },

  // Promo
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  promoLeft:    { gap: 3 },
  promoEyebrow: { ...TYPOGRAPHY.micro, color: 'rgba(255,255,255,0.65)' },
  promoTitle:   { ...TYPOGRAPHY.h3, color: COLORS.textWhite },
  promoSub:     { ...TYPOGRAPHY.caption, color: 'rgba(255,255,255,0.75)' },
  promoBadge:   { alignItems: 'center', gap: 3 },
  promoPct:     { fontSize: 28, fontWeight: '800', color: COLORS.textWhite },
  promoCb:      { ...TYPOGRAPHY.micro, color: 'rgba(255,255,255,0.80)' },
});
