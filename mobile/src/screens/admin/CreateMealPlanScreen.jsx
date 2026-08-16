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

const CreateMealPlanScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("");
  const [pricePerCredit, setPricePerCredit] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a meal plan name.");
      return;
    }

    if (!credits || Number(credits) <= 0) {
      Alert.alert("Error", "Please enter a valid number of credits.");
      return;
    }

    if (!pricePerCredit || Number(pricePerCredit) < 0) {
      Alert.alert("Error", "Please enter a valid price per credit.");
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Create Meal Plan</Text>

      <Text style={styles.subtitle}>
        Add a new meal plan for students
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Plan Name</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. One Week Plan"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe this meal plan"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Meal Credits</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 5"
          value={credits}
          onChangeText={setCredits}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Price Per Credit</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 1000"
          value={pricePerCredit}
          onChangeText={setPricePerCredit}
          keyboardType="decimal-pad"
        />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Active Plan</Text>

            <Text style={styles.switchDescription}>
              Make this plan available to students
            </Text>
          </View>

          <Switch
            value={isActive}
            onValueChange={setIsActive}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Create Meal Plan
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
    backgroundColor: "#FFFFFF",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  switchDescription: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 3,
  },

  createButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
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

export default CreateMealPlanScreen;