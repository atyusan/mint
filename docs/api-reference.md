# API Reference

## Overview

The Mint Platform API is a RESTful API built with NestJS that provides comprehensive endpoints for managing payments, terminals, analytics, and payouts. All API endpoints require authentication via JWT tokens.

## Base URL

```
Production: https://api.mintplatform.com/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All API requests require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Authentication Endpoints

### POST /auth/login

Authenticate a user and return a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "MERCHANT",
      "merchant": {
        "id": "merchant-id",
        "businessName": "Business Name"
      }
    }
  }
}
```

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "MERCHANT",
  "businessName": "Business Name",
  "businessType": "Retail"
}
```

### GET /auth/me

Get current user information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "MERCHANT",
    "status": "ACTIVE",
    "merchant": {
      "id": "merchant-id",
      "businessName": "Business Name",
      "businessType": "Retail"
    }
  }
}
```

### POST /auth/logout

Logout the current user.

## User Management Endpoints

### GET /users/profile

Get user profile information.

### PUT /users/profile

Update user profile.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### GET /users/permissions

Get user permissions.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "resource": "invoice",
      "action": "create"
    },
    {
      "resource": "terminal",
      "action": "read"
    }
  ]
}
```

## Merchant Management Endpoints

### GET /merchants/profile

Get merchant profile information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "merchant-id",
    "businessName": "Business Name",
    "businessType": "Retail",
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "website": "https://business.com",
    "isActive": true,
    "outlets": [...]
  }
}
```

### PUT /merchants/profile

Update merchant profile.

**Request Body:**

```json
{
  "businessName": "Updated Business Name",
  "businessType": "E-commerce",
  "address": "456 New St",
  "city": "Abuja",
  "state": "FCT",
  "website": "https://newbusiness.com"
}
```

## Outlet Management Endpoints

### GET /outlets

Get list of outlets for the merchant.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `isActive` (optional): Filter by active status

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "outlet-id",
      "name": "Main Store",
      "address": "123 Main St",
      "city": "Lagos",
      "state": "Lagos",
      "phone": "+1234567890",
      "email": "store@business.com",
      "isActive": true,
      "terminals": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### POST /outlets

Create a new outlet.

**Request Body:**

```json
{
  "name": "New Store",
  "address": "789 New St",
  "city": "Lagos",
  "state": "Lagos",
  "phone": "+1234567890",
  "email": "newstore@business.com"
}
```

### PUT /outlets/:id

Update an outlet.

**Request Body:**

```json
{
  "name": "Updated Store Name",
  "address": "Updated Address",
  "phone": "+0987654321"
}
```

### DELETE /outlets/:id

Delete an outlet.

## Terminal Management Endpoints

### GET /terminals

Get list of terminals.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `outletId` (optional): Filter by outlet
- `status` (optional): Filter by status (ACTIVE, INACTIVE, MAINTENANCE)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "terminal-id",
      "serialNumber": "TERM001",
      "model": "Paystack Terminal",
      "status": "ACTIVE",
      "location": "Counter 1",
      "isOnline": true,
      "lastSeenAt": "2024-01-15T10:30:00Z",
      "outlet": {
        "id": "outlet-id",
        "name": "Main Store"
      }
    }
  ]
}
```

### POST /terminals

Create a new terminal.

**Request Body:**

```json
{
  "outletId": "outlet-id",
  "serialNumber": "TERM002",
  "model": "Paystack Terminal",
  "location": "Counter 2"
}
```

### PUT /terminals/:id

Update terminal information.

### PATCH /terminals/:id/status

Update terminal status.

**Request Body:**

```json
{
  "status": "MAINTENANCE"
}
```

### POST /terminals/:id/assign

Assign terminal to an outlet.

**Request Body:**

```json
{
  "outletId": "new-outlet-id"
}
```

## Invoice Management Endpoints

### GET /invoices

Get list of invoices.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `outletId` (optional): Filter by outlet
- `status` (optional): Filter by status (PENDING, PAID, CANCELLED)
- `categoryId` (optional): Filter by category

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "invoice-id",
      "invoiceNumber": "INV-20240115-0001",
      "customerEmail": "customer@example.com",
      "customerName": "John Customer",
      "amount": 5000.00,
      "fee": 125.00,
      "totalAmount": 5125.00,
      "currency": "NGN",
      "status": "PAID",
      "description": "Product purchase",
      "createdAt": "2024-01-15T10:30:00Z",
      "paidAt": "2024-01-15T10:35:00Z",
      "outlet": {
        "id": "outlet-id",
        "name": "Main Store"
      },
      "terminal": {
        "id": "terminal-id",
        "serialNumber": "TERM001"
      },
      "payments": [...]
    }
  ]
}
```

