import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMealPlans } from '../../api/mealPlans.api';
import { COLORS, SHADOWS, SPACING } from '../../theme/tokens';

// ─── Colour palette (matches the approved admin design) ───────────────────────
const HERO        = '#075E45';
const PRIMARY     = '#0B7A55';
const TILE        = '#E6F6EE';
const TILE_TEXT   = '#075E45';
const TILE_OFF    = '#EEF2F6';
const HERO_SOFT   = '#BFE8D4';
const BG          = '#F4F6F5';
const SURFACE     = '#FFFFFF';
const TEXT        = '#0F172A';
const TEXT_SEC    = '#475569';
const TEXT_MUTED  = '#64748B';
const BORDER      = '#E2E8F0';
const INACTIVE_BG = '#E2E8F0';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MealPlansScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [plans, setPlans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState('');

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const data = await getMealPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (_e) {
      setPlans([]);
      setError("We couldn't load the meal plans right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const activeCount   = useMemo(() => plans.filter((p) => p.isActive).length, [plans]);
  const inactiveCount = plans.length - activeCount;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconWrap}>
            <ActivityIndicator size="small" color={PRIMARY} />
          </View>
          <Text style={styles.loadingTitle}>Loading meal plans{'\u2026'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <View style={[styles.hero, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <View style={styles.heroCircle} />

        <View style={styles.heroTopRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={20} color={SURFACE} />
          </Pressable>
          <Text style={styles.heroTitle}>Meal plans</Text>
        </View>

        <View style={styles.heroCountRow}>
          <Text style={styles.heroCount}>{plans.length}</Text>
          <Text style={styles.heroCountLabel}>meal plans</Text>
        </View>

        <View style={styles.pillRow}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>{activeCount} active</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>{inactiveCount} inactive</Text>
          </View>
        </View>
      </View>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
      >
        {error && plans.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={[styles.stateIconWrap, { backgroundColor: COLORS.dangerLight }]}>
              <Ionicons name="alert-circle-outline" size={22} color={COLORS.danger} />
            </View>
            <Text style={styles.stateTitle}>Something went wrong</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              onPress={() => fetchData()}
              accessibilityRole="button"
              accessibilityLabel="Try again"
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={[styles.stateIconWrap, { backgroundColor: TILE }]}>
              <Ionicons name="restaurant-outline" size={22} color={HERO} />
            </View>
            <Text style={styles.stateTitle}>No meal plans yet</Text>
            <Text style={styles.stateText}>
              Create your first meal plan to get started.
            </Text>
          </View>
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onMore={() => navigation.navigate('EditMealPlan', { plan })}
            />
          ))
        )}
      </ScrollView>

      {/* ── Bottom action ─────────────────────────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateMealPlan')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Create meal plan"
          style={styles.createButton}
        >
          <Ionicons name="add" size={20} color={SURFACE} />
          <Text style={styles.createButtonText}>Create meal plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, onMore }) {
  const credits     = Number(plan.credits);
  const creditsWord = credits === 1 ? 'credit' : 'credits';
  const total       = Number(plan.pricePerCredit) * credits;
  const isActive    = !!plan.isActive;

  return (
    <View style={styles.planCard}>
      {/* Credit tile */}
      <View style={[styles.creditTile, !isActive && styles.creditTileOff]}>
        <Text style={styles.creditNumber}>{plan.credits}</Text>
        <Text style={styles.creditWord}>{creditsWord}</Text>
      </View>

      {/* Name, per-credit, status */}
      <View style={styles.planInfo}>
        <Text style={styles.planName} numberOfLines={1}>{plan.name}</Text>
        <Text style={styles.planPerCredit} numberOfLines={1}>
          {formatMoney(plan.pricePerCredit)} FCFA / credit
        </Text>
        <View style={[styles.statusPill, !isActive && styles.statusPillOff]}>
          <Text style={[styles.statusText, !isActive && styles.statusTextOff]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Total */}
      <View style={styles.priceCol}>
        <Text style={styles.planTotal}>{formatMoney(total)}</Text>
        <Text style={styles.planCurrency}>FCFA</Text>
      </View>

      {/* More */}
      <Pressable
        onPress={onMore}
        accessibilityRole="button"
        accessibilityLabel={'More options for ' + plan.name}
        hitSlop={8}
        style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={TEXT_SEC} />
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  pressed: {
    opacity: 0.85,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TILE,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },

  // Hero (≈200pt tall in the design)
  hero: {
    backgroundColor: HERO,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
    minHeight: 200,
  },
  heroCircle: {
    position: 'absolute',
    right: -70,
    top: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    letterSpacing: -0.35,
    color: SURFACE,
  },
  heroCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 18,
  },
  heroCount: {
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 48,
    includeFontPadding: false,
    color: SURFACE,
  },
  heroCountLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: HERO_SOFT,
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  heroPill: {
    height: 30,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  heroPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: SURFACE,
  },

  // List
  scroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Plan card (≈103pt tall, 13pt gap)
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 18,
    minHeight: 103,
    marginBottom: 13,
    ...SHADOWS.sm,
  },
  creditTile: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: TILE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  creditTileOff: {
    backgroundColor: TILE_OFF,
  },
  creditNumber: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    color: TILE_TEXT,
  },
  creditWord: {
    marginTop: 2,
    fontSize: 12,
    color: TILE_TEXT,
  },

  planInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  planName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: TEXT,
  },
  planPerCredit: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_MUTED,
  },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    height: 23,
    justifyContent: 'center',
    backgroundColor: TILE,
    borderRadius: 999,
    paddingHorizontal: 10,
  },
  statusPillOff: {
    backgroundColor: INACTIVE_BG,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: TILE_TEXT,
  },
  statusTextOff: {
    color: TEXT_SEC,
  },

  priceCol: {
    width: 76,
    alignItems: 'flex-end',
    marginLeft: 8,
    flexShrink: 0,
  },
  planTotal: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: TEXT,
  },
  planCurrency: {
    marginTop: 1,
    fontSize: 12,
    color: TEXT_MUTED,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    flexShrink: 0,
  },

  // State cards
  stateCard: {
    marginTop: 4,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOWS.sm,
  },
  stateIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: TEXT,
  },
  stateText: {
    marginTop: 4,
    maxWidth: 280,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: TEXT_MUTED,
  },
  retryButton: {
    marginTop: SPACING.md,
    height: 44,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_SEC,
  },

  // Bottom action (52pt button, 16pt side margins)
  bottomBar: {
    backgroundColor: SURFACE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  createButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: SURFACE,
  },
});