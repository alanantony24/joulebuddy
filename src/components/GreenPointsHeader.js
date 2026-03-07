import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Leaf, Flame } from 'lucide-react-native';
import GradientHeader from './GradientHeader';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, getLevel, getLevelProgress } from '../theme/theme';
import { useGP } from '../context/GPContext';

// ─────────────────────────────────────────────────────────────────────────────
// GreenPointsHeader — Eco-Modern design  (uses LinearGradient via GradientHeader)
// ─────────────────────────────────────────────────────────────────────────────
export default function GreenPointsHeader({ title, subtitle }) {
  const { totalGP, streak } = useGP();
  const lvl      = getLevel(totalGP);
  const progress = getLevelProgress(totalGP);

  return (
    <GradientHeader>
      {/* Row 1: screen title + metric pills */}
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle
            ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            : null}
        </View>

        <View style={styles.pills}>
          {streak > 0 && (
            <View style={styles.streakPill}>
              <Flame size={13} color="#FF7043" strokeWidth={2.5} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
          <View style={styles.gpPill}>
            <Leaf size={13} color={COLORS.mintDark} strokeWidth={2.5} />
            <Text style={styles.gpValue}>{totalGP.toLocaleString()}</Text>
            <Text style={styles.gpUnit}> GP</Text>
          </View>
        </View>
      </View>

      {/* Row 2: live level progress bar */}
      <View style={styles.levelRow}>
        <Text style={styles.levelEmoji}>{lvl.icon}</Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.round(progress * 100)}%`, backgroundColor: lvl.color },
            ]}
          />
        </View>
        <Text style={styles.levelLabel} numberOfLines={1}>
          Lv.{lvl.level} {lvl.title}
        </Text>
      </View>
    </GradientHeader>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleBlock: { flex: 1, marginRight: SPACING.md },
  title:    { ...TYPOGRAPHY.h2, color: COLORS.textWhite },
  subtitle: { ...TYPOGRAPHY.bodySm, color: COLORS.textWhiteSub, marginTop: 2 },

  pills: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexShrink: 0 },

  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  streakText: { ...TYPOGRAPHY.captionBold, color: COLORS.textWhite },

  gpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  gpValue: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark, fontWeight: '700' },
  gpUnit:  { ...TYPOGRAPHY.micro, color: COLORS.mintDark, fontSize: 9 },

  levelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  levelEmoji: { fontSize: 14 },
  barTrack: {
    flex: 1, height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: RADIUS.full, minWidth: 6 },
  levelLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textWhiteSub, fontSize: 11 },
});
