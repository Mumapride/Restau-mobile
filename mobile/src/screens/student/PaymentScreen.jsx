import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../store/useAuthStore';
import { subscribeToPlan } from '../../api/Student.api';
import StudentTopBar from '../../components/StudentTopBar';
import mtnLogo from '../../../assets/payment/mtn-money.png';
import orangeLogo from '../../../assets/payment/orange-money.png';

const MAX_CONTENT_WIDTH = 680;
const APP_GREEN = '#1B5E3A';
const DASHBOARD_PRIMARY = '#16A36A';
const DASHBOARD_DARK_GREEN = '#15803D';
const DASHBOARD_LIGHT_GREEN = '#DCFCE7';
const DASHBOARD_BACKGROUND = '#F8FAFC';
const DASHBOARD_TEXT = '#0F172A';
const DASHBOARD_TEXT_SECONDARY = '#64748B';
const DASHBOARD_BORDER = '#E2E8F0';
const MINT_SOFT = '#E3F6EA';
const MINT_PANEL = '#F1FAF5';
const MINT_BORDER = '#BBF7D0';
const MTN_ACCENT = '#E0AA00';
const ORANGE_ACCENT = '#F97316';

const WEB_CURSOR_STYLE = Platform.select({
  web: { cursor: 'pointer' },
  default: {},
});
const WEB_FOCUS_STYLE = Platform.select({
  web: {
    outlineColor: DASHBOARD_PRIMARY,
    outlineOffset: 2,
    outlineStyle: 'solid',
    outlineWidth: 1,
  },
  default: {},
});

