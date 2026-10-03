import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { createSemester } from "../../api/semester.api";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TOUCH_TARGET,
  TYPOGRAPHY,
} from "../../theme/tokens";

const CreateSemesterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !startDate || !endDate) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert(
        "Invalid Date",
        "Please enter valid dates in YYYY-MM-DD format."
      );
      return;
    }

    if (start >= end) {
      Alert.alert(
        "Invalid Dates",
        "The end date must be after the start date."
      );
      return;
    }

    try {
      setLoading(true);

      await createSemester({
        name,
        startDate,
        endDate,
      });

      Alert.alert(
        "Success",
        "Semester created successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create semester."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Create Semester"
        subtitle="Academic semester management"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            Semester Information
          </Text>

          <Text style={styles.formDescription}>
            Enter the semester details below.
          </Text>

          {/* Semester Name */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="text-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.label}>
                Semester Name
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="e.g. 2026/2027 First Semester"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          {/* Start Date */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.label}>
                Start Date
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              value={startDate}
              onChangeText={setStartDate}
              keyboardType="numbers-and-punctuation"
              editable={!loading}
            />

            <Text style={styles.hint}>
              Example: 2026-09-01
            </Text>
          </View>

          {/* End Date */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.label}>
                End Date
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              value={endDate}
              onChangeText={setEndDate}
              keyboardType="numbers-and-punctuation"
              editable={!loading}
            />

            <Text style={styles.hint}>
              Example: 2026-12-20
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.onPrimary} />
            ) : (
              <>
                <Ionicons
                  name="add"
                  size={18}
                  color={COLORS.onPrimary}
                  style={styles.plusIcon}
                />

                <Text style={styles.primaryButtonText}>
                  Create Semester
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* =========================
     HEADER (rendered by ScreenHeader)
  ========================= */

  /* =========================
     CONTENT
  ========================= */

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  /* =========================
     FORM CARD
  ========================= */

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },

  formTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },

  formDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },

  /* =========================
     FIELDS
  ========================= */

  field: {
    marginTop: SPACING.lg,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },

  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
  },

  input: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 14,
  },

  hint: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: SPACING.xs,
  },

  /* =========================
     BUTTONS
  ========================= */

  primaryButton: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    ...SHADOWS.md,
  },

  plusIcon: {
    marginRight: SPACING.sm,
  },

  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelButton: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.surface,
  },

  cancelText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default CreateSemesterScreen;
