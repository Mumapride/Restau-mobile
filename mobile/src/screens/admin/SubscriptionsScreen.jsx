import React from "react";
import { View, Text, StyleSheet } from "react-native";

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
    backgroundColor: "#F5F7FA",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B5E3A",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
  },
});