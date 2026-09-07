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

const EditMealPlanScreen = ({ navigation }) => {
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
      console.error("Update meal plan error:", error);

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
      {/* Green Header */}

      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.headerBackText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Create Meal Plan
          </Text>

          <Text style={styles.headerSubtitle}>
            Add a new meal plan for students
          </Text>
        </View>
      </View>

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
              <Text style={styles.sectionIconText}>
                +
              </Text>
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
                <Text style={styles.inputIconText}>
                  ▣
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. One Week Plan"
                placeholderTextColor="#9BB5A8"
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
                <Text style={styles.inputIconText}>
                  ≡
                </Text>
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder="Describe this meal plan"
                placeholderTextColor="#9BB5A8"
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
                <Text style={styles.inputIconText}>
                  ◷
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. 5"
                placeholderTextColor="#9BB5A8"
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
                <Text style={styles.inputIconText}>
                  ₣
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. 1000"
                placeholderTextColor="#9BB5A8"
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
              <Text style={styles.switchIconText}>
                ✓
              </Text>
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
                false: "#D7E2DD",
                true: "#9AD5B7",
              }}
              thumbColor={
                isActive ? "#087443" : "#F4F7F5"
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
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonIcon}>
                  +
                </Text>

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
    backgroundColor: "#F4FAF7",
  },

  topHeader: {
    backgroundColor: "#087443",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerBackText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 38,
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#D7F2E3",
    fontSize: 12,
    marginTop: 3,
  },

  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E0EFE7",
    shadowColor: "#075C37",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#E5F5ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  sectionIconText: {
    color: "#087443",
    fontSize: 25,
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#10251C",
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#789187",
    fontSize: 12,
    marginTop: 3,
  },

  field: {
    marginTop: 19,
  },

  label: {
    color: "#345247",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#DCEBE4",
    borderRadius: 11,
    backgroundColor: "#FBFDFC",
    flexDirection: "row",
    alignItems: "center",
  },

  inputIcon: {
    width: 42,
    height: 42,
    marginLeft: 4,
    borderRadius: 9,
    backgroundColor: "#EAF7F0",
    justifyContent: "center",
    alignItems: "center",
  },

  inputIconText: {
    color: "#087443",
    fontSize: 16,
    fontWeight: "800",
  },

  input: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 12,
    color: "#17382B",
    fontSize: 14,
    fontWeight: "500",
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
    color: "#8AA096",
    fontSize: 11,
    marginTop: 5,
    marginLeft: 2,
  },

  switchCard: {
    marginTop: 23,
    padding: 13,
    borderRadius: 13,
    backgroundColor: "#EFF9F4",
    borderWidth: 1,
    borderColor: "#DDEFE6",
    flexDirection: "row",
    alignItems: "center",
  },

  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#DDF3E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  switchIconText: {
    color: "#087443",
    fontSize: 17,
    fontWeight: "800",
  },

  switchTextContainer: {
    flex: 1,
    paddingRight: 7,
  },

  switchTitle: {
    color: "#17382B",
    fontSize: 14,
    fontWeight: "800",
  },

  switchDescription: {
    color: "#789187",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },

  primaryButton: {
    backgroundColor: "#087443",
    minHeight: 51,
    borderRadius: 11,
    marginTop: 23,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#087443",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  primaryButtonIcon: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginRight: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  secondaryButton: {
    minHeight: 49,
    borderWidth: 1.2,
    borderColor: "#087443",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 9,
    backgroundColor: "#FFFFFF",
  },

  secondaryButtonText: {
    color: "#087443",
    fontSize: 14,
    fontWeight: "800",
  },
});

export default EditMealPlanScreen;
