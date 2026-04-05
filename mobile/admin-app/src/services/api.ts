import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const KNOWN_NON_API_BASE_URLS = new Set([
  'https://swami-g-dashboard.vercel.app',
]);

function normalizeBaseUrl(url?: string): string {
  return (url || '').trim().replace(/\/+$/, '');
}

function getExpoDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;
  if (!hostUri) return null;
  return String(hostUri).split(':')[0] || null;
}

function resolveApiBaseUrl(): string {
  const configured = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  const shouldUseDevAutoHost =
    __DEV__ && (!configured || KNOWN_NON_API_BASE_URLS.has(configured));

  if (shouldUseDevAutoHost) {
    const expoHost = getExpoDevHost();
    if (expoHost) {
      return `http://${expoHost}:3000`;
    }
    return 'http://localhost:3000';
  }

  return configured || 'http://localhost:3000';
}

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('admin_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap API wrappers
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html')) {
      return Promise.reject(
        new Error('API returned HTML instead of JSON. Check EXPO_PUBLIC_API_URL or local backend.')
      );
    }

    if (response.data && typeof response.data === 'object') {
      // Standard wrapper: { success: true, data: [...] }
      if ('success' in response.data && 'data' in response.data) {
        response.data = response.data.data;
      }
      // DonationsRecord uses: { success: true, allPayments: [...] }
      else if ('allPayments' in response.data) {
        response.data = response.data.allPayments;
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync('admin_auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;
