import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme/tokens';

/**
 * AppCard — consistent surface container.
 * If `onPress` is provided the card becomes touchable,
 * otherwise it renders as a plain View.
 */
export default function AppCard({ children, style, onPress, accessibilityLabel }) {
  if (onPress) {
    return (
      <TouchableOpacity
        accessible
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
});
