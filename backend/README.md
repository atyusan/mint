# Mint Platform

A comprehensive payment facilitation platform that enables businesses to manage POS terminals, process payments, and track analytics through Paystack Terminal integration.

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture**: Support for merchants, individual users, and administrators
- **Granular RBAC**: Role-based access control with fine-grained permissions
- **Terminal Management**: Track and manage Paystack POS terminals across outlets
- **Invoice Management**: Create, track, and manage payment invoices
- **Real-time Webhooks**: Process payment events in real-time
- **Payout Management**: Flexible payout scheduling and processing
- **Analytics Dashboard**: Comprehensive reporting and insights

### Payment Processing
- **Paystack Integration**: Seamless integration with Paystack Terminal API
- **Dynamic Fee Structure**: Configurable fees per merchant
- **Payment Categories**: Organize payments by business categories
- **Multiple Payment Methods**: Support for cards, bank transfers, mobile money
- **Real-time Status Updates**: Instant payment confirmations

### Analytics & Reporting
- **Real-time Metrics**: Live dashboard with current performance
- **Revenue Trends**: Historical and predictive analytics
- **Category Analysis**: Performance breakdown by payment categories
- **Terminal Performance**: Individual terminal analytics
- **Outlet Comparison**: Multi-outlet performance tracking

## 🏗️ Architecture

### Backend Stack
- **NestJS**: Scalable Node.js framework
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Robust relational database
- **JWT**: Secure authentication
- **Paystack API**: Payment processing

### Frontend Stack (Planned)
- **React**: Modern UI library
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS
- **Material UI**: Component library
- **Redux Toolkit**: State management

## 📊 Database Schema

### Core Entities
- **Users**: Multi-role user management (Admin, Merchant, Individual)
- **Merchants**: Business profiles with outlet management
- **Outlets**: Physical business locations
- **Terminals**: POS device tracking and management
- **Invoices**: Payment request management
- **Payments**: Transaction records
- **Payouts**: Merchant settlement processing

### RBAC System
- **Roles**: Hierarchical role management
- **Permissions**: Granular action-based permissions
- **User Roles**: Role assignments
- **User Permissions**: Direct permission grants

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed initial data (optional)
   npm run prisma:seed
   ```

5. **Start the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

### API Documentation

Once running, access the API documentation at:
- **Swagger UI**: `http://localhost:3001/api/docs`
- **API Base**: `http://localhost:3001`

## 🔐 Authentication

### User Types
- **Admin**: Full system access
- **Merchant**: Business management and analytics
- **Individual**: Personal payment processing

### Permission System
- **Resource-based**: Permissions tied to specific resources
- **Action-based**: Granular control over operations
- **Hierarchical**: Role inheritance and overrides

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - User profile
- `GET /auth/permissions` - User permissions

### User Management
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Terminal Management
- `GET /terminals` - List terminals
- `POST /terminals` - Create terminal
- `GET /terminals/:id` - Get terminal details
- `PATCH /terminals/:id` - Update terminal
- `DELETE /terminals/:id` - Delete terminal

### Invoice Management
- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `GET /invoices/:id` - Get invoice details
- `PATCH /invoices/:id` - Update invoice
- `PATCH /invoices/:id/cancel` - Cancel invoice

### Analytics
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/revenue-trends` - Revenue analytics
- `GET /analytics/top-outlets` - Top performing outlets
- `GET /analytics/top-categories` - Top payment categories
- `GET /analytics/real-time` - Real-time metrics

### Payout Management
- `GET /payouts` - List payouts
- `POST /payouts` - Create payout
- `GET /payouts/methods` - List payout methods
- `POST /payouts/methods` - Create payout method

## 🔄 Webhook Integration

### Paystack Events
- `charge.success` - Payment completed
- `paymentrequest.success` - Invoice payment confirmed
- `paymentrequest.pending` - Invoice created, waiting
- `invoice.payment_failed` - Payment attempt failed

### Webhook Security
- **HMAC SHA512** signature verification
- **Header validation** for Paystack signature
- **Automatic retry** for failed processing

## 📈 Analytics Features

### Dashboard Metrics
- Total invoices and revenue
- Payment success rates
- Active terminal count
- Pending payout amounts

### Revenue Analytics
- Daily/weekly/monthly trends
- Category-based breakdown
- Outlet performance comparison
- Payment method analysis

### Real-time Monitoring
- Live transaction updates
- Terminal status monitoring
- Payment success tracking
- System health metrics

## 🚀 Deployment

### Production Checklist
- [ ] Configure environment variables
- [ ] Set up PostgreSQL database
- [ ] Configure Paystack webhooks
- [ ] Set up SSL certificates
- [ ] Configure monitoring and logging
- [ ] Set up backup strategies

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/mint"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# Paystack
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."

# Application
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://your-frontend.com"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**Mint Platform** - Simplifying payment processing for businesses worldwide.
