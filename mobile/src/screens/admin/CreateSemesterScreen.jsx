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
  StatusBar,
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
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#087F4E"
      />

      {/* Green Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Create Semester
          </Text>

          <Text style={styles.headerSubtitle}>
            Academic semester management
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page Introduction */}
        <View style={styles.intro}>
          <Text style={styles.pageTitle}>
            Create Semester
          </Text>

          <Text style={styles.pageSubtitle}>
            Add a new academic semester
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            Semester Information
          </Text>

          <Text style={styles.formDescription}>
            Enter the semester details below.
          </Text>

          {/* Semester Name */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>▣</Text>
              </View>

              <Text style={styles.label}>
                Semester Name
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="e.g. 2026/2027 First Semester"
              placeholderTextColor="#9AAFA5"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          {/* Start Date */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>◷</Text>
              </View>

              <Text style={styles.label}>
                Start Date
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9AAFA5"
              value={startDate}
              onChangeText={setStartDate}
              keyboardType="numbers-and-punctuation"
              editable={!loading}
            />

            <Text style={styles.hint}>
              Example: 2026-09-01
            </Text>
          </View>

          {/* End Date */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>◷</Text>
              </View>

              <Text style={styles.label}>
                End Date
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9AAFA5"
              value={endDate}
              onChangeText={setEndDate}
              keyboardType="numbers-and-punctuation"
              editable={!loading}
            />

            <Text style={styles.hint}>
              Example: 2026-12-20
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.plusIcon}>+</Text>

                <Text style={styles.primaryButtonText}>
                  Create Semester
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>
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
    backgroundColor: "#F4F8F6",
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    backgroundColor: "#087F4E",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  backIcon: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 36,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#D8F0E5",
    fontSize: 11,
    marginTop: 2,
  },

  /* =========================
     CONTENT
  ========================= */

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },

  intro: {
    marginBottom: 15,
    paddingHorizontal: 2,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#102E24",
  },

  pageSubtitle: {
    fontSize: 13,
    color: "#668177",
    marginTop: 4,
  },

  /* =========================
     FORM CARD
  ========================= */

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,

    shadowColor: "#164D38",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,

    elevation: 3,
  },

  formTitle: {
    color: "#102E24",
    fontSize: 18,
    fontWeight: "700",
  },

  formDescription: {
    color: "#789088",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 7,
  },

  /* =========================
     FIELDS
  ========================= */

  field: {
    marginTop: 18,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E5F4ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  iconText: {
    color: "#087F4E",
    fontSize: 17,
    fontWeight: "700",
  },

  label: {
    color: "#24483B",
    fontSize: 13,
    fontWeight: "700",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D8E9E1",
    backgroundColor: "#FBFDFC",
    borderRadius: 11,
    paddingHorizontal: 14,
    color: "#16372B",
    fontSize: 14,
  },

  hint: {
    color: "#91A59D",
    fontSize: 11,
    marginTop: 5,
    marginLeft: 2,
  },

  /* =========================
     BUTTONS
  ========================= */

  primaryButton: {
    height: 50,
    backgroundColor: "#087F4E",
    borderRadius: 11,
    marginTop: 27,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#087F4E",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,

    elevation: 3,
  },

  plusIcon: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "400",
    marginRight: 7,
    lineHeight: 22,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#087F4E",
    borderRadius: 11,
    marginTop: 10,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",
  },

  cancelText: {
    color: "#087F4E",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default CreateSemesterScreen;
