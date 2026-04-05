import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '') || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap { success, data } wrapper from dashboard API
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html')) {
      return Promise.reject(
        new Error('API returned HTML instead of JSON. Check EXPO_PUBLIC_API_URL or local backend.')
      );
    }

    // Dashboard API wraps responses as { success: true, data: [...] }
    // Unwrap so screens can use response.data directly as the array/object
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;
