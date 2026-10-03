import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
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
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

import useAuthStore from '../../store/useAuthStore';
import { BASE_URL } from '../../api/auth.api';
import StudentTopBar from '../../components/StudentTopBar';
import AppButton from '../../components/AppButton';
import Avatar from '../../components/Avatar';
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

function QRCodeSkeleton() {
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
    <View style={styles.passCard}>
      <View style={styles.skeletonHeader}>
        <Animated.View style={[styles.skeletonAvatar, { opacity: shimmer }]} />
        <View style={{ flex: 1, gap: 6 }}>
          <Animated.View style={[styles.skeletonLine, { width: '60%', height: 16, opacity: shimmer }]} />
          <Animated.View style={[styles.skeletonLine, { width: '40%', height: 12, opacity: shimmer }]} />
        </View>
      </View>
      <View style={styles.cardDivider} />
      <Animated.View style={[styles.skeletonQR, { opacity: shimmer }]} />
      <Animated.View style={[styles.skeletonPill, { opacity: shimmer }]} />
    </View>
  );
}

export default function MyQRCodeScreen({ navigation }) {
  const { token, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchQRCode = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      try {
        const response = await axios.get(`${BASE_URL}/qr-tokens/my-qr`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        });
        setQrData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Could not load your cafeteria meal pass. Please pull down to try again.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  const onRefresh = useCallback(() => {
    fetchQRCode(true);
  }, [fetchQRCode]);

  const hasQrToken = Boolean(qrData?.token);
  const firstName = qrData?.firstName || user?.firstName || 'Student';
  const lastName = qrData?.lastName || user?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const matricule = qrData?.matricule || user?.matricule || 'N/A';
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;

  const qrSize = Math.min(Math.max(width - 110, 200), 230);

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
        <View style={[styles.inner, width >= 700 && styles.innerWide]}>
          {/* Header intro */}
          <View style={styles.pageIntro}>
            <Text style={styles.pageTitle}>My QR Code</Text>
            <Text style={styles.pageSubtitle}>
              Show this at the cafeteria scanner to collect your meal.
            </Text>
          </View>

          {/* Loading state */}
          {loading && !refreshing ? (
            <QRCodeSkeleton />
          ) : error && !hasQrToken ? (
            /* Error state */
            <View style={styles.stateCard}>
              <View style={[styles.stateIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle-outline" size={26} color="#DC2626" />
              </View>
              <Text style={styles.stateTitle}>Pass Unavailable</Text>
              <Text style={styles.stateText}>{error}</Text>
              <AppButton
                title="Try Again"
                onPress={() => fetchQRCode(false)}
                variant="secondary"
                style={styles.stateButton}
              />
            </View>
          ) : hasQrToken ? (
            /* Pass Card */
            <View style={styles.passCard}>
              {/* Student identity header */}
              <View style={styles.studentRow}>
                <Avatar
                  initials={initials}
                  size={46}
                  style={styles.avatar}
                  textStyle={styles.avatarText}
                />
                <View style={styles.studentCopy}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {fullName}
                  </Text>
                  <View style={styles.matriculeBadge}>
                    <Ionicons name="id-card-outline" size={13} color={DASHBOARD_TEXT_SECONDARY} />
                    <Text style={styles.matriculeText} numberOfLines={1}>
                      {matricule}
                    </Text>
                  </View>
                </View>
                <View style={styles.activePassChip}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Active Pass</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* QR plate with ample white quiet zone for cafeteria scanners */}
              <View style={styles.qrPlate}>
                <QRCode
                  value={qrData.token}
                  size={qrSize}
                  color={COLORS.primaryDark}
                  backgroundColor="#FFFFFF"
                />
              </View>

              {/* Status pill */}
              <View style={styles.readyPill}>
                <Ionicons name="scan-outline" size={16} color={DASHBOARD_DARK_GREEN} />
                <Text style={styles.readyPillText}>Ready to scan at turnstile</Text>
              </View>

              {/* Offline hint */}
              <View style={styles.offlineBox}>
                <Ionicons name="information-circle-outline" size={16} color={DASHBOARD_TEXT_SECONDARY} />
                <Text style={styles.offlineText}>
                  No internet at restau? Screenshot this QR code to use it offline.
                </Text>
              </View>
            </View>
          ) : (
            /* Empty state */
            <View style={styles.stateCard}>
              <View style={[styles.stateIconCircle, { backgroundColor: DASHBOARD_LIGHT_GREEN }]}>
                <Ionicons name="qr-code-outline" size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.stateTitle}>No QR Pass Available</Text>
              <Text style={styles.stateText}>
                You do not have an active meal pass token yet. Subscribe to a meal plan to get your pass.
              </Text>
              <AppButton
                title="Browse Meal Plans"
                onPress={() => navigation.navigate('Meal Plans')}
                variant="primary"
                style={styles.stateButton}
              />
            </View>
          )}

          {/* Refresh action */}
          {hasQrToken ? (
            <Pressable
              onPress={() => fetchQRCode(false)}
              accessibilityRole="button"
              accessibilityLabel="Refresh pass token"
              style={({ pressed }) => [
                styles.refreshRow,
                pressed && styles.refreshRowPressed,
              ]}
            >
              <Ionicons name="refresh-outline" size={17} color={COLORS.primary} />
              <Text style={styles.refreshText}>Refresh Pass</Text>
            </Pressable>
          ) : null}
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

  /* Pass Card */
  passCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
    padding: 18,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  studentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    borderWidth: 0,
    backgroundColor: DASHBOARD_LIGHT_GREEN,
  },
  avatarText: {
    color: DASHBOARD_DARK_GREEN,
    fontWeight: '600',
    fontSize: 16,
  },
  studentCopy: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  matriculeBadge: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matriculeText: {
    fontSize: 12,
    lineHeight: 16,
    color: DASHBOARD_TEXT_SECONDARY,
    fontWeight: '500',
  },
  activePassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: DASHBOARD_LIGHT_GREEN,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DASHBOARD_DARK_GREEN,
  },
  activeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: DASHBOARD_DARK_GREEN,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: DASHBOARD_BORDER,
    marginVertical: 16,
  },

  /* QR Plate */
  qrPlate: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },

  /* Status and offline hint */
  readyPill: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: DASHBOARD_LIGHT_GREEN,
  },
  readyPillText: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
    color: DASHBOARD_DARK_GREEN,
  },
  offlineBox: {
    marginTop: 14,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
  },
  offlineText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: DASHBOARD_TEXT_SECONDARY,
  },

  /* Refresh action */
  refreshRow: {
    marginTop: 14,
    minHeight: 46,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
  },
  refreshRowPressed: {
    opacity: 0.72,
    backgroundColor: '#F1F5F9',
  },
  refreshText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORS.primary,
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
  stateButton: {
    alignSelf: 'stretch',
  },

  /* Skeleton */
  skeletonHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E2E8F0',
  },
  skeletonLine: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  skeletonQR: {
    width: 210,
    height: 210,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  skeletonPill: {
    width: 170,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
  },
});