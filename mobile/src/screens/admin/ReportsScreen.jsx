
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { BASE_URL } from "../../api/auth.api";
import { ScreenHeader } from "../../components";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../theme/tokens";

const ReportsScreen = ({ navigation }) => {
  const [summary, setSummary] = useState(null);
  const [dailyReport, setDailyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = async () => {
    // Keep this compatible with your existing login storage.
    // If your project uses another key, replace "token" with that key.
    return await AsyncStorage.getItem("token");
  };

  const fetchReports = async () => {
    try {
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [summaryResponse, dailyResponse] = await Promise.all([
        fetch(`${BASE_URL}/reports/summary`, {
          method: "GET",
          headers,
        }),
        fetch(`${BASE_URL}/reports/daily`, {
          method: "GET",
          headers,
        }),
      ]);

      if (!summaryResponse.ok) {
        const data = await summaryResponse.json().catch(() => ({}));
        throw new Error(
          data.message || "Failed to load reports summary"
        );
      }

      if (!dailyResponse.ok) {
        const data = await dailyResponse.json().catch(() => ({}));
        throw new Error(
          data.message || "Failed to load daily report"
        );
      }

      const summaryData = await summaryResponse.json();
      const dailyData = await dailyResponse.json();

      setSummary(summaryData);
      setDailyReport(dailyData);
    } catch (err) {
      console.error("Reports error:", err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const formatCurrency = (amount) => {
    const value = Number(amount || 0);

    return `${value.toLocaleString()} FCFA`;
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatCard = ({
    icon,
    title,
    value,
    subtitle,
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons
          name={icon}
          size={22}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>

        <Text style={styles.statValue}>
          {value}
        </Text>

        {subtitle ? (
          <Text style={styles.statSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );

  const renderMenuBreakdown = () => {
    if (!dailyReport?.mealsByMenuItem) {
      return null;
    }

    const entries = Object.entries(
      dailyReport.mealsByMenuItem
    );

    if (entries.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="restaurant-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No meals claimed today
          </Text>

          <Text style={styles.emptyText}>
            Meal consumption data will appear here
            once students claim meals.
          </Text>
        </View>
      );
    }

    return entries.map(([menuItem, count], index) => (
      <View
        key={`${menuItem}-${index}`}
        style={styles.breakdownRow}
      >
        <View style={styles.breakdownLeft}>
          <View style={styles.breakdownIcon}>
            <Ionicons
              name="restaurant-outline"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.breakdownName}>
            {menuItem}
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {count}
          </Text>
        </View>
      </View>
    ));
  };

  const renderMealClaims = () => {
    if (!dailyReport?.claims?.length) {
      return (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="document-text-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No claims recorded today
          </Text>

          <Text style={styles.emptyText}>
            Today's student meal claims will appear
            here.
          </Text>
        </View>
      );
    }

    return dailyReport.claims.map((claim) => {
      const student = claim.student;
      const user = student?.user;

      const studentName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
        : "Unknown Student";

      return (
        <View
          key={claim.id}
          style={styles.claimCard}
        >
          <View style={styles.claimTop}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {studentName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {studentName}
              </Text>

              <Text style={styles.matricule}>
                {student?.matricule || "No matricule"}
              </Text>
            </View>

            <View style={styles.successBadge}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={COLORS.primary}
              />

              <Text style={styles.successBadgeText}>
                Claimed
              </Text>
            </View>
          </View>

          <View style={styles.claimDivider} />

          <View style={styles.claimDetails}>
            <View style={styles.claimDetail}>
              <Ionicons
                name="restaurant-outline"
                size={17}
                color={COLORS.primary}
              />

              <View>
                <Text style={styles.detailLabel}>
                  Meal
                </Text>

                <Text style={styles.detailValue}>
                  {claim.menuItem || "Unknown"}
                </Text>
              </View>
            </View>

            <View style={styles.claimDetail}>
              <Ionicons
                name="time-outline"
                size={17}
                color={COLORS.primary}
              />

              <View>
                <Text style={styles.detailLabel}>
                  Time
                </Text>

                <Text style={styles.detailValue}>
                  {formatTime(claim.claimDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading reports...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Reports"
        subtitle="Monitor restaurant activity"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            accessibilityRole="button"
            accessibilityLabel="Refresh reports"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="refresh-outline"
              size={22}
              color={COLORS.onPrimary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ERROR */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={COLORS.danger}
            />

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Unable to load reports
              </Text>

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>

            <TouchableOpacity
              onPress={fetchReports}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* OVERVIEW */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              Overall system statistics
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {renderStatCard({
            icon: "people-outline",
            title: "Students",
            value: summary?.totalStudents ?? 0,
            subtitle: "Registered students",
          })}

          {renderStatCard({
            icon: "card-outline",
            title: "Subscriptions",
            value: summary?.totalSubscriptions ?? 0,
            subtitle: "Total subscriptions",
          })}

          {renderStatCard({
            icon: "restaurant-outline",
            title: "Meals Claimed",
            value: summary?.totalMealsClaimed ?? 0,
            subtitle: "All-time claims",
          })}

          {renderStatCard({
            icon: "ticket-outline",
            title: "Credits",
            value: summary?.totalCreditsPurchased ?? 0,
            subtitle: "Credits purchased",
          })}
        </View>

        {/* REVENUE */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueIcon}>
            <Ionicons
              name="cash-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.revenueContent}>
            <Text style={styles.revenueLabel}>
              Total Revenue
            </Text>

            <Text style={styles.revenueValue}>
              {formatCurrency(summary?.totalRevenue)}
            </Text>

            <Text style={styles.revenueSubtext}>
              From verified payments
            </Text>
          </View>
        </View>

        {/* TODAY */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Today's Activity
            </Text>

            <Text style={styles.sectionSubtitle}>
              {formatDate(dailyReport?.date)}
            </Text>
          </View>

          <View style={styles.todayBadge}>
            <View style={styles.todayDot} />

            <Text style={styles.todayBadgeText}>
              Today
            </Text>
          </View>
        </View>

        <View style={styles.todayGrid}>
          <View style={styles.todayCard}>
            <View style={styles.todayIcon}>
              <Ionicons
                name="restaurant"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.todayValue}>
              {summary?.today?.mealsClaimed ?? 0}
            </Text>

            <Text style={styles.todayLabel}>
              Meals Claimed
            </Text>
          </View>

          <View style={styles.todayCard}>
            <View style={styles.todayIcon}>
              <Ionicons
                name="people"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.todayValue}>
              {summary?.today?.studentsServed ?? 0}
            </Text>

            <Text style={styles.todayLabel}>
              Students Served
            </Text>
          </View>
        </View>

        {/* MENU BREAKDOWN */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Meal Breakdown
            </Text>

            <Text style={styles.sectionSubtitle}>
              Today's meals by menu item
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          {renderMenuBreakdown()}
        </View>

        {/* CLAIMS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Today's Meal Claims
            </Text>

            <Text style={styles.sectionSubtitle}>
              Recent student meal activity
            </Text>
          </View>

          {dailyReport?.claims?.length > 0 ? (
            <View style={styles.claimCountBadge}>
              <Text style={styles.claimCountText}>
                {dailyReport.claims.length}
              </Text>
            </View>
          ) : null}
        </View>

        <View>
          {renderMealClaims()}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Ionicons
            name="analytics-outline"
            size={20}
            color={COLORS.primary}
          />

          <Text style={styles.footerText}>
            Reports are generated from system activity
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* HEADER (ScreenHeader right action) */
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.overlayLight,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  /* SECTIONS */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },

  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  /* STATS */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48.2%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.md,
  },

  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  statContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  statTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },

  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },

  statSubtitle: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: SPACING.xs,
  },

  /* REVENUE */
  revenueCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  revenueIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  revenueContent: {
    marginLeft: SPACING.md,
  },

  revenueLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  revenueValue: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 2,
  },

  revenueSubtext: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  /* TODAY */
  todayGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },

  todayCard: {
    width: "48.2%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.md,
  },

  todayIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },

  todayValue: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "800",
  },

  todayLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
    textAlign: "center",
  },

  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
  },

  todayDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 5,
  },

  todayBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  /* GENERAL CARD */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },

  /* BREAKDOWN */
  breakdownRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  breakdownIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },

  breakdownName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  countBadge: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: "800",
  },

  /* CLAIM */
  claimCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },

  claimTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  studentAvatarText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
  },

  studentInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  studentName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  matricule: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },

  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },

  successBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 3,
  },

  claimDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceAlt,
    marginVertical: SPACING.md,
  },

  claimDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  claimDetail: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginLeft: 8,
  },

  detailValue: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    marginTop: 2,
  },

  claimCountBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  claimCountText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: "800",
  },

  /* EMPTY */
  emptyBox: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },

  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 5,
  },

  /* ERROR */
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.dangerLight,
  },

  errorContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  errorTitle: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "700",
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 10,
    marginTop: 3,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },

  retryText: {
    color: COLORS.onPrimary,
    fontSize: 11,
    fontWeight: "700",
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: SPACING.md,
  },

  /* FOOTER */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
  },

  footerText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginLeft: 7,
  },
});
