# System Architecture

## Overview

The Mint Platform is built using a modern, scalable architecture that supports multi-tenant operations, real-time processing, and high availability. The system is designed to handle high-volume payment processing while maintaining security, reliability, and performance.

## Architecture Principles

### Design Principles

1. **Microservices Architecture**: Modular services with clear boundaries
2. **Event-Driven Design**: Asynchronous processing using events
3. **API-First Approach**: RESTful APIs with comprehensive documentation
4. **Security by Design**: Security integrated at every layer
5. **Scalability**: Horizontal scaling capabilities
6. **Fault Tolerance**: Graceful degradation and error handling
7. **Observability**: Comprehensive logging, monitoring, and tracing

### Technology Stack

#### Backend

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Caching**: Redis (optional)
- **Message Queue**: Redis/Bull (for background jobs)
- **File Storage**: Local/S3 compatible storage

#### Frontend

- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material UI
- **Charts**: Recharts
- **Build Tool**: Create React App

#### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Docker Compose / Kubernetes
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt or commercial certificates
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging with Winston

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
        API_CLIENT[API Clients]
    end

    subgraph "Load Balancer"
        LB[Nginx Load Balancer]
    end

    subgraph "Application Layer"
        subgraph "Frontend Services"
            FE[React Frontend]
        end

        subgraph "Backend Services"
            API[NestJS API Gateway]
            AUTH[Authentication Service]
            INVOICE[Invoice Service]
            TERMINAL[Terminal Service]
            ANALYTICS[Analytics Service]
            PAYOUT[Payout Service]
            WEBHOOK[Webhook Service]
        end
    end

    subgraph "Data Layer"
        subgraph "Primary Database"
            PG[(PostgreSQL)]
        end

        subgraph "Cache Layer"
            REDIS[(Redis)]
        end

        subgraph "File Storage"
            STORAGE[(File Storage)]
        end
    end

    subgraph "External Services"
        PAYSTACK[Paystack API]
        EMAIL[Email Service]
        SMS[SMS Service]
    end

    WEB --> LB
    MOBILE --> LB
    API_CLIENT --> LB
    LB --> FE
    LB --> API
    API --> AUTH
    API --> INVOICE
    API --> TERMINAL
    API --> ANALYTICS
    API --> PAYOUT
    API --> WEBHOOK
    AUTH --> PG
    INVOICE --> PG
    TERMINAL --> PG
    ANALYTICS --> PG
    PAYOUT --> PG
    WEBHOOK --> PG
    AUTH --> REDIS
    INVOICE --> REDIS
    TERMINAL --> REDIS
    ANALYTICS --> REDIS
    PAYOUT --> REDIS
    WEBHOOK --> REDIS
    INVOICE --> STORAGE
    TERMINAL --> STORAGE
    ANALYTICS --> STORAGE
    PAYOUT --> STORAGE
    INVOICE --> PAYSTACK
    TERMINAL --> PAYSTACK
    WEBHOOK --> PAYSTACK
    API --> EMAIL
    API --> SMS
