import {
  useForm as useReactHookForm,
  UseFormProps,
  FieldValues,
  Path,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ObjectSchema } from 'yup';
import { useCallback } from 'react';

export interface UseFormValidationOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, 'resolver'> {
  schema: ObjectSchema<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

export function useFormValidation<T extends FieldValues>({
  schema,
  onSubmit,
  ...options
}: UseFormValidationOptions<T>) {
  const form = useReactHookForm<T>({
    resolver: yupResolver(schema),
    mode: 'onChange', // Enable real-time validation
    reValidateMode: 'onChange',
    ...options,
  });

  const handleSubmit = useCallback(
    (data: T) => {
      if (onSubmit) {
        return onSubmit(data);
      }
    },
    [onSubmit]
  );

  // Enhanced field props for React Native components
  const getFieldProps = useCallback(
    (name: Path<T>) => {
      const fieldState = form.getFieldState(name);
      const field = form.register(name);

      return {
        value: form.watch(name) || '',
        error: fieldState.error?.message,
        onChangeText: (value: string) => {
          form.setValue(name, value as any, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        },
        onBlur: field.onBlur,
        ref: field.ref,
      };
    },
    [form]
  );

  // Get error for a specific field
  const getFieldError = useCallback(
    (name: Path<T>) => {
      const fieldState = form.getFieldState(name);
      return fieldState.error?.message;
    },
    [form]
  );

  // Check if field has error
  const hasFieldError = useCallback(
    (name: Path<T>) => {
      const fieldState = form.getFieldState(name);
      return !!fieldState.error;
    },
    [form]
  );

  // Get field value
  const getFieldValue = useCallback(
    (name: Path<T>) => {
      return form.watch(name);
    },
    [form]
  );

  // Set field value programmatically
  const setFieldValue = useCallback(
    (name: Path<T>, value: any) => {
      form.setValue(name, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [form]
  );

  // Clear field error
  const clearFieldError = useCallback(
    (name: Path<T>) => {
      form.clearErrors(name);
    },
    [form]
  );

  // Set field error
  const setFieldError = useCallback(
    (name: Path<T>, error: string) => {
      form.setError(name, { message: error });
    },
    [form]
  );

  return {
    // React Hook Form methods
    ...form,

    // Enhanced methods
    handleSubmit: form.handleSubmit(handleSubmit),
    getFieldProps,
    getFieldError,
    hasFieldError,
    getFieldValue,
    setFieldValue,
    clearFieldError,
    setFieldError,

    // Computed properties
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    isLoading: form.formState.isLoading,
    errors: form.formState.errors,
    touchedFields: form.formState.touchedFields,
    dirtyFields: form.formState.dirtyFields,
  };
}
