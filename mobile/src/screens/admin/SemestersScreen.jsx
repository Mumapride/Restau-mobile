import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import {
  getActiveSemester,
  closeSemester,
} from "../../api/semester.api";

const SemestersScreen = ({ navigation }) => {
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSemester = async () => {
    try {
      setLoading(true);

      const data = await getActiveSemester();

      setSemester(data);
    } catch (error) {
      if (error.response?.status === 404) {
        setSemester(null);
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Failed to load semester"
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSemester();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadSemester();
  };

  const handleCloseSemester = () => {
    if (!semester) return;

    Alert.alert(
      "Close Semester",
      `Are you sure you want to close "${semester.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Close",
          style: "destructive",
          onPress: async () => {
            try {
              setClosing(true);

              await closeSemester(semester.id);

              Alert.alert(
                "Success",
                "Semester closed successfully"
              );

              setSemester(null);
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to close semester"
              );
            } finally {
              setClosing(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#1B5E3A"
        />

        <Text style={styles.loadingText}>
          Loading semester...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
        <View>
          <Text style={styles.title}>Semesters</Text>

          <Text style={styles.subtitle}>
            Manage academic semesters
          </Text>
        </View>
      </View>

      {/* Active Semester */}

      <Text style={styles.sectionTitle}>
        Current Semester
      </Text>

      {!semester ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No Active Semester
          </Text>

          <Text style={styles.emptyText}>
            There is currently no active semester.
            Create one to begin managing the academic
            period.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate("CreateSemester")
            }
          >
            <Text style={styles.primaryButtonText}>
              + Create Semester
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.semesterCard}>
          {/* Card Header */}

          <View style={styles.cardHeader}>
            <View style={styles.semesterIconContainer}>
              <Text style={styles.semesterIcon}>📅</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.semesterName}>
                {semester.name}
              </Text>

              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />

                <Text style={styles.activeText}>
                  ACTIVE
                </Text>
              </View>
            </View>
          </View>

          {/* Dates */}

          <View style={styles.dateSection}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>
                START DATE
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(semester.startDate)}
              </Text>
            </View>

            <View style={styles.dateDivider} />

            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>
                END DATE
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(semester.endDate)}
              </Text>
            </View>
          </View>

          {/* Actions */}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate(
                  "EditSemester",
                  { semester }
                )
              }
            >
              <Text style={styles.editButtonText}>
                Edit Semester
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseSemester}
              disabled={closing}
            >
              {closing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.closeButtonText}>
                  Close Semester
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Create New Semester */}

      {semester && (
        <>
          <Text style={styles.sectionTitle}>
            Actions
          </Text>

          <TouchableOpacity
            style={styles.newSemesterCard}
            onPress={() =>
              navigation.navigate("CreateSemester")
            }
          >
            <View style={styles.plusContainer}>
              <Text style={styles.plusText}>+</Text>
            </View>

            <View style={styles.newSemesterText}>
              <Text style={styles.newSemesterTitle}>
                Create New Semester
              </Text>

              <Text style={styles.newSemesterDescription}>
                Add another academic semester
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </>
      )}
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
    marginBottom: 25,
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
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    marginTop: 5,
  },

  semesterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    elevation: 2,
    marginBottom: 25,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  semesterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E8F5EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  semesterIcon: {
    fontSize: 24,
  },

  cardHeaderText: {
    flex: 1,
  },

  semesterName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 24,
    marginBottom: 8,
  },

  activeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 5,
  },

  activeText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "700",
  },

  dateSection: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },

  dateBox: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
    marginBottom: 6,
  },

  dateValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },

  dateDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 15,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1B5E3A",
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: "center",
  },

  editButtonText: {
    color: "#1B5E3A",
    fontWeight: "700",
    fontSize: 14,
  },

  closeButton: {
    flex: 1,
    backgroundColor: "#B91C1C",
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: "center",
  },

  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    elevation: 2,
    marginBottom: 25,
  },

  emptyIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#E8F5EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  emptyText: {
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 22,
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
  },

  primaryButton: {
    backgroundColor: "#1B5E3A",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 9,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  newSemesterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    marginBottom: 20,
  },

  plusContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#E8F5EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  plusText: {
    color: "#1B5E3A",
    fontSize: 28,
    fontWeight: "400",
  },

  newSemesterText: {
    flex: 1,
  },

  newSemesterTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },

  newSemesterDescription: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12,
  },

  arrow: {
    fontSize: 28,
    color: "#9CA3AF",
    marginLeft: 8,
  },
});

export default SemestersScreen;