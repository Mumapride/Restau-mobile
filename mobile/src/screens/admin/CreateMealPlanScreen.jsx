/**
 * CreateMealPlanScreen — presentation-only redesign.
 * Validation, createMealPlan() call, alerts and navigation are unchanged.
 */

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
  KeyboardAvoidingView,
  Platform,
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

// Palette from the approved admin design
const HERO      = "#075E45";
const PRIMARY   = "#0B7A55";
const TILE      = "#E6F6EE";
const TILE_TEXT = "#075E45";
const SOFT      = "#F1F5F9";
const BORDER    = "#E2E8F0";
const TEXT_SEC  = "#475569";
const TEXT_MUT  = "#64748B";

const FIELD_HEIGHT = Math.max(TOUCH_TARGET, 52);

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

const Field = ({ label, hint, children }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {hint ? <Text style={styles.helperText}>{hint}</Text> : null}
  </View>
);

const FormInput = ({ icon, multiline, ...inputProps }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.inputWrap,
        multiline && styles.inputWrapMulti,
        focused && styles.inputWrapFocused,
      ]}
    >
      <Ionicons
        name={icon}
        size={19}
        color={focused ? PRIMARY : COLORS.textMuted}
        style={multiline ? styles.iconTop : null}
      />
      <TextInput
        {...inputProps}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMulti]}
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

  // Display-only: total price of the plan once credits and price are valid.
  const creditsNum = Number(credits);
  const priceNum = Number(pricePerCredit);
  const total =
    credits !== "" &&
    pricePerCredit !== "" &&
    Number.isFinite(creditsNum) &&
    Number.isFinite(priceNum) &&
    creditsNum > 0 &&
    priceNum >= 0
      ? creditsNum * priceNum
      : null;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Create Meal Plan"
        subtitle="Add a new meal plan for students"
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero preview: live credits + total */}
          <View style={styles.hero}>
            <View style={styles.heroCircle} />
            <View style={styles.heroRow}>
              <View style={styles.heroTile}>
                <Text style={styles.heroTileNumber}>
                  {credits && Number(credits) > 0 ? credits : "–"}
                </Text>
                <Text style={styles.heroTileWord}>credits</Text>
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle} numberOfLines={1}>
                  {name.trim() || "New meal plan"}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {total !== null
                    ? `${total.toLocaleString()} FCFA total`
                    : "Enter credits and price to see the total"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            {/* Card header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name="restaurant-outline" size={22} color={PRIMARY} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Plan Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Add the details for this meal plan
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Field label="Plan name">
              <FormInput
                icon="pricetag-outline"
                placeholder="e.g. One Week Plan"
                value={name}
                onChangeText={setName}
                editable={!loading}
                accessibilityLabel="Plan name"
              />
            </Field>

            <Field label="Description">
              <FormInput
                icon="document-text-outline"
                placeholder="Describe this meal plan"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                editable={!loading}
                accessibilityLabel="Description"
              />
            </Field>

            <Field label="Meal credits" hint="Number of meals included in this plan">
              <FormInput
                icon="ticket-outline"
                placeholder="e.g. 5"
                value={credits}
                onChangeText={setCredits}
                keyboardType="numeric"
                editable={!loading}
                accessibilityLabel="Meal credits"
              />
            </Field>

            <Field label="Price per credit" hint="Amount charged for each meal credit">
              <FormInput
                icon="cash-outline"
                placeholder="e.g. 1000"
                value={pricePerCredit}
                onChangeText={setPricePerCredit}
                keyboardType="decimal-pad"
                editable={!loading}
                accessibilityLabel="Price per credit"
              />
            </Field>

            {/* Active plan */}
            <View style={styles.switchCard}>
              <View style={styles.switchIcon}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={PRIMARY}
                />
              </View>

              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Active plan</Text>
                <Text style={styles.switchDescription}>
                  Make this plan available to students
                </Text>
              </View>

              <Switch
                value={isActive}
                onValueChange={setIsActive}
                disabled={loading}
                trackColor={{
                  false: COLORS.border,
                  true: TILE,
                }}
                thumbColor={isActive ? PRIMARY : COLORS.surface}
              />
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Create meal plan"
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
                  <Text style={styles.primaryButtonText}>Create Meal Plan</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
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
    backgroundColor: "#F4F6F5",
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  /* ---------- Hero preview ---------- */
  hero: {
    backgroundColor: HERO,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  heroCircle: {
    position: "absolute",
    right: -50,
    top: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroTile: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  heroTileNumber: {
    color: COLORS.onPrimary,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
  },
  heroTileWord: {
    color: "#BFE8D4",
    fontSize: 12,
    marginTop: 2,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    color: COLORS.onPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "#BFE8D4",
    fontSize: 13,
    marginTop: 3,
  },

  /* ---------- Card ---------- */
  formCard: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: BORDER,
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
    backgroundColor: TILE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: TEXT_SEC,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
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
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: RADIUS.md,
  },
  inputWrapMulti: {
    alignItems: "flex-start",
    minHeight: 112,
    paddingTop: 14,
  },
  inputWrapFocused: {
    borderColor: PRIMARY,
    backgroundColor: COLORS.surface,
  },
  iconTop: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 0,
    height: FIELD_HEIGHT - 2,
    color: COLORS.text,
    fontSize: 15,
  },
  inputMulti: {
    height: undefined,
    minHeight: 84,
    textAlignVertical: "top",
    paddingTop: 0,
  },
  helperText: {
    color: TEXT_MUT,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 2,
  },

  /* ---------- Active switch ---------- */
  switchCard: {
    marginTop: SPACING.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
  },
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: TILE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  switchTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  switchDescription: {
    color: TEXT_SEC,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  /* ---------- Buttons ---------- */
  primaryButton: {
    backgroundColor: PRIMARY,
    minHeight: FIELD_HEIGHT,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  secondaryButton: {
    minHeight: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  secondaryButtonText: {
    color: TEXT_SEC,
    fontSize: 15,
    fontWeight: "700",
  },
});

export default CreateMealPlanScreen;