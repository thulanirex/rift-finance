# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    React + Vite + TypeScript                 │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Components (Pages, UI, Forms)                     │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  API Client (src/lib/api-client.ts)                │    │
│  │  - JWT Token Management                            │    │
│  │  - HTTP Request Wrapper                            │    │
│  │  - TypeScript Types                                │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│                    Express.js + Node.js                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Middleware                                        │    │
│  │  - CORS                                            │    │
│  │  - Helmet (Security Headers)                       │    │
│  │  - Morgan (Logging)                                │    │
│  │  - JWT Authentication                              │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Routes (API Endpoints)                            │    │
│  │  - /api/auth (register, login, me)                 │    │
│  │  - /api/users                                      │    │
│  │  - /api/organizations                              │    │
│  │  - /api/invoices                                   │    │
│  │  - /api/pools                                      │    │
│  │  - /api/positions                                  │    │
│  │  - /api/ledger                                     │    │
│  │  - /api/audit                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Database Connection Pool (mysql2)                 │    │
│  │  - Connection pooling                              │    │
│  │  - Parameterized queries                           │    │
│  │  - Transaction support                             │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ MySQL Protocol
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                              │
│                         MySQL 8.0+                           │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  auth_users     │  │  users          │                  │
│  │  - id           │  │  - id           │                  │
│  │  - email        │  │  - auth_id      │                  │
│  │  - password_hash│  │  - role         │                  │
│  └─────────────────┘  │  - org_id       │                  │
│                       └─────────────────┘                  │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  organizations  │  │  invoices       │                  │
│  │  - id           │  │  - id           │                  │
│  │  - name         │  │  - org_id       │                  │
│  │  - kyb_status   │  │  - amount_eur   │                  │
│  └─────────────────┘  │  - status       │                  │
│                       └─────────────────┘                  │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  pools          │  │  positions      │                  │
│  │  - id           │  │  - id           │                  │
│  │  - tenor_days   │  │  - pool_id      │                  │
│  │  - apr          │  │  - funder_id    │                  │
│  └─────────────────┘  │  - invoice_id   │                  │
│                       └─────────────────┘                  │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  ledger_entries │  │  audit_logs     │                  │
│  │  wallets        │  │  bank_accounts  │                  │
│  │  allowlist_...  │  │  ...            │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow

### Authentication Flow

```
User Login Request
      │
      ▼
┌──────────────────┐
│  Frontend Form   │
│  - email         │
│  - password      │
└──────────────────┘
      │
      │ POST /api/auth/login
      ▼
┌──────────────────────────────┐
│  Backend: auth.js route      │
│  1. Validate input           │
│  2. Query auth_users table   │
│  3. Compare password hash    │
│  4. Query users table        │
│  5. Generate JWT token       │
└──────────────────────────────┘
      │
      │ Response: { token, user }
      ▼
┌──────────────────────────────┐
│  Frontend: API Client        │
│  1. Store token in memory    │
│  2. Save to localStorage     │
│  3. Update app state         │
└──────────────────────────────┘
```

### Protected Resource Access

```
Get Invoices Request
      │
      ▼
┌──────────────────────────────┐
│  Frontend: API Client        │
│  1. Add Authorization header │
│     Bearer <token>           │
└──────────────────────────────┘
      │
      │ GET /api/invoices
      ▼
┌──────────────────────────────┐
│  Backend: Auth Middleware    │
│  1. Extract token            │
│  2. Verify JWT signature     │
│  3. Decode user info         │
│  4. Attach to req.user       │
└──────────────────────────────┘
      │
      │ Authorized
      ▼
┌──────────────────────────────┐
│  Backend: invoices.js route  │
│  1. Check user role          │
│  2. Build SQL query          │
│  3. Filter by org_id         │
│  4. Execute query            │
└──────────────────────────────┘
      │
      │ Response: [invoices]
      ▼
┌──────────────────────────────┐
│  Frontend: Component         │
│  1. Receive data             │
│  2. Update state             │
│  3. Render UI                │
└──────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Network Security              │
│  - HTTPS/TLS encryption                 │
│  - CORS policy                          │
│  - Rate limiting (optional)             │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Layer 2: Application Security          │
│  - Helmet.js security headers           │
│  - JWT token validation                 │
│  - Input validation                     │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Layer 3: Authorization                 │
│  - Role-based access control            │
│  - Resource ownership checks            │
│  - Operator/admin privileges            │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Layer 4: Database Security             │
│  - Parameterized queries                │
│  - SQL injection prevention             │
│  - Password hashing (bcrypt)            │
└─────────────────────────────────────────┘
```

