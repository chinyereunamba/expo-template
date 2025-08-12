import { StateCreator } from 'zustand';
import { AppLogger } from './logger';
import { APP_CONFIG } from '@/config/environment';

// Add React import
import React from 'react';

// Zustand devtools middleware for development
export const devtools = <T>(
  f: StateCreator<T>,
  name?: string
): StateCreator<T> => {
  return (set, get, api) => {
    const logger = AppLogger.setContext(`Store:${name || 'Unknown'}`);

    // Enhanced set function with logging
    const enhancedSet: typeof set = (partial, replace) => {
      if (APP_CONFIG.DEBUG) {
        const prevState = get();

        // Call original set
        set(partial, replace);

        const newState = get();
        const action =
          typeof partial === 'function' ? 'Function Update' : 'State Update';

        logger.logStateChange(name || 'Store', action, prevState, newState);

        // Log specific changes
        if (typeof partial === 'object' && partial !== null) {
          const changes = Object.keys(partial);
          logger.debug(`State changes: ${changes.join(', ')}`, partial);
        }
      } else {
        set(partial, replace);
      }
    };

    return f(enhancedSet, get, api);
  };
};

// State inspector utility
export class StateInspector {
  private static instance: StateInspector;
  private stores: Map<string, any> = new Map();
  private listeners: Map<string, ((state: any) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): StateInspector {
    if (!StateInspector.instance) {
      StateInspector.instance = new StateInspector();
    }
    return StateInspector.instance;
  }

  // Register a store for inspection
  registerStore(name: string, store: any): void {
    this.stores.set(name, store);

    if (APP_CONFIG.DEBUG) {
      AppLogger.setContext('StateInspector').debug(`Registered store: ${name}`);
    }
  }

  // Get current state of a store
  getStoreState(name: string): any {
    const store = this.stores.get(name);
    return store ? store.getState() : null;
  }

  // Get all store states
  getAllStates(): Record<string, any> {
    const states: Record<string, any> = {};
    this.stores.forEach((store, name) => {
      states[name] = store.getState();
    });
    return states;
  }

  // Subscribe to store changes
  subscribe(storeName: string, listener: (state: any) => void): () => void {
    if (!this.listeners.has(storeName)) {
      this.listeners.set(storeName, []);
    }

    const storeListeners = this.listeners.get(storeName)!;
    storeListeners.push(listener);

    // Subscribe to the actual store
    const store = this.stores.get(storeName);
    if (store) {
      const unsubscribe = store.subscribe(listener);

      return () => {
        unsubscribe();
        const index = storeListeners.indexOf(listener);
        if (index > -1) {
          storeListeners.splice(index, 1);
        }
      };
    }

    return () => {
      const index = storeListeners.indexOf(listener);
      if (index > -1) {
        storeListeners.splice(index, 1);
      }
    };
  }

  // Export state for debugging
  exportState(): string {
    const allStates = this.getAllStates();
    return JSON.stringify(allStates, null, 2);
  }

  // Import state (for testing/debugging)
  importState(stateJson: string): void {
    try {
      const states = JSON.parse(stateJson);

      Object.entries(states).forEach(([storeName, state]) => {
        const store = this.stores.get(storeName);
        if (store && store.setState) {
          store.setState(state);
          AppLogger.setContext('StateInspector').debug(
            `Imported state for ${storeName}`
          );
        }
      });
    } catch (error) {
      AppLogger.setContext('StateInspector').error(
        'Failed to import state',
        error
      );
    }
  }

  // Reset all stores to initial state
  resetAllStores(): void {
    this.stores.forEach((store, name) => {
      if (store.reset) {
        store.reset();
        AppLogger.setContext('StateInspector').debug(`Reset store: ${name}`);
      }
    });
  }

  // Get store statistics
  getStoreStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    this.stores.forEach((store, name) => {
      const state = store.getState();
      stats[name] = {
        keys: Object.keys(state).length,
        size: JSON.stringify(state).length,
        hasSubscribers: (this.listeners.get(name)?.length || 0) > 0,
      };
    });

    return stats;
  }
}

export const stateInspector = StateInspector.getInstance();

// React hook for state inspection
export const useStateInspector = () => {
  const [allStates, setAllStates] = React.useState<Record<string, any>>({});
  const [stats, setStats] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    const updateStates = () => {
      setAllStates(stateInspector.getAllStates());
      setStats(stateInspector.getStoreStats());
    };

    // Update initially
    updateStates();

    // Set up interval to update periodically in debug mode
    let interval: NodeJS.Timeout;
    if (APP_CONFIG.DEBUG) {
      interval = setInterval(updateStates, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return {
    states: allStates,
    stats,
    exportState: stateInspector.exportState.bind(stateInspector),
    importState: stateInspector.importState.bind(stateInspector),
    resetAllStores: stateInspector.resetAllStores.bind(stateInspector),
  };
};

// Performance monitoring for state updates
export const withStatePerformanceMonitoring = <T>(
  storeCreator: StateCreator<T>,
  storeName: string
): StateCreator<T> => {
  return (set, get, api) => {
    const enhancedSet: typeof set = (partial, replace) => {
      const timer = AppLogger.startTimer(`State Update: ${storeName}`);
      set(partial, replace);
      timer();
    };

    return storeCreator(enhancedSet, get, api);
  };
};
