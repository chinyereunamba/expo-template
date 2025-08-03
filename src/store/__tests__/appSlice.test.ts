import appSlice, {
  setTheme,
  toggleTheme,
  setFirstLaunch,
  setNotifications,
  setOnlineStatus,
  setAppSettings,
  setAppVersion,
} from '../slices/appSlice';
import { AppState, ThemeMode } from '../../types';

const initialState: AppState = {
  theme: 'system',
  isFirstLaunch: true,
  notifications: {
    enabled: true,
    categories: {
      general: true,
      security: true,
      marketing: false,
      updates: true,
    },
    schedule: {
      startTime: '08:00',
      endTime: '22:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  },
  isOnline: true,
  appVersion: '1.0.0',
  buildNumber: '1',
  lastUpdated: null,
  settings: {
    language: 'en',
    region: 'US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    biometricEnabled: false,
    autoLockTimeout: 5,
    crashReporting: true,
    analytics: true,
  },
};

describe('appSlice', () => {
  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(appSlice(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setTheme', () => {
      const themes: ThemeMode[] = ['light', 'dark', 'system'];

      themes.forEach(theme => {
        const actual = appSlice(initialState, setTheme(theme));
        expect(actual.theme).toBe(theme);
      });
    });

    it('should handle toggleTheme - light to dark', () => {
      const lightState: AppState = { ...initialState, theme: 'light' };
      const actual = appSlice(lightState, toggleTheme());
      expect(actual.theme).toBe('dark');
    });

    it('should handle toggleTheme - dark to system', () => {
      const darkState: AppState = { ...initialState, theme: 'dark' };
      const actual = appSlice(darkState, toggleTheme());
      expect(actual.theme).toBe('system');
    });

    it('should handle toggleTheme - system to light', () => {
      const systemState: AppState = { ...initialState, theme: 'system' };
      const actual = appSlice(systemState, toggleTheme());
      expect(actual.theme).toBe('light');
    });

    it('should handle setFirstLaunch', () => {
      const actual = appSlice(initialState, setFirstLaunch(false));
      expect(actual.isFirstLaunch).toBe(false);
    });

    it('should handle setNotifications - partial update', () => {
      const notificationUpdate = {
        enabled: false,
        categories: {
          general: false,
          security: true,
          marketing: true,
          updates: false,
        },
      };

      const actual = appSlice(
        initialState,
        setNotifications(notificationUpdate)
      );

      expect(actual.notifications.enabled).toBe(false);
      expect(actual.notifications.categories).toEqual(
        notificationUpdate.categories
      );
      // Should preserve schedule from initial state
      expect(actual.notifications.schedule).toEqual(
        initialState.notifications.schedule
      );
    });

    it('should handle setNotifications - schedule update', () => {
      const scheduleUpdate = {
        schedule: {
          startTime: '09:00',
          endTime: '21:00',
          timezone: 'America/New_York',
        },
      };

      const actual = appSlice(initialState, setNotifications(scheduleUpdate));

      expect(actual.notifications.schedule).toEqual(scheduleUpdate.schedule);
      // Should preserve other notification settings
      expect(actual.notifications.enabled).toBe(
        initialState.notifications.enabled
      );
      expect(actual.notifications.categories).toEqual(
        initialState.notifications.categories
      );
    });

    it('should handle setOnlineStatus', () => {
      const actual = appSlice(initialState, setOnlineStatus(false));
      expect(actual.isOnline).toBe(false);
    });

    it('should handle setAppSettings - partial update', () => {
      const settingsUpdate = {
        language: 'es',
        currency: 'EUR',
        biometricEnabled: true,
      };

      const actual = appSlice(initialState, setAppSettings(settingsUpdate));

      expect(actual.settings.language).toBe('es');
      expect(actual.settings.currency).toBe('EUR');
      expect(actual.settings.biometricEnabled).toBe(true);
      // Should preserve other settings
      expect(actual.settings.region).toBe(initialState.settings.region);
      expect(actual.settings.dateFormat).toBe(initialState.settings.dateFormat);
    });

    it('should handle setAppVersion', () => {
      const versionInfo = {
        version: '2.0.0',
        buildNumber: '42',
      };

      const actual = appSlice(initialState, setAppVersion(versionInfo));

      expect(actual.appVersion).toBe('2.0.0');
      expect(actual.buildNumber).toBe('42');
      expect(actual.lastUpdated).toBeTruthy();
      expect(new Date(actual.lastUpdated!).getTime()).toBeCloseTo(
        Date.now(),
        -2
      );
    });
  });

  describe('action creators', () => {
    it('should create setTheme action', () => {
      const expectedAction = {
        type: 'app/setTheme',
        payload: 'dark',
      };
      expect(setTheme('dark')).toEqual(expectedAction);
    });

    it('should create toggleTheme action', () => {
      const expectedAction = {
        type: 'app/toggleTheme',
      };
      expect(toggleTheme()).toEqual(expectedAction);
    });

    it('should create setFirstLaunch action', () => {
      const expectedAction = {
        type: 'app/setFirstLaunch',
        payload: false,
      };
      expect(setFirstLaunch(false)).toEqual(expectedAction);
    });

    it('should create setNotifications action', () => {
      const payload = { enabled: false };
      const expectedAction = {
        type: 'app/setNotifications',
        payload,
      };
      expect(setNotifications(payload)).toEqual(expectedAction);
    });

    it('should create setOnlineStatus action', () => {
      const expectedAction = {
        type: 'app/setOnlineStatus',
        payload: false,
      };
      expect(setOnlineStatus(false)).toEqual(expectedAction);
    });

    it('should create setAppSettings action', () => {
      const payload = { language: 'fr' };
      const expectedAction = {
        type: 'app/setAppSettings',
        payload,
      };
      expect(setAppSettings(payload)).toEqual(expectedAction);
    });

    it('should create setAppVersion action', () => {
      const payload = { version: '1.1.0', buildNumber: '10' };
      const expectedAction = {
        type: 'app/setAppVersion',
        payload,
      };
      expect(setAppVersion(payload)).toEqual(expectedAction);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple theme toggles correctly', () => {
      let state = appSlice(initialState, setTheme('light'));
      expect(state.theme).toBe('light');

      state = appSlice(state, toggleTheme());
      expect(state.theme).toBe('dark');

      state = appSlice(state, toggleTheme());
      expect(state.theme).toBe('system');

      state = appSlice(state, toggleTheme());
      expect(state.theme).toBe('light');
    });

    it('should preserve unmodified notification settings', () => {
      const partialUpdate = {
        enabled: false,
      };

      const actual = appSlice(initialState, setNotifications(partialUpdate));

      expect(actual.notifications.enabled).toBe(false);
      expect(actual.notifications.categories).toEqual(
        initialState.notifications.categories
      );
      expect(actual.notifications.schedule).toEqual(
        initialState.notifications.schedule
      );
    });

    it('should handle deep notification category updates', () => {
      const categoryUpdate = {
        categories: {
          general: false,
          security: false,
          marketing: true,
          updates: false,
        },
      };

      const actual = appSlice(initialState, setNotifications(categoryUpdate));

      expect(actual.notifications.categories).toEqual(
        categoryUpdate.categories
      );
      expect(actual.notifications.enabled).toBe(
        initialState.notifications.enabled
      );
    });

    it('should handle app settings with all possible values', () => {
      const allSettings = {
        language: 'fr',
        region: 'FR',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY' as const,
        timeFormat: '24h' as const,
        biometricEnabled: true,
        autoLockTimeout: 10,
        crashReporting: false,
        analytics: false,
      };

      const actual = appSlice(initialState, setAppSettings(allSettings));

      expect(actual.settings).toEqual(allSettings);
    });

    it('should maintain state immutability', () => {
      const originalState = { ...initialState };
      const newState = appSlice(initialState, setTheme('dark'));

      expect(initialState).toEqual(originalState);
      expect(newState).not.toBe(initialState);
      expect(newState.theme).toBe('dark');
    });
  });
});
