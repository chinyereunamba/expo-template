import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Input, InputProps } from '../common/Input';
import { FormFieldError } from './FormFieldError';
import {
  ValidationFeedback,
  getPasswordValidationRules,
} from './ValidationFeedback';

interface FormInputProps<T extends FieldValues>
  extends Omit<InputProps, 'error' | 'value' | 'onChangeText'> {
  name: FieldPath<T>;
  control: Control<T>;
  rules?: object;
  showValidationFeedback?: boolean;
  validationFeedbackType?: 'password' | 'custom';
  customValidationRules?: {
    label: string;
    isValid: boolean;
    required?: boolean;
  }[];
  showSuccessIndicator?: boolean;
  enableRealTimeValidation?: boolean;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  rules,
  showValidationFeedback = false,
  validationFeedbackType = 'password',
  customValidationRules,
  showSuccessIndicator = true,
  enableRealTimeValidation = true,
  ...inputProps
}: FormInputProps<T>) {
  const [successAnim] = React.useState(new Animated.Value(0));
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error, isTouched },
      }) => {
        const hasValue = value && value.length > 0;
        const showSuccess =
          showSuccessIndicator && isTouched && hasValue && !error;

        // Animate success indicator
        React.useEffect(() => {
          Animated.timing(successAnim, {
            toValue: showSuccess ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }, [showSuccess]);

        return (
          <View style={styles.container}>
            <Input
              {...inputProps}
              value={value || ''}
              onChangeText={text => {
                onChange(text);
                // Trigger real-time validation if enabled
                if (enableRealTimeValidation && isTouched) {
                  // The validation will be handled by react-hook-form
                }
              }}
              onBlur={onBlur}
              error={error?.message}
              success={showSuccess}
            />

            {showSuccess && (
              <Animated.View
                style={[styles.successIndicator, { opacity: successAnim }]}
              >
                {/* Success indicator will be handled by Input component */}
              </Animated.View>
            )}

            <FormFieldError
              error={error?.message || undefined}
              visible={isTouched && !!error}
              animated={true}
            />

            {showValidationFeedback && (
              <ValidationFeedback
                rules={
                  validationFeedbackType === 'password'
                    ? getPasswordValidationRules(value || '')
                    : customValidationRules || []
                }
                visible={isTouched || hasValue}
                title={
                  validationFeedbackType === 'password'
                    ? 'Password Requirements'
                    : 'Validation Rules'
                }
              />
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 4,
    marginTop: 4,
  },
  successIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
});
