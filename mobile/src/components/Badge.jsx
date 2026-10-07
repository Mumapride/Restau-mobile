import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/tokens';

/**
 * Badge — small status pill.
 * Variants: 'success' | 'warning' | 'danger' | 'neutral' | 'primary'
 */
const VARIANTS = {
  success: { backgroundColor: COLORS.successLight, color: COLORS.success },
  warning: { backgroundColor: COLORS.warningLight, color: COLORS.warning },
  danger: { backgroundColor: COLORS.dangerLight, color: COLORS.danger },
  neutral: { backgroundColor: COLORS.surfaceAlt, color: COLORS.textSecondary },
  primary: { backgroundColor: COLORS.primaryLight, color: COLORS.primary },
};

export default function Badge({ label, variant = 'neutral', style, textStyle }) {
  const resolved = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[styles.badge, { backgroundColor: resolved.backgroundColor }, style]}
    >
      <View style={[styles.dot, { backgroundColor: resolved.color }]} />
      <Text style={[styles.text, { color: resolved.color }, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
