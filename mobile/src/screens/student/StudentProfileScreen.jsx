import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
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
import axios from 'axios';

import useAuthStore from '../../store/useAuthStore';
import { BASE_URL } from '../../api/auth.api';
import StudentTopBar from '../../components/StudentTopBar';
import Avatar from '../../components/Avatar';
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

function formatExpiry(date) {
  if (!date) return 'Not available';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ProfileSkeleton() {
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
    <View style={{ gap: 14 }}>
      <View style={styles.heroCard}>
        <Animated.View style={[styles.skeletonAvatar, { opacity: shimmer }]} />
        <Animated.View style={[styles.skeletonLine, { width: '50%', height: 18, marginTop: 12, opacity: shimmer }]} />
        <Animated.View style={[styles.skeletonLine, { width: '35%', height: 13, marginTop: 6, opacity: shimmer }]} />
      </View>
      <View style={styles.card}>
        {[1, 2, 3].map((i) => (
          <View key={`skel-row-${i}`} style={styles.rowItem}>
            <Animated.View style={[styles.skeletonIcon, { opacity: shimmer }]} />
            <View style={{ flex: 1, gap: 4 }}>
              <Animated.View style={[styles.skeletonLine, { width: '30%', height: 11, opacity: shimmer }]} />
              <Animated.View style={[styles.skeletonLine, { width: '60%', height: 14, opacity: shimmer }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProfileRow({
  icon,
  iconColor = COLORS.primary,
  label,
  value,
  onPress,
  isLast = false,
  showChevron = false,
}) {
  const content = (
    <View style={[styles.rowItem, !isLast && styles.rowDivider]}>
      <View style={[styles.rowIconWrap, { backgroundColor: DASHBOARD_LIGHT_GREEN }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={1}>
          {value || 'N/A'}
        </Text>
      </View>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={17} color={DASHBOARD_MUTED} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        style={({ pressed }) => [pressed && styles.rowPressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function StudentProfileScreen({ navigation }) {
  const { token, user, clearAuth } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      try {
        const response = await axios.get(`${BASE_URL}/users/students/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        });
        setProfile(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Could not load your student profile. Pull down to try again.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your student account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: clearAuth,
        },
      ],
    );
  };

  const firstName = profile?.firstName || user?.firstName || 'Student';
  const lastName = profile?.lastName || user?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const matricule = profile?.matricule || user?.matricule || 'N/A';
  const email = profile?.email || user?.email || 'N/A';
  const credits = profile?.credits !== undefined ? String(profile.credits) : '0';
  const planName = profile?.mealPlan?.name || 'No active plan';
  const expiryDate = formatExpiry(profile?.semesterEndDate);
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;

  const isWide = width >= 700;

  return (
    <View style={styles.screen}>
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
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={[styles.inner, isWide && styles.innerWide]}>
          {/* Header intro */}
          <View style={styles.pageIntro}>
            <Text style={styles.pageTitle}>Student Profile</Text>
            <Text style={styles.pageSubtitle}>
              Your student identity and cafeteria account details.
            </Text>
          </View>

          {loading && !refreshing ? (
            <ProfileSkeleton />
          ) : error ? (
            <View style={styles.stateCard}>
              <View style={[styles.stateIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle-outline" size={26} color="#DC2626" />
              </View>
              <Text style={styles.stateTitle}>Could Not Load Profile</Text>
              <Text style={styles.stateText}>{error}</Text>
              <AppButton
                title="Try Again"
                onPress={() => fetchProfile(false)}
                variant="secondary"
                style={{ alignSelf: 'stretch' }}
              />
            </View>
          ) : (
            <>
              {/* Profile Identity Hero */}
              <View style={styles.heroCard}>
                <Avatar
                  initials={initials}
                  size={64}
                  style={styles.avatar}
                  textStyle={styles.avatarText}
                />
                <Text style={styles.heroName} numberOfLines={1}>
                  {fullName}
                </Text>
                <View style={styles.matriculePill}>
                  <Ionicons name="id-card-outline" size={13} color={DASHBOARD_TEXT_SECONDARY} />
                  <Text style={styles.matriculePillText}>{matricule}</Text>
                </View>
                <View style={styles.roleChip}>
                  <View style={styles.roleDot} />
                  <Text style={styles.roleChipText}>Student Account</Text>
                </View>
              </View>

              {/* Meal Account Details */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Meal Account</Text>
                <View style={styles.card}>
                  <ProfileRow
                    icon="restaurant-outline"
                    label="Current Plan"
                    value={planName}
                    showChevron
                    onPress={() => navigation.navigate('Meal Plans')}
                  />
                  <ProfileRow
                    icon="wallet-outline"
                    label="Available Credits"
                    value={`${credits} meal credits`}
                    showChevron
                    onPress={() => navigation.navigate('Meal Plans')}
                  />
                  <ProfileRow
                    icon="calendar-outline"
                    label="Credits Expire"
                    value={expiryDate}
                    isLast
                  />
                </View>
              </View>

              {/* Personal Information */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Personal Information</Text>
                <View style={styles.card}>
                  <ProfileRow
                    icon="person-outline"
                    label="First Name"
                    value={firstName}
                  />
                  <ProfileRow
                    icon="person-outline"
                    label="Last Name"
                    value={lastName}
                  />
                  <ProfileRow
                    icon="id-card-outline"
                    label="Matricule"
                    value={matricule}
                  />
                  <ProfileRow
                    icon="mail-outline"
                    label="Email"
                    value={email}
                    isLast
                  />
                </View>
              </View>

              {/* Quick Navigation Shortcuts */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Quick Links</Text>
                <View style={styles.card}>
                  <ProfileRow
                    icon="qr-code-outline"
                    label="My QR Code"
                    value="Show cafeteria meal pass"
                    showChevron
                    onPress={() => navigation.navigate('My QR Code')}
                  />
                  <ProfileRow
                    icon="time-outline"
                    label="Meal History"
                    value="View past claims"
                    showChevron
                    onPress={() => navigation.navigate('History')}
                    isLast
                  />
                </View>
              </View>

              {/* Logout Action */}
              <View style={styles.logoutSection}>
                <Pressable
                  onPress={handleLogout}
                  accessibilityRole="button"
                  accessibilityLabel="Log out of student account"
                  style={({ pressed }) => [
                    styles.logoutButton,
                    pressed && styles.logoutButtonPressed,
                  ]}
                >
                  <Ionicons name="log-out-outline" size={19} color="#DC2626" />
                  <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DASHBOARD_BACKGROUND,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 14,
  },
  inner: {
    width: '100%',
    paddingHorizontal: 16,
  },
  innerWide: {
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  pageIntro: {
    marginBottom: 14,
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

  /* Identity Hero */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  avatar: {
    borderWidth: 0,
    backgroundColor: DASHBOARD_LIGHT_GREEN,
    marginBottom: 8,
  },
  avatarText: {
    color: DASHBOARD_DARK_GREEN,
    fontWeight: '600',
    fontSize: 22,
  },
  heroName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  matriculePill: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  matriculePillText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  roleChip: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: DASHBOARD_LIGHT_GREEN,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DASHBOARD_DARK_GREEN,
  },
  roleChipText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: DASHBOARD_DARK_GREEN,
  },

  /* Sections and cards */
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: DASHBOARD_TEXT_SECONDARY,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  rowItem: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DASHBOARD_BORDER,
  },
  rowPressed: {
    backgroundColor: '#F8FAFC',
  },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  rowValue: {
    marginTop: 1,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },

  /* Logout */
  logoutSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  logoutButton: {
    minHeight: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  logoutButtonPressed: {
    opacity: 0.75,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: '#DC2626',
  },

  /* Empty / Error state */
  stateCard: {
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

  /* Skeletons */
  skeletonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  skeletonLine: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
});
