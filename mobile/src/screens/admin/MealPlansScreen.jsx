import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  getMealPlans,
  deleteMealPlan,
} from "../../api/mealPlans.api";

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
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingIconText}>
            🍴
          </Text>
        </View>

        <ActivityIndicator
          size="small"
          color="#087443"
        />

        <Text style={styles.loadingText}>
          Loading meal plans...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#087443"
          />
        }
      >
        {/* Green Header */}

        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                Meal Plans
              </Text>

              <Text style={styles.headerSubtitle}>
                Manage available meal plans
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerAddButton}
              onPress={() =>
                navigation.navigate(
                  "CreateMealPlan"
                )
              }
            >
              <Text style={styles.headerAddIcon}>
                +
              </Text>

              <Text style={styles.headerAddText}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>
              ▣
            </Text>
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
              <Text style={styles.emptyIconText}>
                🍽
              </Text>
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
              <Text style={styles.emptyButtonIcon}>
                +
              </Text>

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
                    <Text style={styles.planIconText}>
                      🍽
                    </Text>
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
                      <Text style={styles.statIconText}>
                        ◷
                      </Text>
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
                      <Text style={styles.statIconText}>
                        ₣
                      </Text>
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
                    <Text style={styles.editIcon}>
                      ✎
                    </Text>

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
                    <Text style={styles.deleteIcon}>
                      ×
                    </Text>

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
          <Text style={styles.floatingButtonText}>
            +
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4FAF7",
  },

  container: {
    flex: 1,
  },

  content: {
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4FAF7",
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#E2F4EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  loadingIconText: {
    fontSize: 28,
  },

  loadingText: {
    marginTop: 9,
    color: "#789187",
    fontSize: 13,
  },

  header: {
    backgroundColor: "#087443",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#D7F2E3",
    fontSize: 12,
    marginTop: 4,
  },

  headerAddButton: {
    backgroundColor: "#FFFFFF",
    minWidth: 74,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  headerAddIcon: {
    color: "#087443",
    fontSize: 21,
    fontWeight: "800",
    marginRight: 5,
  },

  headerAddText: {
    color: "#087443",
    fontSize: 13,
    fontWeight: "800",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 16,
    minHeight: 78,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0EFE7",
    shadowColor: "#075C37",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#E5F5ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  summaryIconText: {
    color: "#087443",
    fontSize: 22,
  },

  summaryContent: {
    flex: 1,
  },

  summaryNumber: {
    color: "#10251C",
    fontSize: 21,
    fontWeight: "800",
  },

  summaryLabel: {
    color: "#789187",
    fontSize: 11,
    marginTop: 2,
  },

  summaryStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8F1",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#087443",
    marginRight: 5,
  },

  summaryStatusText: {
    color: "#087443",
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
    color: "#10251C",
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#789187",
    fontSize: 11,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#DFF2E8",
    justifyContent: "center",
    alignItems: "center",
  },

  countBadgeText: {
    color: "#087443",
    fontSize: 12,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 13,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0EFE7",
    shadowColor: "#075C37",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  planIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#E7F6EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  planIconText: {
    fontSize: 20,
  },

  planTitleContainer: {
    flex: 1,
    paddingRight: 7,
  },

  planName: {
    color: "#10251C",
    fontSize: 15,
    fontWeight: "800",
  },

  planDescription: {
    color: "#82978E",
    fontSize: 10,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  activeBadge: {
    backgroundColor: "#DDF4E8",
  },

  inactiveBadge: {
    backgroundColor: "#EFF2F0",
  },

  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },

  activeDot: {
    backgroundColor: "#087443",
  },

  inactiveDot: {
    backgroundColor: "#84928C",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  activeText: {
    color: "#087443",
  },

  inactiveText: {
    color: "#718079",
  },

  statsContainer: {
    backgroundColor: "#F5FBF8",
    borderRadius: 12,
    marginTop: 13,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5F1EB",
  },

  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  statIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#E2F4EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },

  statIconText: {
    color: "#087443",
    fontSize: 13,
    fontWeight: "800",
  },

  statLabel: {
    color: "#7C9188",
    fontSize: 9,
  },

  statValue: {
    color: "#16382B",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#DCEAE3",
    marginHorizontal: 9,
  },

  actions: {
    flexDirection: "row",
    marginTop: 11,
  },

  editButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#087443",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 5,
  },

  editIcon: {
    color: "#087443",
    fontSize: 14,
    fontWeight: "800",
    marginRight: 5,
  },

  editButtonText: {
    color: "#087443",
    fontSize: 12,
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E9CACA",
    backgroundColor: "#FFF9F9",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 5,
  },

  deleteIcon: {
    color: "#C63B3B",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 5,
  },

  deleteButtonText: {
    color: "#C63B3B",
    fontSize: 12,
    fontWeight: "800",
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 22,
    padding: 28,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0EFE7",
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#E5F5ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyIconText: {
    fontSize: 30,
  },

  emptyTitle: {
    color: "#10251C",
    fontSize: 19,
    fontWeight: "800",
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#789187",
    fontSize: 12,
    lineHeight: 18,
  },

  emptyButton: {
    height: 45,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#087443",
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonIcon: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginRight: 7,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  floatingButton: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#087443",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#075C37",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 6,
  },

  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "400",
    lineHeight: 32,
  },
});

export default MealPlansScreen;
