import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";

import MealPlansScreen from "../screens/admin/MealPlansScreen";
import CreateMealPlanScreen from "../screens/admin/CreateMealPlanScreen";
import EditMealPlanScreen from "../screens/admin/EditMealPlanScreen";

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Dashboard */}
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
      />

      {/* Meal Plans */}
      <Stack.Screen
        name="MealPlans"
        component={MealPlansScreen}
      />

      <Stack.Screen
        name="CreateMealPlan"
        component={CreateMealPlanScreen}
      />

      <Stack.Screen
        name="EditMealPlan"
        component={EditMealPlanScreen}
      />
    </Stack.Navigator>
  );
}