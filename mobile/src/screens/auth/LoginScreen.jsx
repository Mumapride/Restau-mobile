/**
 * LoginScreen — Restau Mobile sign in.
 *
 * Clean white authentication layout with softly animated pale-green shapes.
 * Login logic (loginStudent / loginAdmin / setAuth), validation, error
 * handling and navigation are unchanged — only the presentation is new.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { loginStudent, loginAdmin } from '../../api/auth.api';
import useAuthStore from '../../store/useAuthStore';

// ---------------------------------------------------------------------------
// Assets & palette
// ---------------------------------------------------------------------------

// Full-colour Restau logo for a white background. Confirm the file name
// in mobile/assets/brand/ (the white variant would be invisible here).
const LOGO = require('../../../assets/brand/restau-logo.png');

const PALETTE = {
  green: '#087A55',
  heading: '#0B1026',
  muted: '#747D96',
  border: '#DDE2EA',
  icon: '#46516B',
  softGreen: '#E8F8EE',
  white: '#FFFFFF',
};

const INPUT_HEIGHT = 58;
const FIELD_RADIUS = 16;

/**
 * Background shapes positioned from the reference.
 * size / offset are fractions of screen width; top is a % of screen height.
 */
const SHAPES = [
  { id: 'tr', size: 0.42, side: 'right', offset: -0.206, top: '1.5%', opacity: 0.95, dx: -9, dy: 9, duration: 10000, delay: 0 },
  { id: 'ml', size: 0.446, side: 'left', offset: -0.25, top: '13%', opacity: 0.9, dx: 9, dy: 8, duration: 12500, delay: 1500 },
  { id: 'mr', size: 0.31, side: 'right', offset: -0.176, top: '36.5%', opacity: 0.9, dx: -8, dy: -9, duration: 9000, delay: 800 },
  { id: 'bl', size: 0.42, side: 'left', offset: -0.21, top: '86%', opacity: 0.9, dx: 8, dy: -9, duration: 11000, delay: 2200 },
  { id: 'br', size: 0.48, side: 'right', offset: -0.24, top: '88%', opacity: 0.85, dx: -9, dy: -8, duration: 13000, delay: 3000 },
];

// ---------------------------------------------------------------------------
// Ambient background shape (native driver, never affects layout)
// ---------------------------------------------------------------------------

function DriftingShape({ style, dx, dy, opacity: base, duration, delay }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const easing = Easing.inOut(Easing.sin);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, easing, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration, easing, useNativeDriver: true }),
      ]),
    );
    const timer = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [t, duration, delay]);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.03] });
  const opacity = t.interpolate({
    inputRange: [0, 1],
    outputRange: [base - 0.12, Math.min(1, base + 0.05)],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.shape, style, { opacity, transform: [{ translateX }, { translateY }, { scale }] }]}
    />
  );
}

// ---------------------------------------------------------------------------
// Input field (presentation only)
// ---------------------------------------------------------------------------

