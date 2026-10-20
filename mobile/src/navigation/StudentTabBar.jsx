import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../theme/tokens';

const NAVY = '#0B1026';
const MUTED = '#747D96';
const WHITE = '#FFFFFF';
const BORDER = '#E6EAF0';

// Bar content height (measured: 80 total on devices with no bottom inset).
const BAR_CONTENT_HEIGHT = 60;
const MIN_BOTTOM_SPACE = 20;
const QR_SIZE = 72;

// Keyed by route name (must match StudentNavigator). [outline, filled]
const TABS = {
  Dashboard: { label: 'Home', icons: ['home-outline', 'home'] },
  'Meal Plans': { label: 'Meal Plans', icons: ['restaurant-outline', 'restaurant'] },
  'My QR Code': { center: true, icon: 'qr-code-outline' },
  History: { label: 'History', icons: ['document-text-outline', 'document-text'] },
  Profile: { label: 'Profile', icons: ['person-outline', 'person'] },
};

export default function StudentTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomSpace = Math.max(insets.bottom, MIN_BOTTOM_SPACE);

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const config = TABS[route.name];
          if (!config) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          if (config.center) {
            return (
              <View key={route.key} style={styles.slot}>
                <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel="My QR Code"
                  style={({ pressed }) => [
                    styles.qrButton,
                    pressed && styles.qrPressed,
                  ]}
                >
                  <Ionicons name={config.icon} size={28} color={WHITE} />
                </Pressable>
              </View>
            );
          }

          const color = focused ? COLORS.primary : MUTED;
          return (
            <Pressable
              key={route.key}
               meta={meta}
              focused={focused}
              badge={options.tabBarBadge}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={config.label}
              style={styles.slot}
            >
              <View style={styles.tabInner}>
                <View style={styles.iconRow}>
                  <Ionicons
                    name={focused ? config.icons[1] : config.icons[0]}
                    size={24}
                    color={color}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    { color },
                    focused && styles.labelFocused,
                  ]}
                  numberOfLines={1}
                >
                  {config.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bar: {
    height: BAR_CONTENT_HEIGHT,
    flexDirection: 'row',
     alignItems: 'flex-end',
  },
  slot: {
    flex: 1,
    height: BAR_CONTENT_HEIGHT,
    alignItems: 'center',
    paddingTop: 10,
  },
  tabInner: { alignItems: 'center' },
  iconRow: {
    height: 26,
    justifyContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '500', marginTop: 4 },
  labelFocused: { fontWeight: '600' },
    qrButton: {
    position: 'absolute',
    top: -24,
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: QR_SIZE / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  qrPressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  badgeText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    color: COLORS.onPrimary,
  },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '500', marginTop: 4 },
  labelFocused: { fontWeight: '600' },
});
