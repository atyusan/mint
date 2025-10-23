import { config } from './env';

/**
 * Application constants that depend on environment variables
 */
export const APP_CONSTANTS = {
  // App Information
  APP_NAME: config.app.name,
  APP_VERSION: config.app.version,
  APP_DESCRIPTION: config.app.description,

  // API Configuration
  API_BASE_URL: config.api.baseUrl,
  API_TIMEOUT: config.api.timeout,

  // Feature Flags
  FEATURES: {
    ANALYTICS: config.features.analytics,
    TERMINAL_MANAGEMENT: config.features.terminalManagement,
    PAYOUTS: config.features.payouts,
  },

  // Development Settings
  DEBUG_MODE: config.development.debugMode,
  ENABLE_MOCK_DATA: config.development.enableMockData,

  // Paystack Configuration
  PAYSTACK_PUBLIC_KEY: config.paystack.publicKey,

  // Environment
  ENVIRONMENT: config.environment,
  IS_DEVELOPMENT: config.isDevelopment(),
  IS_PRODUCTION: config.isProduction(),
  IS_DEBUG_MODE: config.isDebugMode(),
};

/**
 * Default values for the application
 */
export const DEFAULT_VALUES = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Timeouts
  REQUEST_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 300,

  // Currency
  DEFAULT_CURRENCY: 'NGN',
  CURRENCY_SYMBOL: '₦',

  // Date Formats
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ],

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    PERMISSIONS: '/auth/permissions',
  },

  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Terminals
  TERMINALS: {
    LIST: '/terminals',
    CREATE: '/terminals',
    GET_BY_ID: (id: string) => `/terminals/${id}`,
    UPDATE: (id: string) => `/terminals/${id}`,
    DELETE: (id: string) => `/terminals/${id}`,
    STATS: (id: string) => `/terminals/${id}/stats`,
    ACTIVITY: (id: string) => `/terminals/${id}/activity`,
  },

  // Invoices
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    GET_BY_ID: (id: string) => `/invoices/${id}`,
    UPDATE: (id: string) => `/invoices/${id}`,
    CANCEL: (id: string) => `/invoices/${id}/cancel`,
    STATS: '/invoices/stats',
    ACTIVITY: (id: string) => `/invoices/${id}/activity`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REVENUE_TRENDS: '/analytics/revenue-trends',
    TOP_OUTLETS: '/analytics/top-outlets',
    TOP_CATEGORIES: '/analytics/top-categories',
    PAYMENT_METHODS: '/analytics/payment-methods',
    TERMINAL_PERFORMANCE: '/analytics/terminal-performance',
    REAL_TIME: '/analytics/real-time',
  },

  // Payouts
  PAYOUTS: {
    LIST: '/payouts',
    CREATE: '/payouts',
    GET_BY_ID: (id: string) => `/payouts/${id}`,
    STATS: '/payouts/stats',
    PROCESS_SCHEDULED: '/payouts/process-scheduled',
    METHODS: {
      LIST: '/payouts/methods',
      CREATE: '/payouts/methods',
      GET_BY_ID: (id: string) => `/payouts/methods/${id}`,
      UPDATE: (id: string) => `/payouts/methods/${id}`,
      DELETE: (id: string) => `/payouts/methods/${id}`,
    },
  },

  // Fees
  FEES: {
    CALCULATE: '/fees/calculate',
    TIER: (merchantId: string) => `/fees/tier/${merchantId}`,
    HISTORY: (merchantId: string) => `/fees/history/${merchantId}`,
  },
};

export default APP_CONSTANTS;
