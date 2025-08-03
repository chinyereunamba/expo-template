import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { HomeStackRouteProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const DetailsScreen: React.FC = () => {
  const route = useRoute<HomeStackRouteProp<'Details'>>();
  const { theme } = useTheme();
  const { id, title } = route.params;

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title || 'Details'}
            </Text>
            <Text style={[styles.id, { color: theme.colors.textSecondary }]}>
              ID: {id}
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Description
            </Text>
            <Text
              style={[
                styles.description,
                { color: theme.colors.textSecondary },
              ]}
            >
              This is a placeholder details screen. In a real application, this
              would display detailed information about the selected item with
              ID: {id}.
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Additional Information
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Additional content and functionality will be implemented in future
              tasks.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  id: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
