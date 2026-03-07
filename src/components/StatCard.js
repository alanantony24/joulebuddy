import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../theme/theme";

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — "Glass" metric tile with built-in Animated entry
// Props:
//   icon    – React element (lucide icon)
//   label   – small grey label
//   value   – bold display number / text
//   unit    – optional unit string (e.g. "kWh")
//   accent  – icon bubble background colour  (default: mintPale)
//   delay   – stagger delay in ms
//   style   – outer style overrides
// ─────────────────────────────────────────────────────────────────────────────
export default function StatCard({ icon, label, value, unit, accent, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity, transform: [{ translateY }] },
        style,
      ]}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.base,
    alignItems: "flex-start",
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
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
