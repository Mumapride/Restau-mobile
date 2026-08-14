import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { loginStudent, loginAdmin } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';

export default function LoginScreen({ navigation }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth } = useAuthStore();

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
        Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
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
        Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🍽️</Text>
          </View>
          <Text style={styles.appName}>QR Restaurant</Text>
          <Text style={styles.appSubtitle}>Management System</Text>
        </View>

        {/* Toggle Student / Admin */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !isAdmin && styles.toggleActive]}
            onPress={() => setIsAdmin(false)}
          >
            <Text style={[styles.toggleText, !isAdmin && styles.toggleTextActive]}>
              Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isAdmin && styles.toggleActive]}
            onPress={() => setIsAdmin(true)}
          >
            <Text style={[styles.toggleText, isAdmin && styles.toggleTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.loginSubtitle}>
            {isAdmin ? 'Admin Login' : 'Student Login'}
          </Text>

          {/* Matricule or Email */}
          {isAdmin ? (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Matricule</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your matricule"
                placeholderTextColor="#aaa"
                value={matricule}
                onChangeText={setMatricule}
                autoCapitalize="characters"
              />
            </>
          )}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register link only for students */}
          {!isAdmin && (
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E3A',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#c8e6c9',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#145c30',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    width: '80%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 22,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    color: '#c8e6c9',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#1B5E3A',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E3A',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 25,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 13,
    marginBottom: 15,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 13,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: '#333',
  },
  showText: {
    color: '#1B5E3A',
    fontWeight: '600',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#1B5E3A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#888',
    fontSize: 13,
  },
  registerLink: {
    color: '#1B5E3A',
    fontWeight: 'bold',
    fontSize: 13,
  },
});