function AuthInput({ icon, rightAction, style, ...inputProps }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused, style]}>
      <Ionicons name={icon} size={22} color={PALETTE.icon} />
      <TextInput
        {...inputProps}
        style={styles.input}
        placeholderTextColor={PALETTE.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {rightAction}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();

  const [isAdmin, setIsAdmin] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth } = useAuthStore();

  // Login logic — unchanged. Backend/API/authentication flow is untouched.
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
        const message =
          error.response?.data?.message ||
          error.message ||
          'Something went wrong';

        Alert.alert('Login Failed', message);
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
        const message =
          error.response?.data?.message ||
          error.message ||
          'Something went wrong';

        Alert.alert('Login Failed', message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggle = (adminMode) => {
    if (loading) {
      return;
    }
    setIsAdmin(adminMode);
  };

  // Responsive sizing
  const compact = height < 700;
  const logoSize = Math.min(150, Math.max(100, width * 0.34));
 const headingSize = Math.round(Math.min(27, Math.max(24, width * 0.065)));
const subtitleSize = width <= 340 ? 14 : 15;

  return (
    <View style={styles.screen}>
      {/* Decorative animated shapes — behind everything */}
      <View
        style={styles.shapes}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {SHAPES.map(({ id, size, side, offset, top, ...anim }) => (
          <DriftingShape
            key={id}
            {...anim}
            style={{ width: size * width, height: size * width, top, [side]: offset * width }}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + (compact ? SPACING_TOP_COMPACT : SPACING_TOP),
              paddingBottom: Math.max(insets.bottom, 16) + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Brand */}
            <View style={styles.brand}>
              <Image
                source={LOGO}
                style={{ width: logoSize, height: logoSize }}
                resizeMode="contain"
                accessible
                accessibilityLabel="Restau logo"
              />
              <Text style={styles.tagline}>Your Campus Meals, Made Simple</Text>
            </View>

            {/* Heading */}
            <View style={[styles.headingBlock, compact && styles.headingBlockCompact]}>
              <Text
                accessibilityRole="header"
                style={[styles.heading, { fontSize: headingSize, lineHeight: headingSize + 8 }]}
              >
                Welcome back
              </Text>
              <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
                Sign in to access your account.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {isAdmin ? (
                <AuthInput
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Admin email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              ) : (
                <AuthInput
                  icon="id-card-outline"
                  value={matricule}
                  onChangeText={setMatricule}
                  placeholder="Matricule number"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!loading}
                />
              )}

              <AuthInput
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.passwordInput}
                rightAction={
                  <Pressable
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowPassword((value) => !value)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color={PALETTE.icon}
                    />
                  </Pressable>
                }
              />

              {/* Sign in */}
              <Pressable
                accessible
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                disabled={loading}
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.signInButton,
                  (pressed || loading) && styles.signInPressed,
                ]}
              >
                {loading && <ActivityIndicator color={PALETTE.white} style={styles.spinner} />}
                <Text style={styles.signInText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
              </Pressable>

              {/* OR + Register (students only, as before) */}
              {!isAdmin && (
                <>
                  <View style={styles.orRow}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.orLine} />
                  </View>

                  <View style={styles.registerRow}>
                    <Text style={styles.registerText}>Don’t have an account? </Text>
                    <Pressable
                      accessible
                      accessibilityRole="link"
                      accessibilityLabel="Go to Register"
                      disabled={loading}
                      onPress={() => navigation.navigate('Register')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.registerLink}>Register</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {/* Student / Admin switch */}
              <Pressable
                accessible
                accessibilityRole="button"
                accessibilityLabel={isAdmin ? 'Switch to student sign in' : 'Switch to admin sign in'}
                disabled={loading}
                onPress={() => handleToggle(!isAdmin)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.switchLink}
              >
                <Text style={styles.switchText}>
                  {isAdmin ? 'Back to student sign in' : 'Administrator? Sign in here'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const SPACING_TOP = 28;
const SPACING_TOP_COMPACT = 8;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PALETTE.white,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },

  // ---- Background ----
  shapes: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shape: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: PALETTE.softGreen,
  },

  // ---- Layout ----
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  // ---- Brand ----
  brand: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '400',
    color: PALETTE.icon,
    textAlign: 'center',
    marginTop: 12,
  },

  // ---- Heading ----
  headingBlock: {
    marginTop: 44,
  },
  headingBlockCompact: {
    marginTop: 28,
  },
  heading: {
    fontWeight: '700',
    color: PALETTE.heading,
  },
  subtitle: {
    color: PALETTE.muted,
    marginTop: 8,
  },

  // ---- Form ----
  form: {
    marginTop: 28,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: INPUT_HEIGHT,
    paddingHorizontal: 16,
    gap: 14,
    backgroundColor: PALETTE.white,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: FIELD_RADIUS,
  },
  inputWrapFocused: {
    borderColor: PALETTE.green,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: PALETTE.heading,
    paddingVertical: 0,
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  passwordInput: {
    marginTop: 14,
  },

  // ---- Sign in ----
  signInButton: {
    height: INPUT_HEIGHT,
    marginTop: 24,
    borderRadius: FIELD_RADIUS,
    backgroundColor: PALETTE.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInPressed: {
    opacity: 0.85,
  },
  spinner: {
    marginRight: 10,
  },
  signInText: {
    fontSize: 17,
    fontWeight: '600',
    color: PALETTE.white,
  },

  // ---- OR divider ----
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 26,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: PALETTE.border,
  },
  orText: {
    fontSize: 13,
    color: PALETTE.muted,
  },

  // ---- Register ----
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 28,
  },
  registerText: {
    fontSize: 14,
    color: PALETTE.icon,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.green,
  },

  // ---- Student / admin switch ----
  switchLink: {
    alignSelf: 'center',
    marginTop: 28,
    paddingVertical: 4,
  },
  switchText: {
    fontSize: 13,
    color: PALETTE.muted,
  },
});