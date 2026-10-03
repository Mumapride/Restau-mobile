import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/tokens';

/**
 * ScreenHeader — consistent top header.
 *
 * Variants:
 *  - 'primary': Restau green background, white text (default).
 *  - 'light': neutral surface background, dark text.
 *
 * Props are presentational only; navigation is injected via onBack.
 */
export default function ScreenHeader({
  title,
  subtitle,
  variant = 'primary',
  showBack = false,
  onBack,
  rightAction,
  style,
}) {
  const isPrimary = variant === 'primary';

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, isPrimary ? styles.safePrimary : styles.safeLight, style]}
    >
      <StatusBar
        barStyle={isPrimary ? 'light-content' : 'dark-content'}
        backgroundColor={isPrimary ? COLORS.primary : COLORS.surface}
        animated
      />
      <View style={[styles.inner, isPrimary ? styles.innerPrimary : styles.innerLight]}>
        <View style={styles.topRow}>
          {showBack ? (
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.backButton, isPrimary ? styles.backOnPrimary : styles.backOnLight]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isPrimary ? COLORS.onPrimary : COLORS.primary}
              />
            </TouchableOpacity>
          ) : null}
          <View style={styles.titles}>
            <Text
              style={[styles.title, isPrimary ? styles.titlePrimary : styles.titleLight]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[styles.subtitle, isPrimary ? styles.subtitlePrimary : styles.subtitleLight]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View style={styles.right}>{rightAction || null}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: COLORS.primary,
  },
  safePrimary: {
    backgroundColor: COLORS.primary,
  },
  safeLight: {
    backgroundColor: COLORS.surface,
  },
  inner: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  innerPrimary: {
    backgroundColor: COLORS.primary,
  },
  innerLight: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  backOnPrimary: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  backOnLight: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titles: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.h2,
  },
  titlePrimary: {
    color: COLORS.onPrimary,
  },
  titleLight: {
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: 2,
  },
  subtitlePrimary: {
    color: COLORS.onPrimaryMuted,
  },
  subtitleLight: {
    color: COLORS.textSecondary,
  },
  right: {
    marginLeft: SPACING.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
