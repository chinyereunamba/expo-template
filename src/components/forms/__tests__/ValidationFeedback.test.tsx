import React from 'react';
import { render } from '@testing-library/react-native';
import {
  ValidationFeedback,
  getPasswordValidationRules,
} from '../ValidationFeedback';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ValidationFeedback', () => {
  const mockRules = [
    { label: 'At least 8 characters', isValid: true, required: true },
    { label: 'Contains uppercase letter', isValid: false, required: true },
    { label: 'Contains number', isValid: true, required: false },
  ];

  it('renders validation rules when visible', () => {
    const { getByText } = renderWithTheme(
      <ValidationFeedback rules={mockRules} visible={true} />
    );

    expect(getByText('At least 8 characters')).toBeTruthy();
    expect(getByText('Contains uppercase letter')).toBeTruthy();
    expect(getByText('Contains number')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = renderWithTheme(
      <ValidationFeedback rules={mockRules} visible={false} />
    );

    expect(queryByText('At least 8 characters')).toBeNull();
  });

  it('renders custom title', () => {
    const { getByText } = renderWithTheme(
      <ValidationFeedback
        rules={mockRules}
        visible={true}
        title='Custom Requirements'
      />
    );

    expect(getByText('Custom Requirements')).toBeTruthy();
  });

  it('renders default title when not provided', () => {
    const { getByText } = renderWithTheme(
      <ValidationFeedback rules={mockRules} visible={true} />
    );

    expect(getByText('Password Requirements')).toBeTruthy();
  });
});

describe('getPasswordValidationRules', () => {
  it('returns correct validation rules for empty password', () => {
    const rules = getPasswordValidationRules('');

    expect(rules).toHaveLength(5);
    expect(rules[0].isValid).toBe(false); // length < 8
    expect(rules[1].isValid).toBe(false); // no uppercase
    expect(rules[2].isValid).toBe(false); // no lowercase
    expect(rules[3].isValid).toBe(false); // no number
    expect(rules[4].isValid).toBe(false); // no special char
  });

  it('returns correct validation rules for valid password', () => {
    const rules = getPasswordValidationRules('Password123!');

    expect(rules).toHaveLength(5);
    expect(rules[0].isValid).toBe(true); // length >= 8
    expect(rules[1].isValid).toBe(true); // has uppercase
    expect(rules[2].isValid).toBe(true); // has lowercase
    expect(rules[3].isValid).toBe(true); // has number
    expect(rules[4].isValid).toBe(true); // has special char
  });

  it('returns correct validation rules for partially valid password', () => {
    const rules = getPasswordValidationRules('password');

    expect(rules).toHaveLength(5);
    expect(rules[0].isValid).toBe(true); // length >= 8
    expect(rules[1].isValid).toBe(false); // no uppercase
    expect(rules[2].isValid).toBe(true); // has lowercase
    expect(rules[3].isValid).toBe(false); // no number
    expect(rules[4].isValid).toBe(false); // no special char
  });
});
