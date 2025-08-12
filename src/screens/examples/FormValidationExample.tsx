import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useEnhancedFormValidation } from '../../hooks/useEnhancedFormValidation';
import { useFormErrorRecovery } from '../../hooks/useFormErrorRecovery';
import { Button } from '../../components/common/Button';
import { FormInput, FormValidationStatus } from '../../components/forms';
import { Screen } from '../../components/common/Screen';
import { NetworkStatus, ApiErrorHandler } from '../../components/common';
import { validationSchemas } from '../../utils/validationSchemas';
import { ErrorHandler } from '../../utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';
import * as yup from 'yup';

// Enhanced form schema with comprehensive validation
const enhancedFormSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase('Email must be lowercase'),

  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),

  website: yup.string().url('Please enter a valid URL').default(''),

  bio: yup
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .default(''),
});

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  website: string;
  bio: string;
}

export const FormValidationExample: React.FC = () => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [simulateNetworkError, setSimulateNetworkError] = useState(false);
  const [simulateServerError, setSimulateServerError] = useState(false);

  const form = useEnhancedFormValidation<FormData>({
    schema: enhancedFormSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      website: '',
      bio: '',
    },
    enableRealTimeValidation: true,
    enableNetworkValidation: true,
    showNetworkErrors: true,
    retryAttempts: 3,
    onError: error => {
      console.error('Form submission error:', error);
      ErrorHandler.logError(error, 'FormValidationExample');
    },
    onSuccess: data => {
      Alert.alert(
        'Success!',
        'Form submitted successfully with enhanced validation.',
        [{ text: 'OK' }]
      );
      console.log('Form submitted successfully:', data);
    },
  });

  // Enhanced error recovery
  const errorRecovery = useFormErrorRecovery({
    form,
    maxRetryAttempts: 3,
    retryDelay: 1000,
    enableAutoRecovery: true,
    enableOfflineQueue: true,
    onRecoverySuccess: data => {
      Alert.alert(
        'Recovery Success',
        'Form was successfully submitted after recovery!'
      );
    },
    onRecoveryFailed: (error, attempts) => {
      Alert.alert(
        'Recovery Failed',
        `Failed to recover after ${attempts} attempts.`
      );
    },
  });

  // Simulate API call with potential errors
  const simulateApiCall = async (data: FormData): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (simulateNetworkError) {
      throw new Error('Network request failed');
    }

    if (simulateServerError) {
      const serverError = {
        status: 422,
        data: {
          errors: {
            email: ['This email is already taken'],
            phone: ['Phone number format is invalid'],
          },
        },
      };
      throw serverError;
    }

    // Simulate successful submission
    console.log('API call successful:', data);
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await simulateApiCall(data);
    } catch (error) {
      throw error; // Re-throw to be handled by form error handling
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const resetForm = () => {
    form.reset();
    form.clearAllErrors();
  };

  const fillSampleData = () => {
    form.setValue('name', 'John Doe');
    form.setValue('email', 'john.doe@example.com');
    form.setValue('phone', '+1 (555) 123-4567');
    form.setValue('password', 'SecurePass123');
    form.setValue('confirmPassword', 'SecurePass123');
    form.setValue('website', 'https://johndoe.com');
    form.setValue('bio', 'Software developer with 5+ years of experience.');
  };

  return (
    <Screen style={styles.container}>
      <NetworkStatus showWhenOnline={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Enhanced Form Validation
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Comprehensive form with real-time validation, error handling, and
            network awareness
          </Text>
        </View>

        {/* Debug Controls */}
        <View
          style={[
            styles.debugSection,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.debugTitle, { color: theme.colors.text }]}>
            Debug Controls
          </Text>

          <View style={styles.debugControls}>
            <TouchableOpacity
              style={[
                styles.debugButton,
                simulateNetworkError && { backgroundColor: theme.colors.error },
              ]}
              onPress={() => setSimulateNetworkError(!simulateNetworkError)}
            >
              <Text
                style={[
                  styles.debugButtonText,
                  {
                    color: simulateNetworkError ? '#FFFFFF' : theme.colors.text,
                  },
                ]}
              >
                {simulateNetworkError ? 'Disable' : 'Simulate'} Network Error
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.debugButton,
                simulateServerError && { backgroundColor: theme.colors.error },
              ]}
              onPress={() => setSimulateServerError(!simulateServerError)}
            >
              <Text
                style={[
                  styles.debugButtonText,
                  {
                    color: simulateServerError ? '#FFFFFF' : theme.colors.text,
                  },
                ]}
              >
                {simulateServerError ? 'Disable' : 'Simulate'} Server Error
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.debugButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={fillSampleData}
            >
              <Text style={[styles.debugButtonText, { color: '#FFFFFF' }]}>
                Fill Sample Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <FormInput
            name='name'
            control={form.control}
            label='Full Name'
            placeholder='Enter your full name'
            autoCapitalize='words'
            autoComplete='name'
            textContentType='name'
            showSuccessIndicator={true}
            enableRealTimeValidation={true}
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
            label='Email Address'
            placeholder='Enter your email'
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
            textContentType='emailAddress'
            showSuccessIndicator={true}
            enableRealTimeValidation={true}
            leftIcon={
              <Ionicons
                name='mail-outline'
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <FormInput
            name='phone'
            control={form.control}
            label='Phone Number'
            placeholder='Enter your phone number'
            keyboardType='phone-pad'
            autoComplete='tel'
            textContentType='telephoneNumber'
            showSuccessIndicator={true}
            enableRealTimeValidation={true}
            leftIcon={
              <Ionicons
                name='call-outline'
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <FormInput
            name='password'
            control={form.control}
            label='Password'
            placeholder='Create a secure password'
            secureTextEntry={!showPassword}
            autoComplete='new-password'
            textContentType='newPassword'
            showValidationFeedback={true}
            validationFeedbackType='password'
            showSuccessIndicator={true}
            enableRealTimeValidation={true}
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
            showSuccessIndicator={true}
            enableRealTimeValidation={true}
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

          <FormInput
            name='website'
            control={form.control}
            label='Website (Optional)'
            placeholder='https://yourwebsite.com'
            keyboardType='url'
            autoCapitalize='none'
            autoComplete='url'
            textContentType='URL'
            showSuccessIndicator={true}
            enableRealTimeValidation={true}
            leftIcon={
              <Ionicons
                name='globe-outline'
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <FormInput
            name='bio'
            control={form.control}
            label='Bio (Optional)'
            placeholder='Tell us about yourself...'
            multiline={true}
            numberOfLines={4}
            maxLength={500}
            showSuccessIndicator={true}
            enableRealTimeValidation={true}
            leftIcon={
              <Ionicons
                name='document-text-outline'
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />
        </View>

        {/* Enhanced Form Status */}
        <FormValidationStatus
          form={form}
          showDetailedStatus={true}
          showFieldCount={true}
          showNetworkStatus={true}
          isOnline={form.isOnline}
          canSubmit={form.canSubmit}
          onValidateAll={() => form.validateAllFields()}
          onClearErrors={() => form.clearAllErrors()}
        />

        {/* Error Recovery Status */}
        {(errorRecovery.isRecovering || errorRecovery.offlineQueueSize > 0) && (
          <View
            style={[
              styles.recoverySection,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.recoveryTitle, { color: theme.colors.text }]}>
              Error Recovery Status
            </Text>

            {errorRecovery.isRecovering && (
              <View style={styles.recoveryItem}>
                <Ionicons
                  name='refresh-outline'
                  size={16}
                  color={theme.colors.primary}
                  style={styles.recoveryIcon}
                />
                <Text
                  style={[styles.recoveryText, { color: theme.colors.primary }]}
                >
                  Attempting recovery... (Attempt{' '}
                  {errorRecovery.recoveryAttempts})
                </Text>
              </View>
            )}

            {errorRecovery.offlineQueueSize > 0 && (
              <View style={styles.recoveryItem}>
                <Ionicons
                  name='cloud-offline-outline'
                  size={16}
                  color={theme.colors.warning || '#FFA500'}
                  style={styles.recoveryIcon}
                />
                <Text
                  style={[
                    styles.recoveryText,
                    { color: theme.colors.warning || '#FFA500' },
                  ]}
                >
                  {errorRecovery.offlineQueueSize} form(s) queued for offline
                  submission
                </Text>
              </View>
            )}

            {errorRecovery.offlineQueueSize > 0 && form.isOnline && (
              <TouchableOpacity
                style={[
                  styles.recoveryButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => errorRecovery.processOfflineQueue()}
              >
                <Text style={[styles.recoveryButtonText, { color: '#FFFFFF' }]}>
                  Process Queue
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Error Display */}
        {form.lastSubmitError && (
          <ApiErrorHandler
            error={form.lastSubmitError}
            onRetry={() => form.handleSubmitWithRetry(handleSubmit)()}
            onDismiss={() => form.clearAllErrors()}
            inline={true}
            context='form'
          />
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title='Submit with Retry'
            onPress={form.handleSubmitWithRetry(handleSubmit)}
            variant='primary'
            style={styles.button}
            loading={form.isSubmittingWithRetry}
            disabled={!form.canSubmit}
          />

          <Button
            title='Submit with Error Handling'
            onPress={form.handleSubmitWithErrorHandling(handleSubmit)}
            variant='secondary'
            style={styles.button}
            loading={form.formState.isSubmitting}
            disabled={!form.canSubmit}
          />

          <Button
            title='Submit with Error Recovery'
            onPress={() => errorRecovery.attemptRecovery(handleSubmit)}
            variant='outline'
            style={styles.button}
            loading={errorRecovery.isRecovering}
            disabled={!form.canSubmit}
          />

          <View style={styles.secondaryButtons}>
            <Button
              title='Reset Form'
              onPress={resetForm}
              variant='outline'
              style={[styles.button, styles.halfButton]}
            />

            <Button
              title='Validate All'
              onPress={() => form.validateAllFields()}
              variant='outline'
              style={[styles.button, styles.halfButton]}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  attemptsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  button: {
    marginBottom: 0,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  debugButton: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  debugButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  debugControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  debugSection: {
    borderRadius: 8,
    marginBottom: 24,
    padding: 16,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  form: {
    marginBottom: 24,
  },
  halfButton: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recoveryButton: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recoveryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recoveryIcon: {
    marginRight: 8,
  },
  recoveryItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  recoverySection: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  recoveryText: {
    flex: 1,
    fontSize: 14,
  },
  recoveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statusItem: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: '45%',
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  statusSection: {
    borderRadius: 8,
    marginBottom: 24,
    padding: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
