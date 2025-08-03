import React from 'react';
import { render, fireEvent } from '@testing-library/react-native'
import { Input } from '../Input';
import { ThemeProvider } from '@/theme';
import { lightTheme } from '@/theme/themes';

// Mock theme hook
jest.mock('@/hooks', () => ({
  useTheme: () => ({ theme: lightTheme }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <Input placeholder='Enter text' />
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = renderWithTheme(
      <Input label='Username' placeholder='Enter username' />
    );

    expect(getByText('Username')).toBeTruthy();
  });

  it('shows required asterisk when required', () => {
    const { getByText } = renderWithTheme(<Input label='Email' required />);

    expect(getByText('*')).toBeTruthy();
  });

  it('displays error message', () => {
    const { getByText } = renderWithTheme(
      <Input label='Email' error='Invalid email' />
    );

    expect(getByText('Invalid email')).toBeTruthy();
  });

  it('displays helper text', () => {
    const { getByText } = renderWithTheme(
      <Input label='Password' helperText='Must be at least 8 characters' />
    );

    expect(getByText('Must be at least 8 characters')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = renderWithTheme(
      <Input placeholder='Enter text' onChangeText={onChangeTextMock} />
    );

    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'test text');

    expect(onChangeTextMock).toHaveBeenCalledWith('test text');
  });

  it('handles focus and blur events', () => {
    const onFocusMock = jest.fn();
    const onBlurMock = jest.fn();

    const { getByPlaceholderText } = renderWithTheme(
      <Input
        placeholder='Enter text'
        onFocus={onFocusMock}
        onBlur={onBlurMock}
      />
    );

    const input = getByPlaceholderText('Enter text');

    fireEvent(input, 'focus');
    expect(onFocusMock).toHaveBeenCalled();

    fireEvent(input, 'blur');
    expect(onBlurMock).toHaveBeenCalled();
  });

  it('renders with icons', () => {
    const LeftIcon = () => <div testID='left-icon'>Left</div>;
    const RightIcon = () => <div testID='right-icon'>Right</div>;

    const { getByTestId } = renderWithTheme(
      <Input
        placeholder='With icons'
        leftIcon={<LeftIcon />}
        rightIcon={<RightIcon />}
      />
    );

    expect(getByTestId('left-icon')).toBeTruthy();
    expect(getByTestId('right-icon')).toBeTruthy();
  });

  it('calls onRightIconPress when right icon is pressed', () => {
    const onRightIconPressMock = jest.fn();
    const RightIcon = () => <div testID='right-icon'>Right</div>;

    const { getByTestId } = renderWithTheme(
      <Input
        placeholder='With right icon'
        rightIcon={<RightIcon />}
        onRightIconPress={onRightIconPressMock}
      />
    );

    const rightIconContainer = getByTestId('right-icon').parent;
    fireEvent.press(rightIconContainer);

    expect(onRightIconPressMock).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <Input placeholder='Disabled input' disabled />
    );

    const input = getByPlaceholderText('Disabled input');
    expect(input.props.editable).toBe(false);
  });

  it('has correct accessibility properties', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <Input
        label='Username'
        placeholder='Enter username'
        helperText='Your unique username'
        disabled
      />
    );

    const input = getByPlaceholderText('Enter username');
    expect(input.props.accessibilityLabel).toBe('Username');
    expect(input.props.accessibilityHint).toBe('Your unique username');
    expect(input.props.accessibilityState.disabled).toBe(true);
  });

  it('renders different variants correctly', () => {
    const { rerender, getByPlaceholderText } = renderWithTheme(
      <Input placeholder='Outlined' variant='outlined' />
    );

    let input = getByPlaceholderText('Outlined');
    expect(input).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Input placeholder='Filled' variant='filled' />
      </ThemeProvider>
    );

    input = getByPlaceholderText('Filled');
    expect(input).toBeTruthy();
  });

  it('renders different sizes correctly', () => {
    const { rerender, getByPlaceholderText } = renderWithTheme(
      <Input placeholder='Small' size='small' />
    );

    let input = getByPlaceholderText('Small');
    expect(input).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Input placeholder='Large' size='large' />
      </ThemeProvider>
    );

    input = getByPlaceholderText('Large');
    expect(input).toBeTruthy();
  });
});
