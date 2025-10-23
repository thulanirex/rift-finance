# Quick Setup Guide - MySQL Migration

This guide will help you quickly set up the MySQL version of Rift Finance Hub.

## Step 1: Install MySQL

### Windows
1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default"
3. Set a root password (remember this!)
4. Complete the installation

### Verify MySQL is Running
```bash
# Windows
mysql --version

# Check if MySQL service is running
# Open Services (services.msc) and look for MySQL80
```

## Step 2: Create Database

Open Command Prompt or PowerShell:

```bash
# Login to MySQL (enter your root password when prompted)
mysql -u root -p

# In MySQL prompt, run:
CREATE DATABASE rift_finance_hub;
exit;
```

## Step 3: Import Database Schema

```bash
# Navigate to server directory
cd server

# Import the schema (enter your root password when prompted)
mysql -u root -p rift_finance_hub < database/schema.sql
```

## Step 4: Configure Backend

```bash
# Still in server directory
# Edit the .env file with your MySQL password
# Open server/.env in a text editor and update:
DB_PASSWORD=your_mysql_root_password
```

## Step 5: Install Backend Dependencies

```bash
# In server directory
npm install
```

## Step 6: Start Backend Server

```bash
# In server directory
npm run dev
```

You should see:
```
✅ MySQL Database connected successfully
🚀 Server running on port 3001
```

## Step 7: Start Frontend

Open a new terminal:

```bash
# In project root directory
npm run dev
```

The frontend will start on http://localhost:5173

## Step 8: Test the Application

1. Open http://localhost:5173 in your browser
2. Try registering a new user
3. Login with the credentials
4. Test creating/viewing data

## Troubleshooting

### "Access denied for user 'root'@'localhost'"
- Check your password in `server/.env`
- Make sure DB_PASSWORD matches your MySQL root password

### "Cannot connect to MySQL server"
- Verify MySQL service is running
- Check Windows Services for MySQL80

### "Database 'rift_finance_hub' doesn't exist"
- Run the CREATE DATABASE command again
- Make sure you're connected to MySQL when running it

### Port 3001 already in use
- Change PORT in `server/.env` to another port (e.g., 3002)
- Update VITE_API_URL in main `.env` to match

### CORS errors in browser
- Make sure backend is running
- Check CORS_ORIGIN in `server/.env` matches your frontend URL

## Quick Commands Reference

```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from project root)
npm run dev

# Check MySQL status
mysql -u root -p -e "SELECT 1"

# View database tables
mysql -u root -p rift_finance_hub -e "SHOW TABLES"

# View users in database
mysql -u root -p rift_finance_hub -e "SELECT * FROM users"
```

## Default Test Data

The schema includes 3 test organizations:
1. Ardmore Exports Ltd (Ireland) - KYB Approved
2. Baltic Foods GmbH (Germany) - KYB Pending
3. Cordoba Trading SRL (Spain) - KYB Rejected

And 3 liquidity pools:
- 30 days @ 5% APR
- 90 days @ 7% APR
- 120 days @ 10% APR

## Next Steps

After setup is complete:

1. **Update Frontend Code**: Replace Supabase calls with API client
   - See `MYSQL_MIGRATION_GUIDE.md` for detailed instructions

2. **Test All Features**: Ensure all functionality works with the new backend

3. **Production Setup**: Follow production deployment guide in `server/README.md`

## Need Help?

- Check `MYSQL_MIGRATION_GUIDE.md` for detailed migration information
- Check `server/README.md` for API documentation
- Review error messages in terminal for specific issues
