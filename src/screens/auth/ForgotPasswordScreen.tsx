import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Screen } from '../../components/common/Screen';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { theme } = useTheme();

  const handleSendReset = () => {
    // TODO: Implement forgot password logic in task 10
    console.log('Send reset email pressed');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Forgot Password
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter your email to receive a password reset link
        </Text>
      </View>

      <View style={styles.form}>
        {/* TODO: Add email input in task 10 */}
        <Text
          style={[styles.placeholder, { color: theme.colors.textSecondary }]}
        >
          Email input will be implemented in task 10
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title='Send Reset Link'
          onPress={handleSendReset}
          variant='primary'
          style={styles.button}
        />

        <Button
          title='Back to Login'
          onPress={handleGoBack}
          variant='secondary'
          style={styles.button}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    marginBottom: 0,
  },
});
