import { renderHook, act } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkMonitor } from '../useNetworkMonitor';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('useNetworkMonitor Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default network state', () => {
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    } as any);

    const { result } = renderHook(() => useNetworkMonitor());

    expect(result.current.isConnected).toBe(null); // Initial state
    expect(result.current.isInternetReachable).toBe(null);
    expect(result.current.connectionType).toBe('unknown');
  });

  it('should fetch initial network state on mount', async () => {
    const mockNetworkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {
        isConnectionExpensive: false,
        ssid: 'test-wifi',
      },
    };

    mockNetInfo.fetch.mockResolvedValue(mockNetworkState as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
    expect(result.current.connectionType).toBe('wifi');
    expect(result.current.connectionDetails).toEqual(mockNetworkState.details);
  });

  it('should handle offline state', async () => {
    const mockNetworkState = {
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
      details: null,
    };

    mockNetInfo.fetch.mockResolvedValue(mockNetworkState as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.connectionType).toBe('none');
    expect(result.current.isOnline).toBe(false);
  });

  it('should handle cellular connection', async () => {
    const mockNetworkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'cellular',
      details: {
        isConnectionExpensive: true,
        cellularGeneration: '4g',
      },
    };

    mockNetInfo.fetch.mockResolvedValue(mockNetworkState as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionType).toBe('cellular');
    expect(result.current.isExpensive).toBe(true);
  });

  it('should listen to network state changes', () => {
    let networkListener: (state: any) => void;

    mockNetInfo.addEventListener.mockImplementation(listener => {
      networkListener = listener;
      return jest.fn(); // unsubscribe function
    });

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    } as any);

    const { result } = renderHook(() => useNetworkMonitor());

    // Simulate network state change
    act(() => {
      networkListener({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      });
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionType).toBe('none');
  });

  it('should unsubscribe from network listener on unmount', () => {
    const unsubscribe = jest.fn();
    mockNetInfo.addEventListener.mockReturnValue(unsubscribe);

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    } as any);

    const { unmount } = renderHook(() => useNetworkMonitor());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should provide isOnline computed property', async () => {
    const mockNetworkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    };

    mockNetInfo.fetch.mockResolvedValue(mockNetworkState as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    expect(result.current.isOnline).toBe(true);

    // Simulate going offline
    act(() => {
      const listener = mockNetInfo.addEventListener.mock.calls[0][0];
      listener({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      });
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('should handle connection with no internet access', async () => {
    const mockNetworkState = {
      isConnected: true,
      isInternetReachable: false,
      type: 'wifi',
      details: {},
    };

    mockNetInfo.fetch.mockResolvedValue(mockNetworkState as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.isOnline).toBe(false); // No internet access
  });

  it('should provide isExpensive property for cellular connections', async () => {
    const mockNetworkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'cellular',
      details: {
        isConnectionExpensive: true,
      },
    };

    mockNetInfo.fetch.mockResolvedValue(mockNetworkState as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    expect(result.current.isExpensive).toBe(true);
  });

  it('should handle unknown connection type', async () => {
    const mockNetworkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
      details: {},
    };

    mockNetInfo.fetch.mockResolvedValue(mockNetworkState as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    expect(result.current.connectionType).toBe('unknown');
    expect(result.current.isExpensive).toBe(false); // Default to false for unknown
  });

  it('should handle NetInfo fetch errors gracefully', async () => {
    mockNetInfo.fetch.mockRejectedValue(new Error('NetInfo error'));

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result } = renderHook(() => useNetworkMonitor());

    // Should not crash and maintain initial state
    expect(result.current.isConnected).toBe(null);
    expect(result.current.connectionType).toBe('unknown');

    consoleSpy.mockRestore();
  });

  it('should provide refresh function to manually check network state', async () => {
    const mockNetworkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    };

    mockNetInfo.fetch.mockResolvedValue(mockNetworkState as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    // Clear the mock to test refresh
    mockNetInfo.fetch.mockClear();

    const updatedNetworkState = {
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
      details: null,
    };

    mockNetInfo.fetch.mockResolvedValue(updatedNetworkState as any);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockNetInfo.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.isConnected).toBe(false);
  });

  it('should track connection history', async () => {
    let networkListener: (state: any) => void;

    mockNetInfo.addEventListener.mockImplementation(listener => {
      networkListener = listener;
      return jest.fn();
    });

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    } as any);

    const { result, waitForNextUpdate } = renderHook(() => useNetworkMonitor());

    await waitForNextUpdate();

    // Simulate network changes
    act(() => {
      networkListener({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      });
    });

    act(() => {
      networkListener({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
        details: { isConnectionExpensive: true },
      });
    });

    // Should track the latest state
    expect(result.current.connectionType).toBe('cellular');
    expect(result.current.isExpensive).toBe(true);
  });
});
