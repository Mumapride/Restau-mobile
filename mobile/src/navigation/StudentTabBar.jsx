import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../theme/tokens';

/**
 * StudentTabBar — custom, animated replacement for the default bottom tabs.
 *
 * Presentational only: navigation behaviour is injected through the props
 * React Navigation hands to `tabBar`.
 *
 *  - Sliding indicator follows the focused tab.
 *  - Per-tab pill + icon spring on focus (native-driven).
 *  - Safe-area aware height, rounded dock, hairline border and soft shadow.
 */

const TAB_META = {
  Dashboard: { label: 'Dashboard', icon: 'home-outline', activeIcon: 'home' },
  'Meal Plans': {
    label: 'Plans',
    icon: 'restaurant-outline',
    activeIcon: 'restaurant',
  },
  'My QR Code': {
    label: 'My QR',
    icon: 'qr-code-outline',
    activeIcon: 'qr-code',
  },
  History: { label: 'History', icon: 'time-outline', activeIcon: 'time' },
  Profile: { label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
};

const FALLBACK_META = {
  label: '',
  icon: 'ellipse-outline',
  activeIcon: 'ellipse',
};

function TabItem({
  meta,
  focused,
  badge,
  onPress,
  onLongPress,
  accessibilityLabel,
}) {
  const focus = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const [hovered, setHovered] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    Animated.spring(focus, {
      toValue: focused ? 1 : 0,
      tension: 95,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [focus, focused]);

  const iconStyle = {
    transform: [
      {
        scale: focus.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.14],
        }),
      },
      {
        translateY: focus.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1.5],
        }),
      },
    ],
  };

  const pillStyle = {
    opacity: focus,
    transform: [
      {
        scale: focus.interpolate({
          inputRange: [0, 1],
          outputRange: [0.68, 1],
        }),
      },
    ],
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocusVisible(true)}
      onBlur={() => setFocusVisible(false)}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 6, bottom: 6 }}
      style={({ pressed }) => [
        styles.item,
        hovered && !focused && styles.itemHovered,
        focusVisible && styles.itemFocused,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />

        <Animated.View style={iconStyle}>
          <Ionicons
            name={focused ? meta.activeIcon : meta.icon}
            size={21}
            color={focused || hovered ? COLORS.primary : COLORS.textMuted}
          />
        </Animated.View>

        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <Text
        style={[
          styles.label,
          hovered && !focused && styles.labelHovered,
          focused && styles.labelFocused,
        ]}
        numberOfLines={1}
      >
        {meta.label}
      </Text>
    </Pressable>
  );
}

export default function StudentTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const tabCount = state.routes.length;
  const tabWidth = tabCount > 0 && barWidth > 0 ? barWidth / tabCount : 0;

  const slide = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: state.index,
      tension: 72,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [slide, state.index]);

  const indicatorStyle = {
    transform: [
      {
        translateX: slide.interpolate({
          inputRange: [0, Math.max(tabCount - 1, 1)],
          outputRange: [0, tabWidth * Math.max(tabCount - 1, 0)],
        }),
      },
    ],
  };

  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
    >
      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.indicatorSlot, { width: tabWidth }, indicatorStyle]}
        >
          <View style={styles.indicator} />
        </Animated.View>
      ) : null}

      <View style={styles.itemsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const meta = {
            ...FALLBACK_META,
            label: route.name,
            ...(TAB_META[route.name] || {}),
          };

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

          return (
            <TabItem
              key={route.key}
              meta={meta}
              focused={focused}
              badge={options.tabBarBadge}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={
                options.tabBarAccessibilityLabel || meta.label
              }
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 7,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#0B2E1D',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },

  indicatorSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
  },

  indicator: {
    width: 34,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: COLORS.primary,
  },

  itemsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 44,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },

  itemHovered: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },

  itemFocused: Platform.select({
    web: {
      outlineColor: COLORS.primary,
      outlineOffset: 2,
      outlineStyle: 'solid',
      outlineWidth: 1,
      borderRadius: 14,
    },
    default: {},
  }),

  itemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  iconWrap: {
    width: 44,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pill: {
    position: 'absolute',
    width: 42,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
  },

  label: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },

  labelHovered: {
    color: COLORS.textSecondary,
  },

  labelFocused: {
    fontWeight: '600',
    color: COLORS.primary,
  },

  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    color: COLORS.onPrimary,
  },
});
