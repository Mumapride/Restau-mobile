import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const AdminDashboardScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, Admin</Text>
          <Text style={styles.subtitle}>Restau Management System</Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      {/* Statistics */}

      <Text style={styles.sectionTitle}>Overview</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Subscriptions</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Pending Payments</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Meals Claimed</Text>
        </View>
      </View>

      {/* Management */}

      <Text style={styles.sectionTitle}>Management</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Semesters")}
        >
          <Text style={styles.menuIcon}>📅</Text>

          <View>
            <Text style={styles.menuTitle}>Semesters</Text>
            <Text style={styles.menuDescription}>
              Create and manage academic semesters
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("MealPlans")}
        >
          <Text style={styles.menuIcon}>🍽️</Text>

          <View>
            <Text style={styles.menuTitle}>Meal Plans</Text>
            <Text style={styles.menuDescription}>
              Manage available meal plans
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Subscriptions")}
        >
          <Text style={styles.menuIcon}>📋</Text>

          <View>
            <Text style={styles.menuTitle}>Subscriptions</Text>
            <Text style={styles.menuDescription}>
              Monitor student subscriptions
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Payments")}
        >
          <Text style={styles.menuIcon}>💳</Text>

          <View>
            <Text style={styles.menuTitle}>Payments</Text>
            <Text style={styles.menuDescription}>
              Review and verify payments
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Students")}
        >
          <Text style={styles.menuIcon}>👨‍🎓</Text>

          <View>
            <Text style={styles.menuTitle}>Students</Text>
            <Text style={styles.menuDescription}>
              Manage student accounts
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Reports")}
        >
          <Text style={styles.menuIcon}>📊</Text>

          <View>
            <Text style={styles.menuTitle}>Reports</Text>
            <Text style={styles.menuDescription}>
              View meal and transaction reports
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  welcome: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#6B7280",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    marginTop: 10,
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  statNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2563EB",
  },

  statLabel: {
    marginTop: 5,
    color: "#6B7280",
    fontSize: 13,
  },

  menuContainer: {
    marginBottom: 30,
  },

  menuItem: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  menuIcon: {
    fontSize: 28,
    marginRight: 15,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },

  menuDescription: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
});

export default AdminDashboardScreen;