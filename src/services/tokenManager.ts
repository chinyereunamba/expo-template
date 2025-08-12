import { useAuthStore } from '../stores/authStore';
import { APP_CONFIG } from '../constants';
import { ApiResponse } from '../types';

class TokenManager {
  private refreshPromise: Promise<boolean> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  // Check if token is expired or about to expire
  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      // Consider token expired if it expires in the next 5 minutes
      return payload.exp < currentTime + 300;
    } catch {
      return true;
    }
  }

  // Get valid token, refreshing if necessary
  async getValidToken(): Promise<string | null> {
    const { token, refreshToken } = useAuthStore.getState();

    if (!token) {
      return null;
    }

    if (!this.isTokenExpired(token)) {
      return token;
    }

    // If token is expired, try to refresh
    if (refreshToken) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return useAuthStore.getState().token;
      }
    }

    // If refresh failed, logout user
    useAuthStore.getState().logout();
    return null;
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;

    return result;
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data: ApiResponse<{ token: string; refreshToken: string }> =
          await response.json();

        useAuthStore.getState().updateTokens({
          token: data.data.token,
          refreshToken: data.data.refreshToken,
        });

        // Schedule next refresh
        this.scheduleTokenRefresh(data.data.token);

        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Schedule automatic token refresh
  scheduleTokenRefresh(token: string): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      const expiresIn = payload.exp - currentTime;

      // Schedule refresh 5 minutes before expiration
      const refreshIn = Math.max(0, (expiresIn - 300) * 1000);

      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshIn);
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  }

  // Initialize token refresh scheduling
  initialize(): void {
    const { token, isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated && token) {
      this.scheduleTokenRefresh(token);
    }
  }

  // Clear refresh timer
  cleanup(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.refreshPromise = null;
  }
}

export const tokenManager = new TokenManager();