### POST /invoices

Create a new invoice.

**Request Body:**

```json
{
  "outletId": "outlet-id",
  "terminalId": "terminal-id",
  "categoryId": "category-id",
  "customerEmail": "customer@example.com",
  "customerName": "John Customer",
  "amount": 5000.0,
  "description": "Product purchase",
  "dueDate": "2024-01-20T00:00:00Z"
}
```

### GET /invoices/:id

Get invoice details.

### PUT /invoices/:id

Update invoice information.

### POST /invoices/:id/cancel

Cancel an invoice.

### GET /invoices/stats

Get invoice statistics.

**Query Parameters:**

- `outletId` (optional): Filter by outlet
- `categoryId` (optional): Filter by category

**Response:**

```json
{
  "success": true,
  "data": {
    "totalInvoices": 150,
    "paidInvoices": 120,
    "pendingInvoices": 25,
    "cancelledInvoices": 5,
    "totalAmount": 750000.0,
    "paidAmount": 600000.0,
    "pendingAmount": 125000.0,
    "successRate": 80.0
  }
}
```

## Analytics Endpoints

### GET /analytics/dashboard

Get dashboard metrics.

**Query Parameters:**

- `merchantId` (optional): Filter by merchant
- `outletId` (optional): Filter by outlet
- `categoryId` (optional): Filter by category

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalInvoices": 150,
      "paidInvoices": 120,
      "pendingInvoices": 25,
      "cancelledInvoices": 5,
      "successRate": 80.0,
      "averageInvoiceValue": 5000.0
    },
    "revenue": {
      "total": 750000.0,
      "paid": 600000.0,
      "pending": 125000.0,
      "fees": 18750.0,
      "net": 581250.0
    }
  }
}
```

### GET /analytics/revenue-trends

Get revenue trends data.

**Query Parameters:**

- `merchantId` (optional): Filter by merchant
- `outletId` (optional): Filter by outlet
- `categoryId` (optional): Filter by category
- `days` (optional): Number of days (default: 30)

**Response:**

```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "date": "2024-01-15",
        "total": 25000.0,
        "paid": 20000.0,
        "pending": 5000.0,
        "fees": 500.0
      }
    ],
    "byCategory": [
      {
        "name": "Products",
        "color": "#0088FE",
        "total": 500000.0,
        "paid": 400000.0,
        "pending": 100000.0
      }
    ]
  }
}
```

### GET /analytics/top-outlets

Get top performing outlets.

**Query Parameters:**

- `merchantId` (optional): Filter by merchant
- `limit` (optional): Number of results (default: 10)

### GET /analytics/top-categories

Get top performing categories.

### GET /analytics/payment-methods

Get payment method analytics.

### GET /analytics/terminal-performance

Get terminal performance metrics.

### GET /analytics/real-time

Get real-time metrics.

## Payout Management Endpoints

### GET /payouts

Get list of payouts.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (PENDING, PROCESSING, COMPLETED, FAILED)
- `frequency` (optional): Filter by frequency (DAILY, WEEKLY, MONTHLY)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "payout-id",
      "amount": 50000.0,
      "fee": 100.0,
      "netAmount": 49900.0,
      "currency": "NGN",
      "status": "COMPLETED",
      "frequency": "WEEKLY",
      "reference": "PAY-20240115-0001",
      "processedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-14T10:30:00Z",
      "payoutMethod": {
        "id": "method-id",
        "methodType": "BANK_ACCOUNT",
        "accountName": "Business Account",
        "accountNumber": "1234567890",
        "bankName": "First Bank"
      }
    }
  ]
}
```

### POST /payouts

Create a new payout.

**Request Body:**

