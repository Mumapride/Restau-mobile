import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import useAuthStore from '../../store/useAuthStore';
import axios from 'axios';
import { BASE_URL } from '../../api/auth.api';

export default function ScannerScreen() {
  const { token, clearAuth } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/meal-claims/scan`,
        { token: data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (error) {
      setResult({
        approved: false,
        reason: error.response?.data?.message || 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setResult(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1B5E3A" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan QR codes
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <TouchableOpacity onPress={clearAuth}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Camera - 3/4 of screen */}
      <View style={styles.cameraContainer}>
        {!scanned ? (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr']
            }}
          >
            {/* Scan frame overlay */}
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.scanText}>
                Point camera at student QR code
              </Text>
            </View>
          </CameraView>
        ) : (
          <View style={styles.cameraPlaceholder}>
            {loading ? (
              <ActivityIndicator size="large" color="#1B5E3A" />
            ) : (
              <Text style={styles.processingText}>Processing...</Text>
            )}
          </View>
        )}
      </View>

      {/* Result - 1/4 of screen */}
      <View style={[
        styles.resultContainer,
        result?.approved === true && styles.resultApproved,
        result?.approved === false && styles.resultRejected,
        !result && styles.resultWaiting
      ]}>
        {!result && !loading && (
          <Text style={styles.waitingText}>
            📷 Ready to scan
          </Text>
        )}

        {loading && (
          <Text style={styles.waitingText}>Validating...</Text>
        )}

        {result && result.approved && (
          <View style={styles.resultContent}>
            <Text style={styles.resultIcon}>✅</Text>
            <View>
              <Text style={styles.resultStatus}>APPROVED</Text>
              <Text style={styles.resultName}>{result.studentName}</Text>
              <Text style={styles.resultMatricule}>{result.matricule}</Text>
              <Text style={styles.resultCredits}>
                Credits remaining: {result.creditsRemaining}
              </Text>
            </View>
          </View>
        )}

        {result && !result.approved && (
          <View style={styles.resultContent}>
            <Text style={styles.resultIcon}>❌</Text>
            <View>
              <Text style={styles.resultStatus}>REJECTED</Text>
              <Text style={styles.resultReason}>{result.reason}</Text>
              {result.studentName && (
                <Text style={styles.resultName}>{result.studentName}</Text>
              )}
            </View>
          </View>
        )}

        {result && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Scan Next</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1B5E3A',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#c8e6c9',
    fontSize: 14,
  },
  cameraContainer: {
    flex: 3,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: 220,
    height: 220,
    position: 'relative',
    marginBottom: 20,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: 3, borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: 3, borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 3, borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 3, borderRightWidth: 3,
  },
  scanText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  resultWaiting: {
    backgroundColor: '#1B5E3A',
  },
  resultApproved: {
    backgroundColor: '#1B5E3A',
  },
  resultRejected: {
    backgroundColor: '#c62828',
  },
  waitingText: {
    color: '#fff',
    fontSize: 16,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  resultIcon: {
    fontSize: 36,
  },
  resultStatus: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultName: {
    color: '#fff',
    fontSize: 15,
    marginTop: 2,
  },
  resultMatricule: {
    color: '#c8e6c9',
    fontSize: 13,
  },
  resultCredits: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 2,
  },
  resultReason: {
    color: '#ffcdd2',
    fontSize: 14,
    marginTop: 2,
  },
  resetButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#1B5E3A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  permissionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#1B5E3A',
    padding: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});