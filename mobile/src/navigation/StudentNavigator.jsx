import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import MealPlansScreen from '../screens/student/MealPlansScreen';
import MyQRCodeScreen from '../screens/student/MyQRCodeScreen';
import MealHistoryScreen from '../screens/student/MealHistoryScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';

const Tab = createBottomTabNavigator();

export default function StudentNavigator() {
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