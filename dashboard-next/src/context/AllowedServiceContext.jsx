'use client';

import { createContext, useContext } from 'react';
import useSWR from 'swr';

const AllowedServiceContext = createContext({
  allowedService: [],
  isLoading: true,
  hasPermission: serviceKey => false,
  mutate: () => {},
});

// Fetcher function for SWR
const fetcher = async (url) => {
  const res = await fetch(url, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch permissions');
  }
  
  const data = await res.json();
  return data.allowedService || [];
};

export function AllowedServiceProvider({ children }) {
  const { data: allowedService, isLoading, mutate } = useSWR(
    '/api/auth/watch-permissions',
    fetcher,
    {
      refreshInterval: 5000, // Auto-refresh every 5 seconds
      revalidateOnFocus: true, // Revalidate when window gets focus
      revalidateOnReconnect: true, // Revalidate when connection is restored
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
      fallbackData: [], // Default value while loading
    }
  );

  const hasPermission = serviceKey => {
    return allowedService?.includes(serviceKey) || false;
  };

  return (
    <AllowedServiceContext.Provider 
      value={{ 
        allowedService: allowedService || [], 
        isLoading, 
        hasPermission,
        mutate // Expose mutate for manual revalidation
      }}
    >
      {children}
    </AllowedServiceContext.Provider>
  );
}

export function useAllowedService() {
  const context = useContext(AllowedServiceContext);
  if (!context) {
    throw new Error('useAllowedService must be used within an AllowedServiceProvider');
  }
  return context;
}