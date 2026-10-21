import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  AppState,
  Easing,
  Image,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

import useAuthStore from '../../store/useAuthStore';
import { BASE_URL } from '../../api/auth.api';
import { getAnnouncements } from '../../api/announcements.api';

// Real brand asset (mobile/assets/brand/restau-logo.png).
// eslint-disable-next-line import/no-unresolved
const RESTAU_LOGO = require('../../../assets/brand/restau-logo.png');

/* -------------------------------------------------------------------------- */
/* Tokens (values from the measured reference)                                */
/* -------------------------------------------------------------------------- */

const GREEN = '#087A55';
const NAVY = '#0B1026';
const MUTED = '#747D96';
const PALE_GREEN = '#E8F8EE';
const WHITE = '#FFFFFF';
const BORDER = '#E6EAF0';
const DIVIDER = '#EEF2F6';
const PAGE_BG = '#FBFCFD';

const H_MARGIN = 16;
const MAX_CONTENT_WIDTH = 680;
const RADIUS = 14;

const DAY_NAMES = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

// Web-only affordance; native keeps default press behavior.
const WEB_CURSOR_STYLE = Platform.select({
  web: { cursor: 'pointer' },
  default: {},
});

const QUICK_ACTIONS = [
  {
    id: 'qr',
    label: 'My QR Code',
    icon: 'qr-code-outline',
    route: 'My QR Code',
    primary: true,
  },
  {
    id: 'plans',
    label: 'Meal Plans',
    icon: 'restaurant-outline',
    route: 'Meal Plans',
  },
  {
    id: 'history',
    label: 'History',
    icon: 'document-text-outline',
    route: 'History',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    route: 'Profile',
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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

const SERVICE_DAY_INDEX = { TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5 };

/** Date of a service day in the current Monday-start week, in local time. */
function getServiceDayDate(dayOfWeek) {
  const target = SERVICE_DAY_INDEX[dayOfWeek];
  if (target == null) return null;
  const d = new Date();
  d.setHours(12, 0, 0, 0); // local noon, avoids timezone off-by-one
  const today = d.getDay(); // Sun=0, Mon=1, ..., Sat=6
  const daysToMonday = today === 0 ? 6 : today - 1;
  d.setDate(d.getDate() - daysToMonday); // Monday of current week
  d.setDate(d.getDate() + (target - 1)); // target weekday of current week
  return d;
}

/** Short local date label, e.g. "Oct 13". */
function formatMenuDate(date) {
  if (!date) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
  const SERVICE_DAYS = ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
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
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enabled, progress]);
  return { opacity: progress };
}

