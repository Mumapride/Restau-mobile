import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import useAuthStore from '../../store/useAuthStore';
import { subscribeToPlan } from '../../api/Student.api';

export default function PaymentScreen({ route, navigation }) {
  const { plan, semester, studentId } = route.params;
  const { token } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState('MTN_MOMO');
  const [loading, setLoading] = useState(false);

  const totalAmount = plan.credits * plan.pricePerCredit;

  const handleConfirmPayment = async () => {
    Alert.alert(
      'Confirm Payment',
      `You are about to pay ${Number(totalAmount).toLocaleString()} FCFA via ${selectedMethod === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money'} for ${plan.name}. Proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setLoading(true);
              await subscribeToPlan(token, studentId, plan.id, semester.id, selectedMethod);
              Alert.alert(
                'Success! 🎉',
                `Payment successful! ${plan.credits} credits have been added to your account.`,
                [{ text: 'OK', onPress: () => navigation.navigate('StudentTabs') }]
              );
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Payment failed. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
      </View>

      {/* Plan Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan Summary</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plan</Text>
            <Text style={styles.rowValue}>{plan.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Credits</Text>
            <Text style={styles.rowValue}>{plan.credits} meals</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Price per meal</Text>
            <Text style={styles.rowValue}>{Number(plan.pricePerCredit).toLocaleString()} FCFA</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Credits expire</Text>
            <Text style={styles.rowValue}>
              {new Date(semester.endDate).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{Number(totalAmount).toLocaleString()} FCFA</Text>
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'MTN_MOMO' && styles.methodCardSelected]}
          onPress={() => setSelectedMethod('MTN_MOMO')}
        >
          <View style={styles.methodLeft}>
            <Text style={styles.methodIcon}>📱</Text>
            <View>
              <Text style={styles.methodName}>MTN Mobile Money</Text>
              <Text style={styles.methodDesc}>Pay with MTN MoMo</Text>
            </View>
          </View>
          <View style={[styles.radio, selectedMethod === 'MTN_MOMO' && styles.radioSelected]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'ORANGE_MONEY' && styles.methodCardSelected]}
          onPress={() => setSelectedMethod('ORANGE_MONEY')}
        >
          <View style={styles.methodLeft}>
            <Text style={styles.methodIcon}>🟠</Text>
            <View>
              <Text style={styles.methodName}>Orange Money</Text>
              <Text style={styles.methodDesc}>Pay with Orange Money</Text>
            </View>
          </View>
          <View style={[styles.radio, selectedMethod === 'ORANGE_MONEY' && styles.radioSelected]} />
        </TouchableOpacity>
      </View>

      {/* Confirm Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Pay {Number(totalAmount).toLocaleString()} FCFA
            </Text>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1B5E3A',
    padding: 25,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#c8e6c9',
    fontSize: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  rowLabel: {
    fontSize: 14,
    color: '#888',
  },
  rowValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 15,
    color: '#1B5E3A',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#1B5E3A',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 15,
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  methodCardSelected: {
    borderColor: '#1B5E3A',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    fontSize: 28,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  methodDesc: {
    fontSize: 12,
    color: '#888',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  radioSelected: {
    borderColor: '#1B5E3A',
    backgroundColor: '#1B5E3A',
  },
  confirmButton: {
    backgroundColor: '#1B5E3A',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});