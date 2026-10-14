import api from "../lib/axios.js";

/** List all meal claims (GET /api/meal-claims) */
export const getMealClaims = async () => {
  const { data } = await api.get("/meal-claims");
  return data;
};

/** List today's meal claims (GET /api/meal-claims/today) */
export const getTodaysMealClaims = async () => {
  const { data } = await api.get("/meal-claims/today");
  return data;
};
