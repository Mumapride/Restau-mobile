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

const EditMealPlanScreen = ({ route, navigation }) => {
  const { mealPlan } = route.params;

  const [name, setName] = useState(mealPlan.name || "");

  const [description, setDescription] = useState(
    mealPlan.description || ""
  );

  const [credits, setCredits] = useState(
    String(mealPlan.credits ?? "")
  );

  const [pricePerCredit, setPricePerCredit] = useState(
    String(mealPlan.pricePerCredit ?? "")
  );

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a meal plan name.");
      return;
    }

    if (!credits || Number(credits) <= 0) {
      Alert.alert("Error", "Credits must be greater than 0.");
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
      console.error("Update meal plan error:", error);

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
    >
      <Text style={styles.title}>Edit Meal Plan</Text>

      <Text style={styles.subtitle}>
        Update the meal plan information
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Plan Name</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Meal plan name"
        />

        <Text style={styles.label}>Description</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Meal plan description"
          multiline
        />

        <Text style={styles.label}>Meal Credits</Text>

        <TextInput
          style={styles.input}
          value={credits}
          onChangeText={setCredits}
          keyboardType="numeric"
          placeholder="Number of credits"
        />

        <Text style={styles.label}>Price Per Credit</Text>

        <TextInput
          style={styles.input}
          value={pricePerCredit}
          onChangeText={setPricePerCredit}
          keyboardType="decimal-pad"
          placeholder="Price per credit"
        />

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
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 25,
    color: "#6B7280",
  },

  form: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  updateButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
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
    marginTop: 10,
  },

  cancelText: {
    color: "#6B7280",
    fontWeight: "600",
  },
});

export default EditMealPlanScreen;