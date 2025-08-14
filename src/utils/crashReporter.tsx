import { APP_CONFIG } from '@/config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add React import
import React from 'react';
import { Platform } from 'react-native';

export interface CrashReport {
  id: string;
  timestamp: number;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    screen?: string;
    action?: string;
    userId?: string;
    appVersion: string;
    platform: string;
  };
  deviceInfo: {
    userAgent: string;
    language: string;
    timezone: string;
  };
  appState?: Record<string, unknown>;
}

class CrashReporter {
  private static instance: CrashReporter;
  private crashes: CrashReport[] = [];
  private maxCrashes = 50;
  private storageKey = '@crash_reports';
  private isReporting = false; // Prevent infinite loops
  private recentErrors = new Map<string, number>(); // Track recent errors to prevent duplicates

  private constructor() {
    this.loadCrashesFromStorage();
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): CrashReporter {
    if (!CrashReporter.instance) {
      CrashReporter.instance = new CrashReporter();
    }
    return CrashReporter.instance;
  }

  // Set up global error handlers
  private setupGlobalErrorHandlers(): void {
    // Handle global errors through console.error override
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Prevent infinite loops and ignore crash reporter's own errors
      const errorString = args[0]?.toString() || '';
      const shouldIgnore =
        this.isReporting ||
        errorString.includes('CrashReporter') ||
        errorString.includes('Failed to save crashes') ||
        errorString.includes('Failed to load crashes') ||
        errorString.includes('Crash reported:') ||
        errorString.includes('[CrashReporter]');

      if (!shouldIgnore) {
        // Check if this looks like an error
        if (
          args[0] instanceof Error ||
          (typeof args[0] === 'string' && args[0].includes('Error'))
        ) {
          const error = args[0] instanceof Error ? args[0] : new Error(args[0]);
          this.reportCrash(error, 'Console Error');
        }
      }
      originalConsoleError.apply(console, args);
    };

