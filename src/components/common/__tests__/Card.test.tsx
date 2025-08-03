import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card, CardHeader, CardContent, CardFooter } from '../Card';
import { ThemeProvider } from '@/theme';
import { lightTheme } from '@/theme/themes';

// Mock theme hook
jest.mock('@/hooks', () => ({
  useTheme: () => ({ theme: lightTheme }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Card', () => {
  it('renders children correctly', () => {
    const { getByText } = renderWithTheme(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );

    expect(getByText('Card Content')).toBeTruthy();
  });

  it('renders as touchable when onPress is provided', () => {
    const onPressMock = jest.fn();
    const { getByRole } = renderWithTheme(
      <Card onPress={onPressMock}>
        <Text>Touchable Card</Text>
      </Card>
    );

    const card = getByRole('button');
    fireEvent.press(card);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByRole } = renderWithTheme(
      <Card onPress={onPressMock} disabled>
        <Text>Disabled Card</Text>
      </Card>
    );

    const card = getByRole('button');
    fireEvent.press(card);

    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const { rerender, getByText } = renderWithTheme(
      <Card variant='elevated'>
        <Text>Elevated Card</Text>
      </Card>
    );

    expect(getByText('Elevated Card')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Card variant='outlined'>
          <Text>Outlined Card</Text>
        </Card>
      </ThemeProvider>
    );

    expect(getByText('Outlined Card')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Card variant='filled'>
          <Text>Filled Card</Text>
        </Card>
      </ThemeProvider>
    );

    expect(getByText('Filled Card')).toBeTruthy();
  });

  it('applies custom padding and margin', () => {
    const { getByTestId } = renderWithTheme(
      <Card padding='lg' margin='md' testID='custom-card'>
        <Text>Custom Spacing</Text>
      </Card>
    );

    const card = getByTestId('custom-card');
    expect(card.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          padding: lightTheme.spacing.lg,
          margin: lightTheme.spacing.md,
        }),
      ])
    );
  });

  it('applies custom border radius', () => {
    const { getByTestId } = renderWithTheme(
      <Card borderRadius='xl' testID='rounded-card'>
        <Text>Rounded Card</Text>
      </Card>
    );

    const card = getByTestId('rounded-card');
    expect(card.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderRadius: lightTheme.borderRadius.xl,
        }),
      ])
    );
  });

  it('has correct accessibility properties when touchable', () => {
    const { getByRole } = renderWithTheme(
      <Card onPress={() => {}} disabled>
        <Text>Accessible Card</Text>
      </Card>
    );

    const card = getByRole('button');
    expect(card.props.accessibilityState.disabled).toBe(true);
  });
});

describe('CardHeader', () => {
  it('renders children correctly', () => {
    const { getByText } = renderWithTheme(
      <CardHeader>
        <Text>Header Content</Text>
      </CardHeader>
    );

    expect(getByText('Header Content')).toBeTruthy();
  });
});

describe('CardContent', () => {
  it('renders children correctly', () => {
    const { getByText } = renderWithTheme(
      <CardContent>
        <Text>Content Area</Text>
      </CardContent>
    );

    expect(getByText('Content Area')).toBeTruthy();
  });
});

describe('CardFooter', () => {
  it('renders children correctly', () => {
    const { getByText } = renderWithTheme(
      <CardFooter>
        <Text>Footer Content</Text>
      </CardFooter>
    );

    expect(getByText('Footer Content')).toBeTruthy();
  });
});

describe('Card composition', () => {
  it('renders all parts together correctly', () => {
    const { getByText } = renderWithTheme(
      <Card>
        <CardHeader>
          <Text>Card Title</Text>
        </CardHeader>
        <CardContent>
          <Text>Card body content goes here</Text>
        </CardContent>
        <CardFooter>
          <Text>Footer actions</Text>
        </CardFooter>
      </Card>
    );

    expect(getByText('Card Title')).toBeTruthy();
    expect(getByText('Card body content goes here')).toBeTruthy();
    expect(getByText('Footer actions')).toBeTruthy();
  });
});
