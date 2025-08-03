import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '@/theme';
import { lightTheme } from '@/theme/themes';

// Mock theme hook
jest.mock('@/hooks', () => ({
  useTheme: () => ({ theme: lightTheme }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = renderWithTheme(<Button title='Test Button' />);

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button title='Test Button' onPress={onPressMock} />
    );

    fireEvent.press(getByRole('button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button title='Test Button' onPress={onPressMock} disabled />
    );

    fireEvent.press(getByRole('button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <Button title='Test Button' loading />
    );

    // Should show loading indicator
    expect(getByTestId('activity-indicator')).toBeTruthy();
    // Should not show text when loading
    expect(queryByText('Test Button')).toBeFalsy();
  });

  it('renders with different variants', () => {
    const { rerender, getByRole } = renderWithTheme(
      <Button title='Primary' variant='primary' />
    );

    let button = getByRole('button');
    expect(button).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Button title='Secondary' variant='secondary' />
      </ThemeProvider>
    );

    button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { rerender, getByRole } = renderWithTheme(
      <Button title='Small' size='small' />
    );

    let button = getByRole('button');
    expect(button).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Button title='Large' size='large' />
      </ThemeProvider>
    );

    button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('renders with icons', () => {
    const LeftIcon = () => <div testID='left-icon'>Left</div>;
    const RightIcon = () => <div testID='right-icon'>Right</div>;

    const { getByTestId } = renderWithTheme(
      <Button
        title='With Icons'
        leftIcon={<LeftIcon />}
        rightIcon={<RightIcon />}
      />
    );

    expect(getByTestId('left-icon')).toBeTruthy();
    expect(getByTestId('right-icon')).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByRole } = renderWithTheme(
      <Button title='Accessible Button' disabled />
    );

    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Accessible Button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('applies fullWidth style correctly', () => {
    const { getByRole } = renderWithTheme(
      <Button title='Full Width' fullWidth />
    );

    const button = getByRole('button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: '100%' })])
    );
  });
});
