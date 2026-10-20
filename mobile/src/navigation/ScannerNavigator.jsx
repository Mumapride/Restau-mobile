import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScannerScreen from '../screens/scanner/ScannerScreen';

const Stack = createNativeStackNavigator();

export default function ScannerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Scanner" component={ScannerScreen} />
    </Stack.Navigator>
  );
}