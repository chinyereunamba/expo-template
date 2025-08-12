import { createLazyScreen } from '../../utils/lazyLoading';

// Authentication screens - lazy loaded for better performance
export const WelcomeScreen = createLazyScreen(() =>
  import('./WelcomeScreen').then(m => ({ default: m.WelcomeScreen }))
);
export const LoginScreen = createLazyScreen(() =>
  import('./LoginScreen').then(m => ({ default: m.LoginScreen }))
);
export const RegisterScreen = createLazyScreen(() =>
  import('./RegisterScreen').then(m => ({ default: m.RegisterScreen }))
);
export const ForgotPasswordScreen = createLazyScreen(() =>
  import('./ForgotPasswordScreen').then(m => ({
    default: m.ForgotPasswordScreen,
  }))
);
export const ResetPasswordScreen = createLazyScreen(() =>
  import('./ResetPasswordScreen').then(m => ({
    default: m.ResetPasswordScreen,
  }))
);
export const VerifyEmailScreen = createLazyScreen(() =>
  import('./VerifyEmailScreen').then(m => ({ default: m.VerifyEmailScreen }))
);
