import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../stores';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const AboutScreen: React.FC = () => {
  const { theme } = useTheme();
  const { appVersion, buildNumber } = useAppStore();

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={[styles.appName, { color: theme.colors.text }]}>
                Expo Mobile Skeleton
              </Text>
              <Text
                style={[styles.version, { color: theme.colors.textSecondary }]}
              >
                Version {appVersion} ({buildNumber})
              </Text>
            </View>
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
              A scalable foundation for mobile applications built with Expo
              React Native. This skeleton provides a well-structured starting
              point with navigation, state management, theming, and essential
              components.
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Features
            </Text>
            <View style={styles.featuresList}>
              <Text
                style={[styles.feature, { color: theme.colors.textSecondary }]}
              >
                • TypeScript support
              </Text>
              <Text
                style={[styles.feature, { color: theme.colors.textSecondary }]}
              >
                • React Navigation 6
              </Text>
              <Text
                style={[styles.feature, { color: theme.colors.textSecondary }]}
              >
                • Zustand state management
              </Text>
              <Text
                style={[styles.feature, { color: theme.colors.textSecondary }]}
              >
                • Theme system with dark/light mode
              </Text>
              <Text
                style={[styles.feature, { color: theme.colors.textSecondary }]}
              >
                • Component library
              </Text>
              <Text
                style={[styles.feature, { color: theme.colors.textSecondary }]}
              >
                • Authentication flow
              </Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Technology Stack
            </Text>
            <View style={styles.techList}>
              <Text
                style={[styles.tech, { color: theme.colors.textSecondary }]}
              >
                Expo SDK 50+
              </Text>
              <Text
                style={[styles.tech, { color: theme.colors.textSecondary }]}
              >
                React Native
              </Text>
              <Text
                style={[styles.tech, { color: theme.colors.textSecondary }]}
              >
                TypeScript
              </Text>
              <Text
                style={[styles.tech, { color: theme.colors.textSecondary }]}
              >
                Zustand
              </Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text
              style={[styles.copyright, { color: theme.colors.textTertiary }]}
            >
              © 2024 Expo Mobile Skeleton
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
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
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
  featuresList: {
    gap: 8,
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
  },
  techList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tech: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
