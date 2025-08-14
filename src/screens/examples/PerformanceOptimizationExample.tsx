import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  VirtualizedList,
  useInfiniteScroll,
} from '../../components/common/VirtualizedList';
import { OptimizedImage } from '../../components/common/OptimizedImage';

interface ListItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const PerformanceOptimizationExample: React.FC = () => {
  const { theme } = useTheme();
  const performance = usePerformanceOptimization(
    'PerformanceOptimizationExample'
  );
  const [showMetrics, setShowMetrics] = useState(false);
  const [showLargeList, setShowLargeList] = useState(false);

  // Mock data generator for infinite scroll
  const generateMockData = useCallback(
    async (
      page: number
    ): Promise<{
      data: ListItem[];
      hasMore: boolean;
    }> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const pageSize = 20;
      const startIndex = (page - 1) * pageSize;
      const data: ListItem[] = [];

      for (let i = 0; i < pageSize; i++) {
        const index = startIndex + i;
        data.push({
          id: `item-${index}`,
          title: `Item ${index + 1}`,
          description: `This is the description for item ${index + 1}. It contains some sample text to demonstrate list performance.`,
          imageUrl: `https://picsum.photos/100/100?random=${index}`,
        });
      }

      return {
        data,
        hasMore: page < 10, // Limit to 10 pages for demo
      };
    },
    []
  );

  const infiniteScroll = useInfiniteScroll(generateMockData);

  // Memoized list item renderer
  const renderListItem = useCallback(
    ({ item }: { item: ListItem }) => (
      <Card style={styles.listItem}>
        <View style={styles.listItemContent}>
          <OptimizedImage
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            width={60}
            height={60}
            borderRadius={8}
          />
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text
              style={[
                styles.itemDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </Card>
    ),
    [theme]
  );

  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  // Performance metrics display
  const performanceMetrics = useMemo(() => {
    if (!showMetrics) return null;

    const metrics = performance.getPerformanceMetrics();
    const recommendations = performance.getOptimizationRecommendations();

    return (
      <Card style={styles.metricsCard}>
        <Text style={[styles.metricsTitle, { color: theme.colors.text }]}>
          Performance Metrics
        </Text>

        <View style={styles.metricsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Memory Usage
          </Text>
          <Text
            style={[styles.metricText, { color: theme.colors.textSecondary }]}
          >
            Active Listeners: {metrics.memory.activeListeners}
          </Text>
          <Text
            style={[styles.metricText, { color: theme.colors.textSecondary }]}
          >
            Active Timers: {metrics.memory.activeTimers}
          </Text>
          <Text
            style={[styles.metricText, { color: theme.colors.textSecondary }]}
          >
            Memory Trend: {metrics.memory.usage.trend}
          </Text>
        </View>

        <View style={styles.metricsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Rendering Performance
          </Text>
          <Text
            style={[styles.metricText, { color: theme.colors.textSecondary }]}
          >
            Render Count: {metrics.rendering.renderCount}
          </Text>
          <Text
            style={[styles.metricText, { color: theme.colors.textSecondary }]}
          >
            Avg Render Time: {metrics.rendering.averageRenderTime.toFixed(2)}ms
          </Text>
          <Text
            style={[styles.metricText, { color: theme.colors.textSecondary }]}
          >
            Max Render Time: {metrics.rendering.maxRenderTime}ms
          </Text>
        </View>

        {recommendations.length > 0 && (
          <View style={styles.metricsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recommendations
            </Text>
            {recommendations.map((rec, index) => (
              <Text
                key={index}
                style={[
                  styles.recommendationText,
                  { color: theme.colors.warning },
                ]}
              >
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </Card>
    );
  }, [showMetrics, performance, theme]);

  const handlePreloadModule = useCallback(async () => {
    try {
      await performance.preloadModule(
        'example-module',
        () => import('../../components/examples/ApiExample'),
        'HIGH'
      );
      Alert.alert('Success', 'Module preloaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to preload module');
    }
  }, [performance]);

  const handleClearMetrics = useCallback(() => {
    performance.clearPerformanceData();
    Alert.alert('Success', 'Performance data cleared!');
  }, [performance]);

  return (
    <Screen
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Performance Optimization Demo
        </Text>

        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          This screen demonstrates various performance optimization techniques
          including lazy loading, image optimization, virtualized lists, and
          memory leak detection.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title={showMetrics ? 'Hide Metrics' : 'Show Metrics'}
            onPress={() => setShowMetrics(!showMetrics)}
            style={styles.button}
          />

          <Button
            title='Preload Module'
            onPress={handlePreloadModule}
            style={styles.button}
          />

          <Button
            title='Clear Metrics'
            onPress={handleClearMetrics}
            style={styles.button}
          />
        </View>

        {performanceMetrics}

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Virtualized List Demo
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            This demonstrates efficient rendering of large datasets using
            virtualization.
          </Text>

          <Button
            title={showLargeList ? 'Hide List' : 'Show Large List'}
            onPress={() => setShowLargeList(!showLargeList)}
            style={styles.button}
          />

          {showLargeList && (
            <View style={styles.listContainer}>
              <VirtualizedList
                data={infiniteScroll.data}
                renderItem={renderListItem}
                keyExtractor={keyExtractor}
                onEndReached={infiniteScroll.loadMore}
                onRefresh={infiniteScroll.refresh}
                refreshing={infiniteScroll.refreshing}
                loading={infiniteScroll.loading}
                loadingMore={infiniteScroll.loadingMore}
                error={infiniteScroll.error}
                onRetry={infiniteScroll.retry}
                estimatedItemSize={100}
                style={styles.list}
              />
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Optimized Images
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            These images use caching and optimization strategies for better
            performance.
          </Text>

          <View style={styles.imageGrid}>
            {[1, 2, 3, 4].map(index => (
              <OptimizedImage
                key={index}
                source={{
                  uri: `https://picsum.photos/150/150?random=${index + 100}`,
                }}
                style={styles.gridImage}
                width={150}
                height={150}
                borderRadius={12}
                showLoadingIndicator
              />
            ))}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  container: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  gridImage: {
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemImage: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    height: 400,
    marginTop: 16,
  },
  listItem: {
    marginBottom: 8,
    padding: 12,
  },
  listItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  metricText: {
    fontSize: 14,
    marginBottom: 4,
  },
  metricsCard: {
    marginBottom: 24,
    padding: 16,
  },
  metricsSection: {
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recommendationText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
