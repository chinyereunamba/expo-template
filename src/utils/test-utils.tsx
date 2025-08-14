// Additional test utilities for common testing patterns

import { act } from '@testing-library/react-native';

// Utility to wait for async operations
export const waitForAsync = async (callback?: () => void, timeout = 1000) => {
  await act(async () => {
    await new Promise(resolve => {
      setTimeout(() => {
        if (callback) callback();
        resolve(undefined);
      }, timeout);
    });
  });
};

// Utility to simulate user typing
export const simulateTyping = async (
  input: any,
  text: string,
  delay = 50
) => {
  const { fireEvent } = await import('@testing-library/react-native');
  
  for (let i = 0; i <= text.length; i++) {
    await act(async () => {
      fireEvent.changeText(input, text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, delay));
    });
  }
};

// Utility to simulate form submission
export const simulateFormSubmission = async (
  form: any,
  formData: Record<string, string>
) => {
  const { fireEvent } = await import('@testing-library/react-native');
  
  // Fill form fields
  for (const [field, value] of Object.entries(formData)) {
    const input = form.getByPlaceholderText(field) || form.getByLabelText(field);
    if (input) {
      fireEvent.changeText(input, value);
    }
  }

  // Submit form
  const submitButton = form.getByRole('button') || form.getByText(/submit|sign in|sign up/i);
  if (submitButton) {
    fireEvent.press(submitButton);
  }
};

// Utility to test component accessibility
export const testAccessibility = (component: any) => {
  const tests = [];

  // Check for accessibility labels
  const elementsWithLabels = component.queryAllByLabelText(/.+/);
  tests.push({
    name: 'Has accessibility labels',
    passed: elementsWithLabels.length > 0,
  });

  // Check for proper button roles
  const buttons = component.queryAllByRole('button');
  tests.push({
    name: 'Buttons have proper roles',
    passed: buttons.every((button: any) => button.props.accessibilityRole === 'button'),
  });

  return tests;
};

// Utility to test responsive behavior
export const testResponsive = async (
  renderComponent: (dimensions: { width: number; height: number }) => any,
  breakpoints = [
    { width: 320, height: 568 }, // iPhone SE
    { width: 375, height: 667 }, // iPhone 8
    { width: 414, height: 896 }, // iPhone 11
    { width: 768, height: 1024 }, // iPad
  ]
) => {
  const results = [];

  for (const dimensions of breakpoints) {
    // Mock Dimensions
    jest.doMock('react-native', () => ({
      ...jest.requireActual('react-native'),
      Dimensions: {
        get: () => dimensions,
      },
    }));

    const component = renderComponent(dimensions);
    results.push({
      dimensions,
      component,
    });
  }

  return results;
};

// Utility to test theme variations
export const testThemeVariations = (
  renderWithTheme: (theme: 'light' | 'dark') => any
) => {
  const lightComponent = renderWithTheme('light');
  const darkComponent = renderWithTheme('dark');

  return {
    light: lightComponent,
    dark: darkComponent,
  };
};

// Utility to test error states
export const testErrorStates = async (
  component: any,
  errorTriggers: (() => Promise<void> | void)[]
) => {
  const results = [];

  for (const trigger of errorTriggers) {
    try {
      await act(async () => {
        await trigger();
      });

      // Check if error is displayed
      const errorElements = component.queryAllByText(/error|failed|invalid/i);
      results.push({
        hasError: errorElements.length > 0,
        errorElements,
      });
    } catch (error) {
      results.push({
        hasError: true,
        error,
      });
    }
  }

  return results;
};

// Utility to test loading states
export const testLoadingStates = async (
  component: any,
  loadingTrigger: () => Promise<void>
) => {
  // Check initial state (should not be loading)
  const initialLoadingElements = component.queryAllByText(/loading|wait/i);
  const initialSpinners = component.queryAllByLabelText(/loading/i);

  await act(async () => {
    const promise = loadingTrigger();
    
    // Check loading state
    const loadingElements = component.queryAllByText(/loading|wait/i);
    const spinners = component.queryAllByLabelText(/loading/i);
    
    await promise;
    
    // Check final state (should not be loading)
    const finalLoadingElements = component.queryAllByText(/loading|wait/i);
    const finalSpinners = component.queryAllByLabelText(/loading/i);

    return {
      initial: {
        hasLoading: initialLoadingElements.length > 0 || initialSpinners.length > 0,
      },
      during: {
        hasLoading: loadingElements.length > 0 || spinners.length > 0,
      },
      final: {
        hasLoading: finalLoadingElements.length > 0 || finalSpinners.length > 0,
      },
    };
  });
};

// Utility to test navigation flows
export const testNavigationFlow = async (
  component: any,
  navigationSteps: {
    action: () => void;
    expectedScreen: string | RegExp;
  }[]
) => {
  const results = [];

  for (const step of navigationSteps) {
    await act(async () => {
      step.action();
    });

    const screenElement = typeof step.expectedScreen === 'string'
      ? component.queryByText(step.expectedScreen)
      : component.queryByText(step.expectedScreen);

    results.push({
      step,
      found: !!screenElement,
      element: screenElement,
    });
  }

  return results;
};

// Utility to test performance
export const measureRenderTime = (renderFunction: () => any) => {
  const start = performance.now();
  const result = renderFunction();
  const end = performance.now();

  return {
    result,
    renderTime: end - start,
  };
};

// Utility to test memory leaks
export const testMemoryLeaks = async (
  renderComponent: () => any,
  iterations = 10
) => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const components = [];

  // Render multiple instances
  for (let i = 0; i < iterations; i++) {
    components.push(renderComponent());
  }

  // Unmount all components
  components.forEach(component => {
    if (component.unmount) {
      component.unmount();
    }
  });

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

  return {
    initialMemory,
    finalMemory,
    memoryDiff: finalMemory - initialMemory,
    iterations,
  };
};

// Utility to create mock timers
export const createMockTimers = () => {
  jest.useFakeTimers();
  
  return {
    advanceTime: (ms: number) => {
      act(() => {
        jest.advanceTimersByTime(ms);
      });
    },
    runAllTimers: () => {
      act(() => {
        jest.runAllTimers();
      });
    },
    cleanup: () => {
      jest.useRealTimers();
    },
  };
};

// Utility to test component props
export const testComponentProps = (
  Component: React.ComponentType<any>,
  propTests: {
    props: any;
    expectedBehavior: string;
    test: (component: any) => boolean;
  }[]
) => {
  const { render } = require('@testing-library/react-native');
  
  return propTests.map(({ props, expectedBehavior, test }) => {
    const component = render(<Component {...props} />);
    const passed = test(component);
    
    return {
      props,
      expectedBehavior,
      passed,
      component,
    };
  });
};

// Utility for snapshot testing with dynamic content
export const createStableSnapshot = (component: any) => {
  // Replace dynamic content with stable placeholders
  const stableComponent = JSON.stringify(component, (key, value) => {
    if (key === 'testID' && typeof value === 'string' && value.includes('timestamp')) {
      return 'TIMESTAMP_PLACEHOLDER';
    }
    if (key === 'children' && typeof value === 'string' && /\d{4}-\d{2}-\d{2}/.test(value)) {
      return 'DATE_PLACEHOLDER';
    }
    return value;
  });

  return JSON.parse(stableComponent);
};