import { useState, useCallback, useMemo } from 'react';

export interface FormField<T> {
  value: T;
  error: string | null;
  touched: boolean;
}

export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const state = {} as FormState<T>;
    Object.keys(initialValues).forEach(key => {
      const k = key as keyof T;
      state[k] = {
        value: initialValues[k],
        error: null,
        touched: false,
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current values from form state
  const values = useMemo(() => {
    const vals = {} as T;
    Object.keys(formState).forEach(key => {
      const k = key as keyof T;
      vals[k] = formState[k].value;
    });
    return vals;
  }, [formState]);

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: null, // Clear error when value changes
      },
    }));
  }, []);

  const setTouched = useCallback((field: keyof T, touched = true) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched,
      },
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string | null) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));
  }, []);

  const validateField = useCallback(
    (field: keyof T) => {
      if (!validate) return true;

      const errors = validate(values);
      const fieldError = errors[field] || null;

      setError(field, fieldError);
      return !fieldError;
    },
    [validate, values, setError]
  );

  const validateForm = useCallback(() => {
    if (!validate) return true;

    const errors = validate(values);

    let isValid = true;
    Object.keys(formState).forEach(key => {
      const k = key as keyof T;
      const fieldError = errors[k] || null;
      setError(k, fieldError);
      if (fieldError) isValid = false;
    });

    return isValid;
  }, [validate, values, formState, setError]);

  const reset = useCallback(() => {
    setFormState(() => {
      const state = {} as FormState<T>;
      Object.keys(initialValues).forEach(key => {
        const k = key as keyof T;
        state[k] = {
          value: initialValues[k],
          error: null,
          touched: false,
        };
      });
      return state;
    });
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return;

    // Mark all fields as touched
    setFormState(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        const k = key as keyof T;
        newState[k] = { ...newState[k], touched: true };
      });
      return newState;
    });

    // Validate form
    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values, validateForm]);

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: formState[field].value,
      error: formState[field].touched ? formState[field].error : undefined,
      onChangeText: (value: T[keyof T]) => setValue(field, value),
      onBlur: () => {
        setTouched(field, true);
        validateField(field);
      },
    }),
    [formState, setValue, setTouched, validateField]
  );

  const isValid = useMemo(
    () => Object.values(formState).every(field => !field.error),
    [formState]
  );

  const isDirty = useMemo(
    () =>
      Object.keys(formState).some(key => {
        const k = key as keyof T;
        return formState[k].value !== initialValues[k];
      }),
    [formState, initialValues]
  );

  return {
    formState,
    values,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    setTouched,
    setError,
    validateField,
    validateForm,
    reset,
    handleSubmit,
    getFieldProps,
  };
}
