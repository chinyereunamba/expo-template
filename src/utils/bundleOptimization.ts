/**
 * Bundle optimization utilities and configuration
 */

/**
 * Dynamic import wrapper with error handling and retry logic
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on syntax errors or other non-network errors
      if (error instanceof SyntaxError) {
        throw error;
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

/**
 * Module preloader for critical chunks
 */
export class ModulePreloader {
  private static preloadedModules = new Set<string>();
  private static preloadPromises = new Map<string, Promise<any>>();

  /**
   * Preload a module without executing it
   */
  static async preload<T>(
    moduleId: string,
    importFn: () => Promise<T>
  ): Promise<void> {
    if (this.preloadedModules.has(moduleId)) {
      return;
    }

    if (!this.preloadPromises.has(moduleId)) {
      const promise = dynamicImport(importFn).then(module => {
        this.preloadedModules.add(moduleId);
        return module;
      });
      this.preloadPromises.set(moduleId, promise);
    }

    try {
      await this.preloadPromises.get(moduleId);
    } catch (error) {
      // Remove failed preload attempts
      this.preloadPromises.delete(moduleId);
      throw error;
    }
  }

  /**
   * Get a preloaded module or load it dynamically
   */
  static async getModule<T>(
    moduleId: string,
    importFn: () => Promise<T>
  ): Promise<T> {
    const existingPromise = this.preloadPromises.get(moduleId);
    if (existingPromise) {
      return existingPromise;
    }

    return dynamicImport(importFn);
  }

  /**
   * Clear preload cache
   */
  static clearCache(): void {
    this.preloadedModules.clear();
    this.preloadPromises.clear();
  }
}

/**
 * Bundle size analyzer for development
 */
export class BundleAnalyzer {
  private static moduleLoadTimes = new Map<string, number>();
  private static moduleSizes = new Map<string, number>();

  static recordModuleLoad(moduleId: string, startTime: number): void {
    const loadTime = Date.now() - startTime;
    this.moduleLoadTimes.set(moduleId, loadTime);
  }

  static recordModuleSize(moduleId: string, size: number): void {
    this.moduleSizes.set(moduleId, size);
  }

  static getLoadTimeReport(): { module: string; loadTime: number }[] {
    return Array.from(this.moduleLoadTimes.entries())
      .map(([module, loadTime]) => ({ module, loadTime }))
      .sort((a, b) => b.loadTime - a.loadTime);
  }

  static getSizeReport(): { module: string; size: number }[] {
    return Array.from(this.moduleSizes.entries())
      .map(([module, size]) => ({ module, size }))
      .sort((a, b) => b.size - a.size);
  }

  static getTotalBundleSize(): number {
    return Array.from(this.moduleSizes.values()).reduce(
      (total, size) => total + size,
      0
    );
  }
}

/**
 * Code splitting strategies
 */
export const CodeSplittingStrategy = {
  /**
   * Split by route/screen
   */
  BY_ROUTE: 'route',

  /**
   * Split by feature
   */
  BY_FEATURE: 'feature',

  /**
   * Split by vendor libraries
   */
  BY_VENDOR: 'vendor',

  /**
   * Split by usage frequency
   */
  BY_USAGE: 'usage',
} as const;

/**
 * Chunk loading priorities
 */
export const ChunkPriority = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
} as const;

export type ChunkPriorityType =
  (typeof ChunkPriority)[keyof typeof ChunkPriority];

/**
 * Intelligent chunk loader with priority-based loading
 */
export class ChunkLoader {
  private static loadQueue: {
    id: string;
    priority: ChunkPriorityType;
    loader: () => Promise<any>;
  }[] = [];

  private static isLoading = false;
  private static maxConcurrentLoads = 3;
  private static activeLoads = 0;

  static addToQueue(
    id: string,
    loader: () => Promise<any>,
    priority: ChunkPriorityType = ChunkPriority.NORMAL
  ): void {
    // Remove existing entry if present
    this.loadQueue = this.loadQueue.filter(item => item.id !== id);

    // Add to queue with priority
    this.loadQueue.push({ id, priority, loader });

    // Sort by priority
    this.loadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    this.processQueue();
  }

  private static async processQueue(): Promise<void> {
    if (this.isLoading || this.activeLoads >= this.maxConcurrentLoads) {
      return;
    }

    const nextItem = this.loadQueue.shift();
    if (!nextItem) {
      return;
    }

    this.isLoading = true;
    this.activeLoads++;

    try {
      const startTime = Date.now();
      await nextItem.loader();
      BundleAnalyzer.recordModuleLoad(nextItem.id, startTime);
    } catch (error) {
      console.warn(`Failed to load chunk ${nextItem.id}:`, error);
    } finally {
      this.activeLoads--;
      this.isLoading = false;

      // Process next item in queue
      if (this.loadQueue.length > 0) {
        setTimeout(() => this.processQueue(), 0);
      }
    }
  }
}

/**
 * Tree shaking utilities for unused code elimination
 */
export const TreeShakingUtils = {
  /**
   * Mark functions as side-effect free for better tree shaking
   */
  markAsPure: <T extends (...args: any[]) => any>(fn: T): T => {
    // In production builds, this would be handled by bundler annotations
    return fn;
  },

  /**
   * Conditional imports based on environment
   */
  conditionalImport: async <T>(
    condition: boolean,
    importFn: () => Promise<T>
  ): Promise<T | null> => {
    if (!condition) {
      return null;
    }
    return dynamicImport(importFn);
  },
};

/**
 * Performance budget checker
 */
export class PerformanceBudget {
  private static budgets = {
    initialBundle: 500 * 1024, // 500KB
    asyncChunk: 200 * 1024, // 200KB
    totalBundle: 2 * 1024 * 1024, // 2MB
  };

  static checkBudget(
    type: keyof typeof PerformanceBudget.budgets,
    size: number
  ): boolean {
    const budget = this.budgets[type];
    const isWithinBudget = size <= budget;

    if (!isWithinBudget) {
      console.warn(
        `Performance budget exceeded for ${type}: ${size} bytes (budget: ${budget} bytes)`
      );
    }

    return isWithinBudget;
  }

  static setBudget(
    type: keyof typeof PerformanceBudget.budgets,
    size: number
  ): void {
    this.budgets[type] = size;
  }

  static getBudgets(): typeof PerformanceBudget.budgets {
    return { ...this.budgets };
  }
}
