import { useEffect, useCallback, useRef } from 'react';
import {
  MemoryLeakDetector,
  MemoryUsageMonitor,
  useMemoryLeakDetection,
  useRenderPerformance,
} from '../utils/memoryManagement';
import {
  ModulePreloader,
  BundleAnalyzer,
  ChunkLoader,
  ChunkPriority,
} from '../utils/bundleOptimization';
import { ImagePerformanceMonitor } from '../utils/imageOptimization';

/**
 * Comprehensive performance optimization hook
 */
export function usePerformanceOptimization(componentName: string) {
  const memoryTracking = useMemoryLeakDetection(componentName);
  const renderPerformance = useRenderPerformance(componentName);
  const monitoringRef = useRef<(() => void) | null>(null);

  // Start memory monitoring on mount
  useEffect(() => {
    if (__DEV__) {
      monitoringRef.current = MemoryUsageMonitor.startMonitoring(10000); // Every 10 seconds
    }

    return () => {
      if (monitoringRef.current) {
        monitoringRef.current();
      }
    };
  }, []);

  // Preload critical modules
  const preloadModule = useCallback(
    async (
      moduleId: string,
      importFn: () => Promise<any>,
      priority: keyof typeof ChunkPriority = 'NORMAL'
    ) => {
      try {
        await ModulePreloader.preload(moduleId, importFn);
      } catch (error) {
        console.warn(`Failed to preload module ${moduleId}:`, error);
      }
    },
    []
  );

  // Load module with priority
  const loadModuleWithPriority = useCallback(
    (
      moduleId: string,
      importFn: () => Promise<any>,
      priority: keyof typeof ChunkPriority = 'NORMAL'
    ) => {
      ChunkLoader.addToQueue(moduleId, importFn, ChunkPriority[priority]);
    },
    []
  );

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const memoryReport = MemoryLeakDetector.getLeakReport();
    const memoryUsage = MemoryUsageMonitor.getUsageTrend();
    const renderStats = renderPerformance.getPerformanceStats();
    const bundleReport = BundleAnalyzer.getLoadTimeReport();
    const imageFailures = ImagePerformanceMonitor.getFailedLoads();

    return {
      memory: {
        componentInstances: Object.fromEntries(memoryReport.componentInstances),
        activeListeners: memoryReport.activeListeners,
        activeTimers: memoryReport.activeTimers,
        activeIntervals: memoryReport.activeIntervals,
        activeSubscriptions: memoryReport.activeSubscriptions,
        usage: memoryUsage,
      },
      rendering: renderStats,
      bundle: {
        loadTimes: bundleReport.slice(0, 10), // Top 10 slowest modules
        totalModules: bundleReport.length,
      },
      images: {
        failedLoads: imageFailures.length,
        failedUrls: imageFailures.slice(0, 5), // First 5 failed URLs
      },
    };
  }, [renderPerformance]);

  // Performance optimization recommendations
  const getOptimizationRecommendations = useCallback(() => {
    const metrics = getPerformanceMetrics();
    const recommendations: string[] = [];

    // Memory recommendations
    if (metrics.memory.activeListeners > 10) {
      recommendations.push(
        'Consider reducing the number of active event listeners'
      );
    }
    if (metrics.memory.activeTimers > 5) {
      recommendations.push(
        'Review timer usage - consider consolidating or cleaning up unused timers'
      );
    }
    if (metrics.memory.usage.trend === 'increasing') {
      recommendations.push(
        'Memory usage is increasing - check for potential memory leaks'
      );
    }

    // Rendering recommendations
    if (metrics.rendering.averageRenderTime > 50) {
      recommendations.push(
        'Average render time is high - consider memoization or component optimization'
      );
    }
    if (metrics.rendering.maxRenderTime > 200) {
      recommendations.push(
        'Some renders are very slow - profile and optimize heavy computations'
      );
    }

    // Bundle recommendations
    const slowModules = metrics.bundle.loadTimes.filter(m => m.loadTime > 1000);
    if (slowModules.length > 0) {
      recommendations.push(
        `${slowModules.length} modules are loading slowly - consider code splitting`
      );
    }

    // Image recommendations
    if (metrics.images.failedLoads > 0) {
      recommendations.push(
        `${metrics.images.failedLoads} images failed to load - check URLs and implement fallbacks`
      );
    }

    return recommendations;
  }, [getPerformanceMetrics]);

  // Clear all performance data
  const clearPerformanceData = useCallback(() => {
    MemoryLeakDetector.clearAll();
    MemoryUsageMonitor.clearHistory();
    BundleAnalyzer.getLoadTimeReport(); // This clears internal state
    ImagePerformanceMonitor.clearMetrics();
  }, []);

  return {
    // Memory management
    ...memoryTracking,

    // Module loading
    preloadModule,
    loadModuleWithPriority,

    // Performance monitoring
    getPerformanceMetrics,
    getOptimizationRecommendations,
    clearPerformanceData,
  };
}

/**
 * Performance monitoring provider for development
 */
export function usePerformanceMonitoring() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMonitoring = useCallback((intervalMs = 30000) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (__DEV__) {
        const memoryReport = MemoryLeakDetector.getLeakReport();
        const memoryUsage = MemoryUsageMonitor.getUsageTrend();

        console.group('🔍 Performance Monitor');
        console.log('Memory Usage:', memoryUsage);
        console.log(
          'Component Instances:',
          Object.fromEntries(memoryReport.componentInstances)
        );
        console.log('Active Resources:', {
          listeners: memoryReport.activeListeners,
          timers: memoryReport.activeTimers,
          intervals: memoryReport.activeIntervals,
          subscriptions: memoryReport.activeSubscriptions,
        });
        console.groupEnd();

        // Warn about potential issues
        if (memoryUsage.trend === 'increasing') {
          console.warn(
            '⚠️ Memory usage is increasing - potential memory leak detected'
          );
        }

        if (memoryReport.activeListeners > 20) {
          console.warn('⚠️ High number of active listeners detected');
        }
      }
    }, intervalMs);
  }, []);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    startMonitoring,
    stopMonitoring,
  };
}

/**
 * Hook for lazy loading with performance tracking
 */
export function useLazyLoadingWithTracking<T>(
  moduleId: string,
  importFn: () => Promise<{ default: T }>,
  preload = false
) {
  const loadedRef = useRef<T | null>(null);
  const loadingRef = useRef(false);
  const errorRef = useRef<Error | null>(null);

  const load = useCallback(async (): Promise<T> => {
    if (loadedRef.current) {
      return loadedRef.current;
    }

    if (loadingRef.current) {
      // Wait for existing load to complete
      while (loadingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      if (loadedRef.current) {
        return loadedRef.current;
      }
    }

    loadingRef.current = true;
    const startTime = Date.now();

    try {
      const module = await importFn();
      loadedRef.current = module.default;

      BundleAnalyzer.recordModuleLoad(moduleId, startTime);

      return module.default;
    } catch (error) {
      errorRef.current = error as Error;
      throw error;
    } finally {
      loadingRef.current = false;
    }
  }, [moduleId, importFn]);

  // Preload if requested
  useEffect(() => {
    if (preload) {
      load().catch(error => {
        console.warn(`Failed to preload module ${moduleId}:`, error);
      });
    }
  }, [preload, load, moduleId]);

  return {
    load,
    isLoaded: !!loadedRef.current,
    isLoading: loadingRef.current,
    error: errorRef.current,
  };
}
