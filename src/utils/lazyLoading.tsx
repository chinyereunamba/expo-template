import React, { Suspense, ComponentType } from 'react';
import { Loading } from '../components/common/Loading';

/**
 * Higher-order component for lazy loading screens with a loading fallback
 */
export function withLazyLoading<T extends object>(
  LazyComponent: React.LazyExoticComponent<ComponentType<T>>,
  fallback?: React.ComponentType
): React.ComponentType<T> {
  const FallbackComponent = fallback || Loading;

  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Create a lazy-loaded screen component
 */
export function createLazyScreen<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ComponentType
): React.ComponentType<T> {
  const LazyComponent = React.lazy(importFn);
  return withLazyLoading(LazyComponent, fallback);
}

/**
 * Preload a lazy component to improve perceived performance
 */
export function preloadLazyComponent<T extends object>(
  LazyComponent: React.LazyExoticComponent<ComponentType<T>>
): void {
  // Trigger the import to start loading the component
  const componentImport = (LazyComponent as any)._payload._result;
  if (!componentImport) {
    (LazyComponent as any)._payload._result = (
      LazyComponent as any
    )._payload._fn();
  }
}
