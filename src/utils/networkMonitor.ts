import React from 'react';
import { AppLogger } from './logger';
import { APP_CONFIG } from '@/config/environment';

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp: number;
  status?: number;
  responseTime?: number;
  responseData?: any;
  error?: any;
}

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private requests: Map<string, NetworkRequest> = new Map();
  private listeners: ((request: NetworkRequest) => void)[] = [];

  private constructor() {}

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start monitoring a request
  startRequest(method: string, url: string, options?: RequestInit): string {
    const id = this.generateRequestId();
    const request: NetworkRequest = {
      id,
      method: method.toUpperCase(),
      url,
      headers: options?.headers as Record<string, string>,
      body: options?.body,
      timestamp: Date.now(),
    };

    this.requests.set(id, request);

    if (APP_CONFIG.DEBUG) {
      AppLogger.setContext('NetworkMonitor').logNetworkRequest(method, url, {
        headers: request.headers,
        body: request.body,
      });
    }

    return id;
  }

  // Complete a request with response
  completeRequest(
    id: string,
    status: number,
    responseData?: any,
    error?: any
  ): void {
    const request = this.requests.get(id);
    if (!request) return;

    const completedRequest: NetworkRequest = {
      ...request,
      status,
      responseTime: Date.now() - request.timestamp,
      responseData,
      error,
    };

    this.requests.set(id, completedRequest);

    if (APP_CONFIG.DEBUG) {
      AppLogger.setContext('NetworkMonitor').logNetworkResponse(
        request.method,
        request.url,
        status,
        {
          responseTime: completedRequest.responseTime,
          responseData: responseData,
          error: error,
        }
      );
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(completedRequest));

    // Clean up old requests (keep last 100)
    if (this.requests.size > 100) {
      const oldestKey = this.requests.keys().next().value;
      if (oldestKey) {
        this.requests.delete(oldestKey);
      }
    }
  }

  // Get all requests
  getAllRequests(): NetworkRequest[] {
    return Array.from(this.requests.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  // Get failed requests
  getFailedRequests(): NetworkRequest[] {
    return this.getAllRequests().filter(req => req.status && req.status >= 400);
  }

  // Get slow requests (> 2 seconds)
  getSlowRequests(): NetworkRequest[] {
    return this.getAllRequests().filter(
      req => req.responseTime && req.responseTime > 2000
    );
  }

  // Add listener for request completion
  addListener(listener: (request: NetworkRequest) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Clear all requests
  clear(): void {
    this.requests.clear();
  }

  // Get network statistics
  getStats(): {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    slowRequests: number;
  } {
    const requests = this.getAllRequests();
    const successful = requests.filter(req => req.status && req.status < 400);
    const failed = requests.filter(req => req.status && req.status >= 400);
    const withResponseTime = requests.filter(req => req.responseTime);
    const slowRequests = requests.filter(
      req => req.responseTime && req.responseTime > 2000
    );

    const averageResponseTime =
      withResponseTime.length > 0
        ? withResponseTime.reduce(
            (sum, req) => sum + (req.responseTime || 0),
            0
          ) / withResponseTime.length
        : 0;

    return {
      total: requests.length,
      successful: successful.length,
      failed: failed.length,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests: slowRequests.length,
    };
  }
}

export const networkMonitor = NetworkMonitor.getInstance();

// Enhanced fetch wrapper with monitoring
export const monitoredFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method || 'GET';

  const requestId = networkMonitor.startRequest(method, url, init);

  try {
    const response = await fetch(input, init);

    // Clone response to read body without consuming it
    const clonedResponse = response.clone();
    let responseData;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseData = await clonedResponse.json();
      } else {
        responseData = await clonedResponse.text();
      }
    } catch {
      // Ignore response parsing errors
    }

    networkMonitor.completeRequest(requestId, response.status, responseData);

    return response;
  } catch (error) {
    networkMonitor.completeRequest(requestId, 0, null, error);
    throw error;
  }
};

// Hook for React components to access network data
export const useNetworkMonitor = () => {
  const [requests, setRequests] = React.useState<NetworkRequest[]>([]);

  React.useEffect(() => {
    const updateRequests = () => {
      setRequests(networkMonitor.getAllRequests());
    };

    const unsubscribe = networkMonitor.addListener(updateRequests);
    updateRequests(); // Initial load

    return unsubscribe;
  }, []);

  return {
    requests,
    stats: networkMonitor.getStats(),
    failedRequests: networkMonitor.getFailedRequests(),
    slowRequests: networkMonitor.getSlowRequests(),
    clear: () => {
      networkMonitor.clear();
      setRequests([]);
    },
  };
};
