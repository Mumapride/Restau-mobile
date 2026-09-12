import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import useAuthStore from '../../store/useAuthStore';
import { getMealPlans } from '../../api/mealPlans.api';
import { getActiveSemester } from '../../api/semester.api';

export default function MealPlansScreen({ navigation }) {
  const { token, user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
  try {
    const plansData = await getMealPlans();
    setPlans(plansData);
  } catch (error) {
    Alert.alert('Error', 'Could not load meal plans');
  }

  // Semester is optional — don't fail if it errors
  try {
    const semesterData = await getActiveSemester();
    setSemester(semesterData);
  } catch (error) {
    // No active semester — that's ok, just don't show expiry date
    setSemester(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPlan = (plan) => {
    if (!semester) {
      Alert.alert('No Active Semester', 'There is no active semester right now. Please check back later.');
      return;
    }
    navigation.navigate('Payment', { plan, semester, studentId: user.studentId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E3A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Plans</Text>
        <Text style={styles.headerSubtitle}>Choose a plan that works for you</Text>
        {semester && (
          <Text style={styles.expiryNote}>
            Credits expire on {new Date(semester.endDate).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}
          </Text>
        )}
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No meal plans available right now</Text>
            <Text style={styles.emptySubtext}>Check back later or contact admin</Text>
          </View>
        ) : (
          plans.map((plan, index) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, index === 1 && styles.planCardFeatured]}
              onPress={() => handleSelectPlan(plan)}
            >
              {index === 1 && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              <Text style={[styles.planName, index === 1 && styles.planNameFeatured]}>
                {plan.name}
              </Text>
              {plan.description && (
                <Text style={[styles.planDescription, index === 1 && styles.planDescriptionFeatured]}>
                  {plan.description}
                </Text>
              )}
              <View style={styles.planDetails}>
                <View style={styles.planStat}>
                  <Text style={[styles.planStatNumber, index === 1 && styles.planStatNumberFeatured]}>
                    {plan.credits}
                  </Text>
                  <Text style={[styles.planStatLabel, index === 1 && styles.planStatLabelFeatured]}>
                    Credits
                  </Text>
                </View>
                <View style={styles.planDivider} />
                <View style={styles.planStat}>
                  <Text style={[styles.planStatNumber, index === 1 && styles.planStatNumberFeatured]}>
                    {Number(plan.pricePerCredit * plan.credits).toLocaleString()}
                  </Text>
                  <Text style={[styles.planStatLabel, index === 1 && styles.planStatLabelFeatured]}>
                    FCFA
                  </Text>
                </View>
                <View style={styles.planDivider} />
                <View style={styles.planStat}>
                  <Text style={[styles.planStatNumber, index === 1 && styles.planStatNumberFeatured]}>
                    {Number(plan.pricePerCredit).toLocaleString()}
                  </Text>
                  <Text style={[styles.planStatLabel, index === 1 && styles.planStatLabelFeatured]}>
                    Per Meal
                  </Text>
                </View>
              </View>
              <View style={[styles.selectButton, index === 1 && styles.selectButtonFeatured]}>
                <Text style={[styles.selectButtonText, index === 1 && styles.selectButtonTextFeatured]}>
                  Select Plan
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1B5E3A',
    padding: 25,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#c8e6c9',
    fontSize: 14,
  },
  expiryNote: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  plansContainer: {
    padding: 15,
    gap: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#888',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 5,
  },
  planCardFeatured: {
    backgroundColor: '#1B5E3A',
  },
  popularBadge: {
    backgroundColor: '#D9A441',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E3A',
    marginBottom: 4,
  },
  planNameFeatured: {
    color: '#fff',
  },
  planDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 15,
  },
  planDescriptionFeatured: {
    color: '#c8e6c9',
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  planStat: {
    alignItems: 'center',
  },
  planStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E3A',
  },
  planStatNumberFeatured: {
    color: '#fff',
  },
  planStatLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  planStatLabelFeatured: {
    color: '#c8e6c9',
  },
  planDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  selectButton: {
    borderWidth: 2,
    borderColor: '#1B5E3A',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  selectButtonFeatured: {
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  selectButtonText: {
    color: '#1B5E3A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  selectButtonTextFeatured: {
    color: '#1B5E3A',
  },
});