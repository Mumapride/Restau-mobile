import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { loginStudent, loginAdmin } from '../../api/auth.api';
import useAuthStore from '../../store/useAuthStore';

import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  TOUCH_TARGET,
} from '../../theme/tokens';

import {
  AppButton,
  AppCard,
  AppInput,
  AppInputRightAction,
} from '../../components';

export default function LoginScreen({ navigation }) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [isAdmin, setIsAdmin] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth } = useAuthStore();

  // ---------------------------------------------------------
  // Entrance animations
  // ---------------------------------------------------------

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenTranslateY = useRef(new Animated.Value(24)).current;

  const logoScale = useRef(new Animated.Value(0.86)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // ---------------------------------------------------------
  // Student/Admin selector animation
  // ---------------------------------------------------------

  const toggleIndicator = useRef(new Animated.Value(0)).current;

  // ---------------------------------------------------------
  // Decorative background animations
  // ---------------------------------------------------------

  const decorativeOne = useRef(new Animated.Value(0)).current;
  const decorativeTwo = useRef(new Animated.Value(0)).current;

  // ---------------------------------------------------------
  // Password icon animation
  // ---------------------------------------------------------

  const passwordIconRotation = useRef(new Animated.Value(0)).current;

  // ---------------------------------------------------------
  // Initial screen animation
  // ---------------------------------------------------------

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(screenTranslateY, {
        toValue: 0,
        tension: 52,
        friction: 9,
        useNativeDriver: true,
      }),

      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        delay: 80,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const decorativeOneLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(decorativeOne, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(decorativeOne, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const decorativeTwoLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(decorativeTwo, {
          toValue: 1,
          duration: 6500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(decorativeTwo, {
          toValue: 0,
          duration: 6500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    decorativeOneLoop.start();
    decorativeTwoLoop.start();

    return () => {
      decorativeOneLoop.stop();
      decorativeTwoLoop.stop();
    };
  }, [
    decorativeOne,
    decorativeTwo,
    logoOpacity,
    logoScale,
    screenOpacity,
    screenTranslateY,
  ]);

  // ---------------------------------------------------------
  // Student/Admin toggle animation
  // ---------------------------------------------------------

  useEffect(() => {
    Animated.spring(toggleIndicator, {
      toValue: isAdmin ? 1 : 0,
      tension: 70,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [isAdmin, toggleIndicator]);

  // ---------------------------------------------------------
  // Password icon animation
  // ---------------------------------------------------------

  useEffect(() => {
    Animated.timing(passwordIconRotation, {
      toValue: showPassword ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [passwordIconRotation, showPassword]);

  // ---------------------------------------------------------
  // Login logic
  // IMPORTANT:
  // Backend/API/authentication flow is unchanged.
  // ---------------------------------------------------------

  const handleLogin = async () => {
    if (isAdmin) {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      try {
        setLoading(true);

        const result = await loginAdmin(email, password);

        setAuth(result.token, result.user);
      } catch (error) {
        Alert.alert(
          'Login Failed',
          error.response?.data?.message || 'Something went wrong',
        );
      } finally {
        setLoading(false);
      }
    } else {
      if (!matricule || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      try {
        setLoading(true);

        const result = await loginStudent(matricule, password);

        setAuth(result.token, result.user);
      } catch (error) {
        Alert.alert(
          'Login Failed',
          error.response?.data?.message || 'Something went wrong',
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // ---------------------------------------------------------
  // Student/Admin mode
  // ---------------------------------------------------------

  const handleToggle = (adminMode) => {
    if (loading) {
      return;
    }

    setIsAdmin(adminMode);
  };

  // ---------------------------------------------------------
  // Animated values
  // ---------------------------------------------------------

  const logoTranslateY = decorativeOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const decorativeTranslateOne = decorativeOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  const decorativeTranslateTwo = decorativeTwo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });

  const passwordRotate = passwordIconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  const indicatorTranslateX = toggleIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [2, Math.max(2, windowWidth / 2 - 24)],
  });

  // ---------------------------------------------------------
  // Responsive layout helpers
  // ---------------------------------------------------------

  const compactHeight = windowHeight < 700;
  const isSmallWidth = windowWidth <= 360;

  return (
    <View style={styles.screen}>
      {/* -----------------------------------------------------
          Decorative background
          ----------------------------------------------------- */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.decorativeCircleOne,
          {
            transform: [{ translateY: decorativeTranslateOne }],
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.decorativeCircleTwo,
          {
            transform: [{ translateY: decorativeTranslateTwo }],
          },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            compactHeight && styles.scrollContentCompact,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: screenOpacity,
                transform: [{ translateY: screenTranslateY }],
              },
            ]}
          >
            {/* -------------------------------------------------
                Brand
                ------------------------------------------------- */}

            <Animated.View
              style={[
                styles.brandBlock,
                {
                  opacity: logoOpacity,
                  transform: [
                    { scale: logoScale },
                    { translateY: logoTranslateY },
                  ],
                },
              ]}
            >
              <View style={styles.logoOuter}>
                <View style={styles.logoInner}>
                  <Ionicons
                    name="restaurant-outline"
                    size={30}
                    color={COLORS.onPrimary}
                  />
                </View>
              </View>

              <Text style={styles.brandName}>RESTAU</Text>

              <Text style={styles.brandTagline}>
                University meal management
              </Text>
            </Animated.View>

            {/* -------------------------------------------------
                Authentication card
                ------------------------------------------------- */}

            <AppCard style={styles.authenticationCard}>
              {/* ---------------------------------------------
                  Card heading
                  --------------------------------------------- */}

              <View style={styles.headingBlock}>
                <Text style={styles.heading}>Welcome back</Text>

                <Text style={styles.headingSubtitle}>
                  {isAdmin
                    ? 'Sign in to manage meals and services'
                    : 'Sign in to continue to your meal account'}
                </Text>
              </View>

              {/* ---------------------------------------------
                  Student / Admin selector
                  --------------------------------------------- */}

              <View
                accessible
                accessibilityRole="tablist"
                style={styles.toggleContainer}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.toggleIndicator,
                    {
                      width: '50%',
                      transform: [{ translateX: indicatorTranslateX }],
                    },
                  ]}
                />

                <Pressable
                  accessible
                  accessibilityRole="tab"
                  accessibilityState={{ selected: !isAdmin }}
                  accessibilityLabel="Student login"
                  disabled={loading}
                  onPress={() => handleToggle(false)}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    pressed && !loading && styles.togglePressed,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={!isAdmin ? COLORS.primary : COLORS.textMuted}
                  />

                  <Text
                    style={[
                      styles.toggleText,
                      !isAdmin && styles.toggleTextActive,
                    ]}
                  >
                    Student
                  </Text>
                </Pressable>

                <Pressable
                  accessible
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isAdmin }}
                  accessibilityLabel="Admin login"
                  disabled={loading}
                  onPress={() => handleToggle(true)}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    pressed && !loading && styles.togglePressed,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={17}
                    color={isAdmin ? COLORS.primary : COLORS.textMuted}
                  />

                  <Text
                    style={[
                      styles.toggleText,
                      isAdmin && styles.toggleTextActive,
                    ]}
                  >
                    Admin
                  </Text>
                </Pressable>
              </View>

              {/* ---------------------------------------------
                  Credential fields
                  --------------------------------------------- */}

              <View style={styles.form}>
                {isAdmin ? (
                  <AppInput
                    label="Email address"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    icon="mail-outline"
                    editable={!loading}
                  />
                ) : (
                  <AppInput
                    label="Matricule"
                    value={matricule}
                    onChangeText={setMatricule}
                    placeholder="Enter your matricule"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    icon="person-outline"
                    editable={!loading}
                  />
                )}

                <AppInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  icon="lock-closed-outline"
                  style={styles.passwordInput}
                  editable={!loading}
                  rightAction={
                    <Animated.View
                      style={{
                        transform: [{ rotate: passwordRotate }],
                      }}
                    >
                      <AppInputRightAction
                        icon={
                          showPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                        onPress={() =>
                          setShowPassword((value) => !value)
                        }
                      />
                    </Animated.View>
                  }
                />

                {/* -------------------------------------------
                    Login button
                    ------------------------------------------- */}

                <AppButton
                  title={loading ? 'Signing in…' : 'Sign in'}
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  icon="arrow-forward-outline"
                  style={styles.loginButton}
                />

                {/* -------------------------------------------
                    Student registration
                    ------------------------------------------- */}

                {!isAdmin && (
                  <View style={styles.registerArea}>
                    <View style={styles.registerDivider} />

                    <View style={styles.registerRow}>
                      <Text style={styles.registerText}>
                        New to RESTAU?
                      </Text>

                      <Pressable
                        accessible
                        accessibilityRole="link"
                        accessibilityLabel="Go to Register"
                        disabled={loading}
                        onPress={() => navigation.navigate('Register')}
                        hitSlop={{
                          top: 10,
                          bottom: 10,
                          left: 10,
                          right: 10,
                        }}
                        style={({ pressed }) => [
                          styles.registerButton,
                          pressed && styles.registerPressed,
                        ]}
                      >
                        <Text style={styles.registerLink}>
                          Create account
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          size={14}
                          color={COLORS.primary}
                        />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </AppCard>

            {/* -------------------------------------------------
                Footer
                ------------------------------------------------- */}

            <View style={styles.footer}>
              <View style={styles.footerDot} />

              <Text style={styles.footerText}>
                {isAdmin
                  ? 'Authorized administrators only'
                  : 'Your university meal account'}
              </Text>

              <View style={styles.footerDot} />
            </View>

            {!isSmallWidth && (
              <Text style={styles.versionText}>
                RESTAU • University Dining
              </Text>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  // -----------------------------------------------------------
  // Screen
  // -----------------------------------------------------------

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },

  scrollContentCompact: {
    paddingVertical: SPACING.lg,
  },

  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  // -----------------------------------------------------------
  // Decorative background
  // -----------------------------------------------------------

  decorativeCircleOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -115,
    top: -60,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.75,
  },

  decorativeCircleTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    left: -105,
    bottom: -55,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.55,
  },

  // -----------------------------------------------------------
  // Brand
  // -----------------------------------------------------------

  brandBlock: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  logoOuter: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },

  logoInner: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    ...TYPOGRAPHY.h1,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 1.4,
    color: COLORS.primary,
    marginBottom: 2,
  },

  brandTagline: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // -----------------------------------------------------------
  // Authentication card
  // -----------------------------------------------------------

  authenticationCard: {
    width: '100%',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  },

  headingBlock: {
    marginBottom: SPACING.lg,
  },

  heading: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  headingSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // -----------------------------------------------------------
  // Student / Admin segmented control
  // -----------------------------------------------------------

  toggleContainer: {
    position: 'relative',
    flexDirection: 'row',
    minHeight: 52,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },

  toggleIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    bottom: SPACING.xs,
    left: 0,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },

  toggleButton: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    zIndex: 2,
  },

  togglePressed: {
    opacity: 0.72,
  },

  toggleText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
  },

  toggleTextActive: {
    color: COLORS.primary,
  },

  // -----------------------------------------------------------
  // Form
  // -----------------------------------------------------------

  form: {
    width: '100%',
  },

  passwordInput: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  loginButton: {
    minHeight: TOUCH_TARGET,
    marginTop: SPACING.xs,
  },

  // -----------------------------------------------------------
  // Registration
  // -----------------------------------------------------------

  registerArea: {
    marginTop: SPACING.lg,
  },

  registerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },

  registerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },

  registerButton: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    justifyContent: 'center',
  },

  registerPressed: {
    opacity: 0.6,
  },

  registerLink: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },

  // -----------------------------------------------------------
  // Footer
  // -----------------------------------------------------------

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },

  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
  },

  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    opacity: 0.7,
  },
});