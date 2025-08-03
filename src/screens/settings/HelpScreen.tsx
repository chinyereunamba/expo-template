import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const HelpScreen: React.FC = () => {
  const { theme } = useTheme();

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    console.log('Contact support');
  };

  const handleReportBug = () => {
    // TODO: Implement bug reporting functionality
    console.log('Report bug');
  };

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Help & Support
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Get help and support for the app
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Frequently Asked Questions
            </Text>

            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: theme.colors.text }]}>
                How do I change my password?
              </Text>
              <Text
                style={[styles.answer, { color: theme.colors.textSecondary }]}
              >
                Go to Profile → Change Password to update your account password.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: theme.colors.text }]}>
                How do I switch between light and dark theme?
              </Text>
              <Text
                style={[styles.answer, { color: theme.colors.textSecondary }]}
              >
                Go to Settings and tap the "Toggle" button next to Theme.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: theme.colors.text }]}>
                How do I log out of my account?
              </Text>
              <Text
                style={[styles.answer, { color: theme.colors.textSecondary }]}
              >
                Go to Profile and tap the "Sign Out" button at the bottom.
              </Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Contact Support
            </Text>
            <Text
              style={[
                styles.contactText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Need more help? Our support team is here to assist you.
            </Text>
            <View style={styles.buttonGroup}>
              <Button
                title='Contact Support'
                onPress={handleContactSupport}
                variant='primary'
                style={styles.button}
              />
              <Button
                title='Report a Bug'
                onPress={handleReportBug}
                variant='secondary'
                style={styles.button}
              />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Resources
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Additional resources and documentation links will be added here.
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
  subtitle: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    marginBottom: 0,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
