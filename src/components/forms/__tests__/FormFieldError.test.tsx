import React from 'react';
import { render } from '@testing-library/react-native';
import { FormFieldError } from '../FormFieldError';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('FormFieldError', () => {
  it('renders error message when error is provided', () => {
    const { getByText } = renderWithTheme(
      <FormFieldError error='This field is required' visible={true} />
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('does not render when error is not provided', () => {
    const { queryByText } = renderWithTheme(<FormFieldError visible={true} />);

    expect(queryByText('This field is required')).toBeNull();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = renderWithTheme(
      <FormFieldError error='This field is required' visible={false} />
    );

    expect(queryByText('This field is required')).toBeNull();
  });

  it('renders with animation by default', () => {
    const { getByText } = renderWithTheme(
      <FormFieldError error='This field is required' visible={true} />
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('renders without animation when animated is false', () => {
    const { getByText } = renderWithTheme(
      <FormFieldError
        error='This field is required'
        visible={true}
        animated={false}
      />
    );

    expect(getByText('This field is required')).toBeTruthy();
  });
});
