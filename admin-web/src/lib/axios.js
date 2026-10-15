import axios from "axios";
import { getAuthToken, clearAuth } from "./auth.js";

// Base URL is injected via VITE_API_BASE_URL (see .env.example).
// The RESTAU backend is an Express server on port 5000 with all routes mounted
// under /api. CORS is enabled, so the browser can call it directly.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
  withCredentials: false, // No cookie-based session in the backend
});

// Attach the JWT to every request unless the user is unauthenticated.
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Session is authoritative per server-facing rule: a 401/403 means the session
// is invalid, so we clear it and let the app redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
