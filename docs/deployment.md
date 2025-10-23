# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Mint Platform to production environments. It covers various deployment scenarios including cloud platforms, on-premises servers, and containerized deployments.

## Prerequisites

### System Requirements

#### Minimum Requirements

- **CPU**: 2 cores, 2.4 GHz
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **Network**: 100 Mbps connection
- **Operating System**: Ubuntu 20.04+ or similar Linux distribution

#### Recommended Requirements

- **CPU**: 4 cores, 3.0 GHz
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **Network**: 1 Gbps connection
- **Operating System**: Ubuntu 22.04 LTS

### Software Requirements

- **Node.js**: 18+ LTS
- **PostgreSQL**: 13+
- **Nginx**: 1.18+
- **Redis**: 6+ (optional)
- **SSL Certificate**: Valid SSL certificate
- **Domain Name**: Registered domain name

## Environment Preparation

### Server Setup

#### Ubuntu Server Setup

1. **Update System**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Required Packages**

   ```bash
   sudo apt install -y curl wget git nginx postgresql postgresql-contrib redis-server
   ```

3. **Install Node.js**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2**

   ```bash
   sudo npm install -g pm2
   ```

5. **Create Application User**
   ```bash
   sudo useradd -m -s /bin/bash mint
   sudo usermod -aG sudo mint
   ```

### Database Setup

#### PostgreSQL Configuration

1. **Start PostgreSQL**

   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database and User**

   ```sql
   sudo -u postgres psql
   CREATE DATABASE mint_platform;
   CREATE USER mint_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE mint_platform TO mint_user;
   \q
   ```

3. **Configure PostgreSQL**

   ```bash
   sudo nano /etc/postgresql/13/main/postgresql.conf
   ```

   Update the following settings:

   ```
   listen_addresses = 'localhost'
   max_connections = 200
   shared_buffers = 256MB
   effective_cache_size = 1GB
   ```

4. **Configure Access**

   ```bash
   sudo nano /etc/postgresql/13/main/pg_hba.conf
   ```

   Add the following line:

   ```
   local   mint_platform    mint_user    md5
   ```

5. **Restart PostgreSQL**
   ```bash
   sudo systemctl restart postgresql
   ```

### Nginx Configuration

#### Install and Configure Nginx

1. **Start Nginx**

   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

