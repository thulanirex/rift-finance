# 🚀 START HERE - MySQL Migration

Your Rift Finance Hub has been converted from Supabase to MySQL!

## What Happened?

Your application now uses:
- ✅ **MySQL** database instead of Supabase PostgreSQL
- ✅ **Express.js** backend API instead of Supabase client
- ✅ **JWT authentication** instead of Supabase Auth
- ✅ **Solana devnet integration** for blockchain transactions
- ✅ **Full control** over your backend and database

## Quick Start (5 Minutes)

### Step 1: Install MySQL
- **Windows**: Download from https://dev.mysql.com/downloads/installer/
- Run installer, set root password, start service

### Step 2: Create Database
```bash
mysql -u root -p
CREATE DATABASE rift_finance_hub;
exit;
```

### Step 3: Import Schema
```bash
cd server
mysql -u root -p rift_finance_hub < database/schema.sql
```

### Step 4: Configure
Edit `server/.env` and set your MySQL password:
```env
DB_PASSWORD=your_mysql_password
```

### Step 5: Install & Start
```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### Step 6: Test
Open http://localhost:5173 and try:
- Registering a new user
- Logging in
- Creating data

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **CONVERSION_SUMMARY.md** | Overview of all changes |
| **SETUP_MYSQL.md** | Detailed setup guide |
| **MYSQL_MIGRATION_GUIDE.md** | Complete migration documentation |
| **FRONTEND_UPDATE_EXAMPLES.md** | Code examples for updating frontend |
| **MIGRATION_CHECKLIST.md** | Track your migration progress |
| **server/README.md** | Backend API documentation |

## What's Next?

The backend is ready! Now you need to update your frontend:

1. **Read**: `FRONTEND_UPDATE_EXAMPLES.md`
2. **Update**: Replace Supabase calls with API client
3. **Test**: Verify all features work
4. **Deploy**: Follow production guide

## File Structure

```
your-project/
├── server/                          # NEW: Backend API
│   ├── config/database.js          # MySQL connection
│   ├── routes/                     # API endpoints
│   ├── middleware/auth.js          # JWT auth
│   ├── database/schema.sql         # Database schema
│   └── index.js                    # Server entry
├── src/
│   └── lib/api-client.ts           # NEW: API client
├── .env                            # Updated with API URL
└── Documentation files             # Migration guides

```

## Backend API

Your backend is running at: **http://localhost:3001**

### Test It
```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"seller"}'
```

## Frontend Updates Needed

Replace Supabase imports:
```typescript
// Before
import { supabase } from '@/integrations/supabase/client';

// After
import { apiClient } from '@/lib/api-client';
```

Update auth calls:
```typescript
// Before
await supabase.auth.signInWithPassword({ email, password });

// After
const { token, user } = await apiClient.auth.login({ email, password });
apiClient.setToken(token);
```

See `FRONTEND_UPDATE_EXAMPLES.md` for complete examples.

## Common Issues

### "Cannot connect to MySQL"
- Check MySQL is running
- Verify password in `server/.env`

### "Port 3001 already in use"
- Change PORT in `server/.env`
- Update VITE_API_URL in `.env`

### "JWT token invalid"
- Set JWT_SECRET in `server/.env`
- Clear browser localStorage

## Need Help?

1. Check **CONVERSION_SUMMARY.md** for overview
2. Read **SETUP_MYSQL.md** for detailed setup
3. See **FRONTEND_UPDATE_EXAMPLES.md** for code examples
4. Review **MIGRATION_CHECKLIST.md** to track progress

## Support

All documentation is in your project folder. Start with the file that matches your current need:

- 🆕 Just starting? → **SETUP_MYSQL.md**
- 🔧 Setting up? → **MYSQL_MIGRATION_GUIDE.md**
- 💻 Coding? → **FRONTEND_UPDATE_EXAMPLES.md**
- ✅ Tracking? → **MIGRATION_CHECKLIST.md**
- 📡 API reference? → **server/README.md**

---

**Ready?** Start with `SETUP_MYSQL.md` and follow the steps!
