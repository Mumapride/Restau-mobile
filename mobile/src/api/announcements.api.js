import axios from 'axios';
import { BASE_URL } from './auth.api';
import useAuthStore from '../store/useAuthStore';

export const getAnnouncements = async (limit = 5, token) => {
  const response = await axios.get(`${BASE_URL}/announcements`, {
    params: { limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(response.data) ? response.data : [];
};