function formatDate(value) {
  if (!value) return 'Date unavailable';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCameroonPhone(value) {
  const digits = String(value).replace(/\D/g, '').replace(/^237/, '').slice(0, 9);
  if (!digits) return '';
  return `+237 ${[digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter(Boolean)
    .join(' ')}`;
}

/**
 * One reusable, data-driven card for every plan (1 day, 3 days, 4 days, ...).
 * Name, duration, credits and price per credit all come from the plan object.
 */
function MealPlanSummaryCard({ plan }) {
  const credits = Number(plan.credits);
  const hasCredits = Number.isFinite(credits) && credits > 0;
  const durationLabel = hasCredits ? `${credits} ${credits === 1 ? 'Day' : 'Days'}` : null;
  const creditsLabel = credits === 1 ? 'Meal credit' : 'Meal credits';

  return (
    <View style={styles.summaryCard}>
      {/* Subtle decorative shapes (plain Views, no images) */}
      <View pointerEvents="none" style={styles.decoShapeLarge} />
      <View pointerEvents="none" style={styles.decoShapeSmall} />

      <View style={styles.summaryTop}>
        <View style={styles.planIcon}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={26} color={DASHBOARD_PRIMARY} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryLabel}>MEAL PLAN</Text>
          <Text style={styles.planName} numberOfLines={2}>
            {plan.name}
          </Text>
        </View>
        {durationLabel ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText} numberOfLines={1}>
              {durationLabel}
            </Text>
            <Ionicons name="calendar-outline" size={16} color={DASHBOARD_PRIMARY} />
          </View>
        ) : null}
      </View>

      <View style={styles.metricsPanel}>
        <View style={styles.metricItem}>
          <View style={styles.metricIcon}>
            <Ionicons name="layers-outline" size={20} color={DASHBOARD_PRIMARY} />
          </View>
          <View style={styles.metricCopy}>
            <Text style={styles.metricValue} numberOfLines={1}>
              {plan.credits}
            </Text>
            <Text style={styles.metricLabel} numberOfLines={1}>
              {creditsLabel}
            </Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons name="database-outline" size={20} color={DASHBOARD_PRIMARY} />
          </View>
          <View style={styles.metricCopy}>
            <Text style={styles.metricValue} numberOfLines={1}>
              {Number(plan.pricePerCredit).toLocaleString()}
            </Text>
            <Text style={styles.metricLabel} numberOfLines={1}>
              FCFA per credit
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function PaymentScreen({ route, navigation }) {
  const { plan, semester, studentId } = route.params;
  const { token } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState('MTN_MOMO');
  const [loading, setLoading] = useState(false);
  const [hoveredMethod, setHoveredMethod] = useState(null);
  const [focusedMethod, setFocusedMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneDialogVisible, setPhoneDialogVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // CRITICAL: total price calculation must remain unchanged
  const totalAmount = plan.credits * plan.pricePerCredit;

  const providerName = selectedMethod === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money';
  const providerAccent = selectedMethod === 'MTN_MOMO' ? MTN_ACCENT : ORANGE_ACCENT;

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
        'Success! 🎉',
        `Payment successful! ${plan.credits} credits have been added to your account.`,
        [{ text: 'OK', onPress: () => navigation.navigate('StudentTabs') }]
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

  const renderMethod = ({ key, name, logo, accent, selectedCard, selectedIcon }) => {
    const isSelected = selectedMethod === key;
    return (
      <Pressable
        onPress={() => setSelectedMethod(key)}
        onHoverIn={() => setHoveredMethod(key)}
        onHoverOut={() => setHoveredMethod(null)}
        onFocus={() => setFocusedMethod(key)}
        onBlur={() => setFocusedMethod(null)}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`Select ${name}`}
        style={({ pressed }) => [
          styles.methodCard,
          isSelected && selectedCard,
          hoveredMethod === key && !isSelected && styles.methodCardHovered,
          focusedMethod === key && styles.focusedWeb,
          pressed && styles.methodCardPressed,
        ]}
      >
        <View style={[styles.methodIcon, isSelected && selectedIcon]}>
          <Image source={logo} style={styles.methodLogo} resizeMode="contain" accessible={false} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>{name}</Text>
          <Text style={styles.methodDesc}>Mobile money payment</Text>
        </View>
        <View
          style={[
            styles.radio,
            isSelected && { borderColor: accent, backgroundColor: accent },
          ]}
        >
          {isSelected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Fixed top bar — outside the ScrollView */}
      <StudentTopBar
        navigation={navigation}
        title="Payment"
        subtitle="Complete your purchase"
        showBack
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.body, width >= 700 && styles.bodyWide]}>
          <Text style={styles.sectionTitle}>Your meal plan</Text>

          <MealPlanSummaryCard plan={plan} />

          <View style={styles.semesterCard}>
            <View style={styles.semesterIcon}>
              <Ionicons name="school-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.semesterCopy}>
              <Text style={styles.semesterLabel}>Current semester</Text>
              <Text style={styles.semesterName} numberOfLines={1}>
                {semester.name || 'Active semester'}
              </Text>
              {semester.startDate ? (
                <Text style={styles.semesterDate} numberOfLines={1}>
                  Starts {formatDate(semester.startDate)}
                </Text>
              ) : null}
            </View>
            <View style={styles.semesterDivider} />
            <View style={styles.semesterMeta}>
              <Text style={styles.semesterMetaLabel}>Credits expire</Text>
              <Text style={styles.semesterMetaValue} numberOfLines={1}>
                {formatDate(semester.endDate)}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, styles.sectionSpaced]}>Payment method</Text>

          <View style={styles.methodOptions}>
            {renderMethod({
              key: 'MTN_MOMO',
              name: 'MTN Mobile Money',
              logo: mtnLogo,
              accent: MTN_ACCENT,
              selectedCard: styles.methodCardSelectedMtn,
              selectedIcon: styles.methodIconSelectedMtn,
            })}
            {renderMethod({
              key: 'ORANGE_MONEY',
              name: 'Orange Money',
              logo: orangeLogo,
              accent: ORANGE_ACCENT,
              selectedCard: styles.methodCardSelectedOrange,
              selectedIcon: styles.methodIconSelectedOrange,
            })}
          </View>

          <View style={styles.securityCard}>
            <Ionicons name="shield-checkmark" size={24} color={DASHBOARD_DARK_GREEN} />
            <View style={styles.securityCopy}>
              <Text style={styles.securityTitle}>Your payment is secure</Text>
              <Text style={styles.securityText}>We use secure and encrypted payment methods.</Text>
            </View>
            <Ionicons name="lock-closed" size={18} color={DASHBOARD_PRIMARY} />
          </View>

          <View style={styles.totalCard}>
            <View style={styles.totalCopy}>
              <Text style={styles.totalLabel}>Total amount</Text>
              <Text style={styles.totalHint}>One-time payment for this plan</Text>
            </View>
            <View style={styles.totalRight}>
              <Text style={styles.totalValue} numberOfLines={1}>
                {Number(totalAmount).toLocaleString()} FCFA
              </Text>
              <View style={styles.totalChip}>
                <Text style={styles.totalChipText} numberOfLines={1}>
                  {plan.credits} {Number(plan.credits) === 1 ? 'credit' : 'credits'} ×{' '}
                  {Number(plan.pricePerCredit).toLocaleString()} FCFA
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={openPhoneDialog}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={`Pay ${Number(totalAmount).toLocaleString()} FCFA`}
            accessibilityState={{ disabled: loading, busy: loading }}
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.confirmButtonPressed,
              loading && styles.dialogButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmText}>Pay {Number(totalAmount).toLocaleString()} FCFA</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={phoneDialogVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePhoneDialog}
      >
        <BlurView
          style={styles.modalBackdrop}
          blurType="dark"
          blurAmount={4}
          reducedTransparencyFallbackColor="rgba(15, 23, 42, 0.58)"
        >
          <KeyboardAvoidingView style={styles.modalCenter} behavior={undefined}>
            <View style={styles.phoneDialog}>
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
                placeholderTextColor={DASHBOARD_TEXT_SECONDARY}
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
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.dialogButtonPressed,
                  ]}
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
                    styles.payButton,
                    { backgroundColor: providerAccent },
                    pressed && styles.dialogButtonPressed,
                    loading && styles.dialogButtonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.payText}>Pay</Text>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DASHBOARD_BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: DASHBOARD_BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  bodyWide: {
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: DASHBOARD_TEXT,
  },
  sectionSpaced: {
    marginTop: 18,
  },

  /* Meal plan summary card */
  summaryCard: {
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: DASHBOARD_TEXT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  decoShapeLarge: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 48,
    transform: [{ rotate: '28deg' }],
    backgroundColor: 'rgba(22, 163, 106, 0.07)',
  },
  decoShapeSmall: {
    position: 'absolute',
    top: 20,
    right: -34,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(22, 163, 106, 0.06)',
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MINT_SOFT,
  },
  summaryCopy: { flex: 1, minWidth: 0 },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.4,
    fontWeight: '500',
    color: DASHBOARD_TEXT_SECONDARY,
  },
  planName: {
    marginTop: 1,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: DASHBOARD_TEXT,
  },
  durationBadge: {
    flexShrink: 0,
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#9ADBB8',
    backgroundColor: 'rgba(220, 252, 231, 0.7)',
  },
  durationText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: DASHBOARD_DARK_GREEN,
  },
  metricsPanel: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MINT_PANEL,
  },
  metricItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MINT_SOFT,
  },
  metricCopy: { flex: 1, minWidth: 0 },
  metricValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: DASHBOARD_TEXT,
  },
  metricLabel: {
    fontSize: 12.5,
    lineHeight: 16,
    color: DASHBOARD_TEXT_SECONDARY,
  },
  metricDivider: {
    width: 1,
    height: 38,
    marginHorizontal: 10,
    backgroundColor: '#BFE3CE',
  },

  /* Semester */
  semesterCard: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: MINT_BORDER,
  },
  semesterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DASHBOARD_DARK_GREEN,
  },
  semesterCopy: { flex: 1, minWidth: 0 },
  semesterLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: DASHBOARD_TEXT_SECONDARY,
  },
  semesterName: {
    marginTop: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  semesterDate: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    color: DASHBOARD_TEXT_SECONDARY,
  },
  semesterDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 4,
    backgroundColor: MINT_BORDER,
  },
  semesterMeta: {
    maxWidth: 104,
  },
  semesterMetaLabel: {
    fontSize: 11.5,
    lineHeight: 16,
    color: DASHBOARD_TEXT_SECONDARY,
  },
  semesterMetaValue: {
    marginTop: 2,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: DASHBOARD_PRIMARY,
  },

  /* Payment methods */
  methodOptions: { gap: 10 },
  methodCard: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: DASHBOARD_TEXT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    ...WEB_CURSOR_STYLE,
  },
  methodCardSelectedMtn: {
    borderColor: MTN_ACCENT,
    backgroundColor: '#FFFBEB',
  },
  methodCardSelectedOrange: {
    borderColor: ORANGE_ACCENT,
    backgroundColor: '#FFF7ED',
  },
  methodCardHovered: {
    borderColor: '#A7DDBB',
    backgroundColor: '#F7FFFA',
  },
  methodCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  focusedWeb: WEB_FOCUS_STYLE,
  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MINT_SOFT,
  },
  methodIconSelectedMtn: {
    backgroundColor: '#FEF3C7',
  },
  methodIconSelectedOrange: {
    backgroundColor: '#FFEDD5',
  },
  methodLogo: {
    width: 38,
    height: 38,
  },
  methodInfo: { flex: 1, minWidth: 0 },
  methodName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  methodDesc: {
    marginTop: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: DASHBOARD_TEXT_SECONDARY,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#B8C6BE',
    backgroundColor: '#FFFFFF',
  },

  /* Security */
  securityCard: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: MINT_BORDER,
  },
  securityCopy: { flex: 1, minWidth: 0 },
  securityTitle: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: DASHBOARD_DARK_GREEN,
  },
  securityText: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    color: DASHBOARD_TEXT_SECONDARY,
  },

  /* Total */
  totalCard: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: DASHBOARD_LIGHT_GREEN,
    borderWidth: 1,
    borderColor: MINT_BORDER,
  },
  totalCopy: { flexShrink: 1, minWidth: 0 },
  totalLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: DASHBOARD_TEXT,
  },
  totalHint: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: DASHBOARD_TEXT_SECONDARY,
  },
  totalRight: {
    flexShrink: 0,
    alignItems: 'flex-end',
    maxWidth: '60%',
  },
  totalValue: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: DASHBOARD_DARK_GREEN,
  },
  totalChip: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: MINT_BORDER,
  },
  totalChipText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: DASHBOARD_DARK_GREEN,
  },

  /* Pay button */
  confirmButton: {
    marginTop: 14,
    alignSelf: 'stretch',
    minHeight: 54,
    paddingHorizontal: 24,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: APP_GREEN,
    shadowColor: APP_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    ...WEB_CURSOR_STYLE,
  },
  confirmButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  confirmText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Phone dialog (unchanged) */
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  modalCenter: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
  },
  phoneDialog: {
    width: '100%',
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  dialogAccent: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  dialogTitle: {
    color: DASHBOARD_TEXT,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
  },
  dialogLabel: {
    marginTop: 16,
    marginBottom: 6,
    color: DASHBOARD_TEXT,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  phoneInput: {
    width: '100%',
    minHeight: 46,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    color: DASHBOARD_TEXT,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
  },
  phoneInputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  dialogError: {
    marginTop: 6,
    color: '#DC2626',
    fontSize: 12,
    lineHeight: 17,
  },
  dialogActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DASHBOARD_BORDER,
    backgroundColor: '#FFFFFF',
    ...WEB_CURSOR_STYLE,
  },
  cancelText: {
    color: DASHBOARD_TEXT_SECONDARY,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  payButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    ...WEB_CURSOR_STYLE,
  },
  payText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
  },
  dialogButtonPressed: { opacity: 0.78 },
  dialogButtonDisabled: { opacity: 0.65 },
});