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
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/tokens";

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
            color={COLORS.primary}
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
          <Ionicons
            name="alert-circle"
            size={27}
            color={COLORS.danger}
          />
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
          <View style={styles.backRow}>
            <Ionicons
              name="chevron-back"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.backText}>
              Go Back
            </Text>
          </View>
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
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backTop}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backTopRow}>
            <Ionicons
              name="chevron-back"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.backTopText}>
              Back
            </Text>
          </View>
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
            <Ionicons
              name="receipt-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>
        </View>
      </View>

      {/* Student */}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="person-outline"
              size={20}
              color={COLORS.primary}
            />
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
            <Ionicons
              name="fast-food-outline"
              size={20}
              color={COLORS.primary}
            />
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
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.primary}
            />
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
            <Ionicons
              name="card-outline"
              size={20}
              color={COLORS.primary}
            />
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
            <Ionicons
              name="card-outline"
              size={32}
              color={COLORS.textMuted}
            />

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
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  loadingCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  loadingText: {
    marginTop: 5,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  header: {
    marginBottom: 20,
  },

  backTop: {
    marginBottom: 17,
  },

  backTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backTopText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 2,
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
    fontWeight: "700",
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 5,
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    ...SHADOWS.md,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  planHighlight: {
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },

  planLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },

  planName: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
  },

  value: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },

  creditBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  creditValue: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  paymentCard: {
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.primaryLight,
  },

  verifiedText: {
    color: COLORS.success,
  },

  pendingBadge: {
    backgroundColor: COLORS.warningLight,
  },

  pendingText: {
    color: COLORS.warning,
  },

  rejectedBadge: {
    backgroundColor: COLORS.dangerLight,
  },

  rejectedText: {
    color: COLORS.danger,
  },

  noPaymentContainer: {
    alignItems: "center",
    paddingVertical: 18,
  },

  noPaymentText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },

  createdContainer: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 15,
  },

  createdLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },

  createdText: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: COLORS.background,
  },

  errorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.dangerLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  errorText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontSize: 13,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 9,
  },

  retryText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 14,
  },

  backButton: {
    marginTop: 12,
    padding: 10,
  },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backText: {
    color: COLORS.primary,
    fontWeight: "700",
    marginLeft: 2,
  },
});