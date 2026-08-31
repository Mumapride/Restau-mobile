import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { updateMealPlan } from "../../api/mealPlans.api";

const EditMealPlanScreen = ({
  route,
  navigation,
}) => {
  const { mealPlan } = route.params;

  const [name, setName] = useState(
    mealPlan.name || ""
  );

  const [description, setDescription] =
    useState(mealPlan.description || "");

  const [credits, setCredits] = useState(
    String(mealPlan.credits ?? "")
  );

  const [pricePerCredit, setPricePerCredit] =
    useState(
      String(mealPlan.pricePerCredit ?? "")
    );

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
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
        "Credits must be greater than 0."
      );
      return;
    }

    if (
      pricePerCredit === "" ||
      Number(pricePerCredit) < 0
    ) {
      Alert.alert(
        "Error",
        "Price per credit cannot be negative."
      );
      return;
    }

    try {
      setLoading(true);

      const updatedData = {
        name: name.trim(),
        description: description.trim(),
        credits: Number(credits),
        pricePerCredit: Number(pricePerCredit),
      };

      await updateMealPlan(
        mealPlan.id,
        updatedData
      );

      Alert.alert(
        "Success",
        "Meal plan updated successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Update meal plan error:",
        error
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Unable to update meal plan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.backText}>
          ← Back
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>
          Edit Meal Plan
        </Text>

        <Text style={styles.subtitle}>
          Update the meal plan information
        </Text>
      </View>

      {/* Form */}

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>
          Plan Information
        </Text>

        <Text style={styles.label}>
          Plan Name
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Meal plan name"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Meal plan description"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>
          Meal Credits
        </Text>

        <TextInput
          style={styles.input}
          value={credits}
          onChangeText={setCredits}
          keyboardType="numeric"
          placeholder="Number of credits"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.helperText}>
          Number of meals included in this plan
        </Text>

        <Text style={styles.label}>
          Price Per Credit
        </Text>

        <View style={styles.priceInputContainer}>
          <Text style={styles.currencyText}>
            FCFA
          </Text>

          <TextInput
            style={styles.priceInput}
            value={pricePerCredit}
            onChangeText={setPricePerCredit}
            keyboardType="decimal-pad"
            placeholder="Price per credit"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Text style={styles.helperText}>
          Amount charged for each meal credit
        </Text>

        {/* Save */}

        <TouchableOpacity
          style={[
            styles.updateButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
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
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 45,
  },

  backButton: {
    marginBottom: 18,
  },

  backText: {
    color: "#1B5E3A",
    fontSize: 15,
    fontWeight: "700",
  },

  header: {
    marginBottom: 22,
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

  form: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E3A",
    marginBottom: 5,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 19,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },

  textArea: {
    minHeight: 105,
    textAlignVertical: "top",
  },

  helperText: {
    marginTop: 5,
    color: "#9CA3AF",
    fontSize: 12,
  },

  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
  },

  currencyText: {
    paddingLeft: 14,
    color: "#1B5E3A",
    fontWeight: "700",
    fontSize: 13,
  },

  priceInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1F2937",
  },

  updateButton: {
    backgroundColor: "#1B5E3A",
    paddingVertical: 15,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },

  cancelText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default EditMealPlanScreen;