import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeTabNavigationProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore, useAppStore } from '../../stores';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeTabNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { isOnline } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleViewDetails = () => {
    navigation.navigate('Details', {
      id: '1',
      title: 'Sample Details',
    });
  };

  const handleSearch = () => {
    navigation.navigate('Search');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Screen style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            {getGreeting()}
            {user?.name ? `, ${user.name}` : ''}!
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {!isOnline && (
            <View
              style={[
                styles.offlineIndicator,
                { backgroundColor: theme.colors.warning },
              ]}
            >
              <Text
                style={[styles.offlineText, { color: theme.colors.background }]}
              >
                Offline Mode
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.actionButtons}>
              <Button
                title='View Details'
                onPress={handleViewDetails}
                variant='primary'
                size='small'
                style={styles.actionButton}
              />
              <Button
                title='Search'
                onPress={handleSearch}
                variant='secondary'
                size='small'
                style={styles.actionButton}
              />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Recent Activity
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Activity feed will be implemented in future tasks
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Statistics
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Statistics dashboard will be implemented in future tasks
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
  greeting: {
    fontSize: 24,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
