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

        <Text style={styles.title}>Edit Semester</Text>

        <Text style={styles.subtitle}>
          Update semester information
        </Text>
      </View>

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
          placeholderTextColor="#9CA3AF"
        />

        {/* Start Date */}

        <Text style={styles.label}>Start Date</Text>

        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          keyboardType="numbers-and-punctuation"
        />

        {/* End Date */}

        <Text style={styles.label}>End Date</Text>

        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
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
            <ActivityIndicator color="#FFFFFF" />
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

export default EditSemesterScreen;