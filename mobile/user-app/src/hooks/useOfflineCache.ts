import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface CacheOptions {
  key: string;
  endpoint: string;
  ttl?: number; // Time to live in milliseconds (default 30 minutes)
}

export function useOfflineCache<T>({ key, endpoint, ttl = 30 * 60 * 1000 }: CacheOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `@cache_${key}`;
  const timestampKey = `@cache_ts_${key}`;

  const fetchAndCache = async () => {
    try {
      const response = await api.get(endpoint);
      const freshData = response.data?.data || response.data;
      setData(freshData);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(freshData));
      await AsyncStorage.setItem(timestampKey, Date.now().toString());
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      // Try to load from cache
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFromCache = async (): Promise<boolean> => {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      const timestamp = await AsyncStorage.getItem(timestampKey);

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < ttl) {
          setData(JSON.parse(cached));
          setLoading(false);
          return true; // Cache is valid
        }
      }
      return false; // Cache expired or missing
    } catch {
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      const cacheValid = await loadFromCache();
      if (!cacheValid) {
        await fetchAndCache();
      }
    })();
  }, [endpoint]);

  const refresh = async () => {
    setLoading(true);
    await fetchAndCache();
  };

  return { data, loading, error, refresh };
}
