import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthStackNavigationProp, AuthStackRouteProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Screen } from '../../components/common/Screen';

export const VerifyEmailScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const route = useRoute<AuthStackRouteProp<'VerifyEmail'>>();
  const { theme } = useTheme();
  const { email } = route.params;

  const handleResendEmail = () => {
    // TODO: Implement resend verification email logic in task 10
    console.log('Resend verification email to:', email);
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Verify Your Email
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          We've sent a verification link to
        </Text>
        <Text style={[styles.email, { color: theme.colors.primary }]}>
          {email}
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.instructions, { color: theme.colors.textSecondary }]}
        >
          Please check your email and click the verification link to activate
          your account.
        </Text>

        <Text style={[styles.note, { color: theme.colors.textTertiary }]}>
          Didn't receive the email? Check your spam folder or request a new one.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title='Resend Verification Email'
          onPress={handleResendEmail}
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    marginBottom: 0,
  },
});
