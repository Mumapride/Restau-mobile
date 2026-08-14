import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/authStore';

import LoginScreen from '../screens/auth/LoginScreen';
import StudentNavigator from './StudentNavigator';
import AdminNavigator from './AdminNavigator';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, user, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
        ) : user?.role === 'ADMIN' ? (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : (
          <Stack.Screen name="Student" component={StudentNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