## Data Flow Example: Creating an Invoice

```
1. USER ACTION
   └─> User fills invoice form
       └─> Clicks "Create Invoice"

2. FRONTEND
   └─> Form validation
       └─> apiClient.invoices.create({
             amountEur: 10000,
             dueDate: "2024-12-31",
             counterparty: "ABC Corp",
             tenorDays: 90
           })

3. API CLIENT
   └─> Adds Authorization header
       └─> POST /api/invoices
           └─> Body: JSON data

4. BACKEND MIDDLEWARE
   └─> CORS check ✓
       └─> JWT verification ✓
           └─> User authenticated ✓

5. BACKEND ROUTE
   └─> Validate required fields
       └─> Check user has org_id
           └─> INSERT INTO invoices
               └─> (org_id, amount_eur, due_date, ...)

6. DATABASE
   └─> Execute INSERT
       └─> Generate UUID
           └─> Return new record

7. BACKEND RESPONSE
   └─> SELECT * FROM invoices WHERE id = ?
       └─> Return invoice object

8. FRONTEND
   └─> Receive invoice data
       └─> Update UI
           └─> Show success message
               └─> Redirect to invoice list
```

## Comparison: Before vs After

### Before (Supabase)

```
Frontend
   │
   │ @supabase/supabase-js
   │
   ▼
Supabase Cloud
   ├─> PostgreSQL (managed)
   ├─> Auth Service (managed)
   ├─> Storage (managed)
   └─> Real-time (managed)
```

### After (MySQL)

```
Frontend
   │
   │ Custom API Client
   │
   ▼
Express.js Backend (self-hosted)
   ├─> JWT Auth (custom)
   ├─> REST API (custom)
   └─> MySQL Database (self-hosted)
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: React Query
- **Routing**: React Router
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript (ES Modules)
- **Authentication**: JWT + bcrypt
- **Database Driver**: mysql2
- **Security**: Helmet.js, CORS
- **Logging**: Morgan

### Database
- **DBMS**: MySQL 8.0+
- **Storage Engine**: InnoDB
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

## Deployment Architecture (Production)

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │  Load Balancer │
              │   (Optional)   │
              └────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐           ┌───────────────┐
│   Frontend    │           │   Backend     │
│   (Static)    │           │  (Express)    │
│               │           │               │
│  - Nginx      │           │  - PM2        │
│  - CDN        │           │  - Nginx      │
│  - SSL/TLS    │           │  - SSL/TLS    │
└───────────────┘           └───────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │    MySQL      │
                            │   Database    │
                            │               │
                            │  - Replication│
                            │  - Backups    │
                            └───────────────┘
```

## Scaling Considerations

### Horizontal Scaling
- Multiple backend instances behind load balancer
- Stateless JWT authentication (no session storage)
- Database connection pooling

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database indexes
- Query optimization

### Caching
- Redis for session/token blacklist
- Application-level caching
- CDN for static assets

### Database
- Read replicas for scaling reads
- Sharding for large datasets
- Regular index optimization

## Monitoring Points

```
Frontend
  ├─> Error tracking (Sentry)
  ├─> Performance monitoring
  └─> User analytics

Backend
  ├─> API response times
  ├─> Error rates
  ├─> Request volume
  └─> Server resources

Database
  ├─> Query performance
  ├─> Connection pool usage
  ├─> Disk I/O
  └─> Replication lag
```

## Security Best Practices

1. **Authentication**
   - Strong JWT secrets
   - Token expiration
   - Refresh token rotation

2. **Authorization**
   - Role-based access control
   - Resource ownership validation
   - Principle of least privilege

3. **Data Protection**
   - Password hashing (bcrypt)
   - SQL injection prevention
   - Input sanitization
   - Output encoding

4. **Network Security**
   - HTTPS only
   - CORS configuration
   - Rate limiting
   - DDoS protection

5. **Database Security**
   - Least privilege DB users
   - Encrypted connections
   - Regular backups
   - Audit logging
