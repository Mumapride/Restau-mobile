import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";

// Meal Plans
import MealPlansScreen from "../screens/admin/MealPlansScreen";
import CreateMealPlanScreen from "../screens/admin/CreateMealPlanScreen";
import EditMealPlanScreen from "../screens/admin/EditMealPlanScreen";

// Semesters
import SemestersScreen from "../screens/admin/SemestersScreen";
import CreateSemesterScreen from "../screens/admin/CreateSemesterScreen";
import EditSemesterScreen from "../screens/admin/EditSemesterScreen";

//subscription
import SubscriptionsScreen from "../screens/admin/SubscriptionsScreen";
import SubscriptionDetailsScreen from "../screens/admin/SubscriptionDetailsScreen";

import MealClaimsScreen from "../screens/admin/MealClaimsScreen";
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

      {/* Semesters */}
      <Stack.Screen
        name="Semesters"
        component={SemestersScreen}
      />

      <Stack.Screen
        name="CreateSemester"
        component={CreateSemesterScreen}
      />

      <Stack.Screen
        name="EditSemester"
        component={EditSemesterScreen}
      />
      {/* Subscription */}
      <Stack.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
      />

      <Stack.Screen
        name="SubscriptionDetails"
        component={SubscriptionDetailsScreen}
      />

      <Stack.Screen
  name="MealClaims"
  component={MealClaimsScreen}
/>
    </Stack.Navigator>

    
  );
}