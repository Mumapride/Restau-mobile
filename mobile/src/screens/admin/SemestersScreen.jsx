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
import { Ionicons } from "@expo/vector-icons";

import {
  getActiveSemester,
  closeSemester,
} from "../../api/semester.api";
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
      <LoadingView message="Loading semester..." />
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Semesters"
        subtitle="Manage academic semesters"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
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
      {/* Active Semester */}

      <Text style={styles.sectionTitle}>
        Current Semester
      </Text>

      {!semester ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="calendar-outline"
              size={30}
              color={COLORS.primary}
            />
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
              Create Semester
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.semesterCard}>
          {/* Card Header */}

          <View style={styles.cardHeader}>
            <View style={styles.semesterIconContainer}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={COLORS.primary}
              />
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
                <ActivityIndicator color={COLORS.onPrimary} />
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
              <Ionicons
                name="add"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.newSemesterText}>
              <Text style={styles.newSemesterTitle}>
                Create New Semester
              </Text>

              <Text style={styles.newSemesterDescription}>
                Add another academic semester
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },

  semesterCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    marginBottom: SPACING.xl,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.xl,
  },

  semesterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  cardHeaderText: {
    flex: 1,
  },

  semesterName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  activeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.xs,
  },

  activeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "700",
  },

  dateSection: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.xl,
  },

  dateBox: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  dateValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },

  dateDivider: {
    width: 1,
    height: 35,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },

  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },

  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    minHeight: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  closeButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    minHeight: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 14,
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: "center",
    ...SHADOWS.md,
    marginBottom: SPACING.xl,
  },

  emptyIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 33,
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
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  newSemesterCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.md,
    marginBottom: SPACING.xl,
  },

  plusContainer: {
    width: 45,
    height: 45,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  newSemesterText: {
    flex: 1,
  },

  newSemesterTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  newSemesterDescription: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});

export default SemestersScreen;