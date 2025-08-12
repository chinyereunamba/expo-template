/**
 * Image optimization utilities for better performance
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OptimizedImageConfig {
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Calculate optimal image dimensions while maintaining aspect ratio
 */
export function calculateOptimalDimensions(
  originalDimensions: ImageDimensions,
  maxDimensions: ImageDimensions
): ImageDimensions {
  const { width: originalWidth, height: originalHeight } = originalDimensions;
  const { width: maxWidth, height: maxHeight } = maxDimensions;

  const aspectRatio = originalWidth / originalHeight;

  let newWidth = originalWidth;
  let newHeight = originalHeight;

  // Scale down if image is larger than max dimensions
  if (originalWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * Generate optimized image URL for different screen densities
 */
export function generateResponsiveImageUrl(
  baseUrl: string,
  screenWidth: number,
  config: OptimizedImageConfig = {}
): string {
  const { quality = 0.8, format = 'jpeg', maxWidth } = config;

  // Determine optimal width based on screen size
  let targetWidth = screenWidth;
  if (maxWidth && targetWidth > maxWidth) {
    targetWidth = maxWidth;
  }

  // For high-density screens, we might want to load higher resolution
  const pixelRatio = 2; // Could be dynamic based on device
  const optimizedWidth = Math.round(targetWidth * pixelRatio);

  // This would typically integrate with a CDN or image service
  // For now, we'll return the original URL with query parameters
  const params = new URLSearchParams({
    w: optimizedWidth.toString(),
    q: Math.round(quality * 100).toString(),
    f: format,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Image loading strategies for different use cases
 */
export const ImageLoadingStrategy = {
  /**
   * Eager loading for above-the-fold images
   */
  EAGER: 'eager',

  /**
   * Lazy loading for below-the-fold images
   */
  LAZY: 'lazy',

  /**
   * Preload critical images
   */
  PRELOAD: 'preload',
} as const;

export type ImageLoadingStrategyType =
  (typeof ImageLoadingStrategy)[keyof typeof ImageLoadingStrategy];

/**
 * Image cache configuration
 */
export interface ImageCacheConfig {
  maxMemoryCache: number; // in MB
  maxDiskCache: number; // in MB
  cacheTimeout: number; // in milliseconds
}

export const DEFAULT_CACHE_CONFIG: ImageCacheConfig = {
  maxMemoryCache: 50, // 50MB
  maxDiskCache: 200, // 200MB
  cacheTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Utility to determine if an image should be cached based on its characteristics
 */
export function shouldCacheImage(
  imageUrl: string,
  imageSizeBytes?: number
): boolean {
  // Don't cache very large images (>5MB)
  if (imageSizeBytes && imageSizeBytes > 5 * 1024 * 1024) {
    return false;
  }

  // Don't cache images with dynamic parameters that change frequently
  const url = new URL(imageUrl);
  const dynamicParams = ['timestamp', 'rand', 'cache_bust'];
  const hasDynamicParams = dynamicParams.some(param =>
    url.searchParams.has(param)
  );

  if (hasDynamicParams) {
    return false;
  }

  return true;
}

/**
 * Image placeholder generation for better perceived performance
 */
export function generateImagePlaceholder(
  width: number,
  height: number,
  backgroundColor = '#f0f0f0'
): string {
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">
        Loading...
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Performance monitoring for image loading
 */
export class ImagePerformanceMonitor {
  private static loadTimes = new Map<string, number>();
  private static failedLoads = new Set<string>();

  static recordLoadStart(imageUrl: string): void {
    this.loadTimes.set(imageUrl, Date.now());
  }

  static recordLoadEnd(imageUrl: string): void {
    const startTime = this.loadTimes.get(imageUrl);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      console.log(`Image loaded in ${loadTime}ms: ${imageUrl}`);
      this.loadTimes.delete(imageUrl);
    }
  }

  static recordLoadError(imageUrl: string): void {
    this.failedLoads.add(imageUrl);
    this.loadTimes.delete(imageUrl);
  }

  static getFailedLoads(): string[] {
    return Array.from(this.failedLoads);
  }

  static clearMetrics(): void {
    this.loadTimes.clear();
    this.failedLoads.clear();
  }
}
