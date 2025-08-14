import { useEffect, useRef, useCallback } from 'react';
import { AppLogger } from '@/utils/logger';
import { APP_CONFIG } from '@/config/environment';

// Add React import
import React from 'react';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const mountTime = useRef<number>(Date.now());
  const lastRenderTime = useRef<number>(Date.now());
  const updateCount = useRef<number>(0);
  const logger = AppLogger.setContext(`Performance:${componentName}`);

  // Track component mount
  useEffect(() => {
    const mountDuration = Date.now() - mountTime.current;
    if (APP_CONFIG.DEBUG) {
      logger.logPerformance(`${componentName} Mount`, mountDuration);
    }
  }, [componentName, logger]);

  // Track renders
  useEffect(() => {
    const renderTime = Date.now() - lastRenderTime.current;
    updateCount.current += 1;

    if (APP_CONFIG.DEBUG && updateCount.current > 1) {
      logger.logPerformance(`${componentName} Render`, renderTime, {
        updateCount: updateCount.current,
      });
    }

    lastRenderTime.current = Date.now();
  });

  // Measure async operations
  const measureAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationName: string
    ): Promise<T> => {
      const start = Date.now();
      try {
        const result = await operation();
        const duration = Date.now() - start;

        if (APP_CONFIG.DEBUG) {
          logger.logPerformance(
            `${componentName} - ${operationName}`,
            duration
          );
        }

        return result;
      } catch (error) {
        const duration = Date.now() - start;
        logger.error(
          `${componentName} - ${operationName} failed after ${duration}ms`,
          error
        );
        throw error;
      }
    },
    [componentName, logger]
  );

  // Measure sync operations
  const measureSync = useCallback(
    <T>(operation: () => T, operationName: string): T => {
      const start = Date.now();
      try {
        const result = operation();
        const duration = Date.now() - start;

        if (APP_CONFIG.DEBUG) {
          logger.logPerformance(
            `${componentName} - ${operationName}`,
            duration
          );
        }

        return result;
      } catch (error) {
        const duration = Date.now() - start;
        logger.error(
          `${componentName} - ${operationName} failed after ${duration}ms`,
          error
        );
        throw error;
      }
    },
    [componentName, logger]
  );

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    return {
      renderTime: Date.now() - lastRenderTime.current,
      mountTime: Date.now() - mountTime.current,
      updateCount: updateCount.current,
    };
  }, []);

  // Log current metrics
  const logMetrics = useCallback(() => {
    const metrics = getMetrics();
    logger.debug(`${componentName} Metrics`, metrics);
  }, [componentName, getMetrics, logger]);

  return {
    measureAsync,
    measureSync,
    getMetrics,
    logMetrics,
  };
};

// Higher-order component for automatic performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const name =
      componentName || Component.displayName || Component.name || 'Unknown';
    usePerformanceMonitor(name);

    return React.createElement(Component, props as any, ref);
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
};
