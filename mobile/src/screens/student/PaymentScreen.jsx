import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../store/useAuthStore';
import { subscribeToPlan } from '../../api/Student.api';
import mtnLogo from '../../../assets/payment/mtn-money.png';
import orangeLogo from '../../../assets/payment/orange-money.png';

// ─── Palette (taken from the Payment image) ───────────────────────────────────
const PAGE_BG = '#F8FAFC';
const WHITE = '#FFFFFF';
const BORDER = '#E6EAF0';
const GREEN = '#087A55';
const GREEN_TEXT = '#15803D';
const BADGE_BG = '#DCFCE7';
const ICON_BG = '#DCFCE7';
const METRICS_BG = '#C7EBD8';
const METRICS_DIVIDER = '#A9D9BF';
const NAVY = '#0B1026';
const MUTED = '#747D96';
const MTN_ACCENT = '#F5B400';
const MTN_SELECTED_BG = '#FFFBEB';
const ORANGE_ACCENT = '#F97316';
const RADIO_IDLE = '#A8B0BC';
const DISABLED = '#9AA3B2';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatCameroonPhone(value) {
  const digits = String(value).replace(/\D/g, '').replace(/^237/, '').slice(0, 9);
  if (!digits) return '';
  return `+237 ${[digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter(Boolean)
    .join(' ')}`;
}

