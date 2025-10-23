# Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered when working with the Mint Platform. It covers installation problems, configuration issues, runtime errors, and performance problems.

## Installation Issues

### Database Connection Errors

#### Error: `connect ECONNREFUSED 127.0.0.1:5432`

**Problem**: Cannot connect to PostgreSQL database.

**Solutions**:

1. **Check PostgreSQL Status**

   ```bash
   # Ubuntu/Debian
   sudo systemctl status postgresql
   sudo systemctl start postgresql

   # macOS
   brew services list | grep postgresql
   brew services start postgresql

   # Windows
   # Check Services.msc for PostgreSQL service
   ```

2. **Verify Database Credentials**

   ```bash
   # Test connection
   psql -h localhost -U username -d mint_platform
   ```

3. **Check Database URL Format**

   ```bash
   # Correct format
   DATABASE_URL="postgresql://username:password@localhost:5432/mint_platform"
   ```

4. **Create Database if Missing**
   ```sql
   CREATE DATABASE mint_platform;
   CREATE USER mint_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE mint_platform TO mint_user;
   ```

#### Error: `Migration engine failed to connect to database`

**Problem**: Prisma cannot connect to database for migrations.

**Solutions**:

1. **Generate Prisma Client**

   ```bash
   cd backend
   npm run prisma:generate
   ```

2. **Check Database URL**

   ```bash
   # Verify .env file
   cat .env | grep DATABASE_URL
   ```

3. **Reset Database**
   ```bash
   npm run prisma:reset
   npm run prisma:migrate
   ```

### Port Already in Use

#### Error: `listen EADDRINUSE: address already in use :::3000`

**Problem**: Port 3000 is already occupied by another process.

**Solutions**:

1. **Find and Kill Process**

   ```bash
   # Find process using port 3000
   lsof -ti:3000

   # Kill process
   kill -9 $(lsof -ti:3000)

   # Alternative method
   sudo fuser -k 3000/tcp
   ```

2. **Change Port**

   ```bash
   # In backend/.env
   PORT=3001
   ```

3. **Check for Other Services**
   ```bash
   # Check what's running on port 3000
   netstat -tulpn | grep :3000
   ```

### Dependency Installation Issues

#### Error: `npm ERR! peer dep missing`

**Problem**: Missing peer dependencies.

**Solutions**:

1. **Clear npm Cache**

   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and Reinstall**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Install Peer Dependencies**
   ```bash
   npm install --save-dev @types/node @types/react
   ```

#### Error: `Module not found: Can't resolve '@mui/material'`

**Problem**: Material UI components not found.

**Solutions**:

1. **Install Material UI**

   ```bash
   cd frontend
   npm install @mui/material @emotion/react @emotion/styled
   ```

2. **Install Icons**

   ```bash
   npm install @mui/icons-material
   ```

3. **Check Import Statements**
   ```typescript
   // Correct import
   import { Button, Typography } from '@mui/material';
   ```

## Configuration Issues

### Environment Variables

#### Error: `Configuration validation failed`

**Problem**: Invalid environment variable configuration.

**Solutions**:

1. **Check Required Variables**

   ```bash
   # Backend required variables
   DATABASE_URL
   JWT_SECRET
   PAYSTACK_SECRET_KEY
   PAYSTACK_PUBLIC_KEY
   ```

2. **Validate Variable Format**

   ```bash
   # Database URL format
   DATABASE_URL="postgresql://username:password@localhost:5432/database"

   # JWT Secret (minimum 32 characters)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Paystack keys
   PAYSTACK_SECRET_KEY="sk_test_your_secret_key"
   PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"
   ```

3. **Check File Permissions**
   ```bash
   # Make sure .env files are readable
   chmod 644 .env
   ```

### Paystack Configuration

#### Error: `Invalid Paystack API key`

**Problem**: Paystack API keys are invalid or missing.

**Solutions**:

1. **Verify API Keys**

   ```bash
   # Check .env file
   grep PAYSTACK .env
   ```

