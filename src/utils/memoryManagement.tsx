/**
 * Memory management and leak detection utilities
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Memory leak detector for development
 */
export class MemoryLeakDetector {
  private static listeners = new Map<string, Set<() => void>>();
  private static timers = new Map<string, Set<NodeJS.Timeout>>();
  private static intervals = new Map<string, Set<NodeJS.Timeout>>();
  private static subscriptions = new Map<string, Set<{ unsubscribe: () => void }>>();
  private static componentInstances = new Map<string, number>();

  /**
   * Register a component instance
   */
  static registerComponent(componentName: string): string {
    const instanceId = `${componentName}_${Date.now()}_${Math.random()}`;
    const count = this.componentInstances.get(componentName) || 0;
    this.componentInstances.set(componentName, count + 1);
    
    // Initialize tracking sets for this instance
    this.listeners.set(instanceId, new Set());
    this.timers.set(instanceId, new Set());
    this.intervals.set(instanceId, new Set());
    this.subscriptions.set(instanceId, new Set());

    return instanceId;
  }

  /**
   * Unregister a component instance and clean up its resources
   */
  static unregisterComponent(instanceId: string, componentName: string): void {
    // Clean up all tracked resources
    this.cleanupListeners(instanceId);
    this.cleanupTimers(instanceId);
    this.cleanupIntervals(instanceId);
    this.cleanupSubscriptions(instanceId);

    // Remove tracking sets
    this.listeners.delete(instanceId);
    this.timers.delete(instanceId);
    this.intervals.delete(instanceId);
    this.subscriptions.delete(instanceId);

    // Update component count
    const count = this.componentInstances.get(componentName) || 0;
    if (count > 0) {
      this.componentInstances.set(componentName, count - 1);
    }
  }

  /**
   * Track an event listener
   */
  static trackListener(instanceId: string, cleanup: () => void): void {
    const listeners = this.listeners.get(instanceId);
    if (listeners) {
      listeners.add(cleanup);
    }
  }

  /**
   * Track a timer
   */
  static trackTimer(instanceId: string, timerId: NodeJS.Timeout): void {
    const timers = this.timers.get(instanceId);
    if (timers) {
      timers.add(timerId);
    }
  }

  /**
   * Track an interval
   */
  static trackInterval(instanceId: string, intervalId: NodeJS.Timeout): void {
    const intervals = this.intervals.get(instanceId);
    if (intervals) {
      intervals.add(intervalId);
    }
  }

  /**
   * Track a subscription
   */
  static trackSubscription(instanceId: string, subscription: { unsubscribe: () => void }): void {
    const subscriptions = this.subscriptions.get(instanceId);
    if (subscriptions) {
      subscriptions.add(subscription);
    }
  }

  private static cleanupListeners(instanceId: string): void {
    const listeners = this.listeners.get(instanceId);
    if (listeners) {
      listeners.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Error cleaning up listener:', error);
        }
      });
      listeners.clear();
    }
  }

  private static cleanupTimers(instanceId: string): void {
    const timers = this.timers.get(instanceId);
    if (timers) {
      timers.forEach(timerId => {
        try {
          clearTimeout(timerId);
        } catch (error) {
          console.warn('Error clearing timer:', error);
        }
      });
      timers.clear();
    }
  }

  private static cleanupIntervals(instanceId: string): void {
    const intervals = this.intervals.get(instanceId);
    if (intervals) {
      intervals.forEach(intervalId => {
        try {
          clearInterval(intervalId);
        } catch (error) {
          console.warn('Error clearing interval:', error);
        }
      });
      intervals.clear();
    }
  }

  private static cleanupSubscriptions(instanceId: string): void {
    const subscriptions = this.subscriptions.get(instanceId);
    if (subscriptions) {
      subscriptions.forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing:', error);
        }
      });
      subscriptions.clear();
    }
  }

  /**
   * Get memory leak report
   */
  static getLeakReport(): {
    componentInstances: Map<string, number>;
    activeListeners: number;
    activeTimers: number;
    activeIntervals: number;
    activeSubscriptions: number;
  } {
    let totalListeners = 0;
    let totalTimers = 0;
    let totalIntervals = 0;
    let totalSubscriptions = 0;

    this.listeners.forEach(listeners => totalListeners += listeners.size);
    this.timers.forEach(timers => totalTimers += timers.size);
    this.intervals.forEach(intervals => totalIntervals += intervals.size);
    this.subscriptions.forEach(subscriptions => totalSubscriptions += subscriptions.size);

    return {
      componentInstances: new Map(this.componentInstances),
      activeListeners: totalListeners,
      activeTimers: totalTimers,
      activeIntervals: totalIntervals,
      activeSubscriptions: totalSubscriptions,
    };
  }

  /**
   * Clear all tracking data (for testing)
   */
  static clearAll(): void {
    this.listeners.clear();
    this.timers.clear();
    this.intervals.clear();
    this.subscriptions.clear();
    this.componentInstances.clear();
  }
}

/**
 * Hook for automatic memory leak detection and cleanup
 */