    // Set up global unhandled promise rejection tracking
    // This is a React Native compatible approach
    if (typeof global !== 'undefined' && 'ErrorUtils' in global) {
      const globalWithErrorUtils = global as typeof global & {
        ErrorUtils: {
          setGlobalHandler: (
            handler: (error: Error, isFatal?: boolean) => void
          ) => void;
        };
      };

      const originalHandler = globalWithErrorUtils.ErrorUtils.setGlobalHandler;
      globalWithErrorUtils.ErrorUtils.setGlobalHandler(
        (error: Error, isFatal?: boolean) => {
          if (!this.isReporting) {
            this.reportCrash(
              error,
              isFatal ? 'Fatal Error' : 'Non-Fatal Error'
            );
          }
          // Call original handler if it exists
          if (originalHandler) {
            originalHandler(error);
          }
        }
      );
    }
  }

  // Generate unique crash ID
  private generateCrashId(): string {
    return `crash_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // Get device information
  private getDeviceInfo() {
    // React Native doesn't have navigator object, use platform-specific info
    return {
      userAgent: 'React Native App',
      language: 'en', // You could use react-native-localize for actual locale
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    };
  }

  // Report a crash
  async reportCrash(
    error: Error,
    context?: string,
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    // Prevent infinite loops
    if (this.isReporting) {
      return;
    }

    // Prevent duplicate error reports within 5 seconds
    const errorKey = `${error.name}:${error.message}:${context || ''}`;
    const now = Date.now();
    const lastReported = this.recentErrors.get(errorKey);

    if (lastReported && now - lastReported < 5000) {
      return; // Skip duplicate error within 5 seconds
    }

    this.recentErrors.set(errorKey, now);

    // Clean up old entries (keep only last 10 minutes)
    for (const [key, timestamp] of this.recentErrors.entries()) {
      if (now - timestamp > 600000) {
        // 10 minutes
        this.recentErrors.delete(key);
      }
    }

    this.isReporting = true;

    try {
      const crashReport: CrashReport = {
        id: this.generateCrashId(),
        timestamp: Date.now(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack || undefined,
        },
        context: {
          screen: (additionalData?.screen as string | undefined) || undefined,
          action: context || undefined,
          userId: (additionalData?.userId as string | undefined) || undefined,
          appVersion: APP_CONFIG.VERSION,
          platform: Platform.OS,
        },
        deviceInfo: this.getDeviceInfo(),
        appState: additionalData?.appState as
          | Record<string, unknown>
          | undefined,
      };

      // Add to crashes array
      this.crashes.unshift(crashReport);

      // Keep only the most recent crashes
      if (this.crashes.length > this.maxCrashes) {
        this.crashes = this.crashes.slice(0, this.maxCrashes);
      }

      // Save to storage (without logging to prevent loops)
      await this.saveCrashesToStorage();

      // Only log in debug mode and use direct console to avoid loops
      if (APP_CONFIG.DEBUG) {
        // Use console.warn to avoid triggering the crash reporter again
        console.warn(`[CrashReporter] Crash reported: ${error.message}`);
      }

      // In production, send to crash reporting service
      if (!APP_CONFIG.DEBUG) {
        await this.sendCrashReport(crashReport);
      }
    } finally {
      this.isReporting = false;
    }
  }

  // Save crashes to AsyncStorage
  private async saveCrashesToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.crashes));
    } catch (error) {
      // Don't use AppLogger here to avoid infinite loops
      if (APP_CONFIG.DEBUG) {
        console.warn('Failed to save crashes to storage:', error);
      }
    }
  }

  // Load crashes from AsyncStorage
  private async loadCrashesFromStorage(): Promise<void> {
    try {
      const crashesJson = await AsyncStorage.getItem(this.storageKey);
      if (crashesJson) {
        this.crashes = JSON.parse(crashesJson);
      }
    } catch (error) {
      // Don't use AppLogger here to avoid infinite loops
      if (APP_CONFIG.DEBUG) {
        console.warn('Failed to load crashes from storage:', error);
      }
    }
  }

  // Send crash report to external service (placeholder)
  private async sendCrashReport(crashReport: CrashReport): Promise<void> {
    try {
      // In a real app, you would send to services like:
      // - Sentry
      // - Crashlytics
      // - Bugsnag
      // - Custom endpoint

      // Example implementation:
      // await fetch('https://your-crash-reporting-endpoint.com/crashes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(crashReport),
      // });

      if (APP_CONFIG.DEBUG) {
        // eslint-disable-next-line no-console
        console.log(`[CrashReporter] Crash report sent: ${crashReport.id}`);
      }
    } catch (error) {
      if (APP_CONFIG.DEBUG) {
        console.warn('Failed to send crash report:', error);
      }
    }
  }

  // Get all crash reports
  getCrashReports(): CrashReport[] {
    return [...this.crashes];
  }

  // Get recent crashes (last 24 hours)
  getRecentCrashes(): CrashReport[] {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return this.crashes.filter(crash => crash.timestamp > oneDayAgo);
  }

  // Get crash statistics
  getCrashStats(): {
    total: number;
    recent: number;
    mostCommon: string[];
    byScreen: Record<string, number>;
  } {
    const recent = this.getRecentCrashes();

    // Count crashes by error message
    const errorCounts: Record<string, number> = {};
    const screenCounts: Record<string, number> = {};

    this.crashes.forEach(crash => {
      const errorKey = `${crash.error.name}: ${crash.error.message}`;
      errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;

      if (crash.context.screen) {
        screenCounts[crash.context.screen] =
          (screenCounts[crash.context.screen] || 0) + 1;
      }
    });

    const mostCommon = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error);

    return {
      total: this.crashes.length,
      recent: recent.length,
      mostCommon,
      byScreen: screenCounts,
    };
  }

  // Clear all crash reports
  async clearCrashReports(): Promise<void> {
    this.crashes = [];
    await AsyncStorage.removeItem(this.storageKey);
    if (APP_CONFIG.DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[CrashReporter] Cleared all crash reports');
    }
  }

  // Export crashes for debugging
  exportCrashes(): string {
    return JSON.stringify(this.crashes, null, 2);
  }

  // Test crash reporting
  testCrash(): void {
    const testError = new Error('Test crash for debugging');
    this.reportCrash(testError, 'Manual Test', { screen: 'Debug Screen' });
  }
}

export const crashReporter = CrashReporter.getInstance();

// React hook for crash reporting
export const useCrashReporter = () => {
  const [crashes, setCrashes] = React.useState<CrashReport[]>([]);
  const [stats, setStats] = React.useState<
    ReturnType<typeof crashReporter.getCrashStats>
  >({
    total: 0,
    recent: 0,
    mostCommon: [],
    byScreen: {},
  });

  React.useEffect(() => {
    const updateCrashes = () => {
      setCrashes(crashReporter.getCrashReports());
      setStats(crashReporter.getCrashStats());
    };

    updateCrashes();

    // Update periodically in debug mode
    let interval: NodeJS.Timeout;
    if (APP_CONFIG.DEBUG) {
      interval = setInterval(updateCrashes, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return {
    crashes,
    stats,
    recentCrashes: crashReporter.getRecentCrashes(),
    reportCrash: crashReporter.reportCrash.bind(crashReporter),
    clearCrashes: crashReporter.clearCrashReports.bind(crashReporter),
    exportCrashes: crashReporter.exportCrashes.bind(crashReporter),
    testCrash: crashReporter.testCrash.bind(crashReporter),
  };
};

// Higher-order component for crash boundary
export const withCrashReporting = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = React.forwardRef<unknown, P>((props, ref) => {
    React.useEffect(() => {
      // This is a simplified error boundary - in practice you'd use React Error Boundary
      // Note: We don't override console.error here to avoid conflicts with the global handler
      // The global crash reporter will catch errors automatically
      // Component-level error reporting is handled by the global crash reporter
    }, [props]);

    // Handle ref properly for forwardRef
    const componentProps = ref ? { ...props, ref } : props;
    return React.createElement(Component, componentProps as P);
  });

  WrappedComponent.displayName = `withCrashReporting(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
};
