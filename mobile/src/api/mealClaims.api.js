import axios from "axios";

const BASE_URL = "http://10.207.8.154:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Get all meal claims
export const getMealClaims = async (token) => {
  const response = await api.get("/meal-claims", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Get today's meal claims
export const getTodaysMealClaims = async (token) => {
  const response = await api.get("/meal-claims/today", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Get meal claims for a specific student
export const getMealClaimsByStudent = async (studentId, token) => {
  const response = await api.get(
    `/meal-claims/student/${studentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};