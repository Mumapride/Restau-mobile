import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../store/useAuthStore';
import { COLORS, SPACING } from '../theme/tokens';
import Avatar from './Avatar';

// Real brand asset (mobile/assets/brand/restau-logo.png).
// eslint-disable-next-line import/no-unresolved
const RESTAU_LOGO = require('../../assets/brand/restau-logo.png');

export const STUDENT_TOP_BAR_HEIGHT = 56;

/**
 * StudentTopBar — shared, compact student app bar.
 *
 * Layout (one row, fixed height):
 *   [RESTAU logo]  [spacer]  [Notifications bell]  [Profile avatar]
 *
 * Blends into the screen: white background, no gradient, no strong
 * border or shadow. Safe-area aware.
 */
export default function StudentTopBar({
  navigation,
  onNotifications,
  onProfile,
  showBack = false,
  onBack,
  rightAction,
}) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase() || '?';

  const hasNotificationsRoute = Boolean(
    navigation?.getState?.()?.routeNames?.includes('Notifications'),
  );

  const handleNotifications = onNotifications
    ? onNotifications
    : hasNotificationsRoute
      ? () => navigation.navigate('Notifications')
      : undefined;

  const handleProfile = onProfile
    ? onProfile
    : () => navigation?.navigate('Profile');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.surface}
        animated
      />
      <View style={styles.bar}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </Pressable>
        ) : (
          <Image
            source={RESTAU_LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Restau"
          />
        )}
        <View style={styles.spacer} />
        {rightAction !== undefined ? (
          rightAction
        ) : (
          <View style={styles.actions}>
            {handleNotifications ? (
              <Pressable
                onPress={handleNotifications}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.iconButton}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            ) : (
              <View style={styles.iconButton}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
            )}
            <Pressable
              onPress={handleProfile}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.avatarButton}
            >
              <Avatar size={32} initials={initials} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    width: '100%',
    backgroundColor: COLORS.surface,
  },
  bar: {
    height: STUDENT_TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 110,
    height: 28,
    resizeMode: 'contain',
  },
  backButton: {
    padding: 6,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    padding: 6,
  },
  avatarButton: {
    padding: 4,
  },
});
