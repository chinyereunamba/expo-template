import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { Button } from '@/components/common/Button';
import { FormInput } from '@/components/forms';
import { Screen } from '@/components/common/Screen';
import { NetworkStatus, ApiErrorHandler } from '@/components/common';
import { useLogin } from '@/services/authApi';
import { authSchemas } from '@/utils/validationSchemas';
import { Ionicons } from '@expo/vector-icons';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();

  const form = useEnhancedFormValidation<LoginFormData>({
    schema: authSchemas.login,
    defaultValues: {
      email: '',
      password: '',
    },
    enableRealTimeValidation: true,
    enableNetworkValidation: true,
    showNetworkErrors: true,
    retryAttempts: 2,
    onError: error => {
      console.error('Login error:', error);
    },
    onSuccess: data => {
      console.log('Login successful:', data.email);
    },
  });

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Screen style={styles.container}>
      <NetworkStatus showWhenOnline={false} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign in to your account
        </Text>
      </View>

      <View style={styles.form}>
        <FormInput
          name='email'
          control={form.control}
          label='Email'
          placeholder='Enter your email'
          keyboardType='email-address'
          autoCapitalize='none'
          autoComplete='email'
          textContentType='emailAddress'
          leftIcon={
            <Ionicons
              name='mail-outline'
              size={20}
              color={theme.colors.textSecondary}
            />
          }
        />

        <FormInput
          name='password'
          control={form.control}
          label='Password'
          placeholder='Enter your password'
          secureTextEntry={!showPassword}
          autoComplete='password'
          textContentType='password'
          leftIcon={
            <Ionicons
              name='lock-closed-outline'
              size={20}
              color={theme.colors.textSecondary}
            />
          }
          rightIcon={
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textSecondary}
            />
          }
          onRightIconPress={togglePasswordVisibility}
        />
      </View>

      {form.lastSubmitError && (
        <ApiErrorHandler
          error={form.lastSubmitError}
          onRetry={() =>
            form.handleSubmitWithRetry(async data => {
              await loginMutation.mutateAsync(data);
            })()
          }
          onDismiss={() => form.clearAllErrors()}
          inline={true}
          context='login'
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title='Sign In'
          onPress={form.handleSubmitWithRetry(async data => {
            await loginMutation.mutateAsync(data);
          })}
          variant='primary'
          style={styles.button}
          loading={form.isSubmittingWithRetry || loginMutation.isPending}
          disabled={!form.canSubmit || loginMutation.isPending}
        />

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotButton}
        >
          <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text
            style={[styles.registerText, { color: theme.colors.textSecondary }]}
          >
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleGoToRegister}>
            <Text
              style={[styles.registerLink, { color: theme.colors.primary }]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
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
  forgotButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  registerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  registerText: {
    fontSize: 14,
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
});
