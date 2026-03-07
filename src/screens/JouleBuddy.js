import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  Flame,
  Leaf,
  ListChecks,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import GradientHeader from '../components/GradientHeader';
import StyledCard     from '../components/StyledCard';
import TaskCard       from '../components/TaskCard';
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY, getLevel, getLevelProgress } from '../theme/theme';
import { useGP } from '../context/GPContext';

// ─────────────────────────────────────────────────────────────────────────────
// Streak badge — rendered inside the GradientHeader
// ─────────────────────────────────────────────────────────────────────────────
function StreakBadge({ count }) {
  return (
    <View style={streak.pill}>
      <Flame size={16} color="#FF7043" strokeWidth={2.5} />
      <Text style={streak.count}>{count}</Text>
      <Text style={streak.label}>
        Day{count !== 1 ? 's' : ''} Streak{count >= 3 ? ' 🔥' : ''}
      </Text>
    </View>
  );
}
const streak = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  count: { ...TYPOGRAPHY.h4, color: COLORS.textWhite },
  label: { ...TYPOGRAPHY.captionBold, color: COLORS.textWhiteSub },
});

// ─────────────────────────────────────────────────────────────────────────────
export default function JouleBuddyScreen() {
  const { totalGP, streak: streakCount, quests, isCompleted, completeQuest, completedQuestIds } = useGP();

  const lvl       = getLevel(totalGP);
  const progress  = getLevelProgress(totalGP);
  const doneCount = completedQuestIds.size;
  const totalCount = quests.length;
  const gpToday   = useMemo(
    () => quests.filter((q) => isCompleted(q.id)).reduce((s, q) => s + q.gp, 0),
    [quests, isCompleted],
  );

  const allDone = doneCount === totalCount;

  // Build sorted list: pending first, completed second
  const sortedQuests = useMemo(() => ([
    ...quests.filter((q) => !isCompleted(q.id)),
    ...quests.filter((q) =>  isCompleted(q.id)),
  ]), [quests, isCompleted]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.mint} />

      {/* ── GradientHeader: streak + level title + progress bar ── */}
      <GradientHeader colors={GRADIENTS.brand}>
        {/* Row 1: Streak badge + GP today pill */}
        <View style={styles.headerTopRow}>
          <StreakBadge count={streakCount} />
          <View style={styles.gpTodayPill}>
            <Leaf size={13} color={COLORS.mintDark} strokeWidth={2.5} />
            <Text style={styles.gpTodayText}>+{gpToday} GP today</Text>
          </View>
        </View>

        {/* Row 2: Level heading */}
        <View style={styles.levelHeadRow}>
          <Text style={styles.levelTitle}>
            GreenUp Level: {lvl.title} {lvl.icon}
          </Text>
          <View style={[styles.levelBadge, { backgroundColor: lvl.color }]}>
            <Trophy size={13} color={COLORS.textWhite} strokeWidth={2.5} />
            <Text style={styles.levelBadgeText}>Lv.{lvl.level}</Text>
          </View>
        </View>

        {/* Row 3: Custom horizontal progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: lvl.color,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{lvl.min.toLocaleString()} GP</Text>
          <Text style={styles.progressLabel}>
            {lvl.level < 5
              ? `${(lvl.max - totalGP).toLocaleString()} to next level`
              : '🏆 Max Level!'}
          </Text>
          {lvl.level < 5 && (
            <Text style={styles.progressLabel}>{lvl.max.toLocaleString()} GP</Text>
          )}
        </View>
      </GradientHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Today's Stats card ── */}
        <StyledCard delay={0}>
          <View style={styles.statsRow}>
            {/* Streak */}
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.orangeLight }]}>
                <Flame size={20} color={COLORS.orange} strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{streakCount}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statDivider} />

            {/* GP Today */}
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.mintLight }]}>
                <Leaf size={20} color={COLORS.mint} strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>+{gpToday}</Text>
              <Text style={styles.statLabel}>GP Today</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Quests */}
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.purpleLight }]}>
                <ListChecks size={20} color={COLORS.purple} strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{doneCount}/{totalCount}</Text>
              <Text style={styles.statLabel}>Quests</Text>
            </View>
          </View>
        </StyledCard>

        {/* ── Quest section header ── */}
        <View style={styles.sectionHeader}>
          <Sparkles size={16} color={COLORS.mint} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Today's Eco-Quests</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {totalCount - doneCount} left
            </Text>
          </View>
        </View>

        {/* ── Quest cards — staggered moti entry ── */}
        {sortedQuests.map((quest, index) => (
          <TaskCard
            key={quest.id}
            quest={quest}
            completed={isCompleted(quest.id)}
            onComplete={completeQuest}
            delay={index * 80}
          />
        ))}

        {/* ── All-done celebration banner ── */}
        {allDone && (
          <MotiView
            from={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14 }}
            style={styles.allDoneBanner}
          >
            <Star size={24} color={COLORS.gold} strokeWidth={2} fill={COLORS.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.allDoneTitle}>All quests complete! 🎉</Text>
              <Text style={styles.allDoneSub}>
                Come back tomorrow for a fresh set of Eco-Quests.
              </Text>
            </View>
          </MotiView>
        )}

        {/* ── JouleBuddy Tip card ── */}
        <StyledCard delay={sortedQuests.length * 80 + 80} style={styles.tipCard}>
          <View style={styles.tipRow}>
            <View style={styles.tipIconBubble}>
              <Sparkles size={18} color={COLORS.mint} strokeWidth={2} />
            </View>
            <Text style={styles.tipEyebrow}>JouleBuddy Tip</Text>
          </View>
          <Text style={styles.tipBody}>
            Complete all daily quests to unlock a{' '}
            <Text style={styles.tipHighlight}>10% bonus GP</Text> at midnight.
            Don't miss a single one!
          </Text>
        </StyledCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.mint },
  scroll:        { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },

  // ── GradientHeader internals ──
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gpTodayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gpTodayText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },

  levelHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  levelTitle: { ...TYPOGRAPHY.h3, color: COLORS.textWhite, flex: 1 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  levelBadgeText: { ...TYPOGRAPHY.captionBold, color: COLORS.textWhite },

  // Custom progress bar
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    minWidth: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressLabel: { ...TYPOGRAPHY.micro, color: COLORS.textWhiteSub, fontSize: 9 },

  // ── Stats card ──
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { ...TYPOGRAPHY.h3, color: COLORS.textHeading },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: 'center' },
  statDivider: {
    width: 1,
    height: 56,
    backgroundColor: COLORS.borderLight,
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.textHeading, flex: 1 },
  countPill: {
    backgroundColor: COLORS.mintLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countPillText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },

  // ── All-done banner ──
  allDoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.goldLight,
    borderRadius: RADIUS.card,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    ...SHADOWS.xs,
  },
  allDoneTitle: { ...TYPOGRAPHY.h4, color: COLORS.textHeading },
  allDoneSub:   { ...TYPOGRAPHY.bodySm, color: COLORS.textMuted, marginTop: 2 },

  // ── Tip card (overlaid on StyledCard) ──
  tipCard: { backgroundColor: COLORS.mintPale, borderWidth: 1, borderColor: COLORS.mintLight },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  tipIconBubble: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipEyebrow: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },
  tipBody:    { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 20 },
  tipHighlight: { fontWeight: '700', color: COLORS.mint },
});
