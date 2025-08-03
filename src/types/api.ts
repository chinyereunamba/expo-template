// API type definitions

// Standard API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
  requestId?: string;
}

// API error response
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
  requestId?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage?: number;
  prevPage?: number;
}

// Request pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search parameters
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

// File upload types
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface FileUploadRequest {
  file: {
    uri: string;
    type: string;
    name: string;
  };
  folder?: string;
  isPublic?: boolean;
}

// API endpoint configuration
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  requiresAuth?: boolean;
  timeout?: number;
}

// Request/Response interceptor types
export interface RequestInterceptor {
  onRequest?: (config: any) => any;
  onRequestError?: (error: any) => any;
}

export interface ResponseInterceptor {
  onResponse?: (response: any) => any;
  onResponseError?: (error: any) => any;
}

// Network status
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  details: Record<string, any>;
}

// Cache configuration
export interface CacheConfig {
  ttl?: number; // Time to live in seconds
  maxAge?: number;
  staleWhileRevalidate?: boolean;
  tags?: string[];
}

// RTK Query base query types
export interface BaseQueryArgs {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  cache?: CacheConfig;
}

export interface BaseQueryError {
  status: number;
  data: ApiError;
}

// Common API status codes
export enum ApiStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

// Validation error details
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}