/* -------------------------------------------------------------------------- */
/* Building blocks                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading({ title, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle} numberOfLines={1}>
        {title}
      </Text>
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
          <Ionicons name="chevron-forward" size={15} color={GREEN} />
        </Pressable>
      ) : null}
    </View>
  );
}

function UsageBar({ ratio, color = GREEN, style }) {
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
      accessibilityLabel={action.label}
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.quickActionPressed,
      ]}
    >
      <View
        style={[
          styles.quickActionCircle,
          action.primary
            ? styles.quickActionCirclePrimary
            : styles.quickActionCircleLight,
        ]}
      >
        <Ionicons
          name={action.icon}
          size={22}
          color={action.primary ? WHITE : GREEN}
        />
      </View>
      <Text
        style={styles.quickActionLabel}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

// Cloche (serving dome) drawn with Views, since Ionicons has no cloche glyph.
function Cloche() {
  return (
    <View style={styles.cloche}>
      <View style={styles.clocheKnob} />
      <View style={styles.clocheDome} />
      <View style={styles.clocheBase} />
    </View>
  );
}

// Menu row: information only. Today gets a badge; other rows show a chevron.
function MenuRow({ item, isToday }) {
  const dayName = DAY_NAMES[item.day] || item.day || 'Menu';
  return (
    <View style={styles.menuRow}>
      <View style={styles.menuImage}>
        <Cloche />
      </View>
      <View style={styles.menuRowBody}>
        <Text style={styles.menuName} numberOfLines={2}>
          {item.mealName}
        </Text>
        <Text style={styles.menuDay} numberOfLines={1}>
          {dayName}
          {item.date ? ' · ' + formatMenuDate(item.date) : ''}
        </Text>
      </View>
      {isToday ? (
        <View style={styles.todayTag}>
          <Text style={styles.todayTagText}>Today</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={MUTED} />
      )}
    </View>
  );
}

function InfoRow({ icon, label, value, isLast }) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowDivider]}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={18} color={GREEN} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function DashboardHeader({
  insetTop,
  onBellPress,
  onProfilePress,
  fullName,
  matricule,
  firstName,
  greeting,
}) {
  return (
    <View style={[styles.header, { paddingTop: insetTop + 10 }]}>
      {/* ── Top row: logo left + icons right ─── */}
      <View style={styles.headerTopRow}>
        <Image
          source={RESTAU_LOGO}
          style={styles.headerLogo}
          resizeMode="contain"
          accessibilityLabel="Restau"
        />

        <View style={styles.headerRight}>
          {onBellPress ? (
            <Pressable
              onPress={onBellPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={({ pressed }) => [
                styles.bellButton,
                pressed && styles.pressedSoft,
              ]}
            >
              <Ionicons name="notifications-outline" size={22} color={NAVY} />
            </Pressable>
          ) : (
            <View style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={22} color={NAVY} />
            </View>
          )}

          <Pressable
            onPress={onProfilePress}
            accessibilityRole="button"
            accessibilityLabel={`Open ${fullName || 'student'} profile`}
            accessibilityHint={`Matricule ${matricule}`}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.pressedSoft,
            ]}
          >
            <Ionicons name="person-outline" size={20} color={GREEN} />
          </Pressable>
        </View>
      </View>

      {/* ── Greeting block — stacked below logo, same left edge ── */}
      <View style={styles.headerGreeting}>
        <Text style={styles.headerGreetingLabel}>{greeting},</Text>
        <Text style={styles.headerGreetingName} numberOfLines={1}>
          {firstName} 👋
        </Text>
        <Text style={styles.headerGreetingSubtitle}>
          Ready for a great meal today?
        </Text>
      </View>
    </View>
  );
}