2. **Test API Connection**

   ```bash
   curl -H "Authorization: Bearer sk_test_your_key" \
        https://api.paystack.co/customer
   ```

3. **Check Key Format**
   ```bash
   # Secret key should start with 'sk_'
   # Public key should start with 'pk_'
   PAYSTACK_SECRET_KEY="sk_test_..."
   PAYSTACK_PUBLIC_KEY="pk_test_..."
   ```

#### Error: `Webhook signature verification failed`

**Problem**: Webhook signature validation is failing.

**Solutions**:

1. **Check Webhook Secret**

   ```bash
   # Verify webhook secret in .env
   WEBHOOK_SECRET="your-webhook-secret"
   ```

2. **Verify Webhook URL**

   ```bash
   # Check webhook URL in Paystack dashboard
   https://your-domain.com/paystack/webhook
   ```

3. **Check Signature Header**
   ```typescript
   // Ensure x-paystack-signature header is present
   const signature = req.headers['x-paystack-signature'];
   ```

## Runtime Errors

### Authentication Errors

#### Error: `Unauthorized: Invalid token`

**Problem**: JWT token is invalid or expired.

**Solutions**:

1. **Check Token Format**

   ```typescript
   // Token should be in Authorization header
   Authorization: Bearer<token>;
   ```

2. **Verify JWT Secret**

   ```bash
   # Check JWT secret in .env
   JWT_SECRET="your-super-secret-jwt-key"
   ```

3. **Check Token Expiration**
   ```typescript
   // Token might be expired
   // User needs to login again
   ```

#### Error: `Forbidden: Insufficient permissions`

**Problem**: User doesn't have required permissions.

**Solutions**:

1. **Check User Permissions**

   ```typescript
   // Verify user has required permissions
   const user = await getUserPermissions(userId);
   ```

2. **Check Role Assignments**

   ```typescript
   // Verify user has correct role
   const userRoles = await getUserRoles(userId);
   ```

3. **Update Permissions**
   ```typescript
   // Assign required permissions to user
   await assignPermission(userId, permissionId);
   ```

### Database Errors

#### Error: `Unique constraint failed`

**Problem**: Attempting to insert duplicate data.

**Solutions**:

1. **Check for Existing Records**

   ```typescript
   // Check if record already exists
   const existing = await prisma.user.findUnique({
     where: { email: userEmail },
   });
   ```

2. **Handle Duplicates Gracefully**

   ```typescript
   try {
     const user = await prisma.user.create({ data: userData });
   } catch (error) {
     if (error.code === 'P2002') {
       throw new ConflictException('Email already exists');
     }
     throw error;
   }
   ```

3. **Use Upsert for Updates**
   ```typescript
   const user = await prisma.user.upsert({
     where: { email: userEmail },
     update: userData,
     create: userData,
   });
   ```

#### Error: `Foreign key constraint failed`

**Problem**: Referenced record doesn't exist.

**Solutions**:

1. **Check Referenced Records**

   ```typescript
   // Verify referenced record exists
   const outlet = await prisma.outlet.findUnique({
     where: { id: outletId },
   });
   ```

2. **Create Referenced Records First**

   ```typescript
   // Create outlet before creating terminal
   const outlet = await prisma.outlet.create({ data: outletData });
   const terminal = await prisma.terminal.create({
     data: { ...terminalData, outletId: outlet.id },
   });
   ```

3. **Use Transactions**
   ```typescript
   await prisma.$transaction(async (tx) => {
     const outlet = await tx.outlet.create({ data: outletData });
     const terminal = await tx.terminal.create({
       data: { ...terminalData, outletId: outlet.id },
     });
   });
   ```

### API Errors

#### Error: `Request timeout`

**Problem**: API request is taking too long.

**Solutions**:

1. **Increase Timeout**

   ```typescript
   // Increase API timeout
   const response = await fetch(url, {
     timeout: 30000, // 30 seconds
   });
   ```

