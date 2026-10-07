import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/tokens';

/**
 * SectionTitle — list/form section heading with optional subtitle and action.
 * `action` can be { label, onPress, icon } or any custom node via `actionNode`.
 */
export default function SectionTitle({ title, subtitle, action, actionNode, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionNode ||
        (action?.label && action?.onPress ? (
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.action}
          >
            {action.icon ? (
              <Ionicons name={action.icon} size={16} color={COLORS.primary} style={styles.actionIcon} />
            ) : null}
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ) : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  texts: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
});
