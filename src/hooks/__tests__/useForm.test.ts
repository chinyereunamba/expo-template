import { renderHook, act } from '@testing-library/react-native';
import { useForm } from '../useForm';

describe('useForm Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        onSubmit: jest.fn(),
      })
    );

    expect(result.current.values).toEqual({ email: '', password: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('should update values when handleChange is called', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('should validate fields when validation rules are provided', () => {
    const validationRules = {
      email: (value: string) => (!value ? 'Email is required' : null),
      password: (value: string) =>
        value.length < 6 ? 'Password must be at least 6 characters' : null,
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        validationRules,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.isValid).toBe(false);
  });

  it('should clear errors when valid values are entered', () => {
    const validationRules = {
      email: (value: string) => (!value ? 'Email is required' : null),
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validationRules,
        onSubmit: jest.fn(),
      })
    );

    // First trigger error
    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Email is required');

    // Then fix the error
    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com' },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('should not submit when form is invalid', async () => {
    const onSubmit = jest.fn();
    const validationRules = {
      email: (value: string) => (!value ? 'Email is required' : null),
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validationRules,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Email is required');
  });

  it('should handle submission errors', async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValue(new Error('Submission failed'));

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com' },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.isSubmitting).toBe(false);
    // Error handling would depend on implementation
  });

  it('should reset form to initial values', () => {
    const initialValues = { email: '', password: '' };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: jest.fn(),
      })
    );

    // Change values
    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.handleChange('password', 'password123');
    });

    expect(result.current.values).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });

    // Reset form
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it('should set field error manually', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.setFieldError('email', 'Custom error message');
    });

    expect(result.current.errors.email).toBe('Custom error message');
    expect(result.current.isValid).toBe(false);
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        onSubmit: jest.fn(),
      })
    );

    // Set some errors
    act(() => {
      result.current.setFieldError('email', 'Email error');
      result.current.setFieldError('password', 'Password error');
    });

    expect(Object.keys(result.current.errors)).toHaveLength(2);

    // Clear errors
    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('should handle async validation', async () => {
    const asyncValidation = {
      email: async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return value === 'taken@example.com' ? 'Email is already taken' : null;
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validationRules: asyncValidation,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChange('email', 'taken@example.com');
    });

    await act(async () => {
      await result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Email is already taken');
  });

  it('should track touched fields', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        onSubmit: jest.fn(),
      })
    );

    expect(result.current.touched).toEqual({});

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.password).toBeUndefined();
  });

  it('should handle form submission state correctly', async () => {
    const onSubmit = jest
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com' },
        onSubmit,
      })
    );

    expect(result.current.isSubmitting).toBe(false);

    const submitPromise = act(async () => {
      return result.current.handleSubmit();
    });

    expect(result.current.isSubmitting).toBe(true);

    await submitPromise;

    expect(result.current.isSubmitting).toBe(false);
  });
});