2. **Create Nginx Configuration**

   ```bash
   sudo nano /etc/nginx/sites-available/mint-platform
   ```

   Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com www.your-domain.com;

       ssl_certificate /path/to/your/certificate.crt;
       ssl_certificate_key /path/to/your/private.key;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers off;

       # Frontend
       location / {
           root /home/mint/mint-platform/frontend/build;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       # Webhooks
       location /webhooks {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/mint-platform /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Application Deployment

### Code Deployment

#### Clone and Setup

1. **Switch to Application User**

   ```bash
   sudo su - mint
   ```

2. **Clone Repository**

   ```bash
   git clone <repository-url> mint-platform
   cd mint-platform
   ```

3. **Install Dependencies**

   ```bash
   # Backend
   cd backend
   npm install --production

   # Frontend
   cd ../frontend
   npm install
   ```

4. **Build Frontend**
   ```bash
   npm run build
   ```

### Environment Configuration

#### Backend Environment

1. **Create Production Environment File**

   ```bash
   cd backend
   cp .env.example .env.production
   ```

2. **Configure Environment Variables**

   ```bash
   nano .env.production
   ```

   Set the following variables:

   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL="postgresql://mint_user:secure_password@localhost:5432/mint_platform"
   JWT_SECRET="your-super-secret-jwt-key-for-production"
   JWT_EXPIRES_IN="7d"
   PAYSTACK_SECRET_KEY="sk_live_your_live_secret_key"
   PAYSTACK_PUBLIC_KEY="pk_live_your_live_public_key"
   CORS_ORIGIN="https://your-domain.com"
   REDIS_HOST="localhost"
   REDIS_PORT=6379
   ```

#### Frontend Environment

1. **Create Production Environment File**

   ```bash
   cd frontend
   cp .env.example .env.production
   ```

2. **Configure Environment Variables**

   ```bash
   nano .env.production
   ```

   Set the following variables:

   ```bash
   REACT_APP_API_URL="https://your-domain.com/api"
   REACT_APP_PAYSTACK_PUBLIC_KEY="pk_live_your_live_public_key"
   REACT_APP_ENVIRONMENT="production"
   ```

### Database Migration

1. **Run Database Migrations**

   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate:deploy
   ```

2. **Seed Database (Optional)**
   ```bash
   npm run prisma:seed
   ```

### Application Startup

#### Using PM2

1. **Create PM2 Configuration**

   ```bash
   cd backend
   nano ecosystem.config.js
   ```

   Add the following configuration:

   ```javascript
   module.exports = {
     apps: [
       {
         name: 'mint-backend',
         script: 'dist/main.js',
         instances: 'max',
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production',
           PORT: 3000,
         },
         error_file: './logs/err.log',
         out_file: './logs/out.log',
         log_file: './logs/combined.log',
         time: true,
       },
     ],
   };
   ```

2. **Start Application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### Using Systemd

1. **Create Systemd Service**

   ```bash
   sudo nano /etc/systemd/system/mint-backend.service
   ```

   Add the following configuration:

   ```ini
   [Unit]
   Description=Mint Platform Backend
   After=network.target postgresql.service

   [Service]
   Type=simple
   User=mint
   WorkingDirectory=/home/mint/mint-platform/backend
   ExecStart=/usr/bin/node dist/main.js
   Restart=always
   RestartSec=10
   Environment=NODE_ENV=production
   Environment=PORT=3000

   [Install]
   WantedBy=multi-user.target
   ```

2. **Start Service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start mint-backend
   sudo systemctl enable mint-backend
   ```

## SSL Certificate Setup

### Let's Encrypt (Recommended)

1. **Install Certbot**

   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**

   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Test Auto-renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

### Commercial SSL Certificate

1. **Purchase Certificate**

   - Buy SSL certificate from trusted provider
   - Download certificate files

2. **Install Certificate**

   ```bash
   sudo cp certificate.crt /etc/ssl/certs/
   sudo cp private.key /etc/ssl/private/
   sudo chmod 600 /etc/ssl/private/private.key
   ```

3. **Update Nginx Configuration**
   ```nginx
   ssl_certificate /etc/ssl/certs/certificate.crt;
   ssl_certificate_key /etc/ssl/private/private.key;
   ```

## Monitoring and Logging

### Application Monitoring

#### PM2 Monitoring

1. **Monitor Application**

   ```bash
   pm2 monit
   ```

2. **View Logs**

   ```bash
   pm2 logs mint-backend
   ```

3. **Restart Application**
   ```bash
   pm2 restart mint-backend
   ```

#### System Monitoring

1. **Install Monitoring Tools**

   ```bash
   sudo apt install htop iotop nethogs
   ```

2. **Monitor System Resources**
   ```bash
   htop
   ```

### Log Management

#### Log Rotation

1. **Configure Logrotate**

   ```bash
   sudo nano /etc/logrotate.d/mint-platform
   ```

   Add the following configuration:

   ```
   /home/mint/mint-platform/backend/logs/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 644 mint mint
       postrotate
           pm2 reload mint-backend
       endscript
   }
   ```

#### Centralized Logging

1. **Install ELK Stack (Optional)**
   ```bash
   # Install Elasticsearch, Logstash, Kibana
   # Configure log shipping
   ```

## Backup and Recovery

### Database Backup

#### Automated Backups

1. **Create Backup Script**

   ```bash
   sudo nano /home/mint/backup-db.sh
   ```

   Add the following script:

   ```bash
   #!/bin/bash
   BACKUP_DIR="/home/mint/backups"
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_FILE="$BACKUP_DIR/mint_platform_$DATE.sql"

   mkdir -p $BACKUP_DIR
   pg_dump -h localhost -U mint_user -d mint_platform > $BACKUP_FILE
   gzip $BACKUP_FILE

   # Keep only last 30 days of backups
   find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
   ```

2. **Make Script Executable**

   ```bash
   chmod +x /home/mint/backup-db.sh
   ```

3. **Schedule Backup**

   ```bash
   crontab -e
   ```

   Add the following line:

   ```
   0 2 * * * /home/mint/backup-db.sh
   ```

#### Manual Backup

1. **Create Backup**

   ```bash
   pg_dump -h localhost -U mint_user -d mint_platform > backup.sql
   ```

2. **Restore Backup**
   ```bash
   psql -h localhost -U mint_user -d mint_platform < backup.sql
   ```

### Application Backup

1. **Backup Application Code**

   ```bash
   tar -czf mint-platform-backup-$(date +%Y%m%d).tar.gz /home/mint/mint-platform
   ```

2. **Backup Configuration Files**
   ```bash
   tar -czf config-backup-$(date +%Y%m%d).tar.gz /etc/nginx/sites-available/mint-platform /etc/systemd/system/mint-backend.service
   ```

## Security Configuration

### Firewall Setup

1. **Configure UFW**

   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

2. **Check Status**
   ```bash
   sudo ufw status
   ```

### Security Headers

1. **Update Nginx Configuration**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header Referrer-Policy "no-referrer-when-downgrade" always;
   add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
   ```

### Access Control

1. **Restrict Database Access**

   ```bash
   sudo nano /etc/postgresql/13/main/pg_hba.conf
   ```

   Update to restrict access:

   ```
   local   all             all                                     md5
   host    all             all             127.0.0.1/32            md5
   host    all             all             ::1/128                 md5
   ```

## Performance Optimization

### Database Optimization

1. **Configure PostgreSQL**

   ```bash
   sudo nano /etc/postgresql/13/main/postgresql.conf
   ```

   Update performance settings:

   ```
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   checkpoint_completion_target = 0.9
   wal_buffers = 16MB
   default_statistics_target = 100
   random_page_cost = 1.1
   effective_io_concurrency = 200
   ```

2. **Restart PostgreSQL**
   ```bash
   sudo systemctl restart postgresql
   ```

### Application Optimization

1. **Enable Gzip Compression**

   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_proxied expired no-cache no-store private must-revalidate auth;
   gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
   ```

2. **Configure Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## Docker Deployment

### Docker Compose Setup

1. **Create Docker Compose File**

   ```yaml
   version: '3.8'

   services:
     postgres:
       image: postgres:13
       environment:
         POSTGRES_DB: mint_platform
         POSTGRES_USER: mint_user
         POSTGRES_PASSWORD: secure_password
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
         DATABASE_URL: postgresql://mint_user:secure_password@postgres:5432/mint_platform
         REDIS_HOST: redis
         NODE_ENV: production
       ports:
         - '3000:3000'
       depends_on:
         - postgres
         - redis

     frontend:
       build: ./frontend
       ports:
         - '80:80'
       depends_on:
         - backend

   volumes:
     postgres_data:
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Docker Production Setup

1. **Create Production Dockerfile**

   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "run", "start:prod"]
   ```

2. **Build and Deploy**
   ```bash
   docker build -t mint-backend .
   docker run -d -p 3000:3000 mint-backend
   ```

## Cloud Deployment

### AWS Deployment

#### EC2 Instance Setup

1. **Launch EC2 Instance**

   - Choose Ubuntu 22.04 LTS
   - Select appropriate instance type
   - Configure security groups

2. **Install Dependencies**

   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl wget git nginx postgresql postgresql-contrib
   ```

