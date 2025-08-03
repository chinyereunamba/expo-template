// Common type definitions used across the application

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ID types
export type ID = string;
export type NumericID = number;

// Timestamp types
export type Timestamp = string; // ISO 8601 format
export type UnixTimestamp = number;

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type LoadingState = 'idle' | 'pending' | 'fulfilled' | 'rejected';

// Generic callback types
export type Callback = () => void;
export type CallbackWithParam<T> = (param: T) => void;
export type AsyncCallback = () => Promise<void>;
export type AsyncCallbackWithParam<T> = (param: T) => Promise<void>;

// Event handler types
export type EventHandler<T = any> = (event: T) => void;
export type ChangeHandler<T = any> = (value: T) => void;

// Form types
export type FormValues = Record<string, any>;
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

// Validation types
export type ValidationRule<T> = (value: T) => string | undefined;
export type ValidationSchema<T> = Partial<Record<keyof T, ValidationRule<T>>>;

// Component props types
export interface BaseComponentProps {
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
}

export interface StyleProps {
  style?: any;
  className?: string;
}

export interface ChildrenProps {
  children?: React.ReactNode;
}

// Screen size types
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Orientation = 'portrait' | 'landscape';

// Device types
export type Platform = 'ios' | 'android' | 'web';
export type DeviceType = 'phone' | 'tablet' | 'desktop';

// Permission types
export type Permission =
  | 'camera'
  | 'microphone'
  | 'location'
  | 'notifications'
  | 'contacts'
  | 'calendar'
  | 'photos'
  | 'storage';

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'blocked';

// Location types
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface Location {
  coords: Coordinates;
  timestamp: number;
}

// File types
export interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export interface ImageInfo extends FileInfo {
  width: number;
  height: number;
}

// Color types
export type ColorValue = string;
export type HexColor = string;
export type RGBColor = `rgb(${number}, ${number}, ${number})`;
export type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'none';
export type EasingType =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';

// Layout types
export interface Dimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Network types
export type NetworkState = 'online' | 'offline' | 'unknown';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown';

// Storage types
export type StorageKey = string;
export type StorageValue = string | number | boolean | object | null;

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Feature flag types
export type FeatureFlag = string;
export type FeatureFlagValue = boolean | string | number | object;

// Sorting types
export type SortDirection = 'asc' | 'desc';
export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

// Filter types
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'endsWith';
export interface FilterConfig<T> {
  key: keyof T;
  operator: FilterOperator;
  value: any;
}

// Date/Time types
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type DateTimeFormat = `${DateFormat} ${TimeFormat}`;

// Locale types
export type LanguageCode = string; // ISO 639-1 format (e.g., 'en', 'es', 'fr')
export type CountryCode = string; // ISO 3166-1 alpha-2 format (e.g., 'US', 'ES', 'FR')
export type LocaleCode = `${LanguageCode}-${CountryCode}`; // e.g., 'en-US', 'es-ES'

// Currency types
export type CurrencyCode = string; // ISO 4217 format (e.g., 'USD', 'EUR', 'GBP')

// Timeout types
export type TimeoutID = NodeJS.Timeout;
export type IntervalID = NodeJS.Timeout;
