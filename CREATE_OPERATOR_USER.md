# 🔐 Create Operator/Admin User

## Quick Method (Recommended)

Run this command in the `server` directory:

```bash
cd server
npm run create-operator
```

This will create:

### 1. **Operator User**
- **Email:** `operator@rift.finance`
- **Password:** `operator123`
- **Role:** `operator`
- **Access:** Can review invoices, approve/reject, manage KYB

### 2. **Admin User**
- **Email:** `admin@rift.finance`
- **Password:** `admin123`
- **Role:** `admin`
- **Access:** Full access to everything (operator + seller + funder features)

## Manual Method (SQL)

If you prefer to create users manually:

### Step 1: Generate Password Hash

Create a file `hash-password.js`:

```javascript
import bcrypt from 'bcryptjs';

const password = 'your-password-here';
const hash = await bcrypt.hash(password, 10);
console.log('Hash:', hash);
```

Run it:
```bash
node hash-password.js
```

### Step 2: Insert User

```sql
USE rift_finance_hub;

INSERT INTO users (id, email, password_hash, role, created_at, updated_at) 
VALUES (
  UUID(), 
  'operator@rift.finance',
  'YOUR_HASH_HERE',  -- Paste the hash from step 1
  'operator',
  NOW(),
  NOW()
);
```

## Login

1. Go to `http://localhost:5173/auth`
2. Enter email and password
3. You'll be redirected to the operator dashboard

## Default Credentials

**⚠️ IMPORTANT: Change these passwords in production!**

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `operator@rift.finance` | `operator123` | operator | Invoice review, KYB, Pools |
| `admin@rift.finance` | `admin123` | admin | Full platform access |

## Roles Explained

### Operator
- Review and approve/reject invoices
- Manage KYB applications
- View audit logs
- Manage pools
- Cannot submit invoices or fund

### Admin
- Everything an operator can do
- Plus: Can act as seller, funder, or operator
- Full access to all features
- Can manage all users

## Test the Flow

1. **Login as operator:**
   ```
   Email: operator@rift.finance
   Password: operator123
   ```

2. **You should see:**
   - Operator Dashboard with stats
   - Sidebar with: Dashboard, KYB Review, Invoices, Pools, Settings
   - Pending invoices count

3. **Test invoice approval:**
   - Go to "Invoices" in sidebar
   - Select a pending invoice
   - View PDF
   - Click "Approve" or "Reject"
   - Add notes
   - Submit

4. **Verify:**
   - Invoice status changes
   - Approved invoices appear in Market for funders

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens for authentication
- Role-based access control on all routes
- **Change default passwords immediately in production!**

## Troubleshooting

### "Email already exists"
The script uses `ON DUPLICATE KEY UPDATE` so it will update the password if the user already exists.

### "Cannot connect to database"
Check your `.env` file in the `server` directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rift_finance_hub
```

### "Permission denied"
Make sure your MySQL user has INSERT permissions on the `users` table.
