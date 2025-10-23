# Configuration Guide

## Overview

This guide covers all configuration options for the Mint Platform, including environment variables, system settings, and third-party integrations.

## Environment Variables

### Backend Configuration

#### Database Configuration

```bash
# PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/mint_platform"

# Database Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_ACQUIRE_TIMEOUT=60000
```

#### Authentication Configuration

```bash
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Password Configuration
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true
```

#### Server Configuration

```bash
# Server Settings
PORT=3000
NODE_ENV="development"
HOST="0.0.0.0"

# CORS Configuration
CORS_ORIGIN="http://localhost:3001"
CORS_CREDENTIALS=true
CORS_METHODS="GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
THROTTLE_SKIP_SUCCESSFUL_REQUESTS=false
```

#### Paystack Configuration

```bash
# Paystack API Keys
PAYSTACK_SECRET_KEY="sk_test_your_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"

# Paystack Settings
PAYSTACK_BASE_URL="https://api.paystack.co"
PAYSTACK_TIMEOUT=30000
PAYSTACK_RETRY_ATTEMPTS=3

# Webhook Configuration
WEBHOOK_SECRET="your-webhook-secret-key"
WEBHOOK_TIMEOUT=5000
```

#### Redis Configuration (Optional)

```bash
# Redis Settings
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
REDIS_TTL=3600

# Redis Cluster (for production)
REDIS_CLUSTER_NODES="redis1:6379,redis2:6379,redis3:6379"
REDIS_CLUSTER_ENABLED=false
```

#### Email Configuration (Optional)

```bash
# SMTP Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Email Templates
EMAIL_FROM="noreply@mintplatform.com"
EMAIL_FROM_NAME="Mint Platform"
EMAIL_TEMPLATES_PATH="./templates"
```

#### File Upload Configuration

```bash
# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH="uploads"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
UPLOAD_TEMP_PATH="temp"
```

#### Logging Configuration

```bash
# Logging Settings
LOG_LEVEL="info"
LOG_FILE="logs/app.log"
LOG_MAX_SIZE="10m"
LOG_MAX_FILES=5
LOG_DATE_PATTERN="YYYY-MM-DD"

# Log Rotation
LOG_ROTATION_ENABLED=true
LOG_COMPRESS=true
```

### Frontend Configuration

#### API Configuration

```bash
# API Settings
REACT_APP_API_URL="http://localhost:3000"
REACT_APP_API_TIMEOUT=30000
REACT_APP_API_RETRY_ATTEMPTS=3

# Paystack Frontend
REACT_APP_PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"
```

#### Application Configuration

```bash
# App Settings
REACT_APP_NAME="Mint Platform"
REACT_APP_VERSION="1.0.0"
REACT_APP_ENVIRONMENT="development"

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_DARK_MODE=false
```

#### UI Configuration

```bash
# UI Settings
REACT_APP_THEME_PRIMARY="#1976d2"
REACT_APP_THEME_SECONDARY="#dc004e"
REACT_APP_DEFAULT_LANGUAGE="en"
REACT_APP_CURRENCY="NGN"
REACT_APP_DATE_FORMAT="DD/MM/YYYY"
```

## System Configuration

### Database Configuration

#### Connection Pool Settings

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_timeout = 30
  connection_limit = 10
}
```

#### Database Indexes

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_invoices_outlet_status ON invoices(outlet_id, status);
CREATE INDEX CONCURRENTLY idx_payments_invoice_status ON payments(invoice_id, status);
CREATE INDEX CONCURRENTLY idx_audit_logs_user_created ON audit_logs(user_id, created_at);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY idx_active_terminals ON terminals(outlet_id) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY idx_active_outlets ON outlets(merchant_id) WHERE is_active = true;
```

### Authentication Configuration

#### JWT Configuration

```typescript
// auth/jwt.config.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'mint-platform',
    audience: 'mint-platform-users',
  },
  verifyOptions: {
    issuer: 'mint-platform',
    audience: 'mint-platform-users',
  },
};
```

