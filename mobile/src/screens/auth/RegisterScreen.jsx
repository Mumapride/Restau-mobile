/**
 * RegisterScreen — Restau Mobile student registration.
 *
 * Clean white authentication layout matching the Sign In screen.
 * Registration logic, validation, API call and navigation are unchanged.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  Animated,
  ActivityIndicator,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { registerStudent } from '../../api/auth.api';

const LOGO = require('../../../assets/brand/restau-logo.png');

const AUTH = {
  background: '#FFFFFF',
  green: '#087A55',
  heading: '#0B1026',
  muted: '#747D96',
  border: '#DDE2EA',
  icon: '#46516B',
  paleGreen: '#E8F8EE',
};

const INPUT_HEIGHT = 58;
const FIELD_RADIUS = 16;

/* -------------------------------------------------------------------------- */
/* Animated background shape                                                   */
/* -------------------------------------------------------------------------- */

function DriftingShape({
  style,
  dx = 10,
  dy = 10,
  duration = 12000,
  delay = 0,
}) {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const easing = Easing.inOut(Easing.sin);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration,
          easing,
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => {
      loop.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [animation, duration, delay]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dx],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dy],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.03],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.shape,
        style,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Authentication input                                                       */
/* -------------------------------------------------------------------------- */

function AuthInput({
  icon,
  rightAction,
  style,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.inputWrap,
        focused && styles.inputWrapFocused,
        style,
      ]}
    >
      <Ionicons
        name={icon}
        size={23}
        color={AUTH.icon}
      />

      <TextInput
        {...inputProps}
        style={styles.input}
        placeholderTextColor={AUTH.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {rightAction}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen                                                                      */
/* -------------------------------------------------------------------------- */

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  /*
   * IMPORTANT:
   * Same logo sizing system as LoginScreen.
   * Login uses max 150px, so Registration now matches it.
   */
  const logoSize = Math.min(
    150,
    Math.max(100, width * 0.34)
  );

  const compact = height < 700;

  /* ----------------------------- Form state ----------------------------- */

  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* --------------------------- Name handling ---------------------------- */

  const handleFullNameChange = (text) => {
    setFullName(text);

    const trimmed = text.trim();
    const spaceIndex = trimmed.search(/\s/);

    if (spaceIndex === -1) {
      setFirstName(trimmed);
      setLastName('');
    } else {
      setFirstName(trimmed.slice(0, spaceIndex));
      setLastName(trimmed.slice(spaceIndex).trim());
    }
  };

  /* --------------------------- Registration ----------------------------- */

  const handleRegister = async () => {
    if (
      !firstName ||
      !lastName ||
      !matricule ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Error',
        !lastName && firstName
          ? 'Please enter your first and last name'
          : 'Please fill in all fields'
      );

      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      await registerStudent(
        firstName,
        lastName,
        matricule,
        email,
        password
      );

      Alert.alert(
        'Success',
        'Account created successfully',
        [
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('Login');
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <View style={styles.screen}>

      {/* ------------------------------------------------------------------ */}
      {/* Animated background                                                 */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.shapes}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <DriftingShape
          style={styles.shapeTR}
          dx={-8}
          dy={8}
          duration={13000}
        />

        <DriftingShape
          style={styles.shapeBL}
          dx={10}
          dy={-8}
          duration={15000}
          delay={1200}
        />

        <DriftingShape
          style={styles.shapeBR}
          dx={-8}
          dy={-10}
          duration={14000}
          delay={2400}
        />
      </View>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop:
                insets.top +
                (compact ? 8 : 12),

              paddingBottom:
                Math.max(insets.bottom, 16) + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

          <View style={styles.content}>

            {/* ---------------------------------------------------------- */}
            {/* Back button                                                  */}
            {/* ---------------------------------------------------------- */}

            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.6}
              onPress={goBack}
              style={styles.backBtn}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color={AUTH.heading}
              />
            </TouchableOpacity>

            {/* ---------------------------------------------------------- */}
            {/* Logo                                                        */}
            {/* ---------------------------------------------------------- */}

            <View style={styles.brand}>
              <Image
                source={LOGO}
                style={{
                  width: logoSize,
                  height: logoSize,
                }}
                resizeMode="contain"
                accessible
                accessibilityLabel="Restau logo"
              />
            </View>

            {/* ---------------------------------------------------------- */}
            {/* Heading                                                     */}
            {/* ---------------------------------------------------------- */}

            <View
              style={[
                styles.headingBlock,
                compact && styles.headingBlockCompact,
              ]}
            >
              <Text style={styles.title}>
                Create your account
              </Text>

              <Text style={styles.subtitle}>
                Join Restau and enjoy easy access{'\n'}
                to campus meals.
              </Text>
            </View>

            {/* ---------------------------------------------------------- */}
            {/* Form                                                        */}
            {/* ---------------------------------------------------------- */}

            <View style={styles.form}>

              {/* Full name */}
              <AuthInput
                icon="person-outline"
                value={fullName}
                onChangeText={handleFullNameChange}
                placeholder="Full name"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />

              {/* Student email */}
              <AuthInput
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="Student email (e.g. ub@student.cm)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.fieldSpacing}
              />

              {/* Matricule */}
              <AuthInput
                icon="school-outline"
                value={matricule}
                onChangeText={setMatricule}
                placeholder="Matricule number"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading}
                style={styles.fieldSpacing}
              />

              {/* Password */}
              <AuthInput
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.fieldSpacing}
                rightAction={
                  <Pressable
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    onPress={() =>
                      setShowPassword((value) => !value)
                    }
                    disabled={loading}
                    hitSlop={{
                      top: 10,
                      bottom: 10,
                      left: 10,
                      right: 10,
                    }}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={24}
                      color={AUTH.icon}
                    />
                  </Pressable>
                }
              />

              {/* Confirm password */}
              <AuthInput
                icon="lock-closed-outline"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.fieldSpacing}
                rightAction={
                  <Pressable
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    onPress={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    hitSlop={{
                      top: 10,
                      bottom: 10,
                      left: 10,
                      right: 10,
                    }}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={24}
                      color={AUTH.icon}
                    />
                  </Pressable>
                }
              />

              {/* Create account */}
              <Pressable
                accessible
                accessibilityRole="button"
                accessibilityLabel="Create account"
                disabled={loading}
                onPress={handleRegister}
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed && !loading && styles.submitPressed,
                  loading && styles.submitPressed,
                ]}
              >
                {loading && (
                  <View style={styles.loadingDot}>
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  </View>
                )}

                <Text style={styles.submitText}>
                  {loading
                    ? 'Creating account…'
                    : 'Create account'}
                </Text>
              </Pressable>
            </View>

            {/* ---------------------------------------------------------- */}
            {/* Login link                                                  */}
            {/* ---------------------------------------------------------- */}

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
              </Text>

              <TouchableOpacity
                accessible
                accessibilityRole="link"
                accessibilityLabel="Go to Login"
                onPress={() =>
                  navigation.navigate('Login')
                }
                hitSlop={{
                  top: 8,
                  bottom: 8,
                  left: 8,
                  right: 8,
                }}
                disabled={loading}
              >
                <Text style={styles.loginLink}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AUTH.background,
    overflow: 'hidden',
  },

  flex: {
    flex: 1,
  },

  /* ------------------------- Background shapes ------------------------- */

  shapes: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  shape: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: AUTH.paleGreen,
  },

  shapeTR: {
    width: 260,
    height: 260,
    top: -70,
    right: -100,
  },

  shapeBL: {
    width: 280,
    height: 280,
    bottom: -130,
    left: -120,
  },

  shapeBR: {
    width: 240,
    height: 240,
    bottom: -120,
    right: -100,
  },

  /* ----------------------------- Layout -------------------------------- */

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },

  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  /* --------------------------- Back button ------------------------------ */

  backBtn: {
    width: 42,
    height: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 2,
  },

  /* ------------------------------- Logo --------------------------------- */

  brand: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ----------------------------- Heading -------------------------------- */

  headingBlock: {
    marginTop: 24,
  },

  headingBlockCompact: {
    marginTop: 18,
  },

  title: {
    fontSize: 28,
    lineHeight: 37,
    fontWeight: '700',
    color: AUTH.heading,
    textAlign: 'left',
  },

  subtitle: {
  fontSize: 15,
  lineHeight: 21,
  fontWeight: '400',
  color: AUTH.muted,
  textAlign: 'left',
  marginTop: 8,
},

  /* ------------------------------ Form --------------------------------- */

  form: {
    width: '100%',
    marginTop: 28,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',

    height: INPUT_HEIGHT,

    paddingHorizontal: 16,

    backgroundColor: AUTH.background,

    borderWidth: 1,
    borderColor: AUTH.border,

    borderRadius: FIELD_RADIUS,

    gap: 14,
  },

  inputWrapFocused: {
    borderColor: AUTH.green,
  },

  input: {
    flex: 1,
    height: '100%',

    fontSize: 14,
    fontWeight: '400',

    color: AUTH.heading,

    paddingVertical: 0,

    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
      default: {},
    }),
  },

  fieldSpacing: {
    marginTop: 14,
  },

  /* -------------------------- Create account --------------------------- */

  submitBtn: {
    height: INPUT_HEIGHT,

    marginTop: 24,

    borderRadius: FIELD_RADIUS,

    backgroundColor: AUTH.green,

    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',
  },

  submitPressed: {
    opacity: 0.86,
  },

  loadingDot: {
    marginRight: 10,
  },

  submitText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* ----------------------------- Login row ----------------------------- */

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    flexWrap: 'wrap',

    marginTop: 28,
  },

  loginText: {
    fontSize: 14,
    fontWeight: '400',
    color: AUTH.muted,
  },

  loginLink: {
    fontSize: 15,
    fontWeight: '600',
    color: AUTH.green,
  },
});
