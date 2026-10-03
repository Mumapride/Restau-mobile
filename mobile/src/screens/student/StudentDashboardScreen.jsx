import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Alert,
  Animated,
  AppState,
  Easing,
  ImageBackground,
  Pressable,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

import useAuthStore from '../../store/useAuthStore';
import { BASE_URL } from '../../api/auth.api';
import Avatar from '../../components/Avatar';
import StudentTopBar from '../../components/StudentTopBar';
import { COLORS } from '../../theme/tokens';

const DAY_LABELS = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};
const SERVICE_DAYS = ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const H_MARGIN = 16;
const MAX_CONTENT_WIDTH = 680;
const PANEL_PADDING = 12;

const DASHBOARD_PRIMARY = '#16A36A';
const DASHBOARD_DARK_GREEN = '#15803D';
const DASHBOARD_LIGHT_GREEN = '#DCFCE7';
const DASHBOARD_BACKGROUND = '#F8FAFC';
const DASHBOARD_TEXT = '#0F172A';
const DASHBOARD_TEXT_SECONDARY = '#64748B';
const DASHBOARD_BORDER = '#E2E8F0';
const DASHBOARD_MUTED = '#94A3B8';
const INFO_BLUE = '#2563EB';

// Web-only affordance; native keeps default press behavior.
const WEB_CURSOR_STYLE = Platform.select({
  web: { cursor: 'pointer' },
  default: {},
});

// Presentation-only fallback: the backend menu contract currently has no image field.
const PRESENTATION_MEAL_IMAGE =
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85';

// Isolated static UI content. There is currently no announcements endpoint.
const STATIC_ANNOUNCEMENT_PREVIEW = {
  title: 'Keep your meal pass ready',
  message:
    'Scan your QR code at the cafeteria entrance to collect your meal.',
};

const QUICK_ACTIONS = [
  {
    id: 'qr',
    label: 'My QR Code',
    description: 'Show to scan',
    icon: 'qr-code',
    route: 'My QR Code',
    tint: '#15803D',
    bg: '#DCFCE7',
  },
  {
    id: 'plans',
    label: 'Meal Plans',
    description: 'View menu',
    icon: 'restaurant',
    route: 'Meal Plans',
    tint: '#EA8A0A',
    bg: '#FFF1D6',
  },
  {
    id: 'credit',
    label: 'Buy Credit',
    description: '1-day, 4-day plans',
    icon: 'card',
    route: 'Meal Plans',
    tint: '#2563EB',
    bg: '#DBEAFE',
  },
  {
    id: 'history',
    label: 'History',
    description: 'View meals',
    icon: 'document-text',
    route: 'History',
    tint: '#7C3AED',
    bg: '#EDE9FE',
  },
];

