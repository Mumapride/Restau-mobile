import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../theme/tokens";

export default function SubscriptionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscriptions</Text>
      <Text style={styles.subtitle}>Not implemented yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
  },
});