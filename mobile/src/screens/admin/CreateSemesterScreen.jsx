/**
 * CreateSemesterScreen — presentation-only redesign.
 * Validation, createSemester() call, alerts and navigation are unchanged.
 */

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
  KeyboardAvoidingView,
  Platform,
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

const FIELD_HEIGHT = Math.max(TOUCH_TARGET, 52);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

const Field = ({ label, hint, children }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

const FormInput = ({ icon, ...inputProps }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <Ionicons
        name={icon}
        size={19}
        color={focused ? COLORS.primary : COLORS.textMuted}
      />
      <TextInput
        {...inputProps}
        style={styles.input}
        placeholderTextColor={COLORS.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

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

  // Display-only: length of the semester once both dates are valid.
  let durationDays = null;
  if (DATE_PATTERN.test(startDate) && DATE_PATTERN.test(endDate)) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s < e) {
      durationDays = Math.round((e - s) / DAY_MS) + 1;
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Create Semester"
        subtitle="Academic semester management"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            {/* Card header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.formTitle}>Semester Information</Text>
                <Text style={styles.formDescription}>
                  Enter the semester details below.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Field label="Semester name">
              <FormInput
                icon="text-outline"
                placeholder="e.g. 2026/2027 First Semester"
                value={name}
                onChangeText={setName}
                editable={!loading}
                accessibilityLabel="Semester name"
              />
            </Field>

            <Field label="Start date" hint="Example: 2026-09-01">
              <FormInput
                icon="calendar-outline"
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numbers-and-punctuation"
                editable={!loading}
                accessibilityLabel="Start date"
              />
            </Field>

            <Field label="End date" hint="Example: 2026-12-20">
              <FormInput
                icon="calendar-outline"
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numbers-and-punctuation"
                editable={!loading}
                accessibilityLabel="End date"
              />
            </Field>

            {durationDays !== null && (
              <View style={styles.summary}>
                <Ionicons name="hourglass-outline" size={18} color={COLORS.primary} />
                <Text style={styles.summaryText}>
                  This semester lasts{" "}
                  <Text style={styles.summaryStrong}>{durationDays} days</Text>
                </Text>
              </View>
            )}

            {/* Buttons */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Create semester"
            >
              {loading ? (
                <ActivityIndicator color={COLORS.onPrimary} />
              ) : (
                <>
                  <Ionicons
                    name="add"
                    size={20}
                    color={COLORS.onPrimary}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.primaryButtonText}>Create Semester</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  /* ---------- Card ---------- */
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  formTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  formDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginTop: SPACING.lg,
  },

  /* ---------- Fields ---------- */
  field: {
    marginTop: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrap: {
    minHeight: FIELD_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  inputWrapFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 0,
    height: FIELD_HEIGHT - 2,
    color: COLORS.text,
    fontSize: 15,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 2,
  },

  /* ---------- Duration summary ---------- */
  summary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
  },
  summaryText: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.textSecondary,
    fontSize: 13.5,
  },
  summaryStrong: {
    color: COLORS.text,
    fontWeight: "700",
  },

  /* ---------- Buttons ---------- */
  primaryButton: {
    minHeight: FIELD_HEIGHT,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    minHeight: FIELD_HEIGHT,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
});

export default CreateSemesterScreen;