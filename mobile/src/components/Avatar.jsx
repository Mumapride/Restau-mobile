import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme/tokens';

/**
 * Avatar — initials circle. Size is configurable via `size`.
 */
export default function Avatar({ initials = '', size = 48, style, textStyle }) {
  const resolvedInitials = String(initials || '')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={resolvedInitials ? `Avatar ${resolvedInitials}` : 'Avatar'}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: Math.max(14, size * 0.36) }, textStyle]}>
        {resolvedInitials || '•'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
});