function DashboardLoader({ insetTop }) {
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
      <View style={[styles.loaderHeader, { paddingTop: insetTop + 10 }]}>
        <Image
          source={RESTAU_LOGO}
          style={styles.headerLogo}
          resizeMode="contain"
          accessibilityLabel="Restau"
        />
      </View>
      <View style={styles.loaderBody}>
        <Text style={styles.loaderTitle}>Loading your meal account…</Text>
        <Text style={styles.loaderSubtitle}>
          Fetching your plan, credits and this week’s menu
        </Text>
        {[104, 72, 68, 68].map((height, index) => (
          <Animated.View
            key={`skeleton-${index}`}
            style={[styles.loaderBlock, { height, opacity: shimmer }]}
          />
        ))}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen                                                                     */
/* -------------------------------------------------------------------------- */

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
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsError, setAnnouncementsError] = useState('');

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

  const fetchAnnouncements = useCallback(async () => {
  try {
    const data = await getAnnouncements(3, token);
    setAnnouncements(Array.isArray(data) ? data : []);
    setAnnouncementsError('');
  } catch (err) {
    console.error('DASHBOARD ANNOUNCEMENTS REQUEST FAILED:', err);
    setAnnouncements([]);
    setAnnouncementsError(
      err.response?.data?.message ||
        'Announcements temporarily unavailable.',
    );
  }
  }, [token]);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const [profileResult, menuResult, announcementsResult] =
        await Promise.allSettled([
          fetchProfile(),
          fetchMenu(),
          fetchAnnouncements(),
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
          'The weekly menu is temporarily unavailable. Pull down to try again.',
        );
      }

      // Announcements failure must not break the dashboard (handled in fetchAnnouncements)
      if (announcementsResult.status === 'rejected') {
        console.error(
          'STUDENT DASHBOARD ANNOUNCEMENTS REQUEST FAILED:',
          announcementsResult.reason,
        );
      }

      setLoading(false);
      setRefreshing(false);
    },
    [fetchMenu, fetchProfile, fetchAnnouncements],
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
  const creditsUsedRatio = planCredits > 0 ? creditsUsed / planCredits : 0;
  const semesterEndDate = profile?.semesterEndDate || null;
  const daysLeft = daysUntil(semesterEndDate);
  const hasQRCode = Boolean(profile?.hasQRCode);
  const todayKey = getTodayKey();
  const nextService = useMemo(
    () => findNextServiceDay(menu, todayKey),
    [menu, todayKey],
  );
  const isSemesterActive = daysLeft === null || daysLeft > 0;
  const semesterProgress =
    daysLeft === null
      ? 0.08
      : Math.max(0.08, Math.min(0.94, 1 - Math.max(daysLeft, 0) / 180));
  const isNarrow = width < 360;
  const greeting = getGreeting();
  const academicYear = formatAcademicYear(semesterEndDate);

  // Only show a bell action if the app already has a notifications route.
  const hasNotificationsRoute = Boolean(
    navigation?.getState?.()?.routeNames?.includes('Notifications'),
  );

  if (loading) {
    return <DashboardLoader insetTop={insets.top} />;
  }

  return (
    <View style={styles.screen}>
      {/* Static background shapes (behind the scrolling content) */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.decorTop} />
        <View style={styles.decorMiddle} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 0) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            colors={[GREEN]}
            tintColor={GREEN}
            progressBackgroundColor={WHITE}
          />
        }
      >
        <Animated.View style={contentFade}>
          <View style={styles.shell}>
            {/* Header */}
            <DashboardHeader
              insetTop={insets.top}
              fullName={fullName}
              matricule={matricule}
              firstName={firstName}
              greeting={greeting}
              onProfilePress={() => navigation.navigate('Profile')}
              onBellPress={
                hasNotificationsRoute
                  ? () => navigation.navigate('Notifications')
                  : undefined
              }
            />

            {/* Error notice */}
            {error ? (
              <View style={styles.notice}>
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
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
            ) : null}

            {/* Available credit */}
            <View
              style={styles.creditCard}
              accessible
              accessibilityLabel={`${credits} meal ${pluralize(
                credits,
                'credit',
                'credits',
              )} available`}
              accessibilityHint={
                hasPlan
                  ? `${creditsUsed} of ${planCredits} plan credits used`
                  : 'No active meal plan'
              }
            >
              <View pointerEvents="none" style={styles.creditWaveA} />
              <View pointerEvents="none" style={styles.creditWaveB} />
              <View
                style={[styles.creditRow, isNarrow && styles.creditRowNarrow]}
              >
                <View style={styles.creditCopy}>
                  <Text style={styles.creditLabel}>Available credit</Text>
                  <View style={styles.creditValueRow}>
                    <Text style={styles.creditNumber}>{credits}</Text>
                    <Text style={styles.creditUnit}>
                      {pluralize(credits, 'credit', 'credits')}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => navigation.navigate('Meal Plans')}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  accessibilityRole="button"
                  accessibilityLabel="Buy credit. Open meal plans."
                  style={({ pressed }) => [
                    styles.buyButton,
                    isNarrow && styles.buyButtonNarrow,
                    pressed && styles.buyButtonPressed,
                  ]}
                >
                  <View style={styles.buyPlus}>
                    <Ionicons name="add" size={14} color={WHITE} />
                  </View>
                  <Text style={styles.buyText}>Buy credit</Text>
                </Pressable>
              </View>
            </View>

            {/* Quick actions */}
            <View style={styles.quickRow}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionTile
                  key={action.id}
                  action={action}
                  onPress={() => navigation.navigate(action.route)}
                />
              ))}
            </View>

            {/* Weekly menu */}
            <View style={styles.section}>
              <SectionHeading
                title="Weekly Menu"
                actionLabel="See all"
                onAction={() => navigation.navigate('Meal Plans')}
              />
              {menu.length > 0 ? (
                <View style={styles.menuList}>
                  {menu.map((item, index) => (
                    <MenuRow
                      key={`${item.day}-${item.mealName}-${index}`}
                      item={{ ...item, date: getServiceDayDate(item.day) }}
                      isToday={item.day === todayKey}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="restaurant-outline"
                      size={19}
                      color={GREEN}
                    />
                  </View>
                  <View style={styles.emptyCopy}>
                    <Text style={styles.emptyTitle}>
                      {error ? 'Menu unavailable' : 'Menu not published yet'}
                    </Text>
                    <Text style={styles.emptyText}>
                      {nextService
                        ? `Next: ${
                            DAY_NAMES[nextService.day] || nextService.day
                          } — ${nextService.mealName}`
                        : 'The cafeteria schedule will appear here once published.'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Announcements */}
            <View style={styles.section}>
              <SectionHeading
                title="Announcements"
                actionLabel="See All"
                onAction={() => navigation.navigate('Announcements')}
              />
              {announcementsError ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color="#DC2626"
                    />
                  </View>
                  <View style={styles.emptyCopy}>
                    <Text style={styles.emptyTitle}>
                      Announcements unavailable
                    </Text>
                    <Text style={styles.emptyText}>
                      {announcementsError}
                    </Text>
                  </View>
                </View>
              ) : announcements.length === 0 ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={19}
                      color={GREEN}
                    />
                  </View>
                  <View style={styles.emptyCopy}>
                    <Text style={styles.emptyTitle}>
                      No new announcements
                    </Text>
                    <Text style={styles.emptyText}>
                      Updates from the cafeteria will appear here.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.announcementsList}>
                  {announcements.map((item) => (
                    <Pressable
                      key={item.id}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={item.title || 'Announcement'}
                      onPress={() =>
                        navigation.navigate('Announcements')
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.announcementRow}
                    >
                      <View style={styles.announcementRowBody}>
                        <Text style={styles.announcementTitle}
                          numberOfLines={2}
                        >
                          {item.title || '(Untitled announcement)'}
                        </Text>
                        <Text style={styles.announcementDate}>
                          {new Date(
                            item.updatedAt || item.createdAt,
                          ).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                        <Text style={styles.announcementPreview}
                          numberOfLines={2}
                        >
                          {item.body || '—'}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Account overview (existing dashboard data) */}
            <View style={styles.section}>
              <SectionHeading title="Account Overview" />
              <View style={styles.overviewCard}>
                <InfoRow
                  icon="card-outline"
                  label="Current plan"
                  value={mealPlanName}
                />
                {hasPlan ? (
                  <View style={styles.usageBlock}>
                    <View style={styles.usageHeader}>
                      <Text style={styles.infoLabel}>Plan credits used</Text>
                      <Text style={styles.usageValue}>
                        {creditsUsed} / {planCredits}
                      </Text>
                    </View>
                    <UsageBar ratio={creditsUsedRatio} />
                  </View>
                ) : null}
                <InfoRow
                  icon="qr-code-outline"
                  label="Meal pass"
                  value={hasQRCode ? 'Ready to scan' : 'Not generated'}
                />
                <View style={styles.semesterBlock}>
                  <View style={styles.semesterTopRow}>
                    <View style={styles.semesterCopy}>
                      <Text style={styles.infoLabel}>Current semester</Text>
                      <Text style={styles.semesterYear} numberOfLines={1}>
                        {academicYear}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        !isSemesterActive && styles.statusPillEnded,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          !isSemesterActive && styles.statusDotEnded,
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          !isSemesterActive && styles.statusTextEnded,
                        ]}
                      >
                        {isSemesterActive ? 'Active' : 'Ended'}
                      </Text>
                    </View>
                  </View>
                  <UsageBar
                    ratio={semesterProgress}
                    color={isSemesterActive ? GREEN : '#94A3B8'}
                    style={styles.semesterBar}
                  />
                  <View style={styles.semesterFooter}>
                    <Text style={styles.semesterNote} numberOfLines={1}>
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
                    <Text
                      style={[styles.semesterNote, styles.semesterNoteRight]}
                      numberOfLines={1}
                    >
                      {semesterEndDate
                        ? `Ends ${formatLongDate(semesterEndDate)}`
                        : 'No end date'}
                    </Text>
                  </View>
                </View>
                {lastUpdated ? (
                  <Text style={styles.updatedText}>
                    Updated {formatSyncTime(lastUpdated)}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const cardSurface = {
  borderRadius: RADIUS,
  borderWidth: 1,
  borderColor: BORDER,
  backgroundColor: WHITE,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PAGE_BG },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
  shell: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: H_MARGIN,
  },
  section: { marginTop: 22 },
  pressedSoft: { opacity: 0.6 },

  /* Background shapes */
  decorTop: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    top: -40,
    right: -60,
    backgroundColor: PALE_GREEN,
    opacity: 0.55,
  },
  decorMiddle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: 300,
    right: -120,
    backgroundColor: PALE_GREEN,
    opacity: 0.45,
  },

  /* Header */
  header: {
    flexDirection: 'column',
    paddingBottom: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLogo: {
    width: 58,
    height: 48,
  },
  headerGreeting: {
    alignSelf: 'stretch',
  },
  headerGreetingLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: MUTED,
  },
  headerGreetingName: {
    marginTop: 2,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: NAVY,
  },
  headerGreetingSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: MUTED,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...WEB_CURSOR_STYLE,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALE_GREEN,
    ...WEB_CURSOR_STYLE,
  },

  /* Error notice */
  notice: {
    marginTop: 14,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  noticeText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#991B1B',
  },
  noticeRetry: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: WHITE,
    ...WEB_CURSOR_STYLE,
  },
  noticeRetryText: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '600',
    color: '#DC2626',
  },

  /* Credit card */
  creditCard: {
    marginTop: 18,
    borderRadius: RADIUS,
    backgroundColor: GREEN,
    paddingHorizontal: 18,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  creditWaveA: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -110,
    top: -120,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  creditWaveB: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -90,
    bottom: -130,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  creditRowNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  creditCopy: { flexShrink: 1, minWidth: 0 },
  creditLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  creditValueRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 7,
  },
  creditNumber: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: WHITE,
  },
  creditUnit: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  buyButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: WHITE,
    ...WEB_CURSOR_STYLE,
  },
  buyButtonNarrow: { marginTop: 12, alignSelf: 'stretch' },
  buyButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  buyPlus: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
  },
  buyText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: GREEN,
  },

  /* Quick actions */
  quickRow: {
    marginTop: 20,
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
  quickActionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionCirclePrimary: { backgroundColor: GREEN },
  quickActionCircleLight: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  quickActionLabel: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    color: MUTED,
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
  sectionTitle: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: NAVY,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    ...WEB_CURSOR_STYLE,
  },
  sectionActionText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: GREEN,
  },

  /* Weekly menu */
  menuList: { gap: 8 },
  menuRow: {
    ...cardSurface,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  menuImage: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALE_GREEN,
  },
  cloche: {
    width: 30,
    height: 26,
  },
  clocheKnob: {
    position: 'absolute',
    top: 2,
    left: 13,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  clocheDome: {
    position: 'absolute',
    top: 8,
    left: 3,
    width: 24,
    height: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: GREEN,
  },
  clocheBase: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: GREEN,
  },
  menuRowBody: { flex: 1, minWidth: 0 },
  menuName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: NAVY,
  },
  menuDay: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: MUTED,
  },
  todayTag: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: PALE_GREEN,
  },
  todayTagText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: GREEN,
  },

  /* Empty states */
  emptyCard: {
    ...cardSurface,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALE_GREEN,
  },
  emptyCopy: { flex: 1, minWidth: 0 },
  emptyTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: NAVY,
  },
  emptyText: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: MUTED,
  },

  /* Account overview */
  overviewCard: { ...cardSurface, paddingHorizontal: 14, paddingVertical: 4 },
  infoRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALE_GREEN,
  },
  infoCopy: { flex: 1, minWidth: 0 },
  infoLabel: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '400',
    color: MUTED,
  },
  infoValue: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: NAVY,
  },
  usageBlock: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  usageHeader: {
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  usageValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: NAVY,
  },
  usageTrack: {
    height: 6,
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: PALE_GREEN,
  },
  usageFill: { height: '100%', borderRadius: 999 },
  semesterBlock: { paddingVertical: 12 },
  semesterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  semesterCopy: { flex: 1, minWidth: 0 },
  semesterYear: {
    marginTop: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: NAVY,
  },
  statusPill: {
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PALE_GREEN,
  },
  statusPillEnded: { backgroundColor: '#E2E8F0' },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  statusDotEnded: { backgroundColor: '#64748B' },
  statusText: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
    color: GREEN,
  },
  statusTextEnded: { color: '#475569' },
  semesterBar: { marginTop: 10 },
  semesterFooter: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  semesterNote: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    color: MUTED,
  },
  semesterNoteRight: { textAlign: 'right' },
  updatedText: {
    paddingVertical: 10,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#9AA3B8',
  },

  /* Loader */
  loaderHeader: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: H_MARGIN,
  },
  loaderBody: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: H_MARGIN,
    paddingTop: 18,
    gap: 12,
  },
  loaderTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: NAVY,
  },
  loaderSubtitle: {
    marginTop: -8,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  loaderBlock: {
    borderRadius: RADIUS,
    backgroundColor: PALE_GREEN,
  },
  /* Announcements */
  announcementsList: {
    gap: 10,
  },
  announcementRow: {
    ...cardSurface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  announcementRowBody: {
    flex: 1,
    minWidth: 0,
  },
  announcementTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: NAVY,
  },
  announcementDate: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: MUTED,
  },
  announcementPreview: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
});