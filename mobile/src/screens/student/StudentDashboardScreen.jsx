import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { BASE_URL } from '../../api/auth.api';

export default function StudentDashboardScreen({ navigation }) {
  const { token, user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/students/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.nameText}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text style={styles.matriculeText}>
            Matricule: {profile?.matricule}
          </Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.credits || 0}</Text>
          <Text style={styles.statLabel}>Credits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {profile?.mealPlan ? profile.mealPlan.name : 'None'}
          </Text>
          <Text style={styles.statLabel}>Plan</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {profile?.semesterEndDate
              ? new Date(profile.semesterEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
              : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Expires</Text>
        </View>
      </View>

      {/* Credits Expiry Notice */}
      {profile?.semesterEndDate && (
        <View style={styles.expiryCard}>
          <Text style={styles.expiryText}>
            🗓️ Credits expire on{' '}
            {new Date(profile.semesterEndDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Meal Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📱</Text>
          <Text style={styles.actionText}>My QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🕐</Text>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* No Plan Notice */}
      {!profile?.mealPlan && (
        <View style={styles.noPlanCard}>
          <Text style={styles.noPlanTitle}>No Active Plan</Text>
          <Text style={styles.noPlanText}>
            You don't have an active meal plan. Buy a plan to start eating at the Restau.
          </Text>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy a Meal Plan</Text>
          </TouchableOpacity>
        </View>
      )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#c8e6c9',
    fontSize: 14,
  },
  nameText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  matriculeText: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 2,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1B5E3A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E3A',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  expiryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5E3A',
  },
  expiryText: {
    color: '#555',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
  },
  noPlanCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  noPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noPlanText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
  },
  buyButton: {
    backgroundColor: '#1B5E3A',
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 25,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});