#### Password Policy

```typescript
// auth/password-policy.ts
export const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  maxLength: 128,
  forbiddenPasswords: ['password', '123456', 'admin'],
};
```

### Rate Limiting Configuration

```typescript
// throttler.config.ts
export const throttlerConfig = {
  ttl: parseInt(process.env.THROTTLE_TTL) || 60000,
  limit: parseInt(process.env.THROTTLE_LIMIT) || 100,
  skipSuccessfulRequests:
    process.env.THROTTLE_SKIP_SUCCESSFUL_REQUESTS === 'true',
  skipFailedRequests: false,
  ignoreUserAgents: ['health-check'],
};
```

### CORS Configuration

```typescript
// cors.config.ts
export const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: process.env.CORS_METHODS?.split(',') || [
    'GET',
    'HEAD',
    'PUT',
    'PATCH',
    'POST',
    'DELETE',
    'OPTIONS',
  ],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-paystack-signature'],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
};
```

## Paystack Integration Configuration

### API Configuration

```typescript
// paystack/paystack.config.ts
export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
  timeout: parseInt(process.env.PAYSTACK_TIMEOUT) || 30000,
  retryAttempts: parseInt(process.env.PAYSTACK_RETRY_ATTEMPTS) || 3,
  retryDelay: 1000,
};
```

### Webhook Configuration

```typescript
// webhooks/webhook.config.ts
export const webhookConfig = {
  secret: process.env.WEBHOOK_SECRET,
  timeout: parseInt(process.env.WEBHOOK_TIMEOUT) || 5000,
  events: [
    'charge.success',
    'paymentrequest.success',
    'paymentrequest.pending',
    'invoice.payment_failed',
    'terminal.status',
    'terminal.event',
  ],
};
```

### Fee Configuration

```typescript
// fees/fee.config.ts
export const feeConfig = {
  tiers: {
    basic: { percentage: 0.035, min: 50, max: 5000 },
    standard: { percentage: 0.025, min: 50, max: 2000 },
    premium: { percentage: 0.015, min: 50, max: 1000 },
    enterprise: { percentage: 0.01, min: 50, max: 500 },
  },
  defaultTier: 'standard',
  currency: 'NGN',
};
```

## Redis Configuration

### Connection Configuration

```typescript
// redis/redis.config.ts
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  ttl: parseInt(process.env.REDIS_TTL) || 3600,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};
```

### Cache Configuration

```typescript
// cache/cache.config.ts
export const cacheConfig = {
  userSession: { ttl: 3600, prefix: 'user_session:' },
  merchantData: { ttl: 1800, prefix: 'merchant:' },
  analytics: { ttl: 300, prefix: 'analytics:' },
  terminalStatus: { ttl: 60, prefix: 'terminal_status:' },
};
```

## Email Configuration

### SMTP Configuration

```typescript
// email/email.config.ts
export const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  from: process.env.EMAIL_FROM || 'noreply@mintplatform.com',
  fromName: process.env.EMAIL_FROM_NAME || 'Mint Platform',
};
```

### Email Templates

```typescript
// email/templates.config.ts
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to Mint Platform',
    template: 'welcome.html',
  },
  invoiceCreated: {
    subject: 'New Invoice Created',
    template: 'invoice-created.html',
  },
  paymentReceived: {
    subject: 'Payment Received',
    template: 'payment-received.html',
  },
  payoutProcessed: {
    subject: 'Payout Processed',
    template: 'payout-processed.html',
  },
};
```

## File Upload Configuration

### Upload Settings

```typescript
// upload/upload.config.ts
export const uploadConfig = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  uploadPath: process.env.UPLOAD_PATH || 'uploads',
  tempPath: process.env.UPLOAD_TEMP_PATH || 'temp',
  allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
};
```

### Storage Configuration

```typescript
// storage/storage.config.ts
export const storageConfig = {
  provider: process.env.STORAGE_PROVIDER || 'local',
  local: {
    path: process.env.UPLOAD_PATH || 'uploads',
  },
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
};
```

