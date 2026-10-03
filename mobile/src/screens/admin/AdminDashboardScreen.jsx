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
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from '../../store/useAuthStore';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme/tokens';


const AdminDashboardScreen = ({ navigation }) => {
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => clearAuth()
      }
    ]
  );
};
  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
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
                <Ionicons name="people-outline" size={20} color={COLORS.primary} />
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
                <Ionicons name="card-outline" size={20} color={COLORS.primary} />
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
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
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
                <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
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
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Semesters
                </Text>

                <Text style={styles.menuDescription}>
                  Create and manage academic semesters
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
                <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Meal Plans
                </Text>

                <Text style={styles.menuDescription}>
                  Manage available meal plans
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
                <Ionicons name="card-outline" size={20} color={COLORS.primary} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Subscriptions
                </Text>

                <Text style={styles.menuDescription}>
                  Monitor student subscriptions
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Payments
                </Text>

                <Text style={styles.menuDescription}>
                  Review and manage payments
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
                <Ionicons name="people-outline" size={20} color={COLORS.primary} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Students
                </Text>

                <Text style={styles.menuDescription}>
                  Manage student accounts
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
                <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Reports
                </Text>

                <Text style={styles.menuDescription}>
                  View meal and transaction reports
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
                <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  Meal Claims
                </Text>

                <Text style={styles.menuDescription}>
                  Monitor student meal claims
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
            <Ionicons name="log-out-outline" size={19} color={COLORS.danger} />
            <View style={{ width: SPACING.sm }} />

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
    backgroundColor: COLORS.primary,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  content: {
    paddingBottom: 35,
  },

  /* =========================================================
     TOP GREEN HEADER
  ========================================================== */

  topHeader: {
    height: 92,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
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
    backgroundColor: COLORS.onPrimary,
    marginVertical: 2.5,
    borderRadius: 2,
  },

  brandContainer: {
    alignItems: "center",
  },

  brandName: {
    color: COLORS.onPrimary,
    fontSize: 17,
    fontWeight: "700",
  },

  brandSubtitle: {
    color: COLORS.onPrimaryMuted,
    fontSize: 10,
    marginTop: 1,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.onPrimary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },

  /* =========================================================
     WHITE CONTENT AREA
  ========================================================== */

  mainContent: {
    backgroundColor: COLORS.surface,

    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,

    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,

    minHeight: 750,
  },

  /* =========================================================
     WELCOME
  ========================================================== */

  welcomeContainer: {
    marginBottom: SPACING.lg,
  },

  welcome: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },

  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  /* =========================================================
     SECTION TITLES
  ========================================================== */

  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },

  managementHeader: {
    marginTop: 3,
    marginBottom: 13,
  },

  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  /* =========================================================
     STATISTICS
  ========================================================== */

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },

  statCard: {
    width: "48.2%",
    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: RADIUS.md,

    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,

    marginBottom: SPACING.sm,

    ...SHADOWS.sm,
  },

  statIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,

    backgroundColor: COLORS.primaryLight,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: SPACING.sm,
  },

  statNumber: {
    color: COLORS.primary,
    fontSize: 21,
    fontWeight: "800",
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  /* =========================================================
     MANAGEMENT MENU
  ========================================================== */

  menuContainer: {
    marginBottom: SPACING.lg,
  },

  menuItem: {
    minHeight: 60,

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: RADIUS.md,

    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,

    marginBottom: SPACING.sm,

    flexDirection: "row",
    alignItems: "center",

    ...SHADOWS.sm,
  },

  menuIconContainer: {
    width: 38,
    height: 38,

    borderRadius: 10,

    backgroundColor: COLORS.primaryLight,

    justifyContent: "center",
    alignItems: "center",

    marginRight: SPACING.md,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  menuDescription: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },

  /* =========================================================
     LOGOUT
  ========================================================== */

  logoutButton: {
    height: 48,

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.dangerLight,

    borderRadius: RADIUS.md,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 2,
  },

  logoutText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "800",
  },

  /* =========================================================
     FOOTER
  ========================================================== */

  footerText: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 9.5,
    marginTop: SPACING.lg,
  },
});

export default AdminDashboardScreen;