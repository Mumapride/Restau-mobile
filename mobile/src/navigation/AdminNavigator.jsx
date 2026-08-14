import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Admin Dashboard - Coming Soon</Text>
  </View>
);

export default function AdminNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}