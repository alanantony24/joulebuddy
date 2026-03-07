import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, SPACING } from '../theme/theme';

// ─────────────────────────────────────────────────────────────────────────────
// GradientHeader
//
// A LinearGradient container (Emerald Mint → SP Blue) for screen headers.
// Renders children inside a padded inner View.
//
// Props:
//   children     Content to render inside the gradient
//   colors       Override gradient colours (default: GRADIENTS.brand)
//   start        Gradient start vector  (default: top-left)
//   end          Gradient end vector    (default: bottom-right)
//   style        Extra styles on the gradient container
//   innerStyle   Extra styles on the inner padding View
//   noPadBottom  {true} removes bottom padding (useful when a floating card
//                bleeds into the content area below)
// ─────────────────────────────────────────────────────────────────────────────
export default function GradientHeader({
  children,
  colors       = GRADIENTS.brand,
  start        = { x: 0, y: 0 },
  end          = { x: 1, y: 1 },
  style,
  innerStyle,
  noPadBottom  = false,
}) {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[styles.gradient, style]}
    >
      <View style={[styles.inner, noPadBottom && { paddingBottom: 0 }, innerStyle]}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
  },
  inner: {
    paddingHorizontal: SPACING.lg,   // 20 px per spec
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
});
