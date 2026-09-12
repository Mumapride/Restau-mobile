import axios from 'axios';
import { BASE_URL } from './auth.api';

const api = (token) => axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${token}` }
});

// Get all active meal plans
export const getMealPlans = async (token) => {
  const response = await api(token).get('/meal-plans');
  return response.data;
};

// Get active semester
export const getActiveSemester = async (token) => {
  const response = await api(token).get('/semester/active');
  return response.data;
};

// Subscribe to a meal plan and pay
export const subscribeToPlan = async (token, studentId, mealPlanId, semesterId, method) => {
  const response = await api(token).post('/subscriptions', {
    studentId,
    mealPlanId,
    semesterId,
    paymentMethod: method
  });
  return response.data;
};