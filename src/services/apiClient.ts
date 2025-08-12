import { useAuthStore } from '../stores';
import { useNetworkStore } from '../stores';
import { APP_CONFIG } from '../constants';
import { ApiResponse, BaseQueryError } from '../types/api';
import { ErrorHandler } from '../utils/errorHandler';
import { tokenManager } from './tokenManager';

// API Client configuration
const API_CONFIG = {
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Request interceptor type
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Response type
interface ApiClientResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.retryAttempts = API_CONFIG.retryAttempts;
    this.retryDelay = API_CONFIG.retryDelay;
  }

  // Get auth token
  private async getAuthToken(): Promise<string | null> {
    return tokenManager.getValidToken();
  }

  // Get network status
  private getNetworkStatus() {
    return useNetworkStore.getState();
  }

  // Build headers
  private async buildHeaders(
    customHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    const token = await this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle token refresh (delegated to token manager)
  private async refreshToken(): Promise<boolean> {
    return tokenManager.refreshToken();
  }

  // Make request with retry logic
  private async makeRequest<T>(
    config: RequestConfig
  ): Promise<ApiClientResponse<T>> {
    const {
      url,
      method = 'GET',
      body,
      headers,
      timeout = this.timeout,
      retries = this.retryAttempts,
    } = config;

    // Check network connectivity
    const networkStatus = this.getNetworkStatus();
    if (!networkStatus.isConnected) {
      throw new Error('No network connection');
    }

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const requestHeaders = await this.buildHeaders(headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method: method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 unauthorized - try to refresh token
      if (response.status === 401 && retries > 0) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry with new token
          return this.makeRequest({ ...config, retries: retries - 1 });
        } else {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          throw new Error('Authentication failed');
        }
      }

      // Handle other errors with retry logic
      if (!response.ok && retries > 0 && this.shouldRetry(response.status)) {
        await this.delay(this.retryDelay);
        useNetworkStore.getState().incrementRetryCount();
        return this.makeRequest({ ...config, retries: retries - 1 });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          data: errorData,
          message:
            errorData.message ||
            `Request failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      useNetworkStore.getState().resetRetryCount();

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle network errors with retry
      if (this.isNetworkError(error) && retries > 0) {
        await this.delay(this.retryDelay);
        useNetworkStore.getState().incrementRetryCount();
        return this.makeRequest({ ...config, retries: retries - 1 });
      }

      throw error;
    }
  }

  // Check if error should trigger retry
  private shouldRetry(status: number): boolean {
    return status >= 500 || status === 408 || status === 429;
  }

  // Check if error is network-related
  private isNetworkError(error: any): boolean {
    return (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      error.message?.includes('network') ||
      error.message?.includes('fetch')
    );
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  async get<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiClientResponse<T>> {
    return this.makeRequest<T>({ url, method: 'GET', ...config });
  }

  async post<T>(
    url: string,
    body?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiClientResponse<T>> {
    return this.makeRequest<T>({ url, method: 'POST', body, ...config });
  }

  async put<T>(
    url: string,
    body?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiClientResponse<T>> {
    return this.makeRequest<T>({ url, method: 'PUT', body, ...config });
  }

  async patch<T>(
    url: string,
    body?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiClientResponse<T>> {
    return this.makeRequest<T>({ url, method: 'PATCH', body, ...config });
  }

  async delete<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiClientResponse<T>> {
    return this.makeRequest<T>({ url, method: 'DELETE', ...config });
  }

  // Upload file
  async upload<T>(
    url: string,
    formData: FormData,
    config?: Partial<RequestConfig>
  ): Promise<ApiClientResponse<T>> {
    const headers = { ...config?.headers };
    delete headers['Content-Type']; // Let browser set multipart boundary

    return this.makeRequest<T>({
      url,
      method: 'POST',
      body: formData,
      headers,
      ...config,
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for testing
export { ApiClient };