// Subtle food icons drifting upward inside the green hero (Ionicons only, no emoji).
const FOOD_DRIFT_ICONS = [
  { name: 'restaurant-outline', size: 16, left: '5%', top: '10%', duration: 11000, delay: 0, drift: 8, rise: 34 },
  { name: 'cafe-outline', size: 14, left: '19%', top: '40%', duration: 13000, delay: 1800, drift: -7, rise: 38 },
  { name: 'fast-food-outline', size: 18, left: '33%', top: '18%', duration: 12000, delay: 900, drift: 9, rise: 30 },
  { name: 'nutrition-outline', size: 15, left: '47%', top: '48%', duration: 14000, delay: 3000, drift: -8, rise: 40 },
  { name: 'pizza-outline', size: 16, left: '60%', top: '12%', duration: 12500, delay: 2200, drift: 7, rise: 32 },
  { name: 'fish-outline', size: 15, left: '71%', top: '44%', duration: 15000, delay: 600, drift: -6, rise: 42 },
  { name: 'egg-outline', size: 14, left: '82%', top: '24%', duration: 13500, delay: 4000, drift: 6, rise: 30 },
  { name: 'ice-cream-outline', size: 16, left: '90%', top: '52%', duration: 16000, delay: 2600, drift: -5, rise: 36 },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(firstName, lastName) {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
}

function formatAcademicYear(value) {
  if (!value) return 'Academic year unavailable';

  const endYear = new Date(value).getFullYear();
  if (Number.isNaN(endYear)) return 'Academic year unavailable';

  return `${endYear - 1} / ${endYear}`;
}

function formatLongDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatSyncTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTodayKey() {
  return new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
}

function pluralize(count, singular, plural) {
  return Number(count) === 1 ? singular : plural;
}

function daysUntil(value) {
  if (!value) return null;
  return Math.ceil(
    (new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function findNextServiceDay(menu, todayKey) {
  if (!menu || menu.length === 0) return null;
  const todayIndex = SERVICE_DAYS.indexOf(todayKey);
  if (todayIndex === -1) return menu[0];
  const upcoming = [
    ...SERVICE_DAYS.slice(todayIndex + 1),
    ...SERVICE_DAYS.slice(0, todayIndex),
  ];
  for (const day of upcoming) {
    const match = menu.find((item) => item.day === day);
    if (match) return match;
  }
  return null;
}

// Single, quick fade for the whole dashboard once data is ready.
function useFadeIn(enabled) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) {
      progress.setValue(0);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enabled, progress]);
  return { opacity: progress };
}

function FoodDriftIcon({ config }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(config.delay),
      Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    ]);
    animation.start();
    return () => animation.stop();
  }, [config, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -config.rise],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, config.drift, 0],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.16, 0.16, 0],
  });

  return (
    <Animated.View
      style={[
        styles.foodIcon,
        {
          left: config.left,
          top: config.top,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      <Ionicons name={config.name} size={config.size} color="#FFFFFF" />
    </Animated.View>
  );
}

function FoodBackdrop() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(Boolean(enabled));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (reduceMotion) return null;

  return (
    <View pointerEvents="none" style={styles.foodLayer}>
      {FOOD_DRIFT_ICONS.map((config) => (
        <FoodDriftIcon key={config.name} config={config} />
      ))}
    </View>
  );
}

function SectionHeading({
  icon,
  iconColor = DASHBOARD_PRIMARY,
  title,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={styles.sectionTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && styles.pressedSoft,
          ]}
        >
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={DASHBOARD_TEXT_SECONDARY}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function UsageBar({ ratio, color = DASHBOARD_PRIMARY, style }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const width = useRef(new Animated.Value(0)).current;
  const safeRatio = Math.max(0, Math.min(Number(ratio) || 0, 1));
  useEffect(() => {
    if (!trackWidth) return;
    Animated.timing(width, {
      toValue: Math.max(trackWidth * safeRatio, 6),
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [safeRatio, trackWidth, width]);
  return (
    <View
      style={[styles.usageTrack, style]}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[styles.usageFill, { width, backgroundColor: color }]}
      />
    </View>
  );
}

function QuickActionTile({ action, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${action.label}. ${action.description}`}
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.quickActionPressed,
      ]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
        <Ionicons name={action.icon} size={24} color={action.tint} />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={1}>
        {action.label}
      </Text>
      <Text style={styles.quickActionDescription} numberOfLines={2}>
        {action.description}
      </Text>
    </Pressable>
  );
}

function MealCard({ item, isToday, width, horizontal }) {
  const dayLabel = DAY_LABELS[item.day] || item.day || 'Menu';

  const image = (
    <ImageBackground
      source={{ uri: PRESENTATION_MEAL_IMAGE }}
      style={[styles.mealImage, horizontal && styles.mealImageRow]}
      imageStyle={styles.mealImageRadius}
      resizeMode="cover"
    >
      <View
        style={[
          styles.mealBadge,
          isToday ? styles.mealBadgeToday : styles.mealBadgeSchedule,
        ]}
      >
        <Text
          style={[
            styles.mealBadgeText,
            !isToday && styles.mealBadgeTextSchedule,
          ]}
        >
          {isToday ? 'Today' : dayLabel}
        </Text>
      </View>
    </ImageBackground>
  );

  const body = (
    <>
      <Text
        style={[styles.mealName, horizontal && styles.mealNameRow]}
        numberOfLines={2}
      >
        {item.mealName}
      </Text>
      {item.description ? (
        <Text style={styles.mealDescription} numberOfLines={1}>
          {item.description}
        </Text>
      ) : null}
      <View style={styles.mealTimeRow}>
        <Ionicons
          name="time-outline"
          size={13}
          color={DASHBOARD_TEXT_SECONDARY}
        />
        <Text style={styles.mealTimeText} numberOfLines={1}>
          Serving time to be announced
        </Text>
      </View>
    </>
  );

  if (horizontal) {
    return (
      <View style={styles.mealRowCard}>
        {image}
        <View style={styles.mealRowBody}>{body}</View>
      </View>
    );
  }

  return (
    <View style={{ width }}>
      {image}
      {body}
    </View>
  );
}

function AccountRow({ icon, label, value, onPress, accessibilityLabel, isLast }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.accountItem,
        !isLast && styles.accountItemDivider,
        pressed && styles.accountItemPressed,
      ]}
    >
      <View style={styles.accountIconBox}>
        <Ionicons name={icon} size={18} color={DASHBOARD_DARK_GREEN} />
      </View>
      <View style={styles.accountCopy}>
        <Text style={styles.accountLabel}>{label}</Text>
        <Text style={styles.accountValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={DASHBOARD_MUTED} />
    </Pressable>
  );
}

function DashboardLoader() {
  const shimmer = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.45,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);
  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[COLORS.primary, DASHBOARD_PRIMARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, styles.loaderHero]}
      >
        <View style={styles.heroInner}>
          <Text style={styles.loaderTitle}>Loading your meal account…</Text>
          <Text style={styles.loaderSubtitle}>
            Fetching your plan, credits and this week’s menu
          </Text>
        </View>
      </LinearGradient>
      <View style={styles.loaderBody}>
        {[104, 86, 140, 104].map((height, index) => (
          <Animated.View
            key={`skeleton-${index}`}
            style={[styles.loaderBlock, { height, opacity: shimmer }]}
          />
        ))}
      </View>
    </View>
  );
}

export default function StudentDashboardScreen({ navigation }) {
  const { token, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [profile, setProfile] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showFullMenu, setShowFullMenu] = useState(false);

  const contentFade = useFadeIn(!loading);

  const fetchProfile = useCallback(async () => {
    const response = await axios.get(`${BASE_URL}/users/students/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
    });
    setProfile(response.data);
  }, [token]);

  const fetchMenu = useCallback(async () => {
    const response = await axios.get(`${BASE_URL}/menu-schedule`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
    });
    setMenu(Array.isArray(response.data) ? response.data : []);
  }, [token]);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const [profileResult, menuResult] = await Promise.allSettled([
        fetchProfile(),
        fetchMenu(),
      ]);

      if (profileResult.status === 'rejected') {
        setError(
          profileResult.reason?.response?.data?.message ||
            'We could not load your meal account. Pull down to try again.',
        );
      } else {
        setLastUpdated(new Date());
      }

      if (menuResult.status === 'rejected') {
        console.error(
          'STUDENT DASHBOARD MENU REQUEST FAILED:',
          menuResult.reason,
        );
        setMenu([]);
        setError(
          'Today’s menu is temporarily unavailable. Pull down to try again.',
        );
      }

      setLoading(false);
      setRefreshing(false);
    },
    [fetchMenu, fetchProfile],
  );

  useEffect(() => {
    loadDashboard(false);
  }, [loadDashboard]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        loadDashboard(true);
      }
    });
    return () => subscription.remove();
  }, [loadDashboard]);

  const firstName = profile?.firstName || user?.firstName || 'Student';
  const lastName = profile?.lastName || user?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const matricule = profile?.matricule || user?.matricule || 'N/A';
  const credits = Math.max(Number(profile?.credits) || 0, 0);
  const mealPlan = profile?.mealPlan || null;
  const hasPlan = Boolean(mealPlan);
  const mealPlanName = mealPlan?.name || 'No active plan';
  const planCredits = Number(mealPlan?.credits) || 0;
  const creditsUsed = hasPlan ? Math.max(planCredits - credits, 0) : 0;
  const semesterEndDate = profile?.semesterEndDate || null;
  const daysLeft = daysUntil(semesterEndDate);
  const hasQRCode = Boolean(profile?.hasQRCode);
  const todayKey = getTodayKey();
  const todaysMeal = useMemo(
    () => menu.find((item) => item.day === todayKey) || null,
    [menu, todayKey],
  );
  const nextService = useMemo(
    () => findNextServiceDay(menu, todayKey),
    [menu, todayKey],
  );
  const visibleMeals = useMemo(() => {
    if (showFullMenu) return menu;
    if (todaysMeal) return [todaysMeal];
    return nextService ? [nextService] : [];
  }, [menu, nextService, showFullMenu, todaysMeal]);
  const isSemesterActive = daysLeft === null || daysLeft > 0;
  const semesterProgress =
    daysLeft === null
      ? 0.08
      : Math.max(0.08, Math.min(0.94, 1 - Math.max(daysLeft, 0) / 180));
  const isNarrow = width < 340;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - H_MARGIN * 2;
  const panelInnerWidth = contentWidth - PANEL_PADDING * 2 - 2;
  const menuCardWidth = Math.max(
    116,
    Math.min(156, (panelInnerWidth - 16) / 2.5),
  );
  const singleMeal = visibleMeals.length === 1;
  const greeting = getGreeting();
  const academicYear = formatAcademicYear(semesterEndDate);

  if (loading) {
    return (
      <View style={styles.screen}>
        <StudentTopBar navigation={navigation} />
        <DashboardLoader />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StudentTopBar navigation={navigation} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 84 },
        ]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            colors={[DASHBOARD_PRIMARY]}
            tintColor={DASHBOARD_PRIMARY}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        <Animated.View style={contentFade}>
          {/* Hero: greeting + profile */}
          <LinearGradient
            colors={[COLORS.primary, DASHBOARD_PRIMARY]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <FoodBackdrop />
            <View style={styles.heroInner}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroGreeting}>{greeting},</Text>
                  <Text
                    style={styles.heroName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    {firstName}! 👋
                  </Text>
                  <Text style={styles.heroSubtitle}>
                    Here’s your cafeteria overview
                  </Text>
                </View>
                <Pressable
                  onPress={() => navigation.navigate('Profile')}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${fullName || 'student'} profile`}
                  accessibilityHint={`Matricule ${matricule}`}
                  style={({ pressed }) => [
                    styles.avatarButton,
                    pressed && styles.avatarButtonPressed,
                  ]}
                >
                  <Avatar
                    initials={getInitials(firstName, lastName)}
                    size={42}
                    style={styles.avatar}
                    textStyle={styles.avatarText}
                  />
                </Pressable>
              </View>
            </View>
          </LinearGradient>

          {/* Credits (overlaps hero) */}
          <View style={styles.overlapWrap}>
            <View
              style={[styles.creditsCard, isNarrow && styles.creditsCardNarrow]}
              accessible
              accessibilityLabel={`${credits} meal credits available`}
              accessibilityHint={
                hasPlan
                  ? `${creditsUsed} of ${planCredits} plan credits used`
                  : 'No active meal plan'
              }
            >
              <View pointerEvents="none" style={styles.creditArt}>
                <Ionicons
                  name="card"
                  size={72}
                  color="rgba(22,163,106,0.10)"
                />
              </View>
              <View style={styles.creditCopy}>
                <Text style={styles.creditLabel}>Available Credits</Text>
                <View style={styles.creditValueRow}>
                  <Text style={styles.creditNumber}>{credits}</Text>
                  <Text style={styles.creditUnit}>Meal Credits</Text>
                </View>
                <View style={styles.creditReadyRow}>
                  <Ionicons
                    name="restaurant"
                    size={14}
                    color={credits > 0 ? DASHBOARD_PRIMARY : DASHBOARD_MUTED}
                  />
                  <Text style={styles.creditReadyText} numberOfLines={1}>
                    {credits > 0
                      ? 'Ready for your meals'
                      : 'Choose a plan to get started'}
                  </Text>
                  {lastUpdated ? (
                    <Text style={styles.creditUpdated} numberOfLines={1}>
                      · {formatSyncTime(lastUpdated)}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Pressable
                onPress={() => navigation.navigate('Meal Plans')}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Buy Credit. Open meal plans."
                style={({ pressed }) => [
                  styles.buyCreditButton,
                  isNarrow && styles.buyCreditButtonNarrow,
                  pressed && styles.buyCreditButtonPressed,
                ]}
              >
                <Ionicons name="cart" size={17} color="#FFFFFF" />
                <Text style={styles.buyCreditText}>Buy Credit</Text>
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={[styles.shellSection, styles.noticeWrap]}>
              <View style={styles.notice}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#DC2626"
                />
                <Text style={styles.noticeText}>{error}</Text>
                <Pressable
                  onPress={() => loadDashboard(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading dashboard"
                  style={({ pressed }) => [
                    styles.noticeRetry,
                    pressed && styles.pressedSoft,
                  ]}
                >
                  <Text style={styles.noticeRetryText}>Retry</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Quick actions */}
          <View style={[styles.shellSection, styles.quickSection]}>
            <View style={styles.quickRow}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionTile
                  key={action.id}
                  action={action}
                  onPress={() => navigation.navigate(action.route)}
                />
              ))}
            </View>
          </View>

          {/* Today's menu */}
          <View style={[styles.shellSection, styles.menuSection]}>
            <View style={styles.panel}>
              <SectionHeading
                icon="restaurant"
                title={showFullMenu ? 'Weekly Menu' : 'Today’s Menu'}
                actionLabel={showFullMenu ? 'Show Today' : 'View Full Menu'}
                onAction={
                  menu.length > 1
                    ? () => setShowFullMenu((current) => !current)
                    : undefined
                }
              />
              {visibleMeals.length > 0 ? (
                singleMeal ? (
                  <MealCard
                    item={visibleMeals[0]}
                    isToday={visibleMeals[0].day === todayKey}
                    horizontal
                  />
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    overScrollMode="never"
                    contentContainerStyle={styles.menuScroller}
                  >
                    {visibleMeals.map((item, index) => (
                      <MealCard
                        key={`${item.day}-${item.mealName}-${index}`}
                        item={item}
                        isToday={item.day === todayKey}
                        width={menuCardWidth}
                      />
                    ))}
                  </ScrollView>
                )
              ) : (
                <View style={styles.menuEmpty}>
                  <View style={styles.menuEmptyIcon}>
                    <Ionicons
                      name="restaurant-outline"
                      size={20}
                      color={DASHBOARD_DARK_GREEN}
                    />
                  </View>
                  <View style={styles.menuEmptyCopy}>
                    <Text style={styles.menuEmptyTitle}>
                      {menu.length === 0
                        ? 'Menu not published yet'
                        : 'No meal service today'}
                    </Text>
                    <Text style={styles.menuEmptyText}>
                      {nextService
                        ? `Next: ${
                            DAY_LABELS[nextService.day] || nextService.day
                          } — ${nextService.mealName}`
                        : 'The cafeteria schedule will appear here once published.'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Semester */}
          <View style={[styles.shellSection, styles.section]}>
            <View style={styles.semesterCard}>
              <View style={styles.semesterIconCircle}>
                <Ionicons name="school" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.semesterMain}>
                <View style={styles.semesterTopRow}>
                  <View style={styles.semesterHeadingCopy}>
                    <Text style={styles.semesterLabel}>Current Semester</Text>
                    <Text style={styles.semesterYear} numberOfLines={1}>
                      {academicYear}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.activePill,
                      !isSemesterActive && styles.expiredPill,
                    ]}
                  >
                    <View
                      style={[
                        styles.activePillDot,
                        !isSemesterActive && styles.expiredPillDot,
                      ]}
                    />
                    <Text
                      style={[
                        styles.activePillText,
                        !isSemesterActive && styles.expiredPillText,
                      ]}
                    >
                      {isSemesterActive ? 'Active' : 'Ended'}
                    </Text>
                  </View>
                </View>
                <UsageBar
                  ratio={semesterProgress}
                  color={isSemesterActive ? DASHBOARD_DARK_GREEN : DASHBOARD_MUTED}
                  style={styles.semesterProgress}
                />
                <View style={styles.semesterFooter}>
                  <Text style={styles.semesterRemaining} numberOfLines={1}>
                    {daysLeft === null
                      ? 'Semester end date unavailable'
                      : daysLeft > 0
                      ? `${daysLeft} ${pluralize(
                          daysLeft,
                          'day',
                          'days',
                        )} remaining`
                      : 'Semester access has ended'}
                  </Text>
                  <Text style={styles.semesterEndDate} numberOfLines={1}>
                    {semesterEndDate
                      ? `Ends ${formatLongDate(semesterEndDate)}`
                      : 'No end date'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Announcements */}
          <View style={[styles.shellSection, styles.section]}>
            <View style={styles.panel}>
              <SectionHeading
                icon="megaphone"
                iconColor={INFO_BLUE}
                title="Announcements"
                actionLabel="See All"
                onAction={() =>
                  Alert.alert(
                    'Announcements',
                    'Announcements are not connected to a backend service yet.',
                  )
                }
              />
              <View style={styles.announcementCard}>
                <Ionicons
                  name="information-circle"
                  size={28}
                  color={INFO_BLUE}
                />
                <View style={styles.announcementCopy}>
                  <Text style={styles.announcementTitle} numberOfLines={1}>
                    {STATIC_ANNOUNCEMENT_PREVIEW.title}
                  </Text>
                  <Text style={styles.announcementMessage} numberOfLines={2}>
                    {STATIC_ANNOUNCEMENT_PREVIEW.message}
                  </Text>
                </View>
                <Text style={styles.previewBadgeText}>Preview</Text>
              </View>
            </View>
          </View>

          {/* Account list */}
          <View style={[styles.shellSection, styles.section]}>
            <View style={styles.card}>
              <AccountRow
                icon="qr-code-outline"
                label="Meal Pass"
                value={hasQRCode ? 'Ready to scan' : 'Not generated'}
                onPress={() => navigation.navigate('My QR Code')}
                accessibilityLabel={`Meal pass ${
                  hasQRCode ? 'ready to scan' : 'not generated'
                }`}
              />
              <AccountRow
                icon="card-outline"
                label="Current Plan"
                value={mealPlanName}
                onPress={() => navigation.navigate('Meal Plans')}
                accessibilityLabel={`Current plan ${mealPlanName}`}
                isLast
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const cardSurface = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: DASHBOARD_BORDER,
  backgroundColor: '#FFFFFF',
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DASHBOARD_BACKGROUND },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
  shellSection: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: H_MARGIN,
  },
  section: { marginTop: 16 },
  card: { ...cardSurface, overflow: 'hidden' },
  panel: { ...cardSurface, padding: PANEL_PADDING },
  pressedSoft: { opacity: 0.6 },

  /* Hero */
  hero: {
    paddingHorizontal: H_MARGIN,
    paddingTop: 8,
    paddingBottom: 85,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: DASHBOARD_PRIMARY,
    overflow: 'hidden',
  },
  heroInner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH - H_MARGIN * 2,
    alignSelf: 'center',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroCopy: { flex: 1, minWidth: 0 },
  heroGreeting: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '400',
    color: DASHBOARD_LIGHT_GREEN,
  },
  heroName: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.96)',
    ...WEB_CURSOR_STYLE,
  },
  avatarButtonPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  avatar: { borderWidth: 0, backgroundColor: '#E8F7EF' },
  avatarText: { color: DASHBOARD_DARK_GREEN, fontWeight: '600' },
  foodLayer: { ...StyleSheet.absoluteFillObject },
  foodIcon: { position: 'absolute' },

  /* Credits */
  overlapWrap: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: H_MARGIN,
    marginTop: -70,
  },
  creditsCard: {
    ...cardSurface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'hidden',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  creditsCardNarrow: { paddingBottom: 12 },
  creditArt: {
    position: 'absolute',
    top: 6,
    right: 16,
    transform: [{ rotate: '-12deg' }],
  },
  creditCopy: { minWidth: 0 },
  creditLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  creditValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
  },
  creditNumber: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '600',
    letterSpacing: -0.8,
    color: DASHBOARD_TEXT,
  },
  creditUnit: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  creditReadyRow: {
    marginTop: 1,
    maxWidth: 210,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  creditReadyText: {
    flexShrink: 1,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  creditUpdated: {
    flexShrink: 0,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
    color: DASHBOARD_MUTED,
  },
  buyCreditButton: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    ...WEB_CURSOR_STYLE,
  },
  buyCreditButtonNarrow: {
    position: 'relative',
    right: 0,
    bottom: 0,
    marginTop: 10,
    alignSelf: 'stretch',
  },
  buyCreditButtonPressed: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buyCreditText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Error notice */
  noticeWrap: { marginTop: 12 },
  notice: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
    color: '#991B1B',
  },
  noticeRetry: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...WEB_CURSOR_STYLE,
  },
  noticeRetryText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#DC2626',
  },

  /* Quick actions */
  quickSection: { marginTop: 18 },
  quickRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quickAction: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 2,
    ...WEB_CURSOR_STYLE,
  },
  quickActionPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  quickActionIcon: {
    width: 66,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '500',
    color: DASHBOARD_TEXT,
  },
  quickActionDescription: {
    marginTop: 1,
    textAlign: 'center',
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },

  /* Section heading */
  sectionHeading: {
    marginBottom: 10,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: DASHBOARD_TEXT,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    ...WEB_CURSOR_STYLE,
  },
  sectionActionText: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '500',
    color: DASHBOARD_DARK_GREEN,
  },

  /* Menu */
  menuSection: { marginTop: 20 },
  menuScroller: { gap: 8, paddingBottom: 2 },
  mealImage: {
    height: 84,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 6,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E7F2EB',
  },
  mealImageRow: { width: 118, flexShrink: 0 },
  mealImageRadius: { borderRadius: 10 },
  mealBadge: {
    minHeight: 20,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealBadgeToday: { backgroundColor: DASHBOARD_LIGHT_GREEN },
  mealBadgeSchedule: { backgroundColor: 'rgba(255,255,255,0.92)' },
  mealBadgeText: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '500',
    color: DASHBOARD_DARK_GREEN,
  },
  mealBadgeTextSchedule: { color: DASHBOARD_TEXT },
  mealName: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  mealNameRow: { marginTop: 0, fontSize: 15, lineHeight: 20 },
  mealDescription: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  mealTimeRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mealTimeText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  mealRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealRowBody: { flex: 1, minWidth: 0 },
  menuEmpty: {
    minHeight: 72,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: DASHBOARD_BACKGROUND,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
  },
  menuEmptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DASHBOARD_LIGHT_GREEN,
  },
  menuEmptyCopy: { flex: 1 },
  menuEmptyTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: DASHBOARD_TEXT,
  },
  menuEmptyText: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },

  /* Semester */
  usageTrack: {
    height: 6,
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#D1FAE5',
  },
  usageFill: { height: '100%', borderRadius: 999 },
  semesterCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  semesterIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DASHBOARD_DARK_GREEN,
  },
  semesterMain: { flex: 1, minWidth: 0 },
  semesterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  semesterHeadingCopy: { flex: 1, minWidth: 0 },
  semesterLabel: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  semesterYear: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: DASHBOARD_TEXT,
  },
  activePill: {
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#CCFBE1',
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DASHBOARD_DARK_GREEN,
  },
  activePillText: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    color: DASHBOARD_DARK_GREEN,
  },
  expiredPill: { backgroundColor: '#E2E8F0' },
  expiredPillDot: { backgroundColor: '#64748B' },
  expiredPillText: { color: '#475569' },
  semesterProgress: { marginTop: 8 },
  semesterFooter: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  semesterRemaining: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  semesterEndDate: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },

  /* Announcements */
  announcementCard: {
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
  },
  announcementCopy: { flex: 1, minWidth: 0 },
  announcementTitle: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  announcementMessage: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  previewBadgeText: {
    alignSelf: 'flex-start',
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '400',
    color: DASHBOARD_MUTED,
  },

  /* Account list */
  accountItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...WEB_CURSOR_STYLE,
  },
  accountItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  accountItemPressed: { backgroundColor: '#F1F5F9' },
  accountIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DASHBOARD_LIGHT_GREEN,
  },
  accountCopy: { flex: 1, minWidth: 0 },
  accountLabel: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '400',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  accountValue: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
    color: DASHBOARD_TEXT,
  },

  /* Loader */
  loaderHero: { paddingTop: 16, paddingBottom: 48 },
  loaderTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loaderSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
  },
  loaderBody: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: H_MARGIN,
    marginTop: -24,
    gap: 16,
  },
  loaderBlock: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
  },
});