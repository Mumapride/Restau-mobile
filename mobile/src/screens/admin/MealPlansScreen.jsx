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
        <ActivityIndicator
          size="large"
          color="#1B5E3A"
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1B5E3A"
          />
        }
      >
        {/* Header */}

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Meal Plans
            </Text>

            <Text style={styles.subtitle}>
              Manage meal plans available to students
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate("CreateMealPlan")
            }
          >
            <Text style={styles.addButtonText}>
              + Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>
              🍽
            </Text>
          </View>

          <View>
            <Text style={styles.summaryNumber}>
              {mealPlans.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Meal Plans
            </Text>
          </View>
        </View>

        {/* Empty State */}

        {mealPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              🍽️
            </Text>

            <Text style={styles.emptyTitle}>
              No Meal Plans
            </Text>

            <Text style={styles.emptyText}>
              There are currently no meal plans.
              Create one to make it available to
              students.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                navigation.navigate(
                  "CreateMealPlan"
                )
              }
            >
              <Text style={styles.emptyButtonText}>
                Create Meal Plan
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>
              Available Plans
            </Text>

            {mealPlans.map((mealPlan) => (
              <View
                key={mealPlan.id}
                style={styles.card}
              >
                {/* Card Header */}

                <View style={styles.cardHeader}>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planName}>
                      {mealPlan.name}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        mealPlan.isActive
                          ? styles.activeBadge
                          : styles.inactiveBadge,
                      ]}
                    >
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
                </View>

                {/* Description */}

                {mealPlan.description ? (
                  <Text style={styles.description}>
                    {mealPlan.description}
                  </Text>
                ) : (
                  <Text style={styles.noDescription}>
                    No description provided
                  </Text>
                )}

                {/* Information */}

                <View style={styles.infoContainer}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>
                      Credits
                    </Text>

                    <Text style={styles.infoValue}>
                      {mealPlan.credits}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>
                      Price / Credit
                    </Text>

                    <Text style={styles.infoValue}>
                      {mealPlan.pricePerCredit}
                    </Text>
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
            navigation.navigate("CreateMealPlan")
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
    backgroundColor: "#F5F7FA",
  },

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },

  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },

  subtitle: {
    marginTop: 5,
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },

  addButton: {
    backgroundColor: "#1B5E3A",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 9,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    elevation: 2,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F3EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  summaryIconText: {
    fontSize: 23,
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B5E3A",
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },

  cardHeader: {
    marginBottom: 8,
  },

  planTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  planName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 10,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#E8F3EC",
  },

  inactiveBadge: {
    backgroundColor: "#F3F4F6",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  activeText: {
    color: "#1B5E3A",
  },

  inactiveText: {
    color: "#6B7280",
  },

  description: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  noDescription: {
    color: "#9CA3AF",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 4,
  },

  infoContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAF9",
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    alignItems: "center",
  },

  infoBox: {
    flex: 1,
  },

  infoLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 5,
  },

  infoValue: {
    color: "#1B5E3A",
    fontSize: 16,
    fontWeight: "700",
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: "#DDE5DF",
    marginHorizontal: 15,
  },

  actions: {
    flexDirection: "row",
    marginTop: 15,
  },

  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1B5E3A",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 7,
  },

  editButtonText: {
    color: "#1B5E3A",
    fontWeight: "700",
    fontSize: 14,
  },

  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DC2626",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 7,
  },

  deleteButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
    elevation: 2,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },

  emptyButton: {
    backgroundColor: "#1B5E3A",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 25,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#1B5E3A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "400",
    lineHeight: 34,
  },
});

export default MealPlansScreen;