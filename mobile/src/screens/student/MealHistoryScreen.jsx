import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

import useAuthStore from '../../store/useAuthStore';
import { BASE_URL } from '../../api/auth.api';
import StudentTopBar from '../../components/StudentTopBar';
import AppButton from '../../components/AppButton';
import { COLORS, RADIUS, SHADOWS } from '../../theme/tokens';

const DASHBOARD_PRIMARY = '#16A36A';
const DASHBOARD_DARK_GREEN = '#15803D';
const DASHBOARD_LIGHT_GREEN = '#DCFCE7';
const DASHBOARD_BACKGROUND = '#F8FAFC';
const DASHBOARD_TEXT = '#0F172A';
const DASHBOARD_TEXT_SECONDARY = '#64748B';
const DASHBOARD_BORDER = '#E2E8F0';
const DASHBOARD_MUTED = '#94A3B8';
const MAX_CONTENT_WIDTH = 680;

function formatClaimDate(isoDate) {
  if (!isoDate) return 'Date unavailable';
  const d = new Date(isoDate);
  const datePart = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

function HistorySkeleton() {
  const shimmer = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.45,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  return (
    <View style={styles.skeletonWrap}>
      {[1, 2, 3, 4].map((i) => (
        <View key={`hist-skel-${i}`} style={styles.historyRow}>
          <Animated.View style={[styles.skeletonCircle, { opacity: shimmer }]} />
          <View style={{ flex: 1, gap: 6 }}>
            <Animated.View style={[styles.skeletonLine, { width: '40%', height: 11, opacity: shimmer }]} />
            <Animated.View style={[styles.skeletonLine, { width: '70%', height: 15, opacity: shimmer }]} />
          </View>
          <Animated.View style={[styles.skeletonPill, { opacity: shimmer }]} />
        </View>
      ))}
    </View>
  );
}

export default function MealHistoryScreen({ navigation }) {
  const { token, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(
    async (isRefresh = false) => {
      if (!user?.studentId) {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      try {
        const response = await axios.get(
          `${BASE_URL}/meal-claims/student/${user.studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          },
        );
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Could not load your meal history. Pull down to try again.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, user?.studentId],
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    fetchHistory(true);
  }, [fetchHistory]);

  const renderHistoryItem = ({ item }) => {
    const formattedDate = formatClaimDate(item.date);
    const creditsLeft = Number(item.creditsRemainingAfter);

    return (
      <View
        style={styles.historyRow}
        accessible
        accessibilityLabel={`Meal claimed: ${item.menuItem}, on ${formattedDate}. ${creditsLeft} credits remaining.`}
      >
        <View style={styles.mealIconWrap}>
          <Ionicons name="restaurant-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.mealInfo}>
          <Text style={styles.claimDateText} numberOfLines={1}>
            {formattedDate}
          </Text>
          <Text style={styles.mealNameText} numberOfLines={2}>
            {item.menuItem || 'Standard Cafeteria Meal'}
          </Text>
          <Text style={styles.claimLocationText} numberOfLines={1}>
            Restau Turnstile
          </Text>
        </View>

        <View style={styles.claimMeta}>
          <View style={styles.claimedBadge}>
            <Ionicons name="checkmark-circle" size={13} color={DASHBOARD_DARK_GREEN} />
            <Text style={styles.claimedBadgeText}>Claimed</Text>
          </View>
          <Text style={styles.creditsRemainingText} numberOfLines={1}>
            {Number.isFinite(creditsLeft) ? `${creditsLeft} left` : ''}
          </Text>
        </View>
      </View>
    );
  };

  const isWide = width >= 700;

  return (
    <View style={styles.screen}>
      <StudentTopBar navigation={navigation} />

      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderHistoryItem}
        contentContainerStyle={[
          styles.listContent,
          isWide && styles.listContentWide,
          { paddingBottom: Math.max(insets.bottom, 16) + 84 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <View style={styles.pageTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Meal History</Text>
                <Text style={styles.pageSubtitle}>
                  Past meals claimed at the campus cafeteria.
                </Text>
              </View>
              {history.length > 0 ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {history.length} {history.length === 1 ? 'meal' : 'meals'}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading && !refreshing ? (
            <HistorySkeleton />
          ) : error ? (
            <View style={styles.stateCard}>
              <View style={[styles.stateIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle-outline" size={26} color="#DC2626" />
              </View>
              <Text style={styles.stateTitle}>Could Not Load History</Text>
              <Text style={styles.stateText}>{error}</Text>
              <AppButton
                title="Try Again"
                onPress={() => fetchHistory(false)}
                variant="secondary"
                style={styles.stateButton}
              />
            </View>
          ) : (
            <View style={styles.stateCard}>
              <View style={[styles.stateIconCircle, { backgroundColor: DASHBOARD_LIGHT_GREEN }]}>
                <Ionicons name="time-outline" size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.stateTitle}>No meals claimed yet</Text>
              <Text style={styles.stateText}>
                When you present your QR code at the cafeteria, your meal claims and remaining credits will appear here.
              </Text>
              <AppButton
                title="View Meal Plans"
                onPress={() => navigation.navigate('Meal Plans')}
                variant="primary"
                style={styles.stateButton}
              />
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DASHBOARD_BACKGROUND,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listContentWide: {
    maxWidth: MAX_CONTENT_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  pageHeader: {
    marginBottom: 14,
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: DASHBOARD_TEXT,
  },
  pageSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: DASHBOARD_TEXT_SECONDARY,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  countBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },

  /* Clean list rows */
  historyRow: {
    minHeight: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.sm,
  },
  mealIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DASHBOARD_LIGHT_GREEN,
    flexShrink: 0,
  },
  mealInfo: {
    flex: 1,
    minWidth: 0,
  },
  claimDateText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  mealNameText: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  claimLocationText: {
    marginTop: 1,
    fontSize: 11,
    lineHeight: 15,
    color: DASHBOARD_MUTED,
  },
  claimMeta: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 3,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: DASHBOARD_LIGHT_GREEN,
  },
  claimedBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: DASHBOARD_DARK_GREEN,
  },
  creditsRemainingText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: DASHBOARD_TEXT_SECONDARY,
  },

  /* Empty / Error states */
  stateCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  stateIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stateTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
    marginBottom: 4,
    textAlign: 'center',
  },
  stateText: {
    fontSize: 13,
    lineHeight: 19,
    color: DASHBOARD_TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  stateButton: {
    alignSelf: 'stretch',
  },

  /* Skeleton */
  skeletonWrap: {
    marginTop: 4,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    flexShrink: 0,
  },
  skeletonLine: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  skeletonPill: {
    width: 60,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
  },
});
