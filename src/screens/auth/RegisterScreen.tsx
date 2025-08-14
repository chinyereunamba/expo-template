import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { Button } from '@/components/common/Button';
import { FormInput } from '@/components/forms';
import { Screen } from '@/components/common/Screen';
import { NetworkStatus, ApiErrorHandler } from '@/components/common';
import { useRegister } from '@/services/authApi';
import { authSchemas } from '@/utils/validationSchemas';
import { ErrorHandler } from '@/utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useRegister();

  const form = useEnhancedFormValidation<RegisterFormData>({
    schema: authSchemas.register,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    enableRealTimeValidation: true,
    enableNetworkValidation: true,
    showNetworkErrors: true,
    retryAttempts: 2,
    onError: error => {
      console.error('Registration error:', error);
    },
    onSuccess: data => {
      console.log('Registration successful:', data.email);
    },
  });

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Screen style={styles.container}>
      <NetworkStatus showWhenOnline={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Create Account
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Sign up to get started
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            name='name'
            control={form.control}
            label='Full Name'
            placeholder='Enter your full name'
            autoCapitalize='words'
            autoComplete='name'
            textContentType='name'
            leftIcon={
              <Ionicons
                name='person-outline'
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

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
            placeholder='Create a password'
            secureTextEntry={!showPassword}
            autoComplete='new-password'
            textContentType='newPassword'
            showValidationFeedback={true}
            validationFeedbackType='password'
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

          <FormInput
            name='confirmPassword'
            control={form.control}
            label='Confirm Password'
            placeholder='Confirm your password'
            secureTextEntry={!showConfirmPassword}
            autoComplete='new-password'
            textContentType='newPassword'
            leftIcon={
              <Ionicons
                name='lock-closed-outline'
                size={20}
                color={theme.colors.textSecondary}
              />
            }
            rightIcon={
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.colors.textSecondary}
              />
            }
            onRightIconPress={toggleConfirmPasswordVisibility}
          />
        </View>

        {form.lastSubmitError && (
          <ApiErrorHandler
            error={form.lastSubmitError}
            onRetry={() =>
              form.handleSubmitWithRetry(async data => {
                await registerMutation.mutateAsync({
                  name: data.name,
                  email: data.email,
                  password: data.password,
                });
              })()
            }
            onDismiss={() => form.clearAllErrors()}
            inline={true}
            context='register'
          />
        )}

        <View style={styles.buttonContainer}>
          <Button
            title='Create Account'
            onPress={form.handleSubmitWithRetry(async data => {
              await registerMutation.mutateAsync({
                name: data.name,
                email: data.email,
                password: data.password,
              });
            })}
            variant='primary'
            style={styles.button}
            loading={form.isSubmittingWithRetry || registerMutation.isPending}
            disabled={!form.canSubmit || registerMutation.isPending}
          />

          <View style={styles.loginContainer}>
            <Text
              style={[styles.loginText, { color: theme.colors.textSecondary }]}
            >
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleGoToLogin}>
              <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
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
    gap: 16,
    marginBottom: 32,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  form: {
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loginContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginText: {
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
