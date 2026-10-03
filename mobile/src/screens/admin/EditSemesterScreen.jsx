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

import { updateSemester } from "../../api/semester.api";
import { ScreenHeader } from "../../components";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TOUCH_TARGET,
  TYPOGRAPHY,
} from "../../theme/tokens";

const EditSemesterScreen = ({ route, navigation }) => {
  const { semester } = route.params;

  const [name, setName] = useState(semester.name);

  const [startDate, setStartDate] = useState(
    new Date(semester.startDate)
      .toISOString()
      .split("T")[0]
  );

  const [endDate, setEndDate] = useState(
    new Date(semester.endDate)
      .toISOString()
      .split("T")[0]
  );

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
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

      await updateSemester(semester.id, {
        name,
        startDate,
        endDate,
      });

      Alert.alert(
        "Success",
        "Semester updated successfully.",
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
          "Failed to update semester."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Edit Semester"
        subtitle="Update semester information"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      {/* Form */}

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          Semester Information
        </Text>

        {/* Name */}

        <Text style={styles.label}>Semester Name</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Semester name"
          placeholderTextColor={COLORS.textMuted}
        />

        {/* Start Date */}

        <Text style={styles.label}>Start Date</Text>

        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numbers-and-punctuation"
        />

        {/* End Date */}

        <Text style={styles.label}>End Date</Text>

        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numbers-and-punctuation"
        />

        {/* Save */}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.onPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },

  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: TOUCH_TARGET,
    fontSize: 15,
    color: COLORS.text,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    minHeight: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xl,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    minHeight: TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
  },

  cancelText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});

export default EditSemesterScreen;