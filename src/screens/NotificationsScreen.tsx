import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/common/Card';
import { Screen } from '../components/common/Screen';

export const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Notifications
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Stay updated with your latest activity
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Notifications
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Notification system will be implemented in future tasks. This will
              show your recent notifications and updates.
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Notification Settings
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Notification preferences and settings will be available here.
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Activity Feed
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Your activity history and updates will be displayed here.
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
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
