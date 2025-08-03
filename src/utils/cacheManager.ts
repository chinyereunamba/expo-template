import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkUtils } from './network';

// Cache configuration
interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in bytes
  compress?: boolean; // Whether to compress data
}

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
  size: number;
}

// Default cache configuration
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 10 * 1024 * 1024, // 10MB
  compress: false,
};

// Cache manager for offline support
export class CacheManager {
  private config: CacheConfig;
  private keyPrefix: string;

  constructor(
    keyPrefix: string = 'api_cache_',
    config: Partial<CacheConfig> = {}
  ) {
    this.keyPrefix = keyPrefix;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Generate cache key
  private getCacheKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  // Calculate data size (rough estimate)
  private calculateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate in bytes
  }

  // Check if cache entry is valid
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    if (!entry.ttl) return true;

    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  // Set cache entry
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      const size = this.calculateSize(data);

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.ttl,
        size,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to set cache entry:', error);
    }
  }

  // Get cache entry
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);

      if (!this.isValidEntry(entry)) {
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to get cache entry:', error);
      return null;
    }
  }

  // Remove cache entry
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Failed to remove cache entry:', error);
    }
  }

  // Clear all cache entries
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.keyPrefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Get cache size
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.keyPrefix));

      let totalSize = 0;
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          totalSize += entry.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.warn('Failed to calculate cache size:', error);
      return 0;
    }
  }

  // Clean expired entries
  async cleanExpired(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.keyPrefix));

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (!this.isValidEntry(entry)) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clean expired cache entries:', error);
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    expiredEntries: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.keyPrefix));

      let totalSize = 0;
      let expiredEntries = 0;

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          totalSize += entry.size;

          if (!this.isValidEntry(entry)) {
            expiredEntries++;
          }
        }
      }

      return {
        totalEntries: cacheKeys.length,
        totalSize,
        expiredEntries,
      };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        expiredEntries: 0,
      };
    }
  }
}

// Default cache manager instance
export const defaultCacheManager = new CacheManager();

// Offline cache utilities
export const OfflineCacheUtils = {
  // Cache API response
  cacheResponse: async <T>(
    key: string,
    data: T,
    ttl?: number
  ): Promise<void> => {
    await defaultCacheManager.set(key, data, ttl);
  },

  // Get cached response
  getCachedResponse: async <T>(key: string): Promise<T | null> => {
    return await defaultCacheManager.get<T>(key);
  },

  // Check if we should use cache (offline or stale data)
  shouldUseCache: async (): Promise<boolean> => {
    const isOnline = await NetworkUtils.isOnline();
    return !isOnline;
  },

  // Generate cache key for API endpoint
  generateCacheKey: (
    endpoint: string,
    params?: Record<string, any>
  ): string => {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}_${paramString}`;
  },

  // Cache with network fallback
  cacheWithFallback: async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const isOnline = await NetworkUtils.isOnline();

    if (isOnline) {
      try {
        const data = await fetchFn();
        await defaultCacheManager.set(key, data, ttl);
        return data;
      } catch (error) {
        // If network request fails, try cache
        const cached = await defaultCacheManager.get<T>(key);
        if (cached) {
          return cached;
        }
        throw error;
      }
    } else {
      // Offline, use cache
      const cached = await defaultCacheManager.get<T>(key);
      if (cached) {
        return cached;
      }
      throw new Error('No cached data available and device is offline');
    }
  },
};
