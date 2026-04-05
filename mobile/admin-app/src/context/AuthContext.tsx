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
        if (error?.response?.status === 401) {
          await SecureStore.deleteItemAsync('admin_auth_token');
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
      const token = await SecureStore.getItemAsync('admin_auth_token');
      if (token) {
        // Try to verify token with server
        const response = await api.get('/auth/verify');
        // Server returns { admin: decoded } or { user: ... }
        const userData = response.data?.admin || response.data?.user || response.data;
        if (userData) {
          setAdmin({
            _id: userData.adminId || userData._id || '',
            username: userData.username || userData.name || 'Admin',
            name: userData.name,
            role: userData.role,
          });
        } else {
          await SecureStore.deleteItemAsync('admin_auth_token');
          setAdmin(null);
        }
      }
    } catch {
      // Token invalid or expired — clear it
      await SecureStore.deleteItemAsync('admin_auth_token');
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/signin', { username, password });
    const data = response.data;
    if (data?.token) {
      await SecureStore.setItemAsync('admin_auth_token', data.token);
      const user = data.user || data;
      setAdmin({
        _id: user._id || '',
        username: user.username || username,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      });
    } else {
      throw new Error('Login failed — no token received');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      await SecureStore.deleteItemAsync('admin_auth_token');
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
