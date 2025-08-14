import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import {
  FlatList,
  VirtualizedList as RNVirtualizedList,
  ListRenderItem,
  ViewStyle,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  itemHeight?: number;
  estimatedItemSize?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  emptyComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  error?: Error;
  onRetry?: () => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  numColumns?: number;
  horizontal?: boolean;
  windowSize?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  initialNumToRender?: number;
  removeClippedSubviews?: boolean;
  getItemLayout?: (
    data: T[] | null | undefined,
    index: number
  ) => {
    length: number;
    offset: number;
    index: number;
  };
}

/**
 * High-performance virtualized list component for large datasets
 */
export function VirtualizedList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  estimatedItemSize = 50,
  onEndReached,
  onEndReachedThreshold = 0.5,
  onRefresh,
  refreshing = false,
  loading = false,
  loadingMore = false,
  emptyComponent: EmptyComponent,
  errorComponent: ErrorComponent,
  error,
  onRetry,
  style,
  contentContainerStyle,
  numColumns = 1,
  horizontal = false,
  windowSize = 10,
  maxToRenderPerBatch = 10,
  updateCellsBatchingPeriod = 50,
  initialNumToRender = 10,
  removeClippedSubviews = true,
  getItemLayout,
}: VirtualizedListProps<T>) {
  const { theme } = useTheme();
  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const flatListRef = useRef<FlatList<T>>(null);

  // Optimize item layout calculation
  const optimizedGetItemLayout = useMemo(() => {
    if (getItemLayout) return getItemLayout;
    if (!itemHeight) return undefined;

    return (data: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [getItemLayout, itemHeight]);

  // Memoized render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback<ListRenderItem<T>>(
    ({ item, index }) => {
      const itemKey = keyExtractor(item, index);
      const isVisible = viewableItems.includes(itemKey);

      return (
        <View key={itemKey}>
          {renderItem({ item, index, separators: {} as any })}
        </View>
      );
    },
    [renderItem, keyExtractor, viewableItems]
  );

  // Track viewable items for performance optimization
  const onViewableItemsChanged = useCallback(
    ({ viewableItems: newViewableItems }: { viewableItems: any[] }) => {
      const visibleKeys = newViewableItems.map(item =>
        keyExtractor(item.item, item.index)
      );
      setViewableItems(visibleKeys);
    },
    [keyExtractor]
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 300,
    }),
    []
  );

  // Loading footer component
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View
        style={{
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size='small' color={theme.colors.primary} />
        <Text
          style={{
            marginTop: 8,
            color: theme.colors.textSecondary,
            fontSize: 12,
          }}
        >
          Loading more...
        </Text>
      </View>
    );
  }, [loadingMore, theme]);

  // Empty state component
  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: SCREEN_HEIGHT * 0.5,
          }}
        >
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text
            style={{
              marginTop: 16,
              color: theme.colors.textSecondary,
              fontSize: 16,
            }}
          >
            Loading...
          </Text>
        </View>
      );
    }

    if (error && ErrorComponent) {
      return <ErrorComponent error={error} retry={onRetry || (() => {})} />;
    }

    if (EmptyComponent) {
      return <EmptyComponent />;
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: SCREEN_HEIGHT * 0.3,
        }}
      >
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 16,
          }}
        >
          No items found
        </Text>
      </View>
    );
  }, [loading, error, ErrorComponent, EmptyComponent, onRetry, theme]);

  // Refresh control
  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
      />
    );
  }, [onRefresh, refreshing, theme]);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      style={style}
      contentContainerStyle={contentContainerStyle}
      numColumns={numColumns}
      horizontal={horizontal}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={refreshControl}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      getItemLayout={optimizedGetItemLayout}
      windowSize={windowSize}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      initialNumToRender={initialNumToRender}
      removeClippedSubviews={removeClippedSubviews}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      // Performance optimizations
      disableVirtualization={false}
      legacyImplementation={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
    />
  );
}

/**
 * Infinite scroll hook for paginated data
 */
export function useInfiniteScroll<T>(
  fetchData: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  initialPage = 1
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const loadData = useCallback(
    async (page: number, isRefresh = false) => {
      try {
        if (page === initialPage) {
          isRefresh ? setRefreshing(true) : setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const result = await fetchData(page);

        setData(prevData =>
          page === initialPage ? result.data : [...prevData, ...result.data]
        );
        setHasMore(result.hasMore);
        setCurrentPage(page);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [fetchData, initialPage]
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore) {
      loadData(currentPage + 1);
    }
  }, [loadData, currentPage, loadingMore, loading, hasMore]);

  const refresh = useCallback(() => {
    loadData(initialPage, true);
  }, [loadData, initialPage]);

  const retry = useCallback(() => {
    if (data.length === 0) {
      loadData(initialPage);
    } else {
      loadMore();
    }
  }, [data.length, loadData, initialPage, loadMore]);

  // Initial load
  React.useEffect(() => {
    loadData(initialPage);
  }, [loadData, initialPage]);

  return {
    data,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refresh,
    retry,
  };
}

/**
 * Memoized list item component for better performance
 */
export const MemoizedListItem = React.memo(
  <T extends any>(props: {
    item: T;
    index: number;
    renderContent: (item: T, index: number) => React.ReactNode;
  }) => {
    return <>{props.renderContent(props.item, props.index)}</>;
  }
);

/**
 * List performance monitor
 */
export class ListPerformanceMonitor {
  private static scrollMetrics = new Map<
    string,
    {
      scrollEvents: number;
      averageScrollSpeed: number;
      maxScrollSpeed: number;
    }
  >();

  static trackScrollPerformance(listId: string, scrollSpeed: number): void {
    const existing = this.scrollMetrics.get(listId) || {
      scrollEvents: 0,
      averageScrollSpeed: 0,
      maxScrollSpeed: 0,
    };

    existing.scrollEvents++;
    existing.averageScrollSpeed =
      (existing.averageScrollSpeed * (existing.scrollEvents - 1) +
        scrollSpeed) /
      existing.scrollEvents;
    existing.maxScrollSpeed = Math.max(existing.maxScrollSpeed, scrollSpeed);

    this.scrollMetrics.set(listId, existing);
  }

  static getPerformanceReport(): {
    listId: string;
    metrics: {
      scrollEvents: number;
      averageScrollSpeed: number;
      maxScrollSpeed: number;
    };
  }[] {
    return Array.from(this.scrollMetrics.entries()).map(
      ([listId, metrics]) => ({
        listId,
        metrics,
      })
    );
  }

  static clearMetrics(): void {
    this.scrollMetrics.clear();
  }
}