```

### Component Architecture

```mermaid
graph LR
    subgraph "Presentation Layer"
        UI[User Interface]
        API_GW[API Gateway]
    end

    subgraph "Business Logic Layer"
        AUTH_SVC[Auth Service]
        USER_SVC[User Service]
        MERCHANT_SVC[Merchant Service]
        OUTLET_SVC[Outlet Service]
        TERMINAL_SVC[Terminal Service]
        INVOICE_SVC[Invoice Service]
        PAYMENT_SVC[Payment Service]
        ANALYTICS_SVC[Analytics Service]
        PAYOUT_SVC[Payout Service]
        FEE_SVC[Fee Service]
        WEBHOOK_SVC[Webhook Service]
    end

    subgraph "Data Access Layer"
        PRISMA[Prisma ORM]
        CACHE[Redis Cache]
        STORAGE[File Storage]
    end

    subgraph "External Integration Layer"
        PAYSTACK_API[Paystack API]
        EMAIL_API[Email API]
        SMS_API[SMS API]
    end

    UI --> API_GW
    API_GW --> AUTH_SVC
    API_GW --> USER_SVC
    API_GW --> MERCHANT_SVC
    API_GW --> OUTLET_SVC
    API_GW --> TERMINAL_SVC
    API_GW --> INVOICE_SVC
    API_GW --> PAYMENT_SVC
    API_GW --> ANALYTICS_SVC
    API_GW --> PAYOUT_SVC
    API_GW --> FEE_SVC
    API_GW --> WEBHOOK_SVC
    AUTH_SVC --> PRISMA
    USER_SVC --> PRISMA
    MERCHANT_SVC --> PRISMA
    OUTLET_SVC --> PRISMA
    TERMINAL_SVC --> PRISMA
    INVOICE_SVC --> PRISMA
    PAYMENT_SVC --> PRISMA
    ANALYTICS_SVC --> PRISMA
    PAYOUT_SVC --> PRISMA
    FEE_SVC --> PRISMA
    WEBHOOK_SVC --> PRISMA
    AUTH_SVC --> CACHE
    USER_SVC --> CACHE
    MERCHANT_SVC --> CACHE
    OUTLET_SVC --> CACHE
    TERMINAL_SVC --> CACHE
    INVOICE_SVC --> CACHE
    PAYMENT_SVC --> CACHE
    ANALYTICS_SVC --> CACHE
    PAYOUT_SVC --> CACHE
    FEE_SVC --> CACHE
    WEBHOOK_SVC --> CACHE
    INVOICE_SVC --> STORAGE
    TERMINAL_SVC --> STORAGE
    ANALYTICS_SVC --> STORAGE
    PAYOUT_SVC --> STORAGE
    INVOICE_SVC --> PAYSTACK_API
    TERMINAL_SVC --> PAYSTACK_API
    WEBHOOK_SVC --> PAYSTACK_API
    AUTH_SVC --> EMAIL_API
    USER_SVC --> EMAIL_API
    MERCHANT_SVC --> EMAIL_API
    OUTLET_SVC --> EMAIL_API
    TERMINAL_SVC --> EMAIL_API
    INVOICE_SVC --> EMAIL_API
    PAYMENT_SVC --> EMAIL_API
    ANALYTICS_SVC --> EMAIL_API
    PAYOUT_SVC --> EMAIL_API
    FEE_SVC --> EMAIL_API
    WEBHOOK_SVC --> EMAIL_API
    AUTH_SVC --> SMS_API
    USER_SVC --> SMS_API
    MERCHANT_SVC --> SMS_API
    OUTLET_SVC --> SMS_API
    TERMINAL_SVC --> SMS_API
    INVOICE_SVC --> SMS_API
    PAYMENT_SVC --> SMS_API
    ANALYTICS_SVC --> SMS_API
    PAYOUT_SVC --> SMS_API
    FEE_SVC --> SMS_API
    WEBHOOK_SVC --> SMS_API
