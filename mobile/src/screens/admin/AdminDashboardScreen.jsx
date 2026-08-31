```jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminDashboardScreen = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove authentication token
              await AsyncStorage.removeItem("token");

              // Return to login screen and clear navigation history
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Logout error:", error);

              Alert.alert(
                "Error",
                "Unable to logout. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcome}>Welcome, Admin</Text>

          <Text style={styles.subtitle}>
            Restau Management System
          </Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      {/* Overview */}

      <Text style={styles.sectionTitle}>Overview</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>👨‍🎓</Text>
          </View>

          <Text style={styles.statNumber}>0</Text>

          <Text style={styles.statLabel}>
            Students
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📋</Text>
          </View>

          <Text style={styles.statNumber}>0</Text>

          <Text style={styles.statLabel}>
            Subscriptions
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>💳</Text>
          </View>

          <Text style={styles.statNumber}>0</Text>

          <Text style={styles.statLabel}>
            Pending Payments
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>🍽️</Text>
          </View>

          <Text style={styles.statNumber}>0</Text>

          <Text style={styles.statLabel}>
            Meals Claimed
          </Text>
        </View>
      </View>

      {/* Management */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Management
          </Text>

          <Text style={styles.sectionSubtitle}>
            Manage the restaurant system
          </Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {/* Semesters */}

        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Semesters")}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📅</Text>
          </View>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Semesters
            </Text>

            <Text style={styles.menuDescription}>
              Create and manage academic semesters
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Meal Plans */}

        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("MealPlans")}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🍽️</Text>
          </View>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Meal Plans
            </Text>

            <Text style={styles.menuDescription}>
              Manage available meal plans
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Subscriptions */}

        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("Subscriptions")
          }
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📋</Text>
          </View>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Subscriptions
            </Text>

            <Text style={styles.menuDescription}>
              Monitor student subscriptions
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Payments */}

        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Payments")}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>💳</Text>
          </View>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Payments
            </Text>

            <Text style={styles.menuDescription}>
              Review and manage payments
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Students */}

        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Students")}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>👨‍🎓</Text>
          </View>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Students
            </Text>

            <Text style={styles.menuDescription}>
              Manage student accounts
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Reports */}

        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Reports")}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📊</Text>
          </View>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Reports
            </Text>

            <Text style={styles.menuDescription}>
              View meal and transaction reports
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Meal Claims */}

        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("MealClaims")
          }
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🍴</Text>
          </View>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Meal Claims
            </Text>

            <Text style={styles.menuDescription}>
              Monitor student meal claims
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.7}
        onPress={handleLogout}
      >
        <View style={styles.logoutIconContainer}>
          <Text style={styles.logoutIcon}>↪</Text>
        </View>

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Restau Management System
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Header */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  headerTextContainer: {
    flex: 1,
  },

  welcome: {
    fontSize: 27,
    fontWeight: "700",
    color: "#1F2937",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#6B7280",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1B5E3A",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  /* Sections */

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 14,
  },

  /* Statistics */

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 14,
    marginBottom: 12,

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EAF4EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statIcon: {
    fontSize: 19,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "700",
    color: "#1B5E3A",
  },

  statLabel: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },

  /* Management */

  menuContainer: {
    marginBottom: 20,
  },

  menuItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EAF4EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  menuIcon: {
    fontSize: 23,
  },

  menuTextContainer: {
    flex: 1,
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
    lineHeight: 17,
  },

  arrow: {
    fontSize: 28,
    color: "#9CA3AF",
    marginLeft: 8,
  },

  /* Logout */

  logoutButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  logoutIconContainer: {
    marginRight: 8,
  },

  logoutIcon: {
    fontSize: 21,
    color: "#DC2626",
    fontWeight: "700",
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "700",
  },

  footerText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 20,
  },
});

export default AdminDashboardScreen;
```
