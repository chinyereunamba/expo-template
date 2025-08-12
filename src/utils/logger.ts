import { logger, consoleTransport } from 'react-native-logs';
import { APP_CONFIG } from '@/config/environment';

// Configure logger based on environment
const defaultConfig = {
  severity: APP_CONFIG.DEBUG ? 'debug' : 'error',
  transport: APP_CONFIG.DEBUG ? [consoleTransport] : [],
  transportOptions: {
    colors: {
      info: 'blueBright' as const,
      warn: 'yellowBright' as const,
      error: 'redBright' as const,
      debug: 'magentaBright' as const,
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true,
};

const log = logger.createLogger(defaultConfig);

// Enhanced logger with context and structured logging
export class Logger {
  private static instance: Logger;
  private context: string = 'App';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setContext(context: string): Logger {
    this.context = context;
    return this;
  }

  debug(message: string, data?: any): void {
    if (APP_CONFIG.DEBUG) {
      log.debug(`[${this.context}] ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    log.info(`[${this.context}] ${message}`, data);
  }

  warn(message: string, data?: any): void {
    log.warn(`[${this.context}] ${message}`, data);
  }

  error(message: string, error?: any): void {
    log.error(`[${this.context}] ${message}`, error);

    // In production, you might want to send to crash reporting service
    if (!APP_CONFIG.DEBUG && error) {
      this.reportCrash(message, error);
    }
  }

  // Network request logging
  logNetworkRequest(method: string, url: string, data?: any): void {
    if (APP_CONFIG.DEBUG) {
      log.debug(`[Network] ${method.toUpperCase()} ${url}`, data);
    }
  }

  logNetworkResponse(
    method: string,
    url: string,
    status: number,
    data?: any
  ): void {
    if (APP_CONFIG.DEBUG) {
      const statusColor =
        status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
      log[statusColor](
        `[Network] ${method.toUpperCase()} ${url} - ${status}`,
        data
      );
    }
  }

  // State change logging
  logStateChange(
    storeName: string,
    action: string,
    prevState?: any,
    newState?: any
  ): void {
    if (APP_CONFIG.DEBUG) {
      log.debug(`[State] ${storeName} - ${action}`, {
        previous: prevState,
        current: newState,
      });
    }
  }

  // Navigation logging
  logNavigation(from: string, to: string, params?: any): void {
    if (APP_CONFIG.DEBUG) {
      log.debug(`[Navigation] ${from} → ${to}`, params);
    }
  }

  // Performance logging
  logPerformance(operation: string, duration: number, metadata?: any): void {
    if (APP_CONFIG.DEBUG) {
      const level = duration > 1000 ? 'warn' : 'debug';
      log[level](`[Performance] ${operation} took ${duration}ms`, metadata);
    }
  }

  // User action logging
  logUserAction(action: string, data?: any): void {
    if (APP_CONFIG.DEBUG) {
      log.info(`[User] ${action}`, data);
    }
  }

  // Crash reporting (placeholder for production crash reporting service)
  private reportCrash(message: string, error: any): void {
    // In a real app, you would integrate with services like:
    // - Sentry
    // - Crashlytics
    // - Bugsnag
    console.error('Crash Report:', {
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  // Create a timer for performance measurement
  startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.logPerformance(label, duration);
    };
  }

  // Log memory usage (React Native specific)
  logMemoryUsage(): void {
    if (APP_CONFIG.DEBUG) {
      // Memory usage logging is not available in React Native
      // This would be available in web environments
      log.debug(
        '[Memory]',
        'Memory usage monitoring not available in React Native'
      );
    }
  }
}

// Export singleton instance
export const AppLogger = Logger.getInstance();

// Export convenience functions
export const createLogger = (context: string) =>
  Logger.getInstance().setContext(context);

// Export performance timer utility
export const withPerformanceLogging = <T extends (...args: any[]) => any>(
  fn: T,
  label: string
): T => {
  return ((...args: any[]) => {
    const timer = AppLogger.startTimer(label);
    const result = fn(...args);

    // Handle both sync and async functions
    if (result instanceof Promise) {
      return result.finally(() => timer());
    } else {
      timer();
      return result;
    }
  }) as T;
};
