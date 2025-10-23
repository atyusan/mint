# Installation Guide

## Prerequisites

Before installing the Mint Platform, ensure you have the following prerequisites installed on your system:

### Required Software

- **Node.js** (version 18 or higher)
- **npm** (version 8 or higher)
- **PostgreSQL** (version 13 or higher)
- **Git** (for cloning the repository)

### Optional Software

- **Redis** (for caching and session storage)
- **Docker** (for containerized deployment)
- **Docker Compose** (for multi-container orchestration)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mint
```

### 2. Backend Setup

#### Navigate to Backend Directory

```bash
cd backend
```

#### Install Dependencies

```bash
npm install
```

#### Environment Configuration

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/mint_platform"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Paystack Configuration
PAYSTACK_SECRET_KEY="sk_test_your_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"

# Server Configuration
PORT=3000
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:3001"
```

#### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed
```

#### Start the Backend Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

### 3. Frontend Setup

#### Navigate to Frontend Directory

```bash
cd ../frontend
```

#### Install Dependencies

```bash
npm install
```

#### Environment Configuration

Create a `.env` file in the frontend directory:

```bash
REACT_APP_API_URL="http://localhost:3000"
REACT_APP_PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"
```

#### Start the Frontend Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3001`

## Database Setup

### PostgreSQL Installation

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS (using Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

#### Windows

Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE mint_platform;

# Create user
CREATE USER mint_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mint_platform TO mint_user;

# Exit
\q
```

### Database Migration

```bash
cd backend
npm run prisma:migrate
```

This will create all necessary tables and relationships in your database.

## Redis Setup (Optional)

### Installation

#### Ubuntu/Debian

```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

#### macOS (using Homebrew)

```bash
brew install redis
brew services start redis
```

#### Windows

Download and install from [Redis official website](https://redis.io/download)

### Configuration

Add Redis configuration to your backend `.env` file:

```bash
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
```

## Paystack Configuration

### 1. Create Paystack Account

1. Visit [Paystack](https://paystack.com/)
2. Sign up for an account
3. Complete the verification process

### 2. Get API Keys

1. Log in to your Paystack dashboard
2. Navigate to Settings > API Keys & Webhooks
3. Copy your Test/Live API keys

### 3. Configure Webhooks

1. In Paystack dashboard, go to Settings > API Keys & Webhooks
2. Add webhook URL: `https://your-domain.com/paystack/webhook`
3. Enable the following events:
   - `charge.success`
   - `paymentrequest.success`
   - `paymentrequest.pending`
   - `invoice.payment_failed`
   - `terminal.status`
   - `terminal.event`

## Development Environment

### VS Code Setup

#### Recommended Extensions

- Prisma
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

#### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

### Environment Variables

#### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mint_platform"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_your_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3001"

# Redis (Optional)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
```

#### Frontend (.env)

```bash
REACT_APP_API_URL="http://localhost:3000"
REACT_APP_PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"
```

## Testing the Installation

### 1. Backend Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Database Connection

```bash
cd backend
npm run prisma:studio
```

This will open Prisma Studio in your browser where you can view and manage your database.

### 3. Frontend Access

Visit `http://localhost:3001` in your browser. You should see the Mint Platform login page.

### 4. Create Test User

Use the registration endpoint to create a test user:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "userType": "MERCHANT",
    "businessName": "Test Business",
    "businessType": "Retail"
  }'
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

#### 2. Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

- Kill the process using the port: `lsof -ti:3000 | xargs kill -9`
- Or change the port in `.env` file

#### 3. Prisma Migration Error

```
Error: Migration engine failed to connect to database
```

**Solution:**

- Check database URL format
- Ensure database is accessible
- Run `npm run prisma:generate` first

#### 4. Frontend Build Error

```
Module not found: Can't resolve '@mui/material'
```

**Solution:**

- Run `npm install` in frontend directory
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Logs and Debugging

#### Backend Logs

```bash
cd backend
npm run start:dev
```

#### Frontend Logs

```bash
cd frontend
npm start
```

#### Database Logs

```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

## Production Deployment

### Environment Preparation

1. **Server Setup**

   - Ubuntu 20.04+ or similar Linux distribution
   - Node.js 18+ installed
   - PostgreSQL 13+ installed
   - Nginx for reverse proxy
   - SSL certificate

2. **Environment Variables**

   - Use production Paystack keys
   - Set strong JWT secret
   - Configure production database
   - Set NODE_ENV=production

3. **Security Configuration**
   - Firewall configuration
   - SSL/TLS setup
   - Database security
   - API rate limiting

### Deployment Steps

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd mint
   ```

2. **Backend Deployment**

   ```bash
   cd backend
   npm install --production
   npm run build
   npm run start:prod
   ```

3. **Frontend Deployment**

   ```bash
   cd frontend
   npm install
   npm run build
   # Deploy build folder to web server
   ```

4. **Database Migration**
   ```bash
   cd backend
   npm run prisma:deploy
   ```

## Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: mint_platform
      POSTGRES_USER: mint_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  redis:
    image: redis:6-alpine
    ports:
      - '6379:6379'

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://mint_user:your_password@postgres:5432/mint_platform
      REDIS_HOST: redis
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - '3001:3001'
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Next Steps

After successful installation:

1. **Configure Paystack**: Set up your Paystack account and webhooks
2. **Create Admin User**: Set up the first admin user
3. **Configure Permissions**: Set up roles and permissions
4. **Test Integration**: Test the Paystack integration
5. **Deploy to Production**: Follow the production deployment guide

## Support

If you encounter issues during installation:

1. Check the [troubleshooting guide](./troubleshooting.md)
2. Review the [FAQ](./faq.md)
3. Create an issue in the repository
4. Contact the development team

---

This installation guide provides step-by-step instructions for setting up the Mint Platform in both development and production environments.