```

## Data Architecture

### Database Design

#### Primary Database (PostgreSQL)

```mermaid
erDiagram
    User ||--o{ UserRole : has
    User ||--o{ UserPermission : has
    User ||--o| Merchant : "can be"
    User ||--o| Individual : "can be"

    Role ||--o{ UserRole : contains
    Role ||--o{ RolePermission : has

    Permission ||--o{ UserPermission : assigned
    Permission ||--o{ RolePermission : assigned

    Merchant ||--o{ Outlet : owns
    Merchant ||--o{ Payout : receives
    Merchant ||--o{ PayoutMethod : has

    Outlet ||--o{ Terminal : contains
    Outlet ||--o{ Invoice : generates

    Terminal ||--o{ Invoice : processes

    Invoice ||--o{ Payment : receives
    Invoice }|--|| PaymentCategory : belongs

    PaymentCategory ||--o{ Invoice : categorizes

    PaystackCustomer ||--|| Merchant : "maps to"
    PaystackInvoice ||--|| Invoice : "maps to"

    AuditLog }|--|| User : "created by"
```

#### Cache Layer (Redis)

```mermaid
graph TB
    subgraph "Cache Categories"
        USER_CACHE[User Sessions]
        MERCHANT_CACHE[Merchant Data]
        TERMINAL_CACHE[Terminal Status]
        ANALYTICS_CACHE[Analytics Data]
        RATE_LIMIT[Rate Limiting]
        SESSION_CACHE[Session Data]
    end

    subgraph "Cache Strategies"
        TTL[Time-to-Live]
        LRU[Least Recently Used]
        WRITE_THROUGH[Write-Through]
        WRITE_BACK[Write-Back]
    end

    USER_CACHE --> TTL
    MERCHANT_CACHE --> TTL
    TERMINAL_CACHE --> TTL
    ANALYTICS_CACHE --> TTL
    RATE_LIMIT --> TTL
    SESSION_CACHE --> TTL
    USER_CACHE --> LRU
    MERCHANT_CACHE --> LRU
    TERMINAL_CACHE --> LRU
    ANALYTICS_CACHE --> LRU
    RATE_LIMIT --> LRU
    SESSION_CACHE --> LRU
    USER_CACHE --> WRITE_THROUGH
    MERCHANT_CACHE --> WRITE_THROUGH
    TERMINAL_CACHE --> WRITE_THROUGH
    ANALYTICS_CACHE --> WRITE_THROUGH
    RATE_LIMIT --> WRITE_THROUGH
    SESSION_CACHE --> WRITE_THROUGH
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant SVC as Service
    participant DB as Database
    participant CACHE as Cache
    participant EXT as External API

    C->>API: Request
    API->>SVC: Process Request
    SVC->>CACHE: Check Cache
    CACHE-->>SVC: Cache Miss
    SVC->>DB: Query Database
    DB-->>SVC: Return Data
    SVC->>CACHE: Update Cache
    SVC->>EXT: External API Call
    EXT-->>SVC: Response
    SVC-->>API: Processed Response
    API-->>C: Final Response
```

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        FW[Firewall]
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
    end

    subgraph "Application Security"
        AUTH[Authentication]
        AUTHZ[Authorization]
        INPUT[Input Validation]
        OUTPUT[Output Encoding]
    end

    subgraph "Data Security"
        ENCRYPT[Encryption at Rest]
        TRANSPORT[Encryption in Transit]
        BACKUP[Secure Backups]
    end

    subgraph "Infrastructure Security"
        OS[OS Hardening]
        CONTAINER[Container Security]
        SECRETS[Secrets Management]
    end

    FW --> AUTH
    WAF --> AUTHZ
    DDoS --> INPUT
    AUTH --> ENCRYPT
    AUTHZ --> TRANSPORT
    INPUT --> BACKUP
    OUTPUT --> OS
    ENCRYPT --> CONTAINER
    TRANSPORT --> SECRETS
    BACKUP --> OS
    OS --> CONTAINER
    CONTAINER --> SECRETS
    SECRETS --> FW
```

### Authentication and Authorization

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant AUTH as Auth Service
    participant DB as Database
    participant CACHE as Cache

    C->>API: Login Request
    API->>AUTH: Validate Credentials
    AUTH->>DB: Check User
    DB-->>AUTH: User Data
    AUTH->>AUTH: Generate JWT
    AUTH->>CACHE: Store Session
    AUTH-->>API: JWT Token
    API-->>C: Authentication Response

    Note over C: Subsequent Requests
    C->>API: API Request + JWT
    API->>AUTH: Verify JWT
    AUTH->>CACHE: Check Session
    CACHE-->>AUTH: Session Valid
    AUTH-->>API: Token Valid
    API->>API: Check Permissions
    API-->>C: Authorized Response
```

## Integration Architecture

### External Service Integration

```mermaid
graph TB
    subgraph "Mint Platform"
        API[API Gateway]
        SERVICES[Business Services]
        WEBHOOK[Webhook Handler]
    end

    subgraph "Paystack Integration"
        PAYSTACK_API[Paystack API]
        PAYSTACK_WEBHOOK[Paystack Webhooks]
    end

    subgraph "Notification Services"
        EMAIL[Email Service]
        SMS[SMS Service]
        PUSH[Push Notifications]
    end

    subgraph "Analytics Services"
        ANALYTICS[Analytics Platform]
        METRICS[Metrics Collection]
    end

    API --> PAYSTACK_API
    SERVICES --> PAYSTACK_API
    WEBHOOK --> PAYSTACK_WEBHOOK
    API --> EMAIL
    SERVICES --> EMAIL
    WEBHOOK --> EMAIL
    API --> SMS
    SERVICES --> SMS
    WEBHOOK --> SMS
    API --> PUSH
    SERVICES --> PUSH
    WEBHOOK --> PUSH
    API --> ANALYTICS
    SERVICES --> ANALYTICS
    WEBHOOK --> ANALYTICS
    API --> METRICS
    SERVICES --> METRICS
    WEBHOOK --> METRICS
```

### Webhook Architecture

```mermaid
sequenceDiagram
    participant EXT as External Service
    participant LB as Load Balancer
    participant API as API Gateway
    participant WEBHOOK as Webhook Handler
    participant QUEUE as Message Queue
    participant WORKER as Background Worker
    participant DB as Database

    EXT->>LB: Webhook Event
    LB->>API: Forward Event
    API->>WEBHOOK: Process Event
    WEBHOOK->>WEBHOOK: Verify Signature
    WEBHOOK->>QUEUE: Queue Event
    QUEUE->>WORKER: Process Event
    WORKER->>DB: Update Data
    WORKER->>DB: Log Event
    WORKER-->>QUEUE: Event Processed
    QUEUE-->>WEBHOOK: Acknowledgment
    WEBHOOK-->>API: Success Response
    API-->>LB: HTTP 200
    LB-->>EXT: Webhook Acknowledged
```

## Scalability Architecture

### Horizontal Scaling

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx Load Balancer]
    end

    subgraph "Application Instances"
        APP1[App Instance 1]
        APP2[App Instance 2]
        APP3[App Instance 3]
        APPN[App Instance N]
    end

    subgraph "Database Cluster"
        DB1[Primary DB]
        DB2[Read Replica 1]
        DB3[Read Replica 2]
    end

    subgraph "Cache Cluster"
        REDIS1[Redis Primary]
        REDIS2[Redis Replica]
    end

    LB --> APP1
    LB --> APP2
    LB --> APP3
    LB --> APPN
    APP1 --> DB1
    APP2 --> DB2
    APP3 --> DB3
    APPN --> DB1
    APP1 --> REDIS1
    APP2 --> REDIS1
    APP3 --> REDIS2
    APPN --> REDIS1
```

### Performance Optimization

```mermaid
graph LR
    subgraph "Application Layer"
        CACHE[Application Caching]
        POOL[Connection Pooling]
        ASYNC[Async Processing]
    end

    subgraph "Database Layer"
        INDEX[Database Indexing]
        PARTITION[Table Partitioning]
        REPLICA[Read Replicas]
    end

    subgraph "Infrastructure Layer"
        CDN[Content Delivery Network]
        COMPRESS[Response Compression]
        MINIFY[Asset Minification]
    end

    CACHE --> INDEX
    POOL --> PARTITION
    ASYNC --> REPLICA
    INDEX --> CDN
    PARTITION --> COMPRESS
    REPLICA --> MINIFY
```

## Monitoring and Observability

### Monitoring Architecture

```mermaid
graph TB
    subgraph "Application Metrics"
        APP_METRICS[Application Metrics]
        BUSINESS_METRICS[Business Metrics]
        USER_METRICS[User Metrics]
    end

    subgraph "Infrastructure Metrics"
        SYSTEM_METRICS[System Metrics]
        NETWORK_METRICS[Network Metrics]
        STORAGE_METRICS[Storage Metrics]
    end

    subgraph "Monitoring Stack"
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        ALERTMANAGER[Alert Manager]
    end

    subgraph "Logging Stack"
        LOGS[Application Logs]
        LOGSTASH[Logstash]
        ELASTICSEARCH[Elasticsearch]
        KIBANA[Kibana]
    end

    APP_METRICS --> PROMETHEUS
    BUSINESS_METRICS --> PROMETHEUS
    USER_METRICS --> PROMETHEUS
    SYSTEM_METRICS --> PROMETHEUS
    NETWORK_METRICS --> PROMETHEUS
    STORAGE_METRICS --> PROMETHEUS
    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ALERTMANAGER
    LOGS --> LOGSTASH
    LOGSTASH --> ELASTICSEARCH
    ELASTICSEARCH --> KIBANA
```

### Health Check Architecture

```mermaid
sequenceDiagram
    participant LB as Load Balancer
    participant API as API Gateway
    participant HEALTH as Health Check
    participant DB as Database
    participant CACHE as Cache
    participant EXT as External Service

    LB->>API: Health Check Request
    API->>HEALTH: Check Health
    HEALTH->>DB: Check Database
    DB-->>HEALTH: Database OK
    HEALTH->>CACHE: Check Cache
    CACHE-->>HEALTH: Cache OK
    HEALTH->>EXT: Check External Service
    EXT-->>HEALTH: External Service OK
    HEALTH-->>API: All Systems Healthy
    API-->>LB: HTTP 200 OK
```

## Deployment Architecture

### Container Architecture

```mermaid
graph TB
    subgraph "Container Orchestration"
        K8S[Kubernetes Cluster]
    end

    subgraph "Application Containers"
        FE_CONTAINER[Frontend Container]
        BE_CONTAINER[Backend Container]
        NGINX_CONTAINER[Nginx Container]
    end

    subgraph "Data Containers"
        PG_CONTAINER[PostgreSQL Container]
        REDIS_CONTAINER[Redis Container]
    end

    subgraph "Monitoring Containers"
        PROM_CONTAINER[Prometheus Container]
        GRAFANA_CONTAINER[Grafana Container]
    end

    K8S --> FE_CONTAINER
    K8S --> BE_CONTAINER
    K8S --> NGINX_CONTAINER
    K8S --> PG_CONTAINER
    K8S --> REDIS_CONTAINER
    K8S --> PROM_CONTAINER
    K8S --> GRAFANA_CONTAINER
```

### CI/CD Pipeline

```mermaid
graph LR
    subgraph "Source Control"
        GIT[Git Repository]
    end

    subgraph "CI/CD Pipeline"
        BUILD[Build Stage]
        TEST[Test Stage]
        SECURITY[Security Scan]
        DEPLOY[Deploy Stage]
    end

    subgraph "Environments"
        DEV[Development]
        STAGING[Staging]
        PROD[Production]
    end

    GIT --> BUILD
    BUILD --> TEST
    TEST --> SECURITY
    SECURITY --> DEPLOY
    DEPLOY --> DEV
    DEPLOY --> STAGING
    DEPLOY --> PROD
```

## Disaster Recovery Architecture

### Backup and Recovery

```mermaid
graph TB
    subgraph "Primary Site"
        PRIMARY_DB[Primary Database]
        PRIMARY_APP[Primary Application]
    end

    subgraph "Backup Site"
        BACKUP_DB[Backup Database]
        BACKUP_APP[Backup Application]
    end

    subgraph "Backup Storage"
        DB_BACKUP[Database Backups]
        APP_BACKUP[Application Backups]
        CONFIG_BACKUP[Configuration Backups]
    end

    PRIMARY_DB --> DB_BACKUP
    PRIMARY_APP --> APP_BACKUP
    PRIMARY_APP --> CONFIG_BACKUP
    DB_BACKUP --> BACKUP_DB
    APP_BACKUP --> BACKUP_APP
    CONFIG_BACKUP --> BACKUP_APP
```

### High Availability

```mermaid
graph TB
    subgraph "Active-Active Setup"
        SITE1[Site 1 - Active]
        SITE2[Site 2 - Active]
    end

    subgraph "Load Distribution"
        GLOBAL_LB[Global Load Balancer]
    end

    subgraph "Data Synchronization"
        REPLICATION[Database Replication]
        SYNC[Data Synchronization]
    end

    GLOBAL_LB --> SITE1
    GLOBAL_LB --> SITE2
    SITE1 --> REPLICATION
    SITE2 --> REPLICATION
    REPLICATION --> SYNC
    SYNC --> SITE1
    SYNC --> SITE2
```

## Future Architecture Considerations

### Microservices Evolution

```mermaid
graph TB
    subgraph "Current Monolithic Services"
        CURRENT[Current Services]
    end

    subgraph "Future Microservices"
        AUTH_MS[Auth Microservice]
        USER_MS[User Microservice]
        MERCHANT_MS[Merchant Microservice]
        TERMINAL_MS[Terminal Microservice]
        INVOICE_MS[Invoice Microservice]
        PAYMENT_MS[Payment Microservice]
        ANALYTICS_MS[Analytics Microservice]
        PAYOUT_MS[Payout Microservice]
    end

    subgraph "Service Mesh"
        ISTIO[Istio Service Mesh]
    end

    CURRENT --> AUTH_MS
    CURRENT --> USER_MS
    CURRENT --> MERCHANT_MS
    CURRENT --> TERMINAL_MS
    CURRENT --> INVOICE_MS
    CURRENT --> PAYMENT_MS
    CURRENT --> ANALYTICS_MS
    CURRENT --> PAYOUT_MS
    AUTH_MS --> ISTIO
    USER_MS --> ISTIO
    MERCHANT_MS --> ISTIO
    TERMINAL_MS --> ISTIO
    INVOICE_MS --> ISTIO
    PAYMENT_MS --> ISTIO
    ANALYTICS_MS --> ISTIO
    PAYOUT_MS --> ISTIO
```

### Event-Driven Architecture

```mermaid
graph TB
    subgraph "Event Producers"
        USER_EVENTS[User Events]
        PAYMENT_EVENTS[Payment Events]
        TERMINAL_EVENTS[Terminal Events]
    end

    subgraph "Event Bus"
        KAFKA[Apache Kafka]
    end

    subgraph "Event Consumers"
        ANALYTICS_CONSUMER[Analytics Consumer]
        NOTIFICATION_CONSUMER[Notification Consumer]
        AUDIT_CONSUMER[Audit Consumer]
    end

    USER_EVENTS --> KAFKA
    PAYMENT_EVENTS --> KAFKA
    TERMINAL_EVENTS --> KAFKA
    KAFKA --> ANALYTICS_CONSUMER
    KAFKA --> NOTIFICATION_CONSUMER
    KAFKA --> AUDIT_CONSUMER
```

---

This architecture documentation provides a comprehensive overview of the Mint Platform's system architecture, covering all aspects from high-level design to implementation details and future considerations.
