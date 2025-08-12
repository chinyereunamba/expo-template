import { AppLogger } from './logger';
import { APP_CONFIG } from '@/config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  appState: any;
}

class CrashReporter {
  private static instance: CrashReporter;
  private crashes: CrashReport[] = [];
  private maxCrashes = 50;
  private storageKey = '@crash_reports';

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
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', event => {
        this.reportCrash(
          new Error(`Unhandled Promise Rejection: ${event.reason}`),
          'Global Promise Rejection'
        );
      });
    }

    // Handle global errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this looks like an error
      if (
        args[0] instanceof Error ||
        (typeof args[0] === 'string' && args[0].includes('Error'))
      ) {
        const error = args[0] instanceof Error ? args[0] : new Error(args[0]);
        this.reportCrash(error, 'Console Error');
      }
      originalConsoleError.apply(console, args);
    };
  }

  // Generate unique crash ID
  private generateCrashId(): string {
    return `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get device information
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent || 'Unknown',
      language: navigator.language || 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    };
  }

  // Report a crash
  async reportCrash(
    error: Error,
    context?: string,
    additionalData?: any
  ): Promise<void> {
    const crashReport: CrashReport = {
      id: this.generateCrashId(),
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack || undefined,
      },
      context: {
        screen: additionalData?.screen || undefined,
        action: context || undefined,
        userId: additionalData?.userId || undefined,
        appVersion: APP_CONFIG.VERSION,
        platform: 'React Native',
      },
      deviceInfo: this.getDeviceInfo(),
      appState: additionalData?.appState,
    };

    // Add to crashes array
    this.crashes.unshift(crashReport);

    // Keep only the most recent crashes
    if (this.crashes.length > this.maxCrashes) {
      this.crashes = this.crashes.slice(0, this.maxCrashes);
    }

    // Save to storage
    await this.saveCrashesToStorage();

    // Log the crash
    AppLogger.setContext('CrashReporter').error(
      `Crash reported: ${error.message}`,
      crashReport
    );

    // In production, send to crash reporting service
    if (!APP_CONFIG.DEBUG) {
      await this.sendCrashReport(crashReport);
    }
  }

  // Save crashes to AsyncStorage
  private async saveCrashesToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.crashes));
    } catch (error) {
      AppLogger.setContext('CrashReporter').error(
        'Failed to save crashes to storage',
        error
      );
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
      AppLogger.setContext('CrashReporter').error(
        'Failed to load crashes from storage',
        error
      );
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

      AppLogger.setContext('CrashReporter').debug(
        'Crash report sent',
        crashReport.id
      );
    } catch (error) {
      AppLogger.setContext('CrashReporter').error(
        'Failed to send crash report',
        error
      );
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
      const errorKey = crash.error.name + ': ' + crash.error.message;
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
    AppLogger.setContext('CrashReporter').debug('Cleared all crash reports');
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
  const [stats, setStats] = React.useState<any>({});

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
  return React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      const handleError = (error: Error) => {
        crashReporter.reportCrash(
          error,
          `Component: ${componentName || Component.name}`,
          {
            screen: componentName || Component.name,
            props: props,
          }
        );
      };

      // This is a simplified error boundary - in practice you'd use React Error Boundary
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args[0] instanceof Error) {
          handleError(args[0]);
        }
        originalConsoleError.apply(console, args);
      };

      return () => {
        console.error = originalConsoleError;
      };
    }, [props]);

    return React.createElement(Component, props as any, ref);
  });
};

// Add React import
import React from 'react';
