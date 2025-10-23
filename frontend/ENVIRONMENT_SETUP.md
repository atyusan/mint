# Environment Variables Setup

## Overview

The Mint Platform frontend uses Vite for environment variable management. All environment variables must be prefixed with `VITE_` to be accessible in the browser.

## Environment Files

### 1. Development Environment

Copy `env.development.example` to `.env.development`:

```bash
cp env.development.example .env.development
```

### 2. Production Environment

Copy `env.production.example` to `.env.production`:

```bash
cp env.production.example .env.production
```

### 3. General Environment

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

## Available Environment Variables

### API Configuration

- `VITE_API_URL` - Backend API URL (default: `/api`)

### App Configuration

- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_APP_DESCRIPTION` - Application description

### Feature Flags

- `VITE_ENABLE_ANALYTICS` - Enable/disable analytics features
- `VITE_ENABLE_TERMINAL_MANAGEMENT` - Enable/disable terminal management
- `VITE_ENABLE_PAYOUTS` - Enable/disable payout features

### Development Settings

- `VITE_DEBUG_MODE` - Enable debug mode
- `VITE_ENABLE_MOCK_DATA` - Enable mock data for development

### Paystack Configuration

- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key for frontend integration

### Environment

- `VITE_NODE_ENV` - Environment type (development/production)

## Usage in Code

### Using the Config Utility

```typescript
import { config } from './config/env';

// Access configuration
const apiUrl = config.api.baseUrl;
const isDebugMode = config.isDebugMode();
const appName = config.app.name;
```

### Using Constants

```typescript
import { APP_CONSTANTS } from './config/constants';

// Access constants
const apiUrl = APP_CONSTANTS.API_BASE_URL;
const isDevelopment = APP_CONSTANTS.IS_DEVELOPMENT;
```

### Direct Access (Not Recommended)

```typescript
// Direct access to environment variables
const apiUrl = import.meta.env.VITE_API_URL;
```

## Environment File Priority

Vite loads environment files in the following order (higher priority overrides lower):

1. `.env.[mode].local` (e.g., `.env.development.local`)
2. `.env.local`
3. `.env.[mode]` (e.g., `.env.development`)
4. `.env`

## Security Notes

⚠️ **Important**: All environment variables prefixed with `VITE_` are exposed to the browser. Never put sensitive information like API keys or secrets in these variables.

For sensitive data:

- Use server-side environment variables
- Implement proper authentication
- Use secure API endpoints

## Development Setup

1. Copy the appropriate environment file:

   ```bash
   cp env.development.example .env.development
   ```

2. Update the values as needed for your development environment

3. Start the development server:
   ```bash
   npm run dev
   ```

## Production Setup

1. Copy the production environment file:

   ```bash
   cp env.production.example .env.production
   ```

2. Update the values for your production environment

3. Build the application:
   ```bash
   npm run build
   ```

## Example Environment Files

### Development (.env.development)

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Mint Platform (Development)
VITE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=true
```

### Production (.env.production)

```env
VITE_API_URL=https://api.mintplatform.com
VITE_APP_NAME=Mint Platform
VITE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
```

## Troubleshooting

### Environment Variables Not Loading

1. Ensure variables are prefixed with `VITE_`
2. Check that the environment file exists
3. Restart the development server after changes
4. Verify the file is in the correct location (frontend root directory)

### Build Issues

1. Ensure all required environment variables are set
2. Check for typos in variable names
3. Verify the environment file format (no spaces around `=`)
