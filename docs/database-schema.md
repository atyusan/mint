# Database Schema Documentation

## Overview

The Mint Platform uses PostgreSQL as the primary database with Prisma ORM for database operations. The schema is designed to support multi-tenant architecture with comprehensive audit logging and flexible permission system.

## Database Connection

```typescript
// Database URL format
DATABASE_URL = 'postgresql://username:password@localhost:5432/mint_platform';
```

## Schema Structure

### Core Tables

#### Users & Authentication

- `users` - Core user accounts
- `roles` - System roles
- `permissions` - Granular permissions
- `user_roles` - User-role assignments
- `user_permissions` - Direct user permissions
- `role_permissions` - Role-based permissions

#### Business Entities

- `merchants` - Business entities
- `individuals` - Personal accounts
- `outlets` - Physical business locations
- `terminals` - POS devices

#### Payment System

- `invoices` - Payment requests
- `payments` - Individual transactions
- `payment_categories` - Invoice categorization
- `paystack_customers` - Paystack customer mapping
- `paystack_invoices` - Paystack invoice mapping

#### Payout System

- `payout_methods` - Merchant payout preferences
- `payouts` - Scheduled and processed payouts

#### System

- `system_config` - System configuration
- `audit_logs` - Activity tracking

## Detailed Schema

### Users Table

```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    user_type user_type NOT NULL,
    status user_status DEFAULT 'PENDING_VERIFICATION',
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Enums:**

- `user_type`: ADMIN, MERCHANT, INDIVIDUAL
- `user_status`: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION

**Indexes:**

- `idx_users_email` on `email`
- `idx_users_phone` on `phone`
- `idx_users_user_type` on `user_type`
- `idx_users_status` on `status`

### Roles Table

```sql
CREATE TABLE roles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Permissions Table

```sql
CREATE TABLE permissions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(resource, action)
);
```

**Common Resources:**

- `user` - User management
- `merchant` - Merchant management
- `outlet` - Outlet management
- `terminal` - Terminal management
- `invoice` - Invoice management
- `payment` - Payment management
- `analytics` - Analytics access
- `payout` - Payout management
- `fee` - Fee management

**Common Actions:**

- `create` - Create new resources
- `read` - View resources
- `update` - Modify resources
- `delete` - Remove resources
- `manage` - Full management access

### User Roles Table

```sql
CREATE TABLE user_roles (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    role_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

### User Permissions Table

```sql
CREATE TABLE user_permissions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    permission_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

### Role Permissions Table

```sql
CREATE TABLE role_permissions (
    id VARCHAR(255) PRIMARY KEY,
    role_id VARCHAR(255) NOT NULL,
    permission_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

### Merchants Table

```sql
CREATE TABLE merchants (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(255) NOT NULL,
    registration_number VARCHAR(255),
    tax_id VARCHAR(255),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) DEFAULT 'Nigeria',
    website VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**

- `idx_merchants_user_id` on `user_id`
- `idx_merchants_business_name` on `business_name`
- `idx_merchants_is_active` on `is_active`

### Individuals Table

```sql
CREATE TABLE individuals (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255) DEFAULT 'Nigeria',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Outlets Table

```sql
CREATE TABLE outlets (
    id VARCHAR(255) PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) DEFAULT 'Nigeria',
    phone VARCHAR(255),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);
```

**Indexes:**

- `idx_outlets_merchant_id` on `merchant_id`
- `idx_outlets_is_active` on `is_active`

### Terminals Table

```sql
CREATE TABLE terminals (
    id VARCHAR(255) PRIMARY KEY,
    outlet_id VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    model VARCHAR(255) NOT NULL,
    status terminal_status DEFAULT 'ACTIVE',
    location VARCHAR(255),
    last_seen_at TIMESTAMP,
    firmware_version VARCHAR(255),
    battery_level INTEGER,
    is_online BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE
);
```

**Enums:**

- `terminal_status`: ACTIVE, INACTIVE, MAINTENANCE, REPLACED, LOST

**Indexes:**

- `idx_terminals_outlet_id` on `outlet_id`
- `idx_terminals_serial_number` on `serial_number`
- `idx_terminals_status` on `status`
- `idx_terminals_is_online` on `is_online`

### Payment Categories Table

```sql
CREATE TABLE payment_categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Invoices Table