// ─── Plan summary card ────────────────────────────────────────────────────────
function PlanSummaryCard({ plan, totalAmount }) {
  const credits = Number(plan.credits);
  const hasCredits = Number.isFinite(credits) && credits > 0;
  const explicitDays = Number(plan.durationDays);
  const days = Number.isFinite(explicitDays) && explicitDays > 0 ? explicitDays : credits;
  const durationLabel = hasCredits ? `${days} ${days === 1 ? 'Day' : 'Days'}` : null;
  const creditsLabel = credits === 1 ? 'Meal credit' : 'Meal credits';
  const initial = (plan.name || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={styles.summaryCard}>
      <View style={styles.planIcon}>
        <Text style={styles.planInitial}>{initial}</Text>
      </View>

      <Text style={styles.planName} numberOfLines={2}>
        {plan.name}
      </Text>

      {durationLabel ? (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{durationLabel}</Text>
        </View>
      ) : null}

      <View style={styles.metricsPanel}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue} numberOfLines={1}>
            {plan.credits}
          </Text>
          <Text style={styles.metricLabel}>{creditsLabel}</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {formatMoney(totalAmount)} FCFA
          </Text>
          <Text style={styles.metricLabel}>Total amount</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Payment method card ──────────────────────────────────────────────────────
function PaymentMethodCard({ name, description, logo, accent, isSelected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Select ${name}`}
      style={({ pressed }) => [
        styles.methodCard,
        isSelected
          ? { borderWidth: 1.5, borderColor: accent, backgroundColor: MTN_SELECTED_BG }
          : { borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.logoTile, { backgroundColor: accent }]}>
        <Image source={logo} style={styles.logo} resizeMode="contain" accessible={false} />
      </View>

      <View style={styles.methodText}>
        <Text style={styles.methodName}>{name}</Text>
        <Text style={styles.methodDesc}>{description}</Text>
      </View>

      <View
        style={[
          styles.radio,
          isSelected
            ? { borderColor: accent, backgroundColor: accent }
            : { borderColor: RADIUS_IDLE_COLOR },
        ]}
      >
        {isSelected ? <Ionicons name="checkmark" size={14} color={WHITE} /> : null}
      </View>
    </Pressable>
  );
}

const RADIUS_IDLE_COLOR = RADIO_IDLE;

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PaymentScreen({ route, navigation }) {
  const { plan, semester, studentId } = route.params;
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [selectedMethod, setSelectedMethod] = useState('MTN_MOMO');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneDialogVisible, setPhoneDialogVisible] = useState(false);

  // CRITICAL: total price calculation must remain unchanged
  const totalAmount = plan.credits * plan.pricePerCredit;

  const providerName = selectedMethod === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money';
  const providerAccent = selectedMethod === 'MTN_MOMO' ? MTN_ACCENT : ORANGE_ACCENT;
  const payLabel = `Pay ${formatMoney(totalAmount)} FCFA`;

  const handleBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
  };

  // ── Payment flow (unchanged logic) ─────────────────────────────────────────
  const closePhoneDialog = () => {
    Keyboard.dismiss();
    setPhoneError('');
    setPhoneDialogVisible(false);
  };

  const handlePhonePay = async () => {
    if (loading) return;

    const digits = phoneNumber.replace(/\D/g, '').replace(/^237/, '');

    if (!/^6\d{8}$/.test(digits)) {
      setPhoneError('Enter a valid Cameroon mobile number.');
      return;
    }

    Keyboard.dismiss();
    setPhoneError('');

    try {
      setLoading(true);
      await subscribeToPlan(token, studentId, plan.id, semester.id, selectedMethod);
      setPhoneDialogVisible(false);
      Alert.alert(
        'Success!',
        `Payment successful! ${plan.credits} credits have been added to your account.`,
        [{ text: 'OK', onPress: () => navigation.navigate('StudentTabs') }],
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openPhoneDialog = () => {
    Keyboard.dismiss();
    setPhoneError('');
    setPhoneDialogVisible(true);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 12) + 8 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header: back button and semester pill */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={18} color={NAVY} />
          </Pressable>

          {semester?.name ? (
            <View style={styles.semesterPill}>
              <Text style={styles.semesterPillText} numberOfLines={1}>
                {semester.name}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Payment method</Text>
          <Text style={styles.subtitle}>Choose how you want to pay.</Text>
        </View>

        {/* Plan summary */}
        <PlanSummaryCard plan={plan} totalAmount={totalAmount} />

        {/* Payment methods */}
        <Text style={styles.sectionTitle}>Payment method</Text>

        <View style={styles.methodList}>
          <PaymentMethodCard
            name="MTN Mobile Money"
            description="Pay with your MTN account"
            logo={mtnLogo}
            accent={MTN_ACCENT}
            isSelected={selectedMethod === 'MTN_MOMO'}
            onPress={() => setSelectedMethod('MTN_MOMO')}
          />
          <PaymentMethodCard
            name="Orange Money"
            description="Pay with your Orange account"
            logo={orangeLogo}
            accent={ORANGE_ACCENT}
            isSelected={selectedMethod === 'ORANGE_MONEY'}
            onPress={() => setSelectedMethod('ORANGE_MONEY')}
          />
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Pressable
          onPress={openPhoneDialog}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={payLabel}
          accessibilityState={{ disabled: loading, busy: loading }}
          style={({ pressed }) => [
            styles.payButton,
            pressed && styles.pressed,
            loading && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={WHITE} />
          ) : (
            <>
              <Text style={styles.payButtonText}>{payLabel}</Text>
              <Ionicons name="arrow-forward" size={18} color={WHITE} />
            </>
          )}
        </Pressable>
      </View>

      {/* Phone number dialog (payment logic unchanged) */}
      <Modal
        visible={phoneDialogVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePhoneDialog}
      >
        <BlurView
          style={styles.modalBackdrop}
          tint="dark"
          intensity={20}
          reducedTransparencyFallbackColor="rgba(15, 23, 42, 0.58)"
        >
          <KeyboardAvoidingView
            style={styles.modalCenter}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.dialog}>
              <View style={[styles.dialogAccent, { backgroundColor: providerAccent }]} />
              <Text style={styles.dialogTitle}>Pay with {providerName}</Text>
              <Text style={styles.dialogLabel}>Enter phone number</Text>
              <TextInput
                autoFocus
                value={phoneNumber}
                onChangeText={(value) => {
                  setPhoneNumber(formatCameroonPhone(value));
                  if (phoneError) setPhoneError('');
                }}
                onSubmitEditing={handlePhonePay}
                placeholder="+237 6XX XXX XXX"
                placeholderTextColor={MUTED}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                returnKeyType="done"
                accessibilityLabel="Phone number"
                accessibilityState={{ invalid: Boolean(phoneError) }}
                style={[
                  styles.phoneInput,
                  { borderColor: providerAccent },
                  phoneError && styles.phoneInputError,
                ]}
              />
              {phoneError ? (
                <Text style={styles.dialogError} accessibilityLiveRegion="polite">
                  {phoneError}
                </Text>
              ) : null}
              <View style={styles.dialogActions}>
                <Pressable
                  onPress={closePhoneDialog}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel payment"
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handlePhonePay}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Pay"
                  accessibilityState={{ disabled: loading, busy: loading }}
                  style={({ pressed }) => [
                    styles.dialogPayButton,
                    { backgroundColor: providerAccent },
                    pressed && styles.pressed,
                    loading && styles.disabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={WHITE} />
                  ) : (
                    <Text style={styles.dialogPayText}>Pay</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>
    </View>
  );
}

// ─── Styles (values from the Payment image, design points) ───────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },

  // Header
  headerRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
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

  // Title
  titleBlock: {
    marginTop: 18,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: NAVY,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },

  // Summary card
  summaryCard: {
    marginTop: 16,
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  planIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ICON_BG,
  },
  planInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: GREEN_TEXT,
  },
  planName: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: NAVY,
    textAlign: 'center',
  },
  durationBadge: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: BADGE_BG,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN_TEXT,
  },
  metricsPanel: {
    alignSelf: 'stretch',
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: METRICS_BG,
  },
  metricItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: NAVY,
  },
  metricLabel: {
    marginTop: 1,
    fontSize: 11,
    lineHeight: 15,
    color: MUTED,
  },
  metricDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: METRICS_DIVIDER,
  },

  // Section + methods
  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: NAVY,
  },
  methodList: {
    gap: 30,
  },
  methodCard: {
    minHeight: 69,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 44,
    height: 44,
  },
  methodText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: NAVY,
  },
  methodDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: MUTED,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },

  // Footer and pay button
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: PAGE_BG,
  },
  payButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: WHITE,
  },

  // Phone dialog
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  modalCenter: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
  },
  dialog: {
    width: '100%',
    padding: 18,
    borderRadius: 18,
    backgroundColor: WHITE,
  },
  dialogAccent: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  dialogTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: NAVY,
  },
  dialogLabel: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: NAVY,
  },
  phoneInput: {
    width: '100%',
    minHeight: 46,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 15,
    color: NAVY,
    backgroundColor: WHITE,
  },
  phoneInputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  dialogError: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: '#DC2626',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: MUTED,
  },
  dialogPayButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogPayText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: WHITE,
  },
});