import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";

import { createMealPlan } from "../../api/mealPlans.api";
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

const CreateMealPlanScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("");
  const [pricePerCredit, setPricePerCredit] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Error",
        "Please enter a meal plan name."
      );
      return;
    }

    if (!credits || Number(credits) <= 0) {
      Alert.alert(
        "Error",
        "Please enter a valid number of credits."
      );
      return;
    }

    if (
      !pricePerCredit ||
      Number(pricePerCredit) < 0
    ) {
      Alert.alert(
        "Error",
        "Please enter a valid price per credit."
      );
      return;
    }

    try {
      setLoading(true);

      const mealPlanData = {
        name: name.trim(),
        description: description.trim(),
        credits: Number(credits),
        pricePerCredit: Number(pricePerCredit),
        isActive,
      };

      await createMealPlan(mealPlanData);

      Alert.alert(
        "Success",
        "Meal plan created successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Create meal plan error:", error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to create meal plan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Create Meal Plan"
        subtitle="Add a new meal plan for students"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          {/* Section Header */}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="add-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Plan Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Add the details for this meal plan
              </Text>
            </View>
          </View>

          {/* Plan Name */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Plan Name
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="pricetag-outline"
                  size={17}
                  color={COLORS.primary}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. One Week Plan"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Description */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Description
            </Text>

            <View
              style={[
                styles.inputContainer,
                styles.textAreaContainer,
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  styles.textAreaIcon,
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={17}
                  color={COLORS.primary}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder="Describe this meal plan"
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Credits */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Meal Credits
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="ticket-outline"
                  size={17}
                  color={COLORS.primary}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. 5"
                placeholderTextColor={COLORS.textMuted}
                value={credits}
                onChangeText={setCredits}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.helperText}>
              Number of meals included in this plan
            </Text>
          </View>

          {/* Price */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Price Per Credit
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="cash-outline"
                  size={17}
                  color={COLORS.primary}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. 1000"
                placeholderTextColor={COLORS.textMuted}
                value={pricePerCredit}
                onChangeText={setPricePerCredit}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.helperText}>
              Amount charged for each meal credit
            </Text>
          </View>

          {/* Active Plan */}

          <View style={styles.switchCard}>
            <View style={styles.switchIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>
                Active Plan
              </Text>

              <Text style={styles.switchDescription}>
                Make this plan available to students
              </Text>
            </View>

            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{
                false: COLORS.border,
                true: COLORS.primaryLight,
              }}
              thumbColor={
                isActive ? COLORS.primary : COLORS.surface
              }
            />
          </View>

          {/* Create */}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.onPrimary} />
            ) : (
              <>
                <Ionicons
                  name="add-outline"
                  size={18}
                  color={COLORS.onPrimary}
                  style={styles.primaryButtonIcon}
                />

                <Text style={styles.primaryButtonText}>
                  Create Meal Plan
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel */}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
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

  container: {
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

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  field: {
    marginTop: SPACING.lg,
  },

  label: {
    color: COLORS.text,
    ...TYPOGRAPHY.label,
    marginBottom: SPACING.sm,
  },

  inputContainer: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  inputIcon: {
    width: 38,
    height: 38,
    marginLeft: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  input: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    ...TYPOGRAPHY.body,
  },

  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 108,
  },

  textAreaIcon: {
    marginTop: 4,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  helperText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: 2,
  },

  switchCard: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  switchIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },

  switchTextContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },

  switchTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  switchDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    minHeight: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },

  primaryButtonIcon: {
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

  secondaryButton: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
  },

  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default CreateMealPlanScreen;