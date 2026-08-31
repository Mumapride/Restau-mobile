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
      console.error(
        "Create meal plan error:",
        error
      );

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
          Create Meal Plan
        </Text>

        <Text style={styles.subtitle}>
          Add a new meal plan for students
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
          placeholder="e.g. One Week Plan"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe this meal plan"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>
          Meal Credits
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 5"
          placeholderTextColor="#9CA3AF"
          value={credits}
          onChangeText={setCredits}
          keyboardType="numeric"
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
            placeholder="e.g. 1000"
            placeholderTextColor="#9CA3AF"
            value={pricePerCredit}
            onChangeText={setPricePerCredit}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={styles.helperText}>
          Amount charged for each meal credit
        </Text>

        {/* Active Plan */}

        <View style={styles.switchCard}>
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
              false: "#D1D5DB",
              true: "#A8C7B3",
            }}
            thumbColor={
              isActive ? "#1B5E3A" : "#F4F4F5"
            }
          />
        </View>

        {/* Create */}

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

  switchCard: {
    marginTop: 25,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F8FAF9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  switchTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },

  switchDescription: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
  },

  createButton: {
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

export default CreateMealPlanScreen;