2. **Optimize Database Queries**

   ```typescript
   // Use select to limit fields
   const users = await prisma.user.findMany({
     select: { id: true, email: true },
   });
   ```

3. **Add Database Indexes**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_invoices_status ON invoices(status);
   ```

#### Error: `Rate limit exceeded`

**Problem**: Too many requests in a short time.

**Solutions**:

1. **Implement Request Throttling**

   ```typescript
   // Add delay between requests
   await new Promise((resolve) => setTimeout(resolve, 1000));
   ```

2. **Use Exponential Backoff**

   ```typescript
   const delay = Math.pow(2, attempt) * 1000;
   await new Promise((resolve) => setTimeout(resolve, delay));
   ```

3. **Check Rate Limit Headers**
   ```typescript
   const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
   if (rateLimitRemaining < 10) {
     // Slow down requests
   }
   ```

## Performance Issues

### Slow Database Queries

#### Problem: Long query execution times

**Solutions**:

1. **Add Database Indexes**

   ```sql
   -- Add indexes for frequently queried fields
   CREATE INDEX idx_invoices_outlet_status ON invoices(outlet_id, status);
   CREATE INDEX idx_payments_invoice_status ON payments(invoice_id, status);
   CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
   ```

2. **Optimize Query Structure**

   ```typescript
   // Use select to limit fields
   const users = await prisma.user.findMany({
     select: {
       id: true,
       firstName: true,
       lastName: true,
       email: true,
     },
     where: { status: 'ACTIVE' },
     take: 10,
   });
   ```

3. **Use Pagination**
   ```typescript
   const users = await prisma.user.findMany({
     skip: (page - 1) * limit,
     take: limit,
     orderBy: { createdAt: 'desc' },
   });
   ```

### Memory Issues

#### Problem: High memory usage

**Solutions**:

1. **Optimize Data Loading**

   ```typescript
   // Load data in batches
   const batchSize = 100;
   for (let i = 0; i < total; i += batchSize) {
     const batch = await prisma.user.findMany({
       skip: i,
       take: batchSize,
     });
     // Process batch
   }
   ```

2. **Use Streaming for Large Datasets**

   ```typescript
   // Stream large datasets
   const stream = prisma.user.findManyStream({
     where: { status: 'ACTIVE' },
   });

   for await (const user of stream) {
     // Process user
   }
   ```

3. **Clear Unused Variables**
   ```typescript
   // Clear large variables when done
   let largeData = await fetchLargeData();
   // Process data
   largeData = null;
   ```

### Frontend Performance Issues

#### Problem: Slow page loading

**Solutions**:

1. **Implement Code Splitting**

   ```typescript
   import { lazy, Suspense } from 'react';

   const UserList = lazy(() => import('./UserList'));

   function App() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <UserList />
       </Suspense>
     );
   }
   ```

2. **Optimize Bundle Size**

   ```typescript
   // Use dynamic imports
   const moment = await import('moment');

   // Remove unused imports
   import { Button } from '@mui/material'; // Instead of import * as MUI
   ```

3. **Implement Caching**

   ```typescript
   // Cache API responses
   const cache = new Map();

   const fetchUser = async (id: string) => {
     if (cache.has(id)) {
       return cache.get(id);
     }

     const user = await api.getUser(id);
     cache.set(id, user);
     return user;
   };
   ```

## Security Issues

### Authentication Bypass

#### Problem: Users accessing unauthorized resources

**Solutions**:

1. **Verify JWT Token**

   ```typescript
   // Check token validity
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   ```

2. **Check User Permissions**

   ```typescript
   // Verify user has required permissions
   const hasPermission = await checkUserPermission(userId, resource, action);
   if (!hasPermission) {
     throw new ForbiddenException();
   }
   ```

3. **Implement Role-Based Access**
   ```typescript
   // Check user role
   const userRole = await getUserRole(userId);
   if (userRole !== 'ADMIN') {
     throw new ForbiddenException();
   }
   ```

### Data Validation Issues

#### Problem: Invalid data causing errors

**Solutions**:

1. **Implement Input Validation**

   ```typescript
   // Use DTOs with validation
   export class CreateUserDto {
     @IsEmail()
     email: string;

     @IsString()
     @MinLength(8)
     password: string;
   }
   ```

2. **Sanitize Input Data**

   ```typescript
   // Sanitize user input
   const sanitizedData = {
     email: data.email.toLowerCase().trim(),
     firstName: data.firstName.trim(),
   };
   ```

3. **Validate File Uploads**

   ```typescript
   // Check file type and size
   if (file.mimetype !== 'image/jpeg') {
     throw new BadRequestException('Invalid file type');
   }

   if (file.size > MAX_FILE_SIZE) {
     throw new BadRequestException('File too large');
   }
   ```

## Monitoring and Debugging

### Logging Issues

#### Problem: Insufficient logging for debugging

**Solutions**:

1. **Implement Structured Logging**

   ```typescript
   import { Logger } from '@nestjs/common';

   export class UserService {
     private readonly logger = new Logger(UserService.name);

     async createUser(dto: CreateUserDto) {
       this.logger.log(`Creating user with email: ${dto.email}`);

       try {
         const user = await this.prisma.user.create({ data: dto });
         this.logger.log(`User created successfully: ${user.id}`);
         return user;
       } catch (error) {
         this.logger.error(
           `Failed to create user: ${error.message}`,
           error.stack
         );
         throw error;
       }
     }
   }
   ```

2. **Add Request Logging**

   ```typescript
   // Log all requests
   app.use((req, res, next) => {
     console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
     next();
   });
   ```

3. **Implement Error Tracking**
   ```typescript
   // Track errors with context
   try {
     // Operation
   } catch (error) {
     logger.error('Operation failed', {
       error: error.message,
       stack: error.stack,
       userId: req.user?.id,
       timestamp: new Date().toISOString(),
     });
     throw error;
   }
   ```

### Health Check Issues

#### Problem: Health checks failing

**Solutions**:

1. **Implement Health Checks**

   ```typescript
   @Controller('health')
   export class HealthController {
     constructor(
       private readonly prisma: PrismaService,
       private readonly redis: RedisService
     ) {}

     @Get()
     async check() {
       const checks = await Promise.allSettled([
         this.checkDatabase(),
         this.checkRedis(),
       ]);

       const isHealthy = checks.every((check) => check.status === 'fulfilled');

       return {
         status: isHealthy ? 'healthy' : 'unhealthy',
         checks: {
           database: checks[0].status,
           redis: checks[1].status,
         },
         timestamp: new Date().toISOString(),
       };
     }
   }
   ```

2. **Monitor External Dependencies**
   ```typescript
   // Check Paystack API
   async checkPaystack() {
     try {
       const response = await fetch('https://api.paystack.co/customer', {
         headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
       });
       return response.ok;
     } catch {
       return false;
     }
   }
   ```

## Getting Help

### Debugging Steps

1. **Check Logs**

   ```bash
   # Backend logs
   cd backend
   npm run start:dev

   # Frontend logs
   cd frontend
   npm start
   ```

2. **Enable Debug Mode**

   ```bash
   # Set debug environment
   DEBUG=* npm run start:dev
   ```

3. **Use Development Tools**
   - VS Code debugger
   - React Developer Tools
   - Redux DevTools
   - Network tab in browser

### Common Resources

1. **Documentation**

   - [NestJS Documentation](https://docs.nestjs.com/)
   - [Prisma Documentation](https://www.prisma.io/docs/)
   - [Material UI Documentation](https://mui.com/)
   - [Paystack API Documentation](https://paystack.com/docs/)

2. **Community Support**

   - GitHub Issues
   - Stack Overflow
   - Discord/Slack channels
   - Developer forums

3. **Professional Support**
   - Contact development team
   - Enterprise support options
   - Consulting services

---

This troubleshooting guide provides solutions to common issues encountered when working with the Mint Platform. If you encounter issues not covered here, please create an issue in the repository or contact the development team.
