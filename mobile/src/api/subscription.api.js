import axios from "axios";

const BASE_URL = "http://10.206.52.86:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Get all subscriptions
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