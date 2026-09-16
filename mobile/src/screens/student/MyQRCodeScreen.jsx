import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Alert, ScrollView, TouchableOpacity
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import useAuthStore from '../../store/useAuthStore';
import axios from 'axios';
import { BASE_URL } from '../../api/auth.api';

export default function MyQRCodeScreen() {
  const { token, user } = useAuthStore();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/qr-tokens/my-qr`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrData(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not load QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
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
        <Text style={styles.headerTitle}>My QR Code</Text>
        <Text style={styles.headerSubtitle}>
          Show this at the restau to collect your meal
        </Text>
      </View>

      {/* QR Code Card */}
      <View style={styles.qrCard}>

        {/* Student Info */}
        <Text style={styles.studentName}>
          {qrData?.firstName} {qrData?.lastName}
        </Text>
        <Text style={styles.matricule}>{qrData?.matricule}</Text>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          {qrData?.token ? (
            <QRCode
              value={qrData.token}
              size={220}
              color="#1B5E3A"
              backgroundColor="#fff"
            />
          ) : (
            <Text style={styles.noQrText}>No QR code available</Text>
          )}
        </View>

        {/* Notice */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            🔒 This QR code is unique to your account. Do not share it with anyone.
          </Text>
        </View>

        {/* Print hint */}
        <Text style={styles.printHint}>
          No phone at restau? Screenshot or print this QR code and present the paper.
        </Text>

      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchQRCode}>
        <Text style={styles.refreshButtonText}>Refresh QR Code</Text>
      </TouchableOpacity>

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
  qrCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E3A',
    marginBottom: 4,
  },
  matricule: {
    fontSize: 14,
    color: '#888',
    marginBottom: 25,
  },
  qrContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  noQrText: {
    fontSize: 14,
    color: '#888',
  },
  noticeBox: {
    backgroundColor: '#f0f7f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#1B5E3A',
  },
  noticeText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  printHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: '#1B5E3A',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});