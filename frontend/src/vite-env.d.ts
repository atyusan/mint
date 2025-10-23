/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_TERMINAL_MANAGEMENT: string;
  readonly VITE_ENABLE_PAYOUTS: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_ENABLE_MOCK_DATA: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY: string;
  readonly VITE_NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
