import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface AdminUser {
  _id: string;
  username: string;
  name?: string;
  role?: string;
  permissions?: Record<string, boolean>;
}

interface AuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ADMIN_TOKEN_KEY = 'admin_auth_token';
const ADMIN_PROFILE_KEY = 'admin_auth_profile';

async function clearStoredAuth() {
  await Promise.all([
    SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY),
    SecureStore.deleteItemAsync(ADMIN_PROFILE_KEY),
  ]);
}

async function persistAdminProfile(admin: AdminUser) {
  await SecureStore.setItemAsync(ADMIN_PROFILE_KEY, JSON.stringify(admin));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const requestUrl = String(error?.config?.url || '');
        const isAuthVerificationRequest = requestUrl.includes('/auth/verify');

        if ((error?.response?.status === 401 || error?.response?.status === 403) && isAuthVerificationRequest) {
          await clearStoredAuth();
          setAdmin(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const [token, storedProfileRaw] = await Promise.all([
        SecureStore.getItemAsync(ADMIN_TOKEN_KEY),
        SecureStore.getItemAsync(ADMIN_PROFILE_KEY),
      ]);

      if (token) {
        let storedProfile: AdminUser | null = null;
        if (storedProfileRaw) {
          try {
            storedProfile = JSON.parse(storedProfileRaw) as AdminUser;
            setAdmin(storedProfile);
          } catch {
            storedProfile = null;
          }
        }

        try {
          const response = await api.get('/auth/verify');
          const userData = response.data?.admin || response.data?.user || response.data;

          if (userData) {
            const nextAdmin: AdminUser = {
              _id: userData.adminId || userData._id || storedProfile?._id || '',
              username: userData.username || storedProfile?.username || userData.name || 'Admin',
              name: userData.name || storedProfile?.name,
              role: userData.role || storedProfile?.role,
              permissions: userData.permissions || storedProfile?.permissions,
            };

            setAdmin(nextAdmin);
            await persistAdminProfile(nextAdmin);
          } else if (!storedProfile) {
            await clearStoredAuth();
            setAdmin(null);
          }
        } catch (error: any) {
          const status = error?.response?.status;

          if (status === 401 || status === 403) {
            await clearStoredAuth();
            setAdmin(null);
          } else if (!storedProfile) {
            setAdmin(null);
          }
        }
      }
    } catch {
      await clearStoredAuth();
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/signin', { username, password });
    const data = response.data;
    if (data?.token) {
      const user = data.user || data;
      const nextAdmin: AdminUser = {
        _id: user._id || '',
        username: user.username || username,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      };

      await Promise.all([
        SecureStore.setItemAsync(ADMIN_TOKEN_KEY, data.token),
        persistAdminProfile(nextAdmin),
      ]);

      setAdmin(nextAdmin);
    } else {
      throw new Error('Login failed — no token received');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      await clearStoredAuth();
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
