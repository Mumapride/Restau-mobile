import axios from "axios";
import { BASE_URL } from "./auth.api";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Fetch published announcements (STUDENT only). GET /api/announcements
 *  Pass `limit` for dashboard previews; omit for the full list.
 */
export const getAnnouncements = async (limit) => {
  const response = await api.get("/announcements", {
    params: limit !== undefined ? { limit } : undefined,
    headers: authHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
};
