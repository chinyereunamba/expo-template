const IS_DEV = process.env.EXPO_PUBLIC_APP_ENV === 'development';
const IS_STAGING = process.env.EXPO_PUBLIC_APP_ENV === 'staging';
const IS_PROD = process.env.EXPO_PUBLIC_APP_ENV === 'production';

const getUpdateUrl = () => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-project-id-here';
  return `https://u.expo.dev/${projectId}`;
};

const getAppName = () => {
  if (IS_DEV) return 'Expo Mobile Skeleton (Dev)';
  if (IS_STAGING) return 'Expo Mobile Skeleton (Staging)';
  return 'Expo Mobile Skeleton';
};

const getBundleIdentifier = () => {
  const base = 'com.example.expomobileskeleton';
  if (IS_DEV) return `${base}.dev`;
  if (IS_STAGING) return `${base}.staging`;
  return base;
};

const getAndroidPackage = () => {
  const base = 'com.example.expomobileskeleton';
  if (IS_DEV) return `${base}.dev`;
  if (IS_STAGING) return `${base}.staging`;
  return base;
};

const getUpdateChannel = () => {
  if (IS_DEV) return 'development';
  if (IS_STAGING) return 'preview';
  return 'production';
};

export default {
  expo: {
    name: getAppName(),
    slug: 'expo-mobile-skeleton',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    scheme: 'expo-mobile-skeleton',
    platforms: ['ios', 'android', 'web'],
    splash: {
      image: './assets/splash/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      tabletImage: './assets/splash/splash-icon.png'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: getBundleIdentifier(),
      buildNumber: '1',
      deploymentTarget: '13.4',
      requireFullScreen: false,
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        UIBackgroundModes: ['background-fetch', 'background-processing'],
        NSCameraUsageDescription: 'This app uses the camera to take photos for profile pictures.',
        NSPhotoLibraryUsageDescription: 'This app accesses the photo library to select images for profile pictures.',
        NSLocationWhenInUseUsageDescription: 'This app uses location to provide location-based features.',
        NSMicrophoneUsageDescription: 'This app uses the microphone for voice features.',
        UILaunchStoryboardName: 'SplashScreen',
        UIStatusBarStyle: 'UIStatusBarStyleDefault',
        UIViewControllerBasedStatusBarAppearance: false
      },
      associatedDomains: ['applinks:your-domain.com'],
      usesIcloudStorage: false
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icons/adaptive-icon.png',
        backgroundColor: '#ffffff',
        backgroundImage: './assets/icons/adaptive-icon.png'
      },
      edgeToEdgeEnabled: true,
      package: getAndroidPackage(),
      versionCode: 1,
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      minSdkVersion: 23,
      permissions: [
        'INTERNET',
        'ACCESS_NETWORK_STATE',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'RECORD_AUDIO',
        'VIBRATE'
      ],
      blockedPermissions: ['SYSTEM_ALERT_WINDOW'],
      allowBackup: true,
      networkSecurityConfig: {
        cleartextTrafficPermitted: false
      },
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'your-domain.com'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        }
      ]
    },
    web: {
      favicon: './assets/icons/favicon.png',
      bundler: 'metro'
    },
    plugins: [
      [
        'expo-font',
        {
          fonts: ['./node_modules/react-native-vector-icons/Fonts/AntDesign.ttf']
        }
      ]
    ],
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-project-id-here'
      }
    },
    updates: {
      url: getUpdateUrl(),
      enabled: !IS_DEV,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 30000
    },
    runtimeVersion: {
      policy: 'appVersion'
    }
  }
};