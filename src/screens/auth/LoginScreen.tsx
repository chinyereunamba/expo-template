import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { theme } = useTheme();

  const handleLogin = () => {
    // TODO: Implement login logic in task 10
    console.log('Login pressed');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign in to your account
        </Text>
      </View>

      <View style={styles.form}>
        {/* TODO: Add form inputs in task 10 */}
        <Text
          style={[styles.placeholder, { color: theme.colors.textSecondary }]}
        >
          Login form will be implemented in task 10
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title='Sign In'
          onPress={handleLogin}
          variant='primary'
          style={styles.button}
        />

        <Button
          title='Forgot Password?'
          onPress={handleForgotPassword}
          variant='text'
          style={styles.button}
        />

        <View style={styles.registerContainer}>
          <Text
            style={[styles.registerText, { color: theme.colors.textSecondary }]}
          >
            Don't have an account?{' '}
          </Text>
          <Button
            title='Sign Up'
            onPress={handleGoToRegister}
            variant='text'
            style={styles.registerButton}
          />
        </View>
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
  },
  registerButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 'auto',
  },
});
