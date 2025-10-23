# RIFT Finance Hub - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase project set up
- Git installed

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd rift-finance-hub-00-main

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations
# (See Database Setup section below)

# Start development server
npm run dev
```

---

## 📊 Database Setup

### 1. Run Initial Migration
The main schema is already in `supabase/migrations/`. Make sure it's applied to your Supabase project.

### 2. Add User Creation Trigger
**CRITICAL:** Run this SQL in your Supabase SQL Editor:

```sql
-- Automatically create user record when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, role)
  VALUES (NEW.id, NEW.email, NULL)
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Create Test Users (Optional)

```sql
-- Create an operator user for testing
-- First, sign up via the UI with this email, then run:
UPDATE users SET role = 'operator' WHERE email = 'operator@test.com';

-- Or create test users directly:
INSERT INTO users (auth_id, email, role) VALUES
  ('test-seller-id', 'seller@test.com', 'seller'),
  ('test-funder-id', 'funder@test.com', 'funder'),
  ('test-operator-id', 'operator@test.com', 'operator');
```

---

## 🧪 Testing the Application

### Test User Journeys

#### 1. New User Signup Flow
```
1. Go to /auth
2. Click "Sign Up" tab
3. Enter email and password
4. After signup, you'll be redirected to /role-selection
5. Choose a role (Seller, Funder, or Operator)
6. You'll be redirected to the appropriate onboarding
```

#### 2. Seller Journey
```
1. Login as seller
2. You'll land on /dashboard/seller
3. Click "Upload Invoice"
4. Fill out invoice form and upload PDF
5. Submit for review
6. Go back to dashboard to see invoice status
```

#### 3. Funder Journey
```
1. Login as funder
2. You'll land on /dashboard/funder
3. Complete verification if needed
4. Click "Marketplace" in nav
5. Browse invoices and pools
6. Allocate funds (requires wallet connection)
```

#### 4. Operator Journey
```
1. Login as operator
2. You'll land on /dashboard/operator
3. See pending KYB and invoice reviews
4. Click "Invoice Review" to approve invoices
5. Click "KYB Review" to approve organizations
6. Check "Audit Trail" for activity logs
```

---

## 🔐 Authentication System

### Using the Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';

// Require authentication only
<ProtectedRoute>
  <MyPage />
</ProtectedRoute>

// Require specific role
<ProtectedRoute>
  <RoleGuard allowedRoles={['seller', 'admin']}>
    <SellerPage />
  </RoleGuard>
</ProtectedRoute>
```

### Using the Dashboard Layout

```tsx
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

function MyDashboard() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1>My Dashboard</h1>
        {/* Your content */}
      </div>
    </DashboardLayout>
  );
}
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/              # Auth-related components
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   ├── layouts/           # Layout components
│   │   └── DashboardLayout.tsx
│   └── ui/                # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx    # Global auth state
├── hooks/
│   ├── useAuth.ts         # (use from context)
│   └── ...
├── pages/
│   ├── RoleSelection.tsx  # Role selection page
│   ├── SellerDashboard.tsx
│   ├── FunderDashboard.tsx
│   ├── OperatorDashboard.tsx
│   └── ...
├── types/
│   ├── user.ts            # User types
│   └── permissions.ts     # Permission system
└── App.tsx                # Route definitions
```

---

## 🎨 Adding a New Page

### 1. Create the Page Component

```tsx
// src/pages/MyNewPage.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyNewPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My New Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your content here</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. Add Route to App.tsx

```tsx
// src/App.tsx
import MyNewPage from './pages/MyNewPage';

// Inside <Routes>:
<Route
  path="/my-new-page"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={['seller', 'admin']}>
        <DashboardLayout>
          <MyNewPage />
        </DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  }
/>
```

### 3. Add to Navigation (Optional)

```tsx
// src/components/layouts/DashboardLayout.tsx
// In getNavItems() function, add to appropriate role:

if (role === 'seller') {
  return [
    // ... existing items
    { icon: YourIcon, label: 'My New Page', path: '/my-new-page' },
  ];
}
```

---

## 🔧 Common Tasks

### Check User's Role

```tsx
const { user } = useAuth();

if (user?.role === 'seller') {
  // Seller-specific logic
}
```

### Check Permissions

```tsx
import { hasPermission } from '@/types/permissions';

const { user } = useAuth();

if (hasPermission(user?.role, 'canUploadInvoices')) {
  // Show upload button
}
```

### Refresh User Data

```tsx
const { refreshUser } = useAuth();

// After updating user in database:
await supabase.from('users').update({ role: 'funder' }).eq('id', userId);
await refreshUser(); // Refresh auth context
```

### Sign Out User

```tsx
const { signOut } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
  await signOut();
  navigate('/auth');
};
```

---

## 🐛 Troubleshooting

### "User not found" error
**Cause:** User record not created in `users` table  
**Fix:** Run the user creation trigger SQL (see Database Setup)

### Stuck on role selection page
**Cause:** Role not saved to database  
**Fix:** Check browser console for errors, verify database connection

### "Access Denied" on valid route
**Cause:** User role doesn't match allowed roles  
**Fix:** Check user's role in database, verify RoleGuard allowedRoles array

### Navigation not showing
**Cause:** User role is null  
**Fix:** Ensure user has selected a role, check AuthContext

### Infinite redirect loop
**Cause:** Auth state change triggering multiple redirects  
**Fix:** Check useEffect dependencies in Auth.tsx and Index.tsx

---

## 📝 Development Tips

### 1. Use React DevTools
Install React DevTools to inspect component state and context values.

### 2. Check Supabase Logs
Go to Supabase Dashboard → Logs to see database queries and errors.

### 3. Test All Roles
Create test accounts for each role to verify permissions work correctly.

### 4. Mobile Testing
Test on mobile devices or use Chrome DevTools device emulation.

### 5. Clear Cache
If seeing stale data, clear browser cache and localStorage.

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables
Set these in your hosting platform:
```
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
```

### Pre-deployment Checklist
- [ ] Database migrations applied
- [ ] User creation trigger installed
- [ ] Test all user journeys
- [ ] Verify RLS policies
- [ ] Test on staging environment
- [ ] Check mobile responsiveness
- [ ] Verify all environment variables

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

---

## 🆘 Getting Help

### Common Issues
Check `ASSESSMENT_REPORT.md` for known issues and solutions.

### Implementation Details
Check `IMPLEMENTATION_SUMMARY.md` for detailed implementation notes.

### Code Examples
Look at existing pages like `SellerDashboard.tsx` for patterns.

---

## ✅ Next Steps

After getting the app running:

1. **Test all user journeys** - Verify each role works correctly
2. **Review the assessment** - Read `ASSESSMENT_REPORT.md` for full context
3. **Check implementation** - Read `IMPLEMENTATION_SUMMARY.md` for details
4. **Plan Phase 2** - Start implementing UX improvements

---

*Happy coding! 🎉*
