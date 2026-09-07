import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { BASE_URL } from '../../api/auth.api';

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatTime = (isoDate) =>
  new Date(isoDate).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function MealHistoryScreen() {
  const { token } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/meal-claims/student/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not load meal history');
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchHistory();
      setLoading(false);
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [token]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <Text style={styles.timeText}>{formatTime(item.date)}</Text>
      </View>
      <View style={styles.cardMiddle}>
        <Text style={styles.mealText}>{item.menuItem}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.creditsNumber}>{item.creditsRemainingAfter}</Text>
        <Text style={styles.creditsLabel}>left</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E3A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal History</Text>
        <Text style={styles.headerSubtitle}>
          {history.length} meal{history.length !== 1 ? 's' : ''} claimed
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={
          history.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E3A']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>No meals claimed yet</Text>
            <Text style={styles.emptyText}>
              Once you claim a meal at the Restau, it will show up here.
            </Text>
          </View>
        }
      />
    </View>
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
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#c8e6c9',
    fontSize: 13,
    marginTop: 4,
  },
  listContainer: {
    padding: 15,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardLeft: {
    width: 90,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  cardMiddle: {
    flex: 1,
    paddingHorizontal: 10,
  },
  mealText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E3A',
  },
  cardRight: {
    alignItems: 'center',
    minWidth: 40,
  },
  creditsNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E3A',
  },
  creditsLabel: {
    fontSize: 10,
    color: '#888',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
});
