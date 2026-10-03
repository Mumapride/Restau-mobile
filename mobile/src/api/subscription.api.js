import axios from "axios";
import { BASE_URL } from "./auth.api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Get all subscriptionss
export const getSubscriptions = async () => {
  const response = await api.get("/subscriptions");
  return response.data;
};

// Get subscription by ID
export const getSubscriptionById = async (id) => {
  const response = await api.get(`/subscriptions/${id}`);
  return response.data;
};

// Create subscription
export const createSubscription = async (subscriptionData) => {
  const response = await api.post(
    "/subscriptions",
    subscriptionData
  );

  return response.data; 
};