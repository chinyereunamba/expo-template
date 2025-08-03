import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { HomeStackRouteProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const SearchScreen: React.FC = () => {
  const route = useRoute<HomeStackRouteProp<'Search'>>();
  const { theme } = useTheme();
  const initialQuery = route.params?.query || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  return (
    <Screen style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder='Search...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          style={styles.searchInput}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery ? (
          <Card style={styles.card}>
            <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>
              Search Results for "{searchQuery}"
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Search functionality will be implemented in future tasks. This
              would show filtered results based on the query.
            </Text>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Start Searching
            </Text>
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              Enter a search term above to find what you're looking for.
            </Text>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Searches
          </Text>
          <Text
            style={[styles.placeholder, { color: theme.colors.textSecondary }]}
          >
            Recent search history will be displayed here.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Popular Searches
          </Text>
          <Text
            style={[styles.placeholder, { color: theme.colors.textSecondary }]}
          >
            Popular search terms will be displayed here.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
