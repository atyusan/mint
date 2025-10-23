/**
 * Environment configuration for the Mint Platform frontend
 * All environment variables must be prefixed with VITE_ to be accessible in the browser
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
    timeout: 10000,
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Mint Platform',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description:
      import.meta.env.VITE_APP_DESCRIPTION || 'Payment Facilitation Platform',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    terminalManagement:
      import.meta.env.VITE_ENABLE_TERMINAL_MANAGEMENT === 'true',
    payouts: import.meta.env.VITE_ENABLE_PAYOUTS === 'true',
  },

  // Development Settings
  development: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  },

  // Paystack Configuration
  paystack: {
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  },

  // Environment
  environment: import.meta.env.VITE_NODE_ENV || 'development',

  // Utility functions
  isDevelopment: () => import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: () => import.meta.env.VITE_NODE_ENV === 'production',
  isDebugMode: () => import.meta.env.VITE_DEBUG_MODE === 'true',
};

// Validate required environment variables
export const validateEnv = () => {
  const required = ['VITE_API_URL'];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }
};

// Initialize environment validation
validateEnv();

export default config;
