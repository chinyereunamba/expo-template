import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthStackNavigationProp, AuthStackRouteProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Screen } from '../../components/common/Screen';

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const route = useRoute<AuthStackRouteProp<'ResetPassword'>>();
  const { theme } = useTheme();
  const { token } = route.params;

  const handleResetPassword = () => {
    // TODO: Implement reset password logic in task 10
    console.log('Reset password pressed with token:', token);
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Reset Password
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter your new password
        </Text>
      </View>

      <View style={styles.form}>
        {/* TODO: Add password inputs in task 10 */}
        <Text
          style={[styles.placeholder, { color: theme.colors.textSecondary }]}
        >
          Password reset form will be implemented in task 10
        </Text>
        <Text style={[styles.tokenInfo, { color: theme.colors.textTertiary }]}>
          Token: {token}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title='Reset Password'
          onPress={handleResetPassword}
          variant='primary'
          style={styles.button}
        />

        <Button
          title='Back to Login'
          onPress={handleGoToLogin}
          variant='secondary'
          style={styles.button}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: 0,
  },
  buttonContainer: {
    gap: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tokenInfo: {
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center',
  },
});
