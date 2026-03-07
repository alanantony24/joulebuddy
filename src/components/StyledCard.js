import React from 'react';
import { StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme/theme';

// ─────────────────────────────────────────────────────────────────────────────
// StyledCard
//
// A moti-animated card shell. Every consumer gets the slide-up fade-in entry
// animation for free. Just wrap your content in <StyledCard>.
//
// Props:
//   children    React children
//   delay       Stagger delay in ms (default 0)  — pass (index * 80) for lists
//   style       Extra View styles merged on top of the base card
//   glow        {true} adds a mint-coloured ambient shadow (featured cards)
//   onPress     If provided, wraps the MotiView in a pressable animation state
// ─────────────────────────────────────────────────────────────────────────────
export default function StyledCard({
  children,
  delay  = 0,
  style,
  glow   = false,
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 420,
        delay,
      }}
      style={[
        styles.card,
        glow && styles.cardGlow,
        style,
      ]}
    >
      {children}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,          // 24 px per spec
    padding: SPACING.lg,                // 20 px breathing room per spec
    ...SHADOWS.md,                      // 0.10 opacity shadow per spec
  },
  cardGlow: {
    ...SHADOWS.mint,                    // Coloured ambient glow
  },
});
