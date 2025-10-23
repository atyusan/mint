# Mint Platform - Payment Facilitation System

A comprehensive payment facilitation platform that enables businesses to manage POS terminals, process payments, and handle payouts through Paystack integration.

## 🚀 Features

### Core Functionality

- **Multi-tenant Architecture**: Support for merchants, individuals, and administrators
- **RBAC System**: Granular role-based access control with permissions
- **POS Terminal Management**: Complete lifecycle management of Paystack terminals
- **Invoice Processing**: Create and manage invoices with automatic Paystack integration
- **Real-time Analytics**: Comprehensive dashboards and reporting
- **Payout Management**: Flexible payout scheduling and processing
- **Dynamic Fee Calculation**: Tier-based fee structures

### Technical Features

- **Real-time Webhooks**: Instant payment status updates
- **Comprehensive Audit Logging**: Complete activity tracking
- **Scalable Architecture**: Built for high-volume transactions
- **Security First**: HMAC signature verification, JWT authentication
- **Modern UI**: Material UI with responsive design

## 🏗️ Architecture

### Backend (NestJS + Prisma + PostgreSQL)

- **Authentication & Authorization**: JWT-based with granular permissions
- **Database**: PostgreSQL with Prisma ORM
- **Payment Gateway**: Paystack Terminal API integration
- **Real-time Updates**: Webhook processing with signature verification
- **Analytics Engine**: Advanced reporting and metrics

### Frontend (React + TypeScript + Material UI)

- **State Management**: Redux Toolkit for predictable state
- **UI Framework**: Material UI with custom theming
- **Routing**: React Router for navigation
- **Charts**: Recharts for data visualization
- **Responsive Design**: Mobile-first approach

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Redis (optional, for caching)
- Paystack account with Terminal API access

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mint
```

### 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Configure your environment variables
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. Environment Configuration

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
```

#### Frontend (.env)

```bash
REACT_APP_API_URL="http://localhost:3000"
```

## 🔧 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

### Merchants & Outlets

- `GET /merchants/profile` - Get merchant profile
- `GET /outlets` - List outlets
- `POST /outlets` - Create outlet
- `PUT /outlets/:id` - Update outlet

### Terminals

- `GET /terminals` - List terminals
- `POST /terminals` - Create terminal
- `PUT /terminals/:id` - Update terminal
- `PATCH /terminals/:id/status` - Update terminal status
- `POST /terminals/:id/assign` - Assign terminal to outlet

### Invoices

- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `GET /invoices/:id` - Get invoice details
- `PUT /invoices/:id` - Update invoice
- `POST /invoices/:id/cancel` - Cancel invoice

### Analytics

- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/revenue-trends` - Revenue trends
- `GET /analytics/top-outlets` - Top performing outlets
- `GET /analytics/top-categories` - Top categories
- `GET /analytics/payment-methods` - Payment method analytics
- `GET /analytics/terminal-performance` - Terminal performance
- `GET /analytics/real-time` - Real-time metrics

### Payouts

- `GET /payouts` - List payouts
- `POST /payouts` - Create payout
- `GET /payouts/methods` - List payout methods
- `POST /payouts/methods` - Create payout method
- `PUT /payouts/methods/:id` - Update payout method
- `DELETE /payouts/methods/:id` - Delete payout method

### Fees

- `GET /fees/calculate` - Calculate fees
- `GET /fees/tier/:merchantId` - Get merchant tier
- `POST /fees/tier/:merchantId` - Update merchant tier
- `GET /fees/history/:merchantId` - Get fee history

### Webhooks

- `POST /paystack/webhook` - Paystack webhook endpoint

## 🎯 User Roles & Permissions

### Admin

- Full system access
- User management
- System configuration
- Analytics across all merchants

### Merchant

- Manage own outlets and terminals
- Create and manage invoices
- View analytics for own business
- Manage payout methods and schedules

### Individual

- Limited access to personal features
- Basic invoice creation
- Personal analytics

## 📊 Analytics & Reporting

### Dashboard Metrics

- Total revenue and growth trends
- Invoice success rates
- Active terminal status
- Pending payouts

### Revenue Analytics

- Daily, weekly, monthly trends
- Category-based breakdowns
- Payment method analysis
- Terminal performance metrics

### Real-time Monitoring

- Live transaction updates
- Terminal status monitoring
- Payment success rates
- System health metrics

## 🔒 Security Features

### Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Multi-factor authentication support

### Authorization

- Role-based access control (RBAC)
- Resource-level permissions
- API endpoint protection
- Data access restrictions

### Webhook Security

- HMAC SHA512 signature verification
- Request validation
- Rate limiting
- Audit logging

## 🚀 Deployment

### Production Environment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy backend to your server
5. Deploy frontend to CDN or static hosting
6. Configure webhook URLs in Paystack dashboard

### Docker Support

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📈 Monitoring

### Health Checks

- Database connectivity
- Paystack API status
- Webhook processing
- System performance metrics

### Logging

- Structured logging with Winston
- Error tracking and alerting
- Audit trail for all actions
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0

- Initial release
- Core payment facilitation features
- Paystack Terminal integration
- Real-time analytics dashboard
- Multi-tenant architecture
- RBAC system implementation

---

**Built with ❤️ for seamless payment processing**
