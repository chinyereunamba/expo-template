import { createLazyScreen } from '../../utils/lazyLoading';

// Profile screens - lazy loaded for better performance
export const ProfileScreen = createLazyScreen(() =>
  import('./ProfileScreen').then(m => ({ default: m.ProfileScreen }))
);
export const EditProfileScreen = createLazyScreen(() =>
  import('./EditProfileScreen').then(m => ({ default: m.EditProfileScreen }))
);
export const UserSettingsScreen = createLazyScreen(() =>
  import('./UserSettingsScreen').then(m => ({ default: m.UserSettingsScreen }))
);
export const ChangePasswordScreen = createLazyScreen(() =>
  import('./ChangePasswordScreen').then(m => ({
    default: m.ChangePasswordScreen,
  }))
);
