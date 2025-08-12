import React, { useState, useCallback } from 'react';
import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: React.ReactNode;
  errorComponent?: React.ReactNode;
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  style?: StyleProp<ImageStyle>;
  width?: number;
  height?: number;
  borderRadius?: number;
  showLoadingIndicator?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

/**
 * Optimized image component with caching and loading states
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  placeholder,
  errorComponent,
  cachePolicy = 'memory-disk',
  resizeMode = 'cover',
  style,
  width,
  height,
  borderRadius,
  showLoadingIndicator = true,
  onLoadStart,
  onLoadEnd,
  onError,
  ...props
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback(
    (error: any) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(error);
    },
    [onError]
  );

  const imageStyle: StyleProp<ImageStyle> = [
    {
      width,
      height,
      borderRadius,
    },
    style,
  ];

  const containerStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  if (hasError) {
    return (
      <View style={[containerStyle, style]}>
        {errorComponent || (
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            Failed to load image
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Image
        {...props}
        source={source}
        style={imageStyle}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />

      {isLoading && showLoadingIndicator && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius,
          }}
        >
          {placeholder || (
            <ActivityIndicator size='small' color={theme.colors.primary} />
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Image cache manager for manual cache control
 */
export class ImageCacheManager {
  private static cache = new Map<string, string>();
  private static maxCacheSize = 50; // Maximum number of cached images

  static getCachedImage(uri: string): string | undefined {
    return this.cache.get(uri);
  }

  static setCachedImage(uri: string, cachedUri: string): void {
    // Simple LRU implementation
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(uri, cachedUri);
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Hook for image preloading
 */
export const useImagePreloader = () => {
  const preloadImages = useCallback(async (imageUris: string[]) => {
    const preloadPromises = imageUris.map(uri => {
      return new Promise<void>((resolve, reject) => {
        Image.prefetch(uri)
          .then(() => resolve())
          .catch(reject);
      });
    });

    try {
      await Promise.all(preloadPromises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }, []);

  return { preloadImages };
};
