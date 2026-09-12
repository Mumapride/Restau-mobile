import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import MealPlansScreen from '../screens/student/MealPlansScreen';
import MyQRCodeScreen from '../screens/student/MyQRCodeScreen';
import MealHistoryScreen from '../screens/student/MealHistoryScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import PaymentScreen from '../screens/student/PaymentScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudentTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={StudentDashboardScreen} />
      <Tab.Screen name="Meal Plans" component={MealPlansScreen} />
      <Tab.Screen name="My QR Code" component={MyQRCodeScreen} />
      <Tab.Screen name="History" component={MealHistoryScreen} />
      <Tab.Screen name="Profile" component={StudentProfileScreen} />
    </Tab.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}