import React from 'react';
import { render } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput } from '../FormInput';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const TestComponent = () => {
  const { control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  return (
    <ThemeProvider>
      <FormInput
        name='email'
        control={control}
        label='Email'
        placeholder='Enter email'
      />
    </ThemeProvider>
  );
};

describe('FormInput', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<TestComponent />);
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
  });
});
