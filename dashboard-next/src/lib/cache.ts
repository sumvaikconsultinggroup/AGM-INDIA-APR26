/**
 * In-Memory Cache with TTL
 * Enterprise-grade caching for frequently accessed data.
 * 
 * Usage:
 *   const cached = appCache.get<Stats>('dashboard-stats');
 *   if (cached) return cached;
 *   const stats = await fetchStats();
 *   appCache.set('dashboard-stats', stats, 300); // 5 min TTL
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

class AppCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;

    // Cleanup expired entries every 2 minutes
    setInterval(() => this.cleanup(), 2 * 60 * 1000).unref();
  }

  /**
   * Get cached value. Returns null if expired or not found.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a value with TTL in seconds
   */
  set<T>(key: string, data: T, ttlSeconds = 300): void {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
    });
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Delete all keys matching a prefix
   */
  invalidatePrefix(prefix: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; maxSize: number } {
    return { size: this.store.size, maxSize: this.maxSize };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton cache instance
export const appCache = new AppCache();

/**
 * Cache decorator for async functions.
 * 
 * Usage:
 *   const getStats = withCache('stats', 300, async () => { ... });
 *   const result = await getStats();
 */
export function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): () => Promise<T> {
  return async () => {
    const cached = appCache.get<T>(key);
    if (cached !== null) return cached;

    const result = await fn();
    appCache.set(key, result, ttlSeconds);
    return result;
  };
}
