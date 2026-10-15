import api from "../lib/axios.js";

/** List active meal plans (GET /api/meal-plans) */
export const getMealPlans = async () => {
  const { data } = await api.get("/meal-plans");
  return data;
};

/** Create a meal plan (POST /api/meal-plans) */
export const createMealPlan = async (payload) => {
  const { data } = await api.post("/meal-plans", payload);
  return data;
};

/** Update a meal plan (PUT /api/meal-plans/:id) */
export const updateMealPlan = async (id, payload) => {
  const { data } = await api.put(`/meal-plans/${id}`, payload);
  return data;
};

/** Deactivate a meal plan (DELETE /api/meal-plans/:id) */
export const deactivateMealPlan = async (id) => {
  const { data } = await api.delete(`/meal-plans/${id}`);
  return data;
};