```json
{
  "payoutMethodId": "method-id",
  "amount": 50000.0,
  "frequency": "WEEKLY",
  "scheduledFor": "2024-01-20T00:00:00Z"
}
```

### GET /payouts/methods

Get payout methods.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "method-id",
      "methodType": "BANK_ACCOUNT",
      "accountName": "Business Account",
      "accountNumber": "1234567890",
      "bankCode": "011",
      "bankName": "First Bank",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

### POST /payouts/methods

Create a payout method.

**Request Body:**

```json
{
  "methodType": "BANK_ACCOUNT",
  "accountName": "Business Account",
  "accountNumber": "1234567890",
  "bankCode": "011",
  "bankName": "First Bank",
  "isDefault": false
}
```

### PUT /payouts/methods/:id

Update a payout method.

### DELETE /payouts/methods/:id

Delete a payout method.

### GET /payouts/stats

Get payout statistics.

## Fee Management Endpoints

### GET /fees/calculate

Calculate fees for an amount.

**Query Parameters:**

- `amount`: Amount to calculate fees for
- `merchantId` (optional): Merchant ID (defaults to current user)
- `categoryId` (optional): Category ID for category-specific fees

**Response:**

```json
{
  "success": true,
  "data": {
    "amount": 5000.0,
    "fee": 125.0,
    "netAmount": 4875.0,
    "feePercentage": 2.5,
    "breakdown": {
      "baseAmount": 5000.0,
      "feeAmount": 125.0,
      "netAmount": 4875.0
    }
  }
}
```

### GET /fees/tier/:merchantId

Get merchant tier information.

### POST /fees/tier/:merchantId

Update merchant tier.

**Request Body:**

```json
{
  "tier": "premium"
}
```

### GET /fees/history/:merchantId

Get fee history for a merchant.

**Query Parameters:**

- `days` (optional): Number of days to retrieve (default: 30)

## Webhook Endpoints

### POST /paystack/webhook

Paystack webhook endpoint for payment events.

**Headers:**

```
x-paystack-signature: <hmac-signature>
```

**Request Body:**

```json
{
  "event": "charge.success",
  "data": {
    "reference": "txn-reference",
    "amount": 5000,
    "status": "success"
  }
}
```

## Error Codes

| Code                  | Description                             |
| --------------------- | --------------------------------------- |
| `UNAUTHORIZED`        | Invalid or missing authentication token |
| `FORBIDDEN`           | Insufficient permissions                |
| `NOT_FOUND`           | Resource not found                      |
| `VALIDATION_ERROR`    | Request validation failed               |
| `PAYSTACK_ERROR`      | Paystack API error                      |
| `DATABASE_ERROR`      | Database operation failed               |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded                     |
| `INTERNAL_ERROR`      | Internal server error                   |

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authentication endpoints**: 10 requests per minute
- **General API endpoints**: 100 requests per minute
- **Webhook endpoints**: 1000 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @mintplatform/sdk
```

```javascript
import { MintClient } from '@mintplatform/sdk';

const client = new MintClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.mintplatform.com',
});

// Create an invoice
const invoice = await client.invoices.create({
  outletId: 'outlet-id',
  amount: 5000,
  customerEmail: 'customer@example.com',
});
```

### Python

```bash
pip install mintplatform-sdk
```

```python
from mintplatform import MintClient

client = MintClient(api_key='your-api-key')

# Create an invoice
invoice = client.invoices.create(
    outlet_id='outlet-id',
    amount=5000,
    customer_email='customer@example.com'
)
```

## Testing

Use the provided Postman collection or cURL examples to test the API:

### Authentication Example

```bash
curl -X POST https://api.mintplatform.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Invoice Example

```bash
curl -X POST https://api.mintplatform.com/api/v1/invoices \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": "outlet-id",
    "amount": 5000,
    "customerEmail": "customer@example.com",
    "description": "Product purchase"
  }'
```

## Support

For API support and questions:

- Check the [troubleshooting guide](./troubleshooting.md)
- Review the [FAQ](./faq.md)
- Create an issue in the repository
- Contact the development team

---

This API reference provides comprehensive documentation for all available endpoints in the Mint Platform API.
