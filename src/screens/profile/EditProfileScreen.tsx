import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const handleSave = () => {
    // TODO: Implement save profile logic in task 10
    console.log('Save profile changes');
  };

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Edit Profile
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Update your personal information
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Personal Information
            </Text>
            {/* TODO: Add form inputs in task 10 */}
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Profile editing form will be implemented in task 10. Current user:{' '}
              {user?.name || 'Unknown'}
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Contact Information
            </Text>
            <Text
              style={[
                styles.placeholder,
                { color: theme.colors.textSecondary },
              ]}
            >
              Contact information fields will be implemented in task 10.
            </Text>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title='Save Changes'
              onPress={handleSave}
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
