import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Screen } from '../../components/common/Screen';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { theme } = useTheme();

  const handleRegister = () => {
    // TODO: Implement registration logic in task 10
    console.log('Register pressed');
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign up to get started
        </Text>
      </View>

      <View style={styles.form}>
        {/* TODO: Add form inputs in task 10 */}
        <Text
          style={[styles.placeholder, { color: theme.colors.textSecondary }]}
        >
          Registration form will be implemented in task 10
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title='Create Account'
          onPress={handleRegister}
          variant='primary'
          style={styles.button}
        />

        <View style={styles.loginContainer}>
          <Text
            style={[styles.loginText, { color: theme.colors.textSecondary }]}
          >
            Already have an account?{' '}
          </Text>
          <Button
            title='Sign In'
            onPress={handleGoToLogin}
            variant='text'
            style={styles.loginButton}
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 'auto',
  },
});
