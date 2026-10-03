import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { registerStudent } from '../../api/auth.api';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/tokens';
import {
  AppButton,
  AppCard,
  AppInput,
  AppInputRightAction,
  ScreenHeader,
} from '../../components';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !matricule || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await registerStudent(firstName, lastName, matricule, email, password);
      Alert.alert('Success', 'Account created successfully', [
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="RESTAU"
        subtitle="Create your student account"
        variant="light"
        showBack
        onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Login'))}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppCard style={styles.card}>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitle}>
              Register to order your meals on campus
            </Text>

            <AppInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              icon="person-outline"
            />

            <AppInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              icon="person-outline"
            />

            <AppInput
              label="Matricule"
              value={matricule}
              onChangeText={setMatricule}
              placeholder="Enter your matricule"
              autoCapitalize="characters"
              icon="id-card-outline"
            />

            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />

            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              icon="lock-closed-outline"
              rightAction={
                <AppInputRightAction
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  label={showPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
            />

            <AppInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              icon="lock-closed-outline"
              style={styles.lastInput}
              rightAction={
                <AppInputRightAction
                  icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowConfirmPassword((v) => !v)}
                />
              }
            />

            <AppButton
              title={loading ? 'Creating account…' : 'Register'}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              icon="arrow-forward-outline"
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                accessible
                accessibilityRole="link"
                accessibilityLabel="Go to Login"
                onPress={() => navigation.navigate('Login')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  card: {
    width: '100%',
  },
  welcomeText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  lastInput: {
    marginBottom: SPACING.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    flexWrap: 'wrap',
  },
  loginText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
});