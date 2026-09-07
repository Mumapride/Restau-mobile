import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
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
              await AsyncStorage.removeItem("token");

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
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#087A4B"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            GREEN HEADER
        ====================================================== */}

        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.menuButton}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>

            <View style={styles.brandContainer}>
              <Text style={styles.brandName}>
                Restau
              </Text>

              <Text style={styles.brandSubtitle}>
                Management System
              </Text>
            </View>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>

        {/* =====================================================
            MAIN WHITE CONTENT
        ====================================================== */}

        <View style={styles.mainContent}>

          {/* Welcome */}

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcome}>
              Welcome, Admin
            </Text>

            <Text style={styles.subtitle}>
              Restaurant Management System
            </Text>
          </View>

          {/* =================================================
              OVERVIEW
          ================================================== */}

          <Text style={styles.sectionTitle}>
            Overview
          </Text>

          <View style={styles.statsContainer}>

            {/* Students */}

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>
                  ♙
                </Text>
              </View>

              <Text style={styles.statNumber}>
                0
              </Text>

              <Text style={styles.statLabel}>
                Students
              </Text>
            </View>

            {/* Subscriptions */}

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>
                  ▤
                </Text>
              </View>

              <Text style={styles.statNumber}>
                0
              </Text>

              <Text style={styles.statLabel}>
                Subscriptions
              </Text>
            </View>

            {/* Pending Payments */}

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>
                  ◷
                </Text>
              </View>

              <Text style={styles.statNumber}>
                0
              </Text>

              <Text style={styles.statLabel}>
                Pending Payments
              </Text>
            </View>

            {/* Meals Claimed */}

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>
                  ♨
                </Text>
              </View>

              <Text style={styles.statNumber}>
                0
              </Text>

              <Text style={styles.statLabel}>
                Meals Claimed
              </Text>
            </View>

          </View>

          {/* =================================================
              MANAGEMENT
          ================================================== */}

          <View style={styles.managementHeader}>
            <Text style={styles.sectionTitle}>
              Management
            </Text>

            <Text style={styles.sectionSubtitle}>
              Manage the restaurant system
            </Text>
          </View>

          <View style={styles.menuContainer}>

            {/* Semesters */}

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("Semesters")
              }
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>
                  ▣
                </Text>
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Semesters
                </Text>

                <Text style={styles.menuDescription}>
                  Create and manage academic semesters
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </TouchableOpacity>

            {/* Meal Plans */}

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("MealPlans")
              }
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>
                  ♨
                </Text>
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Meal Plans
                </Text>

                <Text style={styles.menuDescription}>
                  Manage available meal plans
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </TouchableOpacity>

            {/* Subscriptions */}

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("Subscriptions")
              }
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>
                  ▤
                </Text>
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Subscriptions
                </Text>

                <Text style={styles.menuDescription}>
                  Monitor student subscriptions
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </TouchableOpacity>

            {/* Payments */}

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("Payments")
              }
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>
                  ◷
                </Text>
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Payments
                </Text>

                <Text style={styles.menuDescription}>
                  Review and manage payments
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </TouchableOpacity>

            {/* Students */}

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("Students")
              }
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>
                  ♙
                </Text>
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Students
                </Text>

                <Text style={styles.menuDescription}>
                  Manage student accounts
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </TouchableOpacity>

            {/* Reports */}

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("Reports")
              }
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>
                  ▥
                </Text>
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Reports
                </Text>

                <Text style={styles.menuDescription}>
                  View meal and transaction reports
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </TouchableOpacity>

            {/* Meal Claims */}

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("MealClaims")
              }
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>
                  ♨
                </Text>
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Meal Claims
                </Text>

                <Text style={styles.menuDescription}>
                  Monitor student meal claims
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </TouchableOpacity>

          </View>

          {/* =================================================
              LOGOUT
          ================================================== */}

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.75}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>
              ↪
            </Text>

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Restau Management System
          </Text>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  /* =========================================================
     SCREEN
  ========================================================== */

  screen: {
    flex: 1,
    backgroundColor: "#087A4B",
  },

  container: {
    flex: 1,
    backgroundColor: "#087A4B",
  },

  content: {
    paddingBottom: 35,
  },

  /* =========================================================
     TOP GREEN HEADER
  ========================================================== */

  topHeader: {
    height: 92,
    backgroundColor: "#087A4B",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    marginRight: 12,
  },

  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: "#FFFFFF",
    marginVertical: 2.5,
    borderRadius: 2,
  },

  brandContainer: {
    alignItems: "center",
  },

  brandName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  brandSubtitle: {
    color: "#D9F2E7",
    fontSize: 10,
    marginTop: 1,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#087A4B",
    fontSize: 16,
    fontWeight: "800",
  },

  /* =========================================================
     WHITE CONTENT AREA
  ========================================================== */

  mainContent: {
    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,

    minHeight: 750,
  },

  /* =========================================================
     WELCOME
  ========================================================== */

  welcomeContainer: {
    marginBottom: 22,
  },

  welcome: {
    color: "#10231B",
    fontSize: 22,
    fontWeight: "800",
  },

  subtitle: {
    color: "#789087",
    fontSize: 12,
    marginTop: 4,
  },

  /* =========================================================
     SECTION TITLES
  ========================================================== */

  sectionTitle: {
    color: "#10231B",
    fontSize: 16,
    fontWeight: "800",
  },

  managementHeader: {
    marginTop: 3,
    marginBottom: 13,
  },

  sectionSubtitle: {
    color: "#789087",
    fontSize: 11,
    marginTop: 4,
  },

  /* =========================================================
     STATISTICS
  ========================================================== */

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 13,
    marginBottom: 25,
  },

  statCard: {
    width: "48.2%",
    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E3F0EA",

    borderRadius: 14,

    paddingHorizontal: 13,
    paddingVertical: 13,

    marginBottom: 10,

    shadowColor: "#087A4B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,

    elevation: 2,
  },

  statIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,

    backgroundColor: "#E5F5EE",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 8,
  },

  statIcon: {
    color: "#087A4B",
    fontSize: 20,
    fontWeight: "700",
  },

  statNumber: {
    color: "#087A4B",
    fontSize: 21,
    fontWeight: "800",
  },

  statLabel: {
    color: "#71847C",
    fontSize: 11,
    marginTop: 2,
  },

  /* =========================================================
     MANAGEMENT MENU
  ========================================================== */

  menuContainer: {
    marginBottom: 20,
  },

  menuItem: {
    minHeight: 66,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E4F0EB",

    borderRadius: 13,

    paddingHorizontal: 12,
    paddingVertical: 10,

    marginBottom: 9,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#087A4B",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.035,
    shadowRadius: 4,

    elevation: 1,
  },

  menuIconContainer: {
    width: 40,
    height: 40,

    borderRadius: 11,

    backgroundColor: "#E7F5EF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  menuIcon: {
    color: "#087A4B",
    fontSize: 20,
    fontWeight: "700",
  },

  menuTextContainer: {
    flex: 1,
  },

  menuTitle: {
    color: "#153128",
    fontSize: 13,
    fontWeight: "800",
  },

  menuDescription: {
    color: "#81928B",
    fontSize: 10.5,
    marginTop: 3,
    lineHeight: 14,
  },

  arrow: {
    color: "#087A4B",
    fontSize: 25,
    fontWeight: "300",
    marginLeft: 7,
  },

  /* =========================================================
     LOGOUT
  ========================================================== */

  logoutButton: {
    height: 48,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#F3D7D7",

    borderRadius: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 2,
  },

  logoutIcon: {
    color: "#D64545",
    fontSize: 19,
    fontWeight: "700",
    marginRight: 7,
  },

  logoutText: {
    color: "#D64545",
    fontSize: 13,
    fontWeight: "800",
  },

  /* =========================================================
     FOOTER
  ========================================================== */

  footerText: {
    textAlign: "center",
    color: "#A0AEA8",
    fontSize: 9.5,
    marginTop: 18,
  },
});

export default AdminDashboardScreen;