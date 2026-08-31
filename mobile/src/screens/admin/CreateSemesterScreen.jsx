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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Semester</Text>

        <Text style={styles.subtitle}>
          Add a new academic semester
        </Text>
      </View>

      {/* Form Card */}

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          Semester Information
        </Text>

        {/* Semester Name */}

        <Text style={styles.label}>Semester Name</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 2026/2027 First Semester"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

        {/* Start Date */}

        <Text style={styles.label}>Start Date</Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          value={startDate}
          onChangeText={setStartDate}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.dateHint}>
          Example: 2026-09-01
        </Text>

        {/* End Date */}

        <Text style={styles.label}>End Date</Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          value={endDate}
          onChangeText={setEndDate}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.dateHint}>
          Example: 2026-12-20
        </Text>

        {/* Create Button */}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Create Semester
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

  header: {
    marginBottom: 22,
  },

  backButton: {
    marginBottom: 15,
  },

  backText: {
    color: "#1B5E3A",
    fontSize: 15,
    fontWeight: "700",
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

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    elevation: 2,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E3A",
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 18,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1F2937",
  },

  dateHint: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 5,
  },

  primaryButton: {
    backgroundColor: "#1B5E3A",
    paddingVertical: 15,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
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
    color: "#1B5E3A",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default CreateSemesterScreen;