```sql
CREATE TABLE invoices (
    id VARCHAR(255) PRIMARY KEY,
    outlet_id VARCHAR(255) NOT NULL,
    terminal_id VARCHAR(255),
    category_id VARCHAR(255),
    invoice_number VARCHAR(255) UNIQUE NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(255),
    customer_name VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(255) DEFAULT 'NGN',
    status invoice_status DEFAULT 'PENDING',
    description TEXT,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
    FOREIGN KEY (terminal_id) REFERENCES terminals(id),
    FOREIGN KEY (category_id) REFERENCES payment_categories(id)
);
```

**Enums:**

- `invoice_status`: PENDING, PAID, PARTIALLY_PAID, CANCELLED, EXPIRED

**Indexes:**

- `idx_invoices_outlet_id` on `outlet_id`
- `idx_invoices_terminal_id` on `terminal_id`
- `idx_invoices_category_id` on `category_id`
- `idx_invoices_invoice_number` on `invoice_number`
- `idx_invoices_status` on `status`
- `idx_invoices_created_at` on `created_at`

### Payments Table

```sql
CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    invoice_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(255) DEFAULT 'NGN',
    method payment_method NOT NULL,
    reference VARCHAR(255) UNIQUE NOT NULL,
    paystack_reference VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    processed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

**Enums:**

- `payment_method`: CARD, BANK_TRANSFER, MOBILE_MONEY, CASH

**Indexes:**

- `idx_payments_invoice_id` on `invoice_id`
- `idx_payments_reference` on `reference`
- `idx_payments_paystack_reference` on `paystack_reference`
- `idx_payments_status` on `status`
- `idx_payments_processed_at` on `processed_at`

### Paystack Customers Table

```sql
CREATE TABLE paystack_customers (
    id VARCHAR(255) PRIMARY KEY,
    merchant_id VARCHAR(255),
    individual_id VARCHAR(255),
    paystack_customer_id VARCHAR(255) UNIQUE NOT NULL,
    customer_code VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (individual_id) REFERENCES individuals(id) ON DELETE CASCADE
);
```

**Indexes:**

- `idx_paystack_customers_merchant_id` on `merchant_id`
- `idx_paystack_customers_individual_id` on `individual_id`
- `idx_paystack_customers_paystack_customer_id` on `paystack_customer_id`
- `idx_paystack_customers_customer_code` on `customer_code`

### Paystack Invoices Table

```sql
CREATE TABLE paystack_invoices (
    id VARCHAR(255) PRIMARY KEY,
    invoice_id VARCHAR(255) UNIQUE NOT NULL,
    paystack_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    request_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(255) DEFAULT 'NGN',
    description TEXT,
    line_items JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

**Indexes:**

- `idx_paystack_invoices_invoice_id` on `invoice_id`
- `idx_paystack_invoices_paystack_invoice_id` on `paystack_invoice_id`
- `idx_paystack_invoices_request_code` on `request_code`

### Payout Methods Table

```sql
CREATE TABLE payout_methods (
    id VARCHAR(255) PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL,
    method_type VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    bank_code VARCHAR(255),
    bank_name VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);
```

**Indexes:**

- `idx_payout_methods_merchant_id` on `merchant_id`
- `idx_payout_methods_is_default` on `is_default`
- `idx_payout_methods_is_active` on `is_active`

### Payouts Table

```sql
CREATE TABLE payouts (
    id VARCHAR(255) PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL,
    payout_method_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(255) DEFAULT 'NGN',
    status payout_status DEFAULT 'PENDING',
    frequency payout_frequency NOT NULL,
    reference VARCHAR(255) UNIQUE NOT NULL,
    processed_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (payout_method_id) REFERENCES payout_methods(id)
);
```

**Enums:**

- `payout_status`: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
- `payout_frequency`: DAILY, WEEKLY, MONTHLY

**Indexes:**

- `idx_payouts_merchant_id` on `merchant_id`
- `idx_payouts_payout_method_id` on `payout_method_id`
- `idx_payouts_status` on `status`
- `idx_payouts_frequency` on `frequency`
- `idx_payouts_reference` on `reference`
- `idx_payouts_scheduled_for` on `scheduled_for`

### System Config Table

```sql
CREATE TABLE system_config (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Enums:**

- `type`: STRING, NUMBER, BOOLEAN, JSON

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Indexes:**

- `idx_audit_logs_user_id` on `user_id`
- `idx_audit_logs_action` on `action`
- `idx_audit_logs_resource` on `resource`
- `idx_audit_logs_resource_id` on `resource_id`
- `idx_audit_logs_created_at` on `created_at`

## Database Relationships

### Primary Relationships

1. **User → Merchant/Individual**: One-to-one relationship
2. **Merchant → Outlets**: One-to-many relationship
3. **Outlet → Terminals**: One-to-many relationship
4. **Outlet → Invoices**: One-to-many relationship
5. **Terminal → Invoices**: One-to-many relationship (optional)
6. **Invoice → Payments**: One-to-many relationship
7. **Merchant → Payouts**: One-to-many relationship
8. **Merchant → Payout Methods**: One-to-many relationship

### Junction Tables

1. **User Roles**: Many-to-many between users and roles
2. **User Permissions**: Many-to-many between users and permissions
3. **Role Permissions**: Many-to-many between roles and permissions

## Data Types and Constraints

### Decimal Precision

- All monetary amounts use `DECIMAL(10,2)` for precise financial calculations
- Supports amounts up to 99,999,999.99

### JSONB Fields

- `metadata` fields use JSONB for flexible data storage
- `line_items` in paystack_invoices for invoice line items
- `old_values` and `new_values` in audit_logs for change tracking

### Timestamps

- All tables include `created_at` and `updated_at` timestamps
- Use `TIMESTAMP` with timezone support
- Default to `NOW()` for creation timestamps

### Unique Constraints

- Email addresses are unique across all users
- Phone numbers are unique across all users
- Invoice numbers are unique
- Terminal serial numbers are unique
- Payout references are unique

## Indexing Strategy

### Primary Indexes

- All primary keys are automatically indexed
- Foreign keys are indexed for join performance

### Performance Indexes

- Status fields for filtering
- Date fields for time-based queries
- Email and phone for authentication lookups
- Serial numbers and references for unique lookups

### Composite Indexes

- Merchant ID + Status for merchant-specific filtering
- Outlet ID + Status for outlet-specific filtering
- Created At + Status for time-based status filtering

## Data Validation

### Database Constraints

- NOT NULL constraints on required fields
- UNIQUE constraints on unique fields
- CHECK constraints for enum values
- FOREIGN KEY constraints for referential integrity

### Application-Level Validation

- Email format validation
- Phone number format validation
- Amount validation (positive values)
- Date validation (future dates for due dates)

## Backup and Recovery

### Backup Strategy

- Daily full database backups
- Transaction log backups every 15 minutes
- Point-in-time recovery capability
- Cross-region backup replication

### Recovery Procedures

- Automated failover to standby database
- Manual recovery procedures documented
- Data integrity verification after recovery
- Rollback procedures for failed migrations

## Performance Optimization

### Query Optimization

- Proper indexing on frequently queried fields
- Query execution plan monitoring
- Slow query identification and optimization
- Connection pooling for better performance

### Maintenance Tasks

- Regular VACUUM and ANALYZE operations
- Index maintenance and rebuilding
- Statistics updates for query planner
- Log file rotation and cleanup

## Security Considerations

### Access Control

- Database user roles with minimal privileges
- Application-specific database users
- Network-level access restrictions
- SSL/TLS encryption for connections

### Data Protection

- Encryption at rest for sensitive data
- Encryption in transit for all connections
- Regular security audits and updates
- Compliance with data protection regulations

## Migration Strategy

### Schema Changes

- Version-controlled migrations
- Backward compatibility considerations
- Rollback procedures for failed migrations
- Testing in staging environment first

### Data Migration

- Incremental data migration for large datasets
- Data validation after migration
- Rollback procedures for data issues
- Performance monitoring during migration

---

This database schema documentation provides comprehensive information about the Mint Platform database structure, relationships, and maintenance procedures.
