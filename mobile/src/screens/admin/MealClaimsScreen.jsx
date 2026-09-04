import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  getMealClaims,
  getTodaysMealClaims,
} from "../../api/mealClaims.api";

import useAuthStore from "../../store/useAuthStore";

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

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Meal</Text>
          <Text style={styles.detailValue}>
            {item.menuItem || "N/A"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {formatDate(item.claimDate)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Semester</Text>
          <Text style={styles.detailValue}>
            {item.semester?.name || "N/A"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Meal Claims</Text>
          <Text style={styles.subtitle}>
            Monitor student meal claims
          </Text>
        </View>
      </View>

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
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#1B5E3A"
          />

          <Text style={styles.loadingText}>
            Loading meal claims...
          </Text>
        </View>
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClaim}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1B5E3A"]}
            />
          }
          contentContainerStyle={
            claims.length === 0
              ? styles.emptyContainer
              : styles.list
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🍽️</Text>

              <Text style={styles.emptyTitle}>
                No Meal Claims
              </Text>

              <Text style={styles.emptyText}>
                {showTodayOnly
                  ? "No meals have been claimed today."
                  : "There are no meal claims yet."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    marginRight: 15,
  },

  backText: {
    fontSize: 40,
    color: "#1B5E3A",
    lineHeight: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },

  subtitle: {
    marginTop: 3,
    color: "#6B7280",
    fontSize: 13,
  },

  filterContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#FFFFFF",
  },

  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F0F2F5",
  },

  activeFilter: {
    backgroundColor: "#1B5E3A",
  },

  filterText: {
    color: "#555",
    fontWeight: "600",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  list: {
    padding: 15,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },

  matricule: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },

  badgeText: {
    color: "#1B5E3A",
    fontSize: 10,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  detailLabel: {
    color: "#6B7280",
    fontSize: 13,
  },

  detailValue: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "600",
    maxWidth: "65%",
    textAlign: "right",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
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
  },
});