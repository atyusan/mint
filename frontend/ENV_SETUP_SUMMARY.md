# Environment Variables Setup - Complete ✅

## What's Been Added

### 1. Environment Configuration Files

- `env.example` - General environment template
- `env.development.example` - Development environment template
- `env.production.example` - Production environment template
- `ENVIRONMENT_SETUP.md` - Complete setup documentation

### 2. Configuration Utilities

- `src/config/env.ts` - Main environment configuration utility
- `src/config/constants.ts` - Application constants using environment variables
- `src/vite-env.d.ts` - TypeScript definitions for Vite environment variables

### 3. Updated Files

- `src/api/api.ts` - Updated to use environment-based API configuration
- `vite.config.ts` - Enhanced to handle environment variables and proxy configuration

### 4. Example Component

- `src/components/AppInfo.tsx` - Example component showing how to use environment variables

## Available Environment Variables

### API Configuration

```env
VITE_API_URL=http://localhost:3001
```

### App Configuration

```env
VITE_APP_NAME=Mint Platform
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Payment Facilitation Platform
```

### Feature Flags

```env
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_TERMINAL_MANAGEMENT=true
VITE_ENABLE_PAYOUTS=true
```

### Development Settings

```env
VITE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
```

### Paystack Configuration

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
```

### Environment

```env
VITE_NODE_ENV=development
```

## How to Use

### 1. Setup Environment Files

```bash
# Copy the example files
cp env.development.example .env.development
cp env.production.example .env.production
cp env.example .env

# Edit the files with your actual values
```

### 2. Use in Components

```typescript
import { config } from '../config/env';
import { APP_CONSTANTS } from '../config/constants';

// Access configuration
const apiUrl = config.api.baseUrl;
const isDebugMode = config.isDebugMode();
const appName = APP_CONSTANTS.APP_NAME;
```

### 3. Environment-Specific Builds

```bash
# Development build
npm run build -- --mode development

# Production build
npm run build -- --mode production
```

## Key Features

✅ **Type Safety** - Full TypeScript support for environment variables
✅ **Validation** - Automatic validation of required environment variables
✅ **Feature Flags** - Easy feature toggling via environment variables
✅ **Multi-Environment** - Support for development, staging, and production
✅ **Documentation** - Complete setup and usage documentation
✅ **Examples** - Working examples of how to use environment variables

## Security Notes

⚠️ **Important**: All `VITE_` prefixed variables are exposed to the browser. Never put sensitive data like API keys or secrets in these variables.

## Next Steps

1. Copy the example environment files to actual `.env` files
2. Update the values for your specific environment
3. Use the configuration utilities in your components
4. Set up different environment files for different deployment stages

The environment variable system is now fully configured and ready to use! 🚀
