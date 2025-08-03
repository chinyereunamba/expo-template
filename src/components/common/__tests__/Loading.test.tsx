import React from 'react';
import { render } from '@testing-library/react-native';
import { Loading, InlineLoading, LoadingOverlay, Skeleton } from '../Loading';
import { ThemeProvider } from '@/theme';
import { lightTheme } from '@/theme/themes';

// Mock theme hook
jest.mock('@/hooks', () => ({
  useTheme: () => ({ theme: lightTheme }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Loading', () => {
  it('renders activity indicator', () => {
    const { getByTestId } = renderWithTheme(
      <Loading testID='loading-component' />
    );

    expect(getByTestId('loading-component')).toBeTruthy();
  });

  it('renders with text', () => {
    const { getByText } = renderWithTheme(<Loading text='Loading data...' />);

    expect(getByText('Loading data...')).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { getByLabelText } = renderWithTheme(<Loading color='#ff0000' />);

    const indicator = getByLabelText('Loading');
    expect(indicator.props.color).toBe('#ff0000');
  });

  it('renders with different sizes', () => {
    const { rerender, getByLabelText } = renderWithTheme(
      <Loading size='small' />
    );

    let indicator = getByLabelText('Loading');
    expect(indicator.props.size).toBe('small');

    rerender(
      <ThemeProvider>
        <Loading size='large' />
      </ThemeProvider>
    );

    indicator = getByLabelText('Loading');
    expect(indicator.props.size).toBe('large');
  });

  it('renders with overlay style when overlay prop is true', () => {
    const { getByTestId } = renderWithTheme(
      <Loading overlay testID='overlay-loading' />
    );

    const container = getByTestId('overlay-loading');
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 'absolute',
        }),
      ])
    );
  });
});

describe('InlineLoading', () => {
  it('renders activity indicator with small size by default', () => {
    const { UNSAFE_getByType } = renderWithTheme(<InlineLoading />);

    const indicator = UNSAFE_getByType('ActivityIndicator');
    expect(indicator.props.size).toBe('small');
  });

  it('renders with custom color', () => {
    const { UNSAFE_getByType } = renderWithTheme(
      <InlineLoading color='#00ff00' />
    );

    const indicator = UNSAFE_getByType('ActivityIndicator');
    expect(indicator.props.color).toBe('#00ff00');
  });
});

describe('LoadingOverlay', () => {
  it('renders when visible is true', () => {
    const { getByText } = renderWithTheme(
      <LoadingOverlay visible={true} text='Processing...' />
    );

    expect(getByText('Processing...')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = renderWithTheme(
      <LoadingOverlay visible={false} text='Processing...' />
    );

    expect(queryByText('Processing...')).toBeFalsy();
  });

  it('renders with default text when no text provided', () => {
    const { getByText } = renderWithTheme(<LoadingOverlay visible={true} />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('applies custom background color and opacity', () => {
    const { UNSAFE_getByType } = renderWithTheme(
      <LoadingOverlay visible={true} backgroundColor='#ff0000' opacity={0.5} />
    );

    // Get the overlay container (first View)
    const overlayViews = UNSAFE_getByType('View');
    const overlayContainer = overlayViews;

    expect(overlayContainer.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#ff0000',
          opacity: 0.5,
        }),
      ])
    );
  });
});

describe('Skeleton', () => {
  it('renders with default dimensions', () => {
    const { UNSAFE_getByType } = renderWithTheme(<Skeleton />);

    const skeletonView = UNSAFE_getByType('View');
    expect(skeletonView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: '100%',
          height: 20,
          borderRadius: 4,
        }),
      ])
    );
  });

  it('renders with custom dimensions', () => {
    const { UNSAFE_getByType } = renderWithTheme(
      <Skeleton width={200} height={40} borderRadius={8} />
    );

    const skeletonView = UNSAFE_getByType('View');
    expect(skeletonView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 200,
          height: 40,
          borderRadius: 8,
        }),
      ])
    );
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 10 };
    const { UNSAFE_getByType } = renderWithTheme(
      <Skeleton style={customStyle} />
    );

    const skeletonView = UNSAFE_getByType('View');
    expect(skeletonView.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(customStyle)])
    );
  });
});
