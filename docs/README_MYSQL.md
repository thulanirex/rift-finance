# Rift Finance Hub - MySQL Version

A decentralized invoice financing platform with MySQL backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
npm install
cd server
npm install
cd ..
```

2. **Setup MySQL database**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE rift_finance_hub;
exit;

# Import schema
cd server
mysql -u root -p rift_finance_hub < database/schema.sql
```

3. **Configure environment**
```bash
# Edit server/.env
# Set your MySQL password and JWT secret
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_random_string
```

4. **Start the application**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

5. **Open browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📚 Documentation

- **[CONVERSION_SUMMARY.md](CONVERSION_SUMMARY.md)** - Overview of changes
- **[SETUP_MYSQL.md](SETUP_MYSQL.md)** - Detailed setup guide
- **[MYSQL_MIGRATION_GUIDE.md](MYSQL_MIGRATION_GUIDE.md)** - Complete migration documentation
- **[FRONTEND_UPDATE_EXAMPLES.md](FRONTEND_UPDATE_EXAMPLES.md)** - Code examples for frontend updates
- **[server/README.md](server/README.md)** - Backend API documentation

## 🏗️ Architecture

### Backend
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT with bcrypt
- **API**: RESTful endpoints

### Frontend
- **Framework**: React + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **State**: React Query
- **API Client**: Custom TypeScript client

## 🔑 Key Features

- ✅ JWT-based authentication
- ✅ Role-based access control (seller, buyer, funder, operator, admin)
- ✅ Invoice management
- ✅ Liquidity pools
- ✅ Position tracking
- ✅ Audit logging
- ✅ Organization KYB management
- ✅ RESTful API

## 🗄️ Database Schema

### Main Tables
- `auth_users` - Authentication
- `users` - User profiles
- `organizations` - Company data
- `invoices` - Invoice records
- `pools` - Liquidity pools
- `positions` - Funder positions
- `ledger_entries` - Financial ledger
- `audit_logs` - Audit trail

## 🔐 Security

- Password hashing with bcrypt
- JWT token authentication
- SQL injection protection
- CORS configuration
- Role-based authorization
- Security headers (Helmet.js)

## 🛠️ Development

### Backend Development
```bash
cd server
npm run dev  # Starts with nodemon
```

### Frontend Development
```bash
npm run dev  # Starts Vite dev server
```

### Database Management
```bash
# View tables
mysql -u root -p rift_finance_hub -e "SHOW TABLES"

# View users
mysql -u root -p rift_finance_hub -e "SELECT * FROM users"

# Backup database
mysqldump -u root -p rift_finance_hub > backup.sql

# Restore database
mysql -u root -p rift_finance_hub < backup.sql
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Resources
- `/api/users` - User management
- `/api/organizations` - Organizations
- `/api/invoices` - Invoices
- `/api/pools` - Liquidity pools
- `/api/positions` - Positions
- `/api/ledger` - Ledger entries
- `/api/audit` - Audit logs

See [server/README.md](server/README.md) for complete API documentation.

## 🧪 Testing

### Test Backend Connection
```bash
curl http://localhost:3001/health
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"seller"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚀 Production Deployment

### Backend
1. Set environment to production
2. Use strong JWT secret
3. Configure production MySQL
4. Set up SSL/TLS
5. Use process manager (PM2)
6. Configure reverse proxy (nginx)
7. Set up monitoring

### Frontend
1. Update API URL
2. Build: `npm run build`
3. Deploy `dist` folder
4. Configure CDN

See [MYSQL_MIGRATION_GUIDE.md](MYSQL_MIGRATION_GUIDE.md) for detailed deployment instructions.

## 🔄 Migration from Supabase

This project was converted from Supabase to MySQL. To complete the migration:

1. ✅ Backend setup (completed)
2. 🔄 Update frontend components to use API client
3. 🧪 Test all features
4. 🚀 Deploy

See [FRONTEND_UPDATE_EXAMPLES.md](FRONTEND_UPDATE_EXAMPLES.md) for code examples.

## 📦 Dependencies

### Backend
- express - Web framework
- mysql2 - MySQL driver
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- cors - CORS middleware
- helmet - Security headers
- dotenv - Environment variables

### Frontend
- react - UI framework
- vite - Build tool
- @tanstack/react-query - Data fetching
- tailwindcss - Styling
- shadcn/ui - UI components

## 🐛 Troubleshooting

### Cannot connect to MySQL
```bash
# Check MySQL is running
sudo systemctl status mysql  # Linux
# Or check Services on Windows

# Test connection
mysql -u root -p -e "SELECT 1"
```

### Port already in use
```bash
# Change PORT in server/.env
PORT=3002

# Update VITE_API_URL in .env
VITE_API_URL=http://localhost:3002/api
```

### JWT token errors
- Ensure JWT_SECRET is set in server/.env
- Clear browser localStorage
- Login again

### CORS errors
- Check CORS_ORIGIN in server/.env matches frontend URL
- Ensure backend is running

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For issues and questions, refer to the documentation files or check the troubleshooting sections.
