import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  getMealPlans,
  deleteMealPlan,
} from "../../api/mealPlans.api";
import { Ionicons } from "@expo/vector-icons";
import {
  LoadingView,
  ScreenHeader,
} from "../../components";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TOUCH_TARGET,
  TYPOGRAPHY,
} from "../../theme/tokens";

const MealPlansScreen = ({ navigation }) => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMealPlans = async () => {
    try {
      const data = await getMealPlans();

      setMealPlans(data.mealPlans || data || []);
    } catch (error) {
      console.error("Get meal plans error:", error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Unable to load meal plans."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMealPlans();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadMealPlans();
  };

  const handleDelete = (mealPlan) => {
    Alert.alert(
      "Delete Meal Plan",
      `Are you sure you want to delete "${mealPlan.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMealPlan(mealPlan.id);

              Alert.alert(
                "Success",
                "Meal plan deleted successfully."
              );

              loadMealPlans();
            } catch (error) {
              console.error(
                "Delete meal plan error:",
                error
              );

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  error.message ||
                  "Unable to delete meal plan."
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LoadingView message="Loading meal plans..." />
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Meal Plans"
        subtitle="Manage available meal plans"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.headerAddButton}
            onPress={() => navigation.navigate("CreateMealPlan")}
            accessibilityRole="button"
            accessibilityLabel="Create meal plan"
          >
            <Ionicons
              name="add"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.headerAddText}>
              Add
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Summary */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="albums-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryNumber}>
              {mealPlans.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Meal Plans
            </Text>
          </View>

          <View style={styles.summaryStatus}>
            <View style={styles.statusDot} />

            <Text style={styles.summaryStatusText}>
              {mealPlans.filter(
                (plan) => plan.isActive
              ).length}{" "}
              Active
            </Text>
          </View>
        </View>

        {/* Empty State */}

        {mealPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="restaurant-outline"
                size={30}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Meal Plans
            </Text>

            <Text style={styles.emptyText}>
              There are currently no meal plans.
              Create one to make it available
              to students.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                navigation.navigate(
                  "CreateMealPlan"
                )
              }
            >
              <Ionicons
                name="add-outline"
                size={19}
                color={COLORS.onPrimary}
                style={styles.emptyButtonIcon}
              />

              <Text style={styles.emptyButtonText}>
                Create Meal Plan
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Available Plans
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Meal plans currently configured
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {mealPlans.length}
                </Text>
              </View>
            </View>

            {mealPlans.map((mealPlan) => (
              <View
                key={mealPlan.id}
                style={styles.card}
              >
                {/* Card Top */}

                <View style={styles.cardTop}>
                  <View style={styles.planIcon}>
                    <Ionicons
                      name="fast-food-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.planTitleContainer}>
                    <Text
                      style={styles.planName}
                      numberOfLines={1}
                    >
                      {mealPlan.name}
                    </Text>

                    <Text style={styles.planDescription}>
                      {mealPlan.description ||
                        "No description provided"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      mealPlan.isActive
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeDot,
                        mealPlan.isActive
                          ? styles.activeDot
                          : styles.inactiveDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        mealPlan.isActive
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {mealPlan.isActive
                        ? "Active"
                        : "Inactive"}
                    </Text>
                  </View>
                </View>

                {/* Statistics */}

                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <View style={styles.statIcon}>
                      <Ionicons
                        name="ticket-outline"
                        size={14}
                        color={COLORS.primary}
                      />
                    </View>

                    <View>
                      <Text style={styles.statLabel}>
                        Meal Credits
                      </Text>

                      <Text style={styles.statValue}>
                        {mealPlan.credits}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statBox}>
                    <View style={styles.statIcon}>
                      <Ionicons
                        name="cash-outline"
                        size={14}
                        color={COLORS.primary}
                      />
                    </View>

                    <View>
                      <Text style={styles.statLabel}>
                        Price / Credit
                      </Text>

                      <Text style={styles.statValue}>
                        {mealPlan.pricePerCredit} FCFA
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      navigation.navigate(
                        "EditMealPlan",
                        {
                          mealPlan,
                        }
                      )
                    }
                  >
                    <Ionicons
                      name="create-outline"
                      size={14}
                      color={COLORS.primary}
                    />

                    <Text style={styles.editButtonText}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      handleDelete(mealPlan)
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={14}
                      color={COLORS.danger}
                    />

                    <Text
                      style={styles.deleteButtonText}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}

      {mealPlans.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() =>
            navigation.navigate(
              "CreateMealPlan"
            )
          }
        >
          <Ionicons
            name="add-outline"
            size={28}
            color={COLORS.onPrimary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingBottom: 100,
  },

  headerAddButton: {
    backgroundColor: COLORS.surface,
    minWidth: 74,
    height: 36,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
  },

  headerAddText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  summaryCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    minHeight: 78,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  summaryContent: {
    flex: 1,
  },

  summaryNumber: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
  },

  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  summaryStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 5,
  },

  summaryStatusText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },

  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  countBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  planIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },

  planTitleContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },

  planName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },

  planDescription: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: SPACING.xs,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  activeBadge: {
    backgroundColor: COLORS.successLight,
  },

  inactiveBadge: {
    backgroundColor: COLORS.surfaceAlt,
  },

  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },

  activeDot: {
    backgroundColor: COLORS.primary,
  },

  inactiveDot: {
    backgroundColor: COLORS.textMuted,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  activeText: {
    color: COLORS.primary,
  },

  inactiveText: {
    color: COLORS.textSecondary,
  },

  statsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  statIcon: {
    width: 31,
    height: 31,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },

  statLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: SPACING.xs,
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },

  actions: {
    flexDirection: "row",
    marginTop: SPACING.md,
  },

  editButton: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: SPACING.sm,
  },

  editButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  deleteButton: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dangerLight,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginLeft: SPACING.sm,
  },

  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "700",
  },

  emptyContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.xxl,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: SPACING.sm,
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  emptyButton: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonIcon: {
    marginRight: SPACING.sm,
  },

  emptyButtonText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: "800",
  },

  floatingButton: {
    position: "absolute",
    right: SPACING.lg,
    bottom: SPACING.xl,
    width: 55,
    height: 55,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 6,
  },
});

export default MealPlansScreen;
