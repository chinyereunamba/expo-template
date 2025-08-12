import { createLazyScreen } from '../../utils/lazyLoading';

// Settings screens - lazy loaded for better performance
export const SettingsScreen = createLazyScreen(() =>
  import('./SettingsScreen').then(m => ({ default: m.SettingsScreen }))
);
export const AppSettingsScreen = createLazyScreen(() =>
  import('./AppSettingsScreen').then(m => ({ default: m.AppSettingsScreen }))
);
export const PrivacyScreen = createLazyScreen(() =>
  import('./PrivacyScreen').then(m => ({ default: m.PrivacyScreen }))
);
export const AboutScreen = createLazyScreen(() =>
  import('./AboutScreen').then(m => ({ default: m.AboutScreen }))
);
export const HelpScreen = createLazyScreen(() =>
  import('./HelpScreen').then(m => ({ default: m.HelpScreen }))
);
