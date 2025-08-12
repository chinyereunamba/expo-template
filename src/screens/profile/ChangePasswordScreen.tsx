import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const ChangePasswordScreen: React.FC = () => {
  const { theme } = useTheme();

  const handleChangePassword = () => {
    // TODO: Implement change password logic in task 10
    console.log('Change password');
  };

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Change Password
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Update your account password
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Password Requirements
            </Text>
            <View style={styles.requirementsList}>
              <Text
                style={[
                  styles.requirement,
                  { color: theme.colors.textSecondary },
                ]}
              >
                • At least 8 characters long
              </Text>
              <Text
                style={[
                  styles.requirement,
                  { color: theme.colors.textSecondary },
                ]}
              >
                • Contains uppercase and lowercase letters
              </Text>
              <Text
                style={[
                  styles.requirement,
                  { color: theme.colors.textSecondary },
                ]}
              >
                • Contains at least one number
              </Text>
              <Text
                style={[
                  styles.requirement,
                  { color: theme.colors.textSecondary },
                ]}
              >
                • Contains at least one special character
              </Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Password Form
            </Text>
            {/* TODO: Add password form inputs in task 10 */}
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Password change form will be implemented in task 10.
            </Text>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title='Update Password'
              onPress={handleChangePassword}
              variant='primary'
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: 0,
  },
  buttonContainer: {
    marginTop: 16,
  },
  card: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
    textAlign: 'center',
  },
  requirement: {
    fontSize: 14,
    lineHeight: 20,
  },
  requirementsList: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
