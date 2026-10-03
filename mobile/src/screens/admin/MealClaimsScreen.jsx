import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  getMealClaims,
  getTodaysMealClaims,
} from "../../api/mealClaims.api";

import useAuthStore from "../../store/useAuthStore";
import {
  EmptyState,
  InfoRow,
  LoadingView,
  ScreenHeader,
} from "../../components";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from "../../theme/tokens";

export default function MealClaimsScreen({ navigation }) {
  const { token } = useAuthStore();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  const loadClaims = async (todayOnly = showTodayOnly) => {
    try {
      if (!refreshing) {
        setLoading(true);
      }

      const data = todayOnly
        ? await getTodaysMealClaims(token)
        : await getMealClaims(token);

      setClaims(data);
    } catch (error) {
      console.log("Meal claims error:", error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to load meal claims"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClaims();
    }, [showTodayOnly])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadClaims();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString();
  };

  const renderClaim = ({ item }) => {
    const studentName = item.student?.user
      ? `${item.student.user.firstName} ${item.student.user.lastName}`
      : "Unknown Student";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {studentName}
            </Text>

            <Text style={styles.matricule}>
              {item.student?.matricule || "No matricule"}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>CLAIMED</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <InfoRow
          label="Meal"
          value={item.menuItem || "N/A"}
        />
        <InfoRow
          label="Date"
          value={formatDate(item.claimDate)}
        />
        <InfoRow
          label="Semester"
          value={item.semester?.name || "N/A"}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Meal Claims"
        subtitle="Monitor student meal claims"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showTodayOnly && styles.activeFilter,
          ]}
          onPress={() => {
            setShowTodayOnly(true);
            loadClaims(true);
          }}
        >
          <Text
            style={[
              styles.filterText,
              showTodayOnly && styles.activeFilterText,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            !showTodayOnly && styles.activeFilter,
          ]}
          onPress={() => {
            setShowTodayOnly(false);
            loadClaims(false);
          }}
        >
          <Text
            style={[
              styles.filterText,
              !showTodayOnly && styles.activeFilterText,
            ]}
          >
            All Claims
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingView message="Loading meal claims..." />
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClaim}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={
            claims.length === 0
              ? styles.emptyContainer
              : styles.list
          }
          ListEmptyComponent={
            <EmptyState
              icon="fast-food-outline"
              title="No Meal Claims"
              message={
                showTodayOnly
                  ? "No meals have been claimed today."
                  : "There are no meal claims yet."
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  filterContainer: {
    flexDirection: "row",
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  filterButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 999,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt,
  },

  activeFilter: {
    backgroundColor: COLORS.primary,
  },

  filterText: {
    color: COLORS.text,
    fontWeight: "600",
  },

  activeFilterText: {
    color: COLORS.onPrimary,
  },

  list: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  studentInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },

  studentName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },

  matricule: {
    marginTop: SPACING.xs,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  badge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
  },

  badgeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
});