## Logging Configuration

### Logging Settings

```typescript
// logging/logging.config.ts
export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: 'combined',
  transports: [
    {
      type: 'console',
      level: 'debug',
    },
    {
      type: 'file',
      filename: process.env.LOG_FILE || 'logs/app.log',
      level: 'info',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    },
  ],
};
```

### Audit Logging

```typescript
// audit/audit.config.ts
export const auditConfig = {
  enabled: process.env.AUDIT_LOGGING_ENABLED === 'true',
  logLevel: process.env.AUDIT_LOG_LEVEL || 'info',
  sensitiveFields: ['password', 'token', 'secret'],
  excludeFields: ['createdAt', 'updatedAt'],
  includeUserAgent: true,
  includeIpAddress: true,
};
```

## Monitoring Configuration

### Health Check Configuration

```typescript
// health/health.config.ts
export const healthConfig = {
  enabled: true,
  path: '/health',
  checks: {
    database: {
      enabled: true,
      timeout: 5000,
    },
    redis: {
      enabled: process.env.REDIS_HOST !== undefined,
      timeout: 3000,
    },
    paystack: {
      enabled: true,
      timeout: 10000,
    },
  },
};
```

### Metrics Configuration

```typescript
// metrics/metrics.config.ts
export const metricsConfig = {
  enabled: process.env.METRICS_ENABLED === 'true',
  path: '/metrics',
  interval: parseInt(process.env.METRICS_INTERVAL) || 300000, // 5 minutes
  collectors: {
    http: true,
    database: true,
    redis: process.env.REDIS_HOST !== undefined,
    paystack: true,
  },
};
```

## Security Configuration

### Security Headers

```typescript
// security/security.config.ts
export const securityConfig = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
  cors: corsConfig,
  rateLimit: throttlerConfig,
};
```

### Input Validation

```typescript
// validation/validation.config.ts
export const validationConfig = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  validationError: {
    target: false,
    value: false,
  },
};
```

## Environment-Specific Configuration

### Development Environment

```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3001
DATABASE_URL=postgresql://localhost:5432/mint_platform_dev
PAYSTACK_SECRET_KEY=sk_test_development_key
```

### Staging Environment

```bash
# .env.staging
NODE_ENV=staging
LOG_LEVEL=info
CORS_ORIGIN=https://staging.mintplatform.com
DATABASE_URL=postgresql://staging-db:5432/mint_platform_staging
PAYSTACK_SECRET_KEY=sk_test_staging_key
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=warn
CORS_ORIGIN=https://mintplatform.com
DATABASE_URL=postgresql://prod-db:5432/mint_platform_prod
PAYSTACK_SECRET_KEY=sk_live_production_key
```

## Configuration Validation

### Environment Validation

```typescript
// config/validation.ts
import { z } from 'zod';

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PAYSTACK_SECRET_KEY: z.string().startsWith('sk_'),
  PAYSTACK_PUBLIC_KEY: z.string().startsWith('pk_'),
  PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
});

export const validateConfig = () => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
  }
};
```

### Configuration Loading

```typescript
// config/index.ts
import { validateConfig } from './validation';

export const config = validateConfig();

export default config;
```

## Configuration Management

### Configuration Updates

1. **Environment Variables**: Update `.env` files
2. **Database Configuration**: Update Prisma schema
3. **Application Configuration**: Update config files
4. **Restart Services**: Restart application after changes

### Configuration Backup

```bash
# Backup configuration files
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env* config/ prisma/schema.prisma

# Restore configuration
tar -xzf config-backup-20240115.tar.gz
```

### Configuration Monitoring

```typescript
// monitoring/config-monitor.ts
export const configMonitor = {
  checkInterval: 60000, // 1 minute
  alertOnChange: true,
  logChanges: true,
  validateOnChange: true,
};
```

---

This configuration guide provides comprehensive information about all configuration options available in the Mint Platform. Use this as a reference when setting up and customizing your deployment.
