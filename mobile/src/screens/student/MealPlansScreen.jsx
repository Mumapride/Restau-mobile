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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../store/useAuthStore';
import { getMealPlans } from '../../api/mealPlans.api';
import { getActiveSemester } from '../../api/semester.api';
import AppButton from '../../components/AppButton';

// ─── Measured from the MPR1 artboard (design points, 390×844 frame) ──────────
const PAGE_BG = '#F6F8F7';
const BORDER = '#E3E8EC';
const WHITE = '#FFFFFF';
const GREEN = '#087A55';
const PALE_GREEN = '#E8F8EE';
const NAVY = '#0B1026';
const MUTED = '#747D96';
const NEUTRAL_TILE = '#F1F4F6';
const DISABLED_BG = '#E3E8EC';
const TOP_INSET_DESIGN = 54;
const FOOTER_BOTTOM_DESIGN = 26;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatLongDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MealPlansScreen({ navigation }) {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [plans, setPlans] = useState([]);
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // ── Data fetching (unchanged logic) ────────────────────────────────────────
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

  // ── Selection and navigation (unchanged logic) ─────────────────────────────
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || null;

  const handleContinue = () => {
    if (!selectedPlan) return;

    if (!semester) {
      Alert.alert(
        'No Active Semester',
        'There is no active semester right now. Please check back later.',
      );
      return;
    }

    navigation.navigate('Payment', {
      plan: selectedPlan,
      semester,
      studentId: user?.studentId,
    });
  };

  // Top offset: design uses 54pt; devices with a larger safe area keep theirs.
  const topPadding = Math.max(insets.top, TOP_INSET_DESIGN);
  const bottomPadding = Math.max(insets.bottom, FOOTER_BOTTOM_DESIGN);

  const header = (
    <View style={[styles.header, { paddingTop: topPadding }]}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={18} color={NAVY} />
        </Pressable>

        {semester ? (
          <View style={styles.semesterPill}>
            <Text style={styles.semesterPillText} numberOfLines={1}>
              {semester.name || 'Active semester'}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={GREEN} />
          <Text style={styles.loadingText}>Loading meal plans…</Text>
        </View>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      {header}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[GREEN]}
            tintColor={GREEN}
          />
        }
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Meal plans</Text>
          <Text style={styles.subtitle}>Choose a plan to continue to payment.</Text>
        </View>

        {/* Credit expiry banner */}
        <ExpiryBanner semester={semester} />

        {/* States: error / empty / list */}
        {error && plans.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Something went wrong</Text>
            <Text style={styles.stateText}>{error}</Text>
            <AppButton
              title="Try Again"
              onPress={() => fetchData()}
              variant="secondary"
              style={styles.retryButton}
            />
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>No meal plans available</Text>
            <Text style={styles.stateText}>
              There aren't any meal plans available for this semester yet.
            </Text>
          </View>
        ) : (
          <View style={styles.plansList}>
            {plans.map((plan, index) => {
              const totalPrice = Number(plan.pricePerCredit) * Number(plan.credits);
              const isFeatured = index === 0;
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  totalPrice={totalPrice}
                  isSelected={selectedPlanId === plan.id}
                  isFeatured={isFeatured}
                  onPress={() => setSelectedPlanId(plan.id)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Fixed footer */}
      <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
        <Pressable
          onPress={handleContinue}
          disabled={!selectedPlan}
          accessibilityRole="button"
          accessibilityLabel="Continue to payment"
          accessibilityState={{ disabled: !selectedPlan }}
          style={({ pressed }) => [
            styles.cta,
            !selectedPlan && styles.ctaDisabled,
            pressed && selectedPlan && styles.pressed,
          ]}
        >
          <Text style={[styles.ctaText, !selectedPlan && styles.ctaTextDisabled]}>
            Continue to payment
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── ExpiryBanner ─────────────────────────────────────────────────────────────
function ExpiryBanner({ semester }) {
  if (!semester) {
    return (
      <View style={styles.banner}>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerLabel}>No active semester</Text>
          <Text style={styles.bannerValue}>Check back later</Text>
        </View>
      </View>
    );
  }

  const expiry = formatLongDate(semester.endDate);

  return (
    <View style={styles.banner}>
      <View style={styles.bannerCopy}>
        <Text style={styles.bannerLabel}>Credits expire</Text>
        <Text style={styles.bannerValue} numberOfLines={1}>
          {expiry || 'Expiry date not set'}
        </Text>
      </View>
      <View style={styles.activeBadge}>
        <Text style={styles.activeBadgeText}>Active</Text>
      </View>
    </View>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, totalPrice, isSelected, isFeatured, onPress }) {
  const creditsWord = Number(plan.credits) === 1 ? 'credit' : 'credits';
  const highlighted = isSelected;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${plan.name}, ${plan.credits} ${creditsWord}, ${formatMoney(totalPrice)} FCFA`}
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [
        styles.planCard,
        highlighted ? styles.planCardHighlighted : styles.planCardDefault,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.creditCircle, isSelected ? styles.creditCircleFeatured : styles.creditCircleDefault]}>
        <Text style={[styles.creditNumber, isSelected && styles.creditNumberFeatured]}>
          {plan.credits}
        </Text>
        <Text style={styles.creditWord}>{creditsWord}</Text>
      </View>

      <View style={styles.planInfo}>
       <View style={styles.planNameRow}>
  <Text style={styles.planName} numberOfLines={1}>
    {plan.name}
  </Text>

  {isFeatured ? (
    <View style={styles.mostChosenBadge}>
      <Text style={styles.mostChosenText}>Most Popular</Text>
    </View>
  ) : null}
</View>
        <Text style={styles.planRate} numberOfLines={1}>
          {formatMoney(plan.pricePerCredit)} FCFA per credit
        </Text>
      </View>

      <View style={styles.priceCol}>
        <Text style={styles.planTotal} numberOfLines={1}>
          {formatMoney(totalPrice)}
        </Text>
        <Text style={styles.planCurrency}>FCFA</Text>
      </View>
    </Pressable>
  );
}

// ─── Styles (values from the MPR1 artboard) ───────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  pressed: {
    opacity: 0.9,
  },

  // Header
  header: {
    paddingHorizontal: 18,
    paddingBottom: 0,
    backgroundColor: PAGE_BG,
  },
  headerRow: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  semesterPill: {
    maxWidth: 200,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  semesterPillText: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
  },

  // Scroll area
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: MUTED,
  },

  // Title
  titleBlock: {
    marginTop: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: NAVY,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
  },

  // Expiry banner
  banner: {
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: PALE_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  bannerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: GREEN,
  },
  bannerValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '600',
    color: NAVY,
  },
  activeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: GREEN,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
  },

  // Plan cards
  plansList: {
    marginTop: 16,
    gap: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 22,
    backgroundColor: WHITE,
  },
  planCardDefault: {
    borderWidth: 1,
    borderColor: BORDER,
  },
  planCardHighlighted: {
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  creditCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  creditCircleFeatured: {
    backgroundColor: PALE_GREEN,
  },
  creditCircleDefault: {
    backgroundColor: NEUTRAL_TILE,
  },
  creditNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: NAVY,
  },
  creditNumberFeatured: {
    color: GREEN,
  },
  creditWord: {
    marginTop: 2,
    fontSize: 10,
    color: MUTED,
  },
  planInfo: {
    flex: 1,
    minWidth: 0,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planName: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: NAVY,
  },
  mostChosenBadge: {
    marginLeft: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: NAVY,
  },
  mostChosenText: {
    fontSize: 10,
    fontWeight: '600',
    color: WHITE,
  },
  planRate: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
  },
  priceCol: {
    alignItems: 'flex-end',
    marginLeft: 12,
    flexShrink: 0,
  },
  planTotal: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  planCurrency: {
    fontSize: 11,
    color: MUTED,
  },

  // State cards
  stateCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: NAVY,
  },
  stateText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: MUTED,
  },
  retryButton: {
    alignSelf: 'stretch',
    marginTop: 12,
  },

  // Footer
  footer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    backgroundColor: PAGE_BG,
  },
  cta: {
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    backgroundColor: DISABLED_BG,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },
  ctaTextDisabled: {
    color: MUTED,
  },
});