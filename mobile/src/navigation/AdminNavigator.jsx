import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useAuthStore from '../store/authStore';

const Tab = createBottomTabNavigator();

const AdminDashboardPlaceholder = () => {
  const { clearAuth } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin Dashboard</Text>
      <Text style={styles.subtext}>Coming Soon</Text>
      <TouchableOpacity style={styles.button} onPress={clearAuth}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function AdminNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={AdminDashboardPlaceholder} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E3A',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 10,
    padding: 15,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});