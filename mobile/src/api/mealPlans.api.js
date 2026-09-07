import axios from "axios";

const BASE_URL = "http://10.207.8.154:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Get all active meal plans
export const getMealPlans = async () => {
  const response = await api.get("/meal-plans");
  return response.data;
};

// Create meal plan
export const createMealPlan = async (mealPlanData) => {
  const response = await api.post("/meal-plans", mealPlanData);
  return response.data;
};

// Update meal plan
export const updateMealPlan = async (id, mealPlanData) => {
  const response = await api.put(
    `/meal-plans/${id}`,
    mealPlanData
  );

  return response.data;
};

// Deactivate meal plan
export const deleteMealPlan = async (id) => {
  const response = await api.delete(
    `/meal-plans/${id}`
  );

  return response.data;
};