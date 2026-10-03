import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../store/useAuthStore';
import { getMealPlans } from '../../api/mealPlans.api';
import { getActiveSemester } from '../../api/semester.api';
import AppButton from '../../components/AppButton';
import StudentTopBar from '../../components/StudentTopBar';
import { COLORS, SHADOWS, SPACING } from '../../theme/tokens';

// ─── Colour palette ───────────────────────────────────────────────────────────
const PRIMARY      = '#1B5E3A';
const PRIMARY_DARK = '#123F27';
const PRIMARY_MID  = '#16A36A';
const LIGHT_GREEN  = '#DCFCE7';
const MINT_BG      = '#F0FDF4';
const MINT_BORDER  = '#BBF7D0';
const BG           = '#F8FAFC';
const SURFACE      = '#FFFFFF';
const TEXT         = '#0F172A';
const TEXT_SEC     = '#64748B';
const TEXT_MUTED   = '#94A3B8';
const BORDER       = '#E2E8F0';
const MAX_WIDTH    = 680;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatDate(value) {
  if (!value) return '\u2014';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MealPlansScreen({ navigation }) {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [plans, setPlans]                   = useState([]);
  const [semester, setSemester]             = useState(null);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [error, setError]                   = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const plansData = await getMealPlans();
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (_e) {
      setPlans([]);
      setError("We couldn't load the meal plans right now.");
    }

    // Semester is optional — don't fail if it errors
    try {
      const semesterData = await getActiveSemester();
      setSemester(semesterData);
    } catch (_e) {
      setSemester(null);
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

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleSelectPlan = (plan) => {
    if (!semester) {
      Alert.alert(
        'No Active Semester',
        'There is no active semester right now. Please check back later.',
      );
      return;
    }
    setSelectedPlanId(plan.id);
    navigation.navigate('Payment', { plan, semester, studentId: user.studentId });
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.screen}>
        <StudentTopBar navigation={navigation} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconWrap}>
            <ActivityIndicator size="small" color={PRIMARY} />
          </View>
          <Text style={styles.loadingTitle}>Loading meal plans{'\u2026'}</Text>
          <Text style={styles.loadingSubtitle}>
            Finding the best options for your campus schedule.
          </Text>
        </View>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  const isWide = width >= 700;

  return (
    <View style={styles.screen}>
      {/* Fixed top bar */}
      <StudentTopBar navigation={navigation} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 84 },
        ]}
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
        <View style={[styles.inner, isWide && styles.innerWide]}>

          {/* ── Semester card ──────────────────────────────────────────────── */}
          {semester ? (
            <View style={styles.semesterCard}>
              <View style={styles.semesterIconBubble}>
                <Ionicons name="school-outline" size={20} color={COLORS.onPrimary} />
              </View>

              <View style={styles.semesterCopy}>
                <Text style={styles.semesterLabel}>Current semester</Text>
                <Text style={styles.semesterName} numberOfLines={1}>
                  {semester.name || 'Active semester'}
                </Text>
              </View>

              <View style={styles.semesterDivider} />

              <View style={styles.semesterMeta}>
                <Text style={styles.semesterMetaLabel}>Credits expire</Text>
                <Text style={styles.semesterMetaValue} numberOfLines={1}>
                  {formatDate(semester.endDate)}
                </Text>
              </View>
            </View>
          ) : null}

          {/* ── Section heading ────────────────────────────────────────────── */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            <Text style={styles.sectionSubtitle}>
              Select a plan to continue to payment.
            </Text>
          </View>

          {/* ── States: error / empty / list ──────────────────────────────── */}
          {error && plans.length === 0 ? (
            <View style={styles.stateCard}>
              <View style={[styles.stateIconWrap, { backgroundColor: COLORS.dangerLight }]}>
                <Ionicons name="alert-circle-outline" size={22} color={COLORS.danger} />
              </View>
              <Text style={styles.stateTitle}>Something went wrong</Text>
              <Text style={styles.stateText}>{error}</Text>
              <AppButton
                title="Try Again"
                onPress={fetchData}
                variant="secondary"
                style={{ alignSelf: 'stretch', marginTop: SPACING.md }}
              />
            </View>
          ) : plans.length === 0 ? (
            <View style={styles.stateCard}>
              <View style={[styles.stateIconWrap, { backgroundColor: LIGHT_GREEN }]}>
                <Ionicons name="restaurant-outline" size={22} color={PRIMARY} />
              </View>
              <Text style={styles.stateTitle}>No meal plans available</Text>
              <Text style={styles.stateText}>
                There aren't any meal plans available for this semester yet.
              </Text>
            </View>
          ) : (
            <View style={styles.plansList}>
              {plans.map((plan, index) => {
                const isSelected = selectedPlanId === plan.id;
                const totalPrice = Number(plan.pricePerCredit) * Number(plan.credits);
                const isPopular  = index === 0;

                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    totalPrice={totalPrice}
                    isSelected={isSelected}
                    isPopular={isPopular}
                    onPress={() => handleSelectPlan(plan)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, totalPrice, isSelected, isPopular, onPress }) {
  const creditsLabel = Number(plan.credits) === 1 ? 'Meal credit' : 'Meal credits';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={'Select ' + plan.name}
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [
        styles.planCard,
        isSelected && styles.planCardSelected,
        pressed && styles.planCardPressed,
      ]}
    >
      {/* Top: badge + title + description */}
      <View style={styles.planCardTop}>
        {isPopular ? (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        ) : null}

        <Text style={styles.planName}>{plan.name}</Text>

        {plan.description ? (
          <Text style={styles.planDescription} numberOfLines={2}>
            {plan.description}
          </Text>
        ) : null}
      </View>

      {/* Divider */}
      <View style={styles.planDivider} />

      {/* Metrics row */}
      <View style={styles.metricsRow}>
        {/* Credits */}
        <View style={styles.metricItem}>
          <View style={styles.metricIconWrap}>
            <Ionicons name="restaurant-outline" size={16} color={PRIMARY} />
          </View>
          <View>
            <Text style={styles.metricValue}>{plan.credits}</Text>
            <Text style={styles.metricLabel}>{creditsLabel}</Text>
          </View>
        </View>

        {/* Vertical separator */}
        <View style={styles.metricSep} />

        {/* Total price */}
        <View style={styles.metricItem}>
          <View style={styles.metricIconWrap}>
            <Ionicons name="wallet-outline" size={16} color={PRIMARY} />
          </View>
          <View>
            <Text style={[styles.metricValue, styles.metricValueGreen]}>
              {formatMoney(totalPrice)}
            </Text>
            <Text style={styles.metricLabel}>FCFA total</Text>
          </View>
        </View>
      </View>

      {/* Per-credit line */}
      <View style={styles.perCreditRow}>
        <Ionicons name="pricetag-outline" size={13} color={PRIMARY_MID} />
        <Text style={styles.perCreditText}>
          {formatMoney(plan.pricePerCredit)} FCFA per credit
        </Text>
      </View>

      {/* Choose Plan button */}
      <View style={[styles.choosePlanBtn, isSelected && styles.choosePlanBtnSelected]}>
        <Text style={[styles.choosePlanText, isSelected && styles.choosePlanTextSelected]}>
          {isSelected ? 'Selected \u2713' : 'Choose Plan'}
        </Text>
        {!isSelected && (
          <Ionicons name="arrow-forward" size={16} color={COLORS.onPrimary} />
        )}
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Scaffold
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingTop: 12,
  },
  inner: {
    width: '100%',
    paddingHorizontal: 16,
  },
  innerWide: {
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: BG,
  },
  loadingIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
    color: TEXT,
  },
  loadingSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: TEXT_SEC,
  },

  // Semester card
  semesterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MINT_BORDER,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 0,
    ...SHADOWS.sm,
  },
  semesterIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    marginRight: 10,
    flexShrink: 0,
  },
  semesterCopy: {
    flex: 1,
    minWidth: 0,
  },
  semesterLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: TEXT_MUTED,
    letterSpacing: 0.1,
  },
  semesterName: {
    marginTop: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: TEXT,
  },
  semesterDivider: {
    width: 1,
    height: 32,
    backgroundColor: BORDER,
    marginHorizontal: 10,
    flexShrink: 0,
  },
  semesterMeta: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 80,
  },
  semesterMetaLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: TEXT_MUTED,
  },
  semesterMetaValue: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: PRIMARY_MID,
  },

  // Section heading
  sectionHeading: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: TEXT,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_SEC,
  },

  // Plans list
  plansList: {
    marginBottom: 8,
  },

  // Plan card
  planCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.md,
  },
  planCardSelected: {
    borderColor: PRIMARY,
    backgroundColor: MINT_BG,
  },
  planCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  // Card top
  planCardTop: {
    marginBottom: 10,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: LIGHT_GREEN,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: PRIMARY,
  },
  planName: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: TEXT,
  },
  planDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_SEC,
  },

  // Card divider
  planDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 10,
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  metricValue: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: TEXT,
  },
  metricValueGreen: {
    color: PRIMARY,
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: TEXT_MUTED,
  },
  metricSep: {
    width: 1,
    height: 36,
    backgroundColor: BORDER,
    marginHorizontal: 14,
    flexShrink: 0,
  },

  // Per-credit
  perCreditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  perCreditText: {
    marginLeft: 5,
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SEC,
  },

  // Choose Plan button
  choosePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY_DARK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  choosePlanBtnSelected: {
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  choosePlanText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onPrimary,
    letterSpacing: 0.1,
    marginRight: 6,
  },
  choosePlanTextSelected: {
    color: PRIMARY,
    marginRight: 0,
  },

  // State cards (empty / error)
  stateCard: {
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOWS.sm,
  },
  stateIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: TEXT,
  },
  stateText: {
    marginTop: 4,
    maxWidth: 280,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: TEXT_SEC,
  },
});