3. **Configure RDS (Optional)**
   - Create RDS PostgreSQL instance
   - Configure security groups
   - Update connection string

#### Load Balancer Setup

1. **Create Application Load Balancer**

   - Configure target groups
   - Set up health checks
   - Configure SSL certificates

2. **Update Nginx Configuration**

   ```nginx
   upstream backend {
       server 127.0.0.1:3000;
   }

   location /api {
       proxy_pass http://backend;
   }
   ```

### Google Cloud Platform

#### Compute Engine Setup

1. **Create VM Instance**

   - Choose Ubuntu 22.04 LTS
   - Configure firewall rules
   - Set up persistent disks

2. **Install Dependencies**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl wget git nginx postgresql postgresql-contrib
   ```

#### Cloud SQL Setup

1. **Create Cloud SQL Instance**

   - Configure PostgreSQL instance
   - Set up authorized networks
   - Configure backup settings

2. **Update Connection String**
   ```bash
   DATABASE_URL="postgresql://username:password@/database?host=/cloudsql/project:region:instance"
   ```

## Health Checks and Monitoring

### Application Health Checks

1. **Create Health Check Endpoint**

   ```typescript
   @Controller('health')
   export class HealthController {
     @Get()
     async check() {
       return {
         status: 'healthy',
         timestamp: new Date().toISOString(),
         uptime: process.uptime(),
       };
     }
   }
   ```

2. **Configure Load Balancer Health Checks**
   - Set health check path to `/health`
   - Configure check interval
   - Set failure threshold

### Monitoring Setup

1. **Install Monitoring Tools**

   ```bash
   sudo apt install prometheus-node-exporter
   ```

2. **Configure Prometheus**

   ```yaml
   global:
     scrape_interval: 15s

   scrape_configs:
     - job_name: 'mint-platform'
       static_configs:
         - targets: ['localhost:3000']
   ```

## Troubleshooting

### Common Issues

#### Application Won't Start

1. **Check Logs**

   ```bash
   pm2 logs mint-backend
   journalctl -u mint-backend
   ```

2. **Verify Environment Variables**

   ```bash
   pm2 show mint-backend
   ```

3. **Check Database Connection**
   ```bash
   psql -h localhost -U mint_user -d mint_platform
   ```

#### Performance Issues

1. **Monitor System Resources**

   ```bash
   htop
   iotop
   ```

2. **Check Database Performance**

   ```sql
   SELECT * FROM pg_stat_activity;
   ```

3. **Optimize Application**
   - Check for memory leaks
   - Optimize database queries
   - Configure caching

### Maintenance

#### Regular Maintenance Tasks

1. **Update System**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Update Application**

   ```bash
   git pull origin main
   npm install
   npm run build
   pm2 restart mint-backend
   ```

3. **Database Maintenance**
   ```sql
   VACUUM ANALYZE;
   REINDEX DATABASE mint_platform;
   ```

#### Backup Verification

1. **Test Backup Restoration**

   ```bash
   # Create test database
   createdb mint_platform_test

   # Restore backup
   psql mint_platform_test < backup.sql

   # Verify data
   psql mint_platform_test -c "SELECT COUNT(*) FROM users;"
   ```

---

This deployment guide provides comprehensive instructions for deploying the Mint Platform to production environments. Follow these steps carefully and adapt them to your specific infrastructure requirements.
