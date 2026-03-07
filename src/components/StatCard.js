import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — "Glass" metric tile with moti entry animation
// Props:
//   icon    – React element (lucide icon)
//   label   – small grey label
//   value   – bold display number / text
//   unit    – optional unit string (e.g. "kWh")
//   accent  – icon bubble background colour  (default: mintPale)
//   delay   – moti stagger delay in ms
//   style   – outer style overrides
// ─────────────────────────────────────────────────────────────────────────────
export default function StatCard({ icon, label, value, unit, accent, delay = 0, style }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 380, delay }}
      style={[styles.card, style]}
    >
      {/* Icon bubble */}
      <View style={[styles.iconBubble, { backgroundColor: accent ?? COLORS.mintPale }]}>
        {icon}
      </View>

      {/* Label */}
      <Text style={styles.label} numberOfLines={1}>{label}</Text>

      {/* Value + unit */}
      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,           // 24 px
    padding: SPACING.base,
    alignItems: 'flex-start',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,     // subtle glass border
    ...SHADOWS.md,                       // 0.10 opacity
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textHeading,
  },
  unit: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
  },
});
