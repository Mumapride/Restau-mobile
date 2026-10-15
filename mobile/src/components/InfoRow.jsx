import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/tokens';

/**
 * InfoRow — labelled value line used inside cards.
 * Keeps long values readable on ~360px screens via flex + right alignment.
 */
export default function InfoRow({ label, value, icon, valueStyle, style }) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        {icon ? (
          <Ionicons name={icon} size={15} color={COLORS.textMuted} style={styles.icon} />
        ) : null}
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, valueStyle]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  value: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    textAlign: 'right',
    flexShrink: 1,
    maxWidth: '60%',
  },
});
