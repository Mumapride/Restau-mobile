import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { getSubscriptionById } from "../../api/subscription.api";

export default function SubscriptionDetailsScreen({
  route,
  navigation,
}) {
  const { subscriptionId } = route.params;

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadSubscription = async () => {
    try {
      setError("");

      const data = await getSubscriptionById(subscriptionId);

      setSubscription(data);
    } catch (error) {
      console.log(
        "Get subscription details error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load subscription"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSubscription();
    }, [subscriptionId])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadSubscription();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCircle}>
          <ActivityIndicator
            size="large"
            color="#1B5E3A"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading subscription
        </Text>

        <Text style={styles.loadingText}>
          Please wait...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Text style={styles.errorIcon}>!</Text>
        </View>

        <Text style={styles.errorTitle}>
          Something went wrong
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadSubscription}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>
            ← Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#1B5E3A"]}
          tintColor="#1B5E3A"
        />
      }
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backTop}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backTopText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Subscription Details
            </Text>

            <Text style={styles.subtitle}>
              Subscription #{subscription.id}
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              📋
            </Text>
          </View>
        </View>
      </View>

      {/* Student */}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text>👨‍🎓</Text>
          </View>

          <Text style={styles.sectionTitle}>
            Student
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Matricule
          </Text>

          <Text style={styles.value}>
            {subscription.student?.matricule ||
              "N/A"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Student ID
          </Text>

          <Text style={styles.value}>
            {subscription.student?.id || "N/A"}
          </Text>
        </View>
      </View>

      {/* Meal Plan */}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text>🍽️</Text>
          </View>

          <Text style={styles.sectionTitle}>
            Meal Plan
          </Text>
        </View>

        <View style={styles.planHighlight}>
          <Text style={styles.planLabel}>
            PLAN
          </Text>

          <Text style={styles.planName}>
            {subscription.mealPlan?.name || "N/A"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Description
          </Text>

          <Text style={styles.value}>
            {subscription.mealPlan?.description ||
              "N/A"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Credits
          </Text>

          <View style={styles.creditBadge}>
            <Text style={styles.creditValue}>
              {subscription.credits}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Price / Credit
          </Text>

          <Text style={styles.value}>
            {subscription.mealPlan?.pricePerCredit ||
              "0"}
          </Text>
        </View>
      </View>

      {/* Semester */}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text>📅</Text>
          </View>

          <Text style={styles.sectionTitle}>
            Semester
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Name
          </Text>

          <Text style={styles.value}>
            {subscription.semester?.name || "N/A"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Start Date
          </Text>

          <Text style={styles.value}>
            {subscription.semester?.startDate
              ? new Date(
                  subscription.semester.startDate
                ).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            End Date
          </Text>

          <Text style={styles.value}>
            {subscription.semester?.endDate
              ? new Date(
                  subscription.semester.endDate
                ).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>
      </View>

      {/* Payments */}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text>💳</Text>
          </View>

          <Text style={styles.sectionTitle}>
            Payments
          </Text>
        </View>

        {subscription.payments?.length > 0 ? (
          subscription.payments.map((payment) => (
            <View
              key={payment.id}
              style={styles.paymentCard}
            >
              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Amount
                </Text>

                <Text style={styles.value}>
                  {payment.amount}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Method
                </Text>

                <Text style={styles.value}>
                  {payment.method}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Status
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    payment.status === "VERIFIED"
                      ? styles.verifiedBadge
                      : payment.status ===
                        "REJECTED"
                      ? styles.rejectedBadge
                      : styles.pendingBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      payment.status === "VERIFIED"
                        ? styles.verifiedText
                        : payment.status ===
                          "REJECTED"
                        ? styles.rejectedText
                        : styles.pendingText,
                    ]}
                  >
                    {payment.status}
                  </Text>
                </View>
              </View>

              {payment.reference && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    Reference
                  </Text>

                  <Text style={styles.value}>
                    {payment.reference}
                  </Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.noPaymentContainer}>
            <Text style={styles.noPaymentIcon}>
              💳
            </Text>

            <Text style={styles.noPaymentText}>
              No payments recorded for this
              subscription.
            </Text>
          </View>
        )}
      </View>

      {/* Created */}

      <View style={styles.createdContainer}>
        <Text style={styles.createdLabel}>
          Subscription created
        </Text>

        <Text style={styles.createdText}>
          {new Date(
            subscription.createdAt
          ).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  content: {
    padding: 20,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },

  loadingCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E8F3ED",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },

  loadingText: {
    marginTop: 5,
    fontSize: 13,
    color: "#6B7280",
  },

  header: {
    marginBottom: 20,
  },

  backTop: {
    marginBottom: 17,
  },

  backTopText: {
    color: "#1B5E3A",
    fontSize: 15,
    fontWeight: "700",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#1F2937",
  },

  subtitle: {
    marginTop: 5,
    color: "#6B7280",
    fontSize: 13,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F3ED",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  headerIconText: {
    fontSize: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8F3ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B5E3A",
  },

  planHighlight: {
    backgroundColor: "#F1F8F4",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },

  planLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 0.8,
  },

  planName: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "800",
    color: "#1B5E3A",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  label: {
    color: "#6B7280",
    fontSize: 13,
    flex: 1,
  },

  value: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },

  creditBadge: {
    backgroundColor: "#E8F3ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  creditValue: {
    color: "#1B5E3A",
    fontSize: 15,
    fontWeight: "800",
  },

  paymentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  verifiedBadge: {
    backgroundColor: "#DCFCE7",
  },

  verifiedText: {
    color: "#166534",
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  pendingText: {
    color: "#92400E",
  },

  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },

  rejectedText: {
    color: "#991B1B",
  },

  noPaymentContainer: {
    alignItems: "center",
    paddingVertical: 18,
  },

  noPaymentIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  noPaymentText: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },

  createdContainer: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 15,
  },

  createdLabel: {
    color: "#9CA3AF",
    fontSize: 11,
  },

  createdText: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F5F7FA",
  },

  errorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  errorIcon: {
    fontSize: 27,
    fontWeight: "800",
    color: "#DC2626",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },

  errorText: {
    marginTop: 8,
    color: "#6B7280",
    textAlign: "center",
    fontSize: 13,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#1B5E3A",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 9,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  backButton: {
    marginTop: 12,
    padding: 10,
  },

  backText: {
    color: "#1B5E3A",
    fontWeight: "700",
  },
});