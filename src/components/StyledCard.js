import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../theme/theme";

// ─────────────────────────────────────────────────────────────────────────────
// StyledCard
//
// Animated card shell using RN's built-in Animated API.
// Every consumer gets a slide-up fade-in entry animation for free.
//
// Props:
//   children    React children
//   delay       Stagger delay in ms (default 0)
//   style       Extra View styles merged on top of the base card
//   glow        {true} adds a mint-coloured ambient shadow (featured cards)
// ─────────────────────────────────────────────────────────────────────────────
export default function StyledCard({ children, delay = 0, style, glow = false }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 420,
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
        glow && styles.cardGlow,
        { opacity, transform: [{ translateY }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  cardGlow: {
    ...SHADOWS.mint,
  },
});
