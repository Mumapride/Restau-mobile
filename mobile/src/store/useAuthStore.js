import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
  token: null,
  user: null,

  setAuth: (token, user) => {
    set({ token, user });
    AsyncStorage.setItem('token', token);
    AsyncStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth: () => {
    set({ token: null, user: null });
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('user');
  },

  loadAuth: async () => {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('user');
    if (token && user) {
      set({ token, user: JSON.parse(user) });
    }
  }
}));

export default useAuthStore;
