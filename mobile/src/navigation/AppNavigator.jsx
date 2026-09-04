import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import useAuthStore from "../store/useAuthStore";

// Auth screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Student navigator
import StudentNavigator from "./StudentNavigator";

// Admin navigator
import AdminNavigator from "./AdminNavigator";

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
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        ) : user?.role === "ADMIN" ? (
          <Stack.Screen
            name="Admin"
            component={AdminNavigator}
          />
        ) : (
          <Stack.Screen
            name="Student"
            component={StudentNavigator}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}