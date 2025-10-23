# MySQL Migration Guide

This guide explains how to migrate the Rift Finance Hub from Supabase (PostgreSQL) to MySQL.

## Overview

The application has been converted from using Supabase as a Backend-as-a-Service to a custom Express.js backend with MySQL database.

## Architecture Changes

### Before (Supabase)
- **Frontend**: React/Vite with `@supabase/supabase-js` client
- **Backend**: Supabase (managed PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (managed by Supabase)

### After (MySQL)
- **Frontend**: React/Vite with custom API client
- **Backend**: Express.js REST API
- **Authentication**: JWT-based authentication
- **Database**: MySQL

## Setup Instructions

### 1. Install MySQL

#### Windows
1. Download MySQL from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Run the installer and follow the setup wizard
3. Set a root password during installation
4. Start MySQL service

#### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-server

# Mac (using Homebrew)
brew install mysql
brew services start mysql
```

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE rift_finance_hub;
exit;
```

### 3. Run Database Schema

```bash
# From the project root
cd server
mysql -u root -p rift_finance_hub < database/schema.sql
```

### 4. Configure Backend

```bash
# Navigate to server directory
cd server

# Copy environment file
cp .env.example .env

# Edit .env with your MySQL credentials
# Update these values:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=rift_finance_hub
# JWT_SECRET=generate_a_secure_random_string
```

### 5. Install Backend Dependencies

```bash
cd server
npm install
```

### 6. Configure Frontend

Update the main `.env` file in the project root:

```env
# Remove Supabase configuration
# VITE_SUPABASE_PROJECT_ID=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
# VITE_SUPABASE_URL=...

# Add API URL
VITE_API_URL=http://localhost:3001/api
```

### 7. Start the Application

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

The backend will run on `http://localhost:3001` and the frontend on `http://localhost:5173`.

## Database Schema

The MySQL schema includes the following tables:

- **auth_users**: User authentication credentials
- **users**: User profiles and roles
- **organizations**: Company/organization data
- **wallets**: Crypto wallet information
- **invoices**: Invoice records
- **pools**: Liquidity pools
- **positions**: Funder positions in pools
- **ledger_entries**: Financial ledger
- **audit_logs**: System audit trail
- **bank_accounts**: Bank account information
- **allowlist_wallets**: Whitelisted wallet addresses

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (operator/admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (operator/admin)

### Organizations
- `GET /api/organizations` - Get organizations
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization (operator/admin)

### Invoices
- `GET /api/invoices` - Get invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Pools
- `GET /api/pools` - Get all pools (public)
- `GET /api/pools/:id` - Get pool by ID
- `POST /api/pools` - Create pool (operator/admin)
- `PUT /api/pools/:id` - Update pool (operator/admin)
- `DELETE /api/pools/:id` - Delete pool (operator/admin)

### Positions
- `GET /api/positions` - Get positions
- `GET /api/positions/:id` - Get position by ID
- `POST /api/positions` - Create position
- `PUT /api/positions/:id` - Update position
- `DELETE /api/positions/:id` - Delete position (operator/admin)

### Ledger
- `GET /api/ledger` - Get ledger entries
- `POST /api/ledger` - Create ledger entry

### Audit
- `GET /api/audit` - Get audit logs (operator/admin)
- `POST /api/audit` - Create audit log

## Frontend Changes Required

To complete the migration, you need to update the frontend code to use the new API client instead of Supabase:

### 1. Replace Supabase Client Imports

**Before:**
```typescript
import { supabase } from '@/integrations/supabase/client';
```

**After:**
```typescript
import { apiClient } from '@/lib/api-client';
```

### 2. Update Authentication Calls

**Before:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**After:**
```typescript
const { token, user } = await apiClient.auth.login({
  email,
  password
});
apiClient.setToken(token);
```

### 3. Update Database Queries

**Before:**
```typescript
const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('org_id', orgId);
```

**After:**
```typescript
const invoices = await apiClient.invoices.getAll();
// Filter on client side if needed
const filtered = invoices.filter(inv => inv.org_id === orgId);
```

### 4. Update Insert Operations

**Before:**
```typescript
const { data, error } = await supabase
  .from('invoices')
  .insert({
    amount_eur: 1000,
    due_date: '2024-12-31',
    // ...
  });
```

**After:**
```typescript
const invoice = await apiClient.invoices.create({
  amountEur: 1000,
  dueDate: '2024-12-31',
  // ...
});
```

### 5. Update Update Operations

**Before:**
```typescript
const { data, error } = await supabase
  .from('invoices')
  .update({ status: 'funded' })
  .eq('id', invoiceId);
```

**After:**
```typescript
const invoice = await apiClient.invoices.update(invoiceId, {
  status: 'funded'
});
```

## Key Differences

### 1. Authentication
- **Supabase**: Built-in auth with email/password, OAuth, magic links
- **MySQL**: Custom JWT-based authentication

### 2. Real-time Subscriptions
- **Supabase**: Native real-time subscriptions
- **MySQL**: Need to implement polling or WebSockets separately

### 3. Storage
- **Supabase**: Built-in file storage
- **MySQL**: Need separate file storage solution (e.g., AWS S3, local storage)

### 4. Row Level Security (RLS)
- **Supabase**: Database-level RLS policies
- **MySQL**: Application-level authorization in API routes

### 5. Auto-generated Types
- **Supabase**: Auto-generates TypeScript types
- **MySQL**: Need to manually maintain types

## Security Considerations

1. **JWT Secret**: Use a strong, random JWT secret in production
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly for your domain
4. **SQL Injection**: The API uses parameterized queries to prevent SQL injection
5. **Password Hashing**: Passwords are hashed using bcrypt
6. **Rate Limiting**: Consider adding rate limiting middleware

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a production-grade MySQL server
3. Set up proper database backups
4. Use environment variables for sensitive data
5. Deploy to a cloud provider (AWS, DigitalOcean, etc.)
6. Set up monitoring and logging

### Frontend
1. Update `VITE_API_URL` to your production API URL
2. Build the frontend: `npm run build`
3. Deploy the `dist` folder to a static hosting service

## Troubleshooting

### Connection Issues
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env`
- Check firewall settings

### Authentication Errors
- Ensure JWT_SECRET is set
- Check token expiration
- Verify user exists in database

### CORS Errors
- Update CORS_ORIGIN in server `.env`
- Ensure frontend URL matches CORS configuration

## Migration Checklist

- [ ] MySQL installed and running
- [ ] Database created
- [ ] Schema imported
- [ ] Backend `.env` configured
- [ ] Backend dependencies installed
- [ ] Frontend `.env` updated
- [ ] Backend server running
- [ ] Frontend running
- [ ] Can register new user
- [ ] Can login
- [ ] Can create/read/update/delete data
- [ ] All features working

## Support

For issues or questions, please refer to:
- Express.js documentation: https://expressjs.com/
- MySQL documentation: https://dev.mysql.com/doc/
- Node.js MySQL2 package: https://github.com/sidorares/node-mysql2
