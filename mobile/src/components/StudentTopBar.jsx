import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, RADIUS, SPACING, TOUCH_TARGET } from '../theme/tokens';

const DASHBOARD_PRIMARY = '#16A36A';
export const STUDENT_TOP_BAR_HEIGHT = 52;

/**
 * StudentTopBar — the fixed Restau Mobile app bar for student screens.
 *
 * The safe-area strip remains neutral so the native Android status bar stays
 * visually separate. The branded gradient begins below that strip.
 */
export default function StudentTopBar({
  navigation,
  title = 'Restau Mobile',
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) {
  const insets = useSafeAreaInsets();
  const canOpenProfile = Boolean(navigation?.navigate);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[COLORS.primary, DASHBOARD_PRIMARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.leftGroup}>
            {showBack ? (
              <Pressable
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
              >
                <Ionicons name="chevron-back" size={22} color={COLORS.onPrimary} />
              </Pressable>
            ) : null}

            <View style={styles.titleWrap}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          {rightAction !== undefined ? (
            rightAction
          ) : (
            <View style={styles.actions}>
              <View
                style={styles.notificationIcon}
                accessible
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications-outline" size={18} color={COLORS.onPrimary} />
              </View>
              {canOpenProfile ? (
                <Pressable
                  onPress={() => navigation.navigate('Profile')}
                  accessibilityRole="button"
                  accessibilityLabel="Open profile"
                  style={({ pressed }) => [
                    styles.profileButton,
                    pressed && styles.profileButtonPressed,
                  ]}
                >
                  <Ionicons name="person-outline" size={18} color={COLORS.onPrimary} />
                </Pressable>
              ) : (
                <View style={styles.profileButton} accessible accessibilityLabel="Profile">
                  <Ionicons name="person-outline" size={18} color={COLORS.onPrimary} />
                </View>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    width: '100%',
    backgroundColor: COLORS.background,
  },
  gradient: {
    minHeight: STUDENT_TOP_BAR_HEIGHT,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  content: {
    width: '100%',
    maxWidth: 680,
    minHeight: STUDENT_TOP_BAR_HEIGHT,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 2,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  leftGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  backButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: COLORS.onPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: COLORS.onPrimaryMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  notificationIcon: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  profileButtonPressed: {
    opacity: 0.72,
  },
});