export function useMemoryLeakDetection(componentName: string) {
  const instanceIdRef = useRef<string>();

  useEffect(() => {
    // Register component on mount
    instanceIdRef.current = MemoryLeakDetector.registerComponent(componentName);

    // Unregister component on unmount
    return () => {
      if (instanceIdRef.current) {
        MemoryLeakDetector.unregisterComponent(instanceIdRef.current, componentName);
      }
    };
  }, [componentName]);

  const trackListener = useCallback((cleanup: () => void) => {
    if (instanceIdRef.current) {
      MemoryLeakDetector.trackListener(instanceIdRef.current, cleanup);
    }
  }, []);

  const trackTimer = useCallback((timerId: NodeJS.Timeout) => {
    if (instanceIdRef.current) {
      MemoryLeakDetector.trackTimer(instanceIdRef.current, timerId);
    }
  }, []);

  const trackInterval = useCallback((intervalId: NodeJS.Timeout) => {
    if (instanceIdRef.current) {
      MemoryLeakDetector.trackInterval(instanceIdRef.current, intervalId);
    }
  }, []);

  const trackSubscription = useCallback((subscription: { unsubscribe: () => void }) => {
    if (instanceIdRef.current) {
      MemoryLeakDetector.trackSubscription(instanceIdRef.current, subscription);
    }
  }, []);

  return {
    trackListener,
    trackTimer,
    trackInterval,
    trackSubscription,
  };
}

/**
 * Safe timer hooks that automatically clean up
 */
export function useSafeTimeout(
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList = []
): void {
  const { trackTimer } = useMemoryLeakDetection('useSafeTimeout');
  const callbackRef = useRef(callback);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  useEffect(() => {
    if (delay === null) return;

    const timerId = setTimeout(() => {
      callbackRef.current();
    }, delay);

    trackTimer(timerId);

    return () => {
      clearTimeout(timerId);
    };
  }, [delay, trackTimer]);
}

export function useSafeInterval(
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList = []
): void {
  const { trackInterval } = useMemoryLeakDetection('useSafeInterval');
  const callbackRef = useRef(callback);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  useEffect(() => {
    if (delay === null) return;

    const intervalId = setInterval(() => {
      callbackRef.current();
    }, delay);

    trackInterval(intervalId);

    return () => {
      clearInterval(intervalId);
    };
  }, [delay, trackInterval]);
}

/**
 * Memory usage monitor
 */
export class MemoryUsageMonitor {
  private static measurements: {
    timestamp: number;
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }[] = [];

  private static maxMeasurements = 100;

  /**
   * Record current memory usage
   */
  static recordUsage(): void {
    const measurement: any = {
      timestamp: Date.now(),
    };

    // Use performance.memory if available (Chrome/Edge)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      measurement.usedJSHeapSize = memory.usedJSHeapSize;
      measurement.totalJSHeapSize = memory.totalJSHeapSize;
      measurement.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    }

    this.measurements.push(measurement);

    // Keep only the most recent measurements
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }
  }

  /**
   * Get memory usage trend
   */
  static getUsageTrend(): {
    current?: number;
    peak?: number;
    average?: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.measurements.length === 0) {
      return { trend: 'stable' };
    }

    const recentMeasurements = this.measurements
      .filter(m => m.usedJSHeapSize !== undefined)
      .map(m => m.usedJSHeapSize!);

    if (recentMeasurements.length === 0) {
      return { trend: 'stable' };
    }

    const current = recentMeasurements[recentMeasurements.length - 1];
    const peak = Math.max(...recentMeasurements);
    const average = recentMeasurements.reduce((sum, val) => sum + val, 0) / recentMeasurements.length;

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentMeasurements.length >= 5) {
      const recent = recentMeasurements.slice(-5);
      const older = recentMeasurements.slice(-10, -5);
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        
        const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (changePercent > 10) {
          trend = 'increasing';
        } else if (changePercent < -10) {
          trend = 'decreasing';
        }
      }
    }

    return {
      current,
      peak,
      average,
      trend,
    };
  }

  /**
   * Clear measurement history
   */
  static clearHistory(): void {
    this.measurements = [];
  }

  /**
   * Start automatic monitoring
   */
  static startMonitoring(intervalMs = 5000): () => void {
    const intervalId = setInterval(() => {
      this.recordUsage();
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }
}

/**
 * Component wrapper for memory leak detection
 */

export function withMemoryLeakDetection<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const displayName = componentName || Component.displayName || Component.name || 'Component';
    useMemoryLeakDetection(displayName);
    
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withMemoryLeakDetection(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}


/**
 * Hook for monitoring component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const renderTimesRef = useRef<number[]>([]);

  useEffect(() => {
    renderCountRef.current++;
    const now = Date.now();
    const renderTime = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    renderTimesRef.current.push(renderTime);
    
    // Keep only the last 10 render times
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current.shift();
    }

    // Log performance warnings in development
    if (__DEV__ && renderTime > 100) {
      console.warn(
        `Slow render detected in ${componentName}: ${renderTime}ms (render #${renderCountRef.current})`
      );
    }
  });

  const getPerformanceStats = useCallback(() => {
    const renderTimes = renderTimesRef.current;
    const averageRenderTime = renderTimes.length > 0 
      ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length 
      : 0;
    
    return {
      renderCount: renderCountRef.current,
      averageRenderTime,
      lastRenderTime: renderTimes[renderTimes.length - 1] || 0,
      maxRenderTime: Math.max(...renderTimes, 0),
    };
  }, []);

  return { getPerformanceStats };
}