# MySQL Migration Checklist

Use this checklist to track your progress migrating from Supabase to MySQL.

## Phase 1: Backend Setup ✅

- [x] MySQL installed and running
- [x] Database created (`rift_finance_hub`)
- [x] Schema imported from `server/database/schema.sql`
- [x] Backend dependencies installed (`cd server && npm install`)
- [x] Environment configured (`server/.env`)
- [x] Backend server created with Express.js
- [x] API routes implemented
- [x] Authentication middleware created
- [x] JWT authentication working

## Phase 2: Initial Testing

- [ ] Backend server starts successfully (`cd server && npm run dev`)
- [ ] MySQL connection successful (check console output)
- [ ] Health check endpoint works (`http://localhost:3001/health`)
- [ ] Can register a new user via API
- [ ] Can login and receive JWT token
- [ ] Token authentication works on protected routes

## Phase 3: Frontend Setup

- [ ] API client created (`src/lib/api-client.ts`)
- [ ] Environment updated (`.env` with `VITE_API_URL`)
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Can access frontend at `http://localhost:5173`

## Phase 4: Authentication Migration

### Auth Context (`src/contexts/AuthContext.tsx`)
- [ ] Import `apiClient` instead of `supabase`
- [ ] Update login function
- [ ] Update register function
- [ ] Update logout function
- [ ] Update getCurrentUser function
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test protected routes

### Auth Pages
- [ ] Update `src/pages/Auth.tsx`
- [ ] Update `src/pages/RoleSelection.tsx`
- [ ] Update `src/pages/DebugAuth.tsx` (if exists)
- [ ] Test registration
- [ ] Test login
- [ ] Test role selection

## Phase 5: Data Operations Migration

### Organizations
- [ ] Update `src/pages/OperatorDashboard.tsx`
- [ ] Update organization fetching
- [ ] Update organization creation
- [ ] Update organization updates
- [ ] Test KYB status changes

### Invoices
- [ ] Update `src/pages/Invoices.tsx`
- [ ] Update `src/pages/InvoiceNew.tsx`
- [ ] Update `src/pages/InvoiceDetail.tsx`
- [ ] Update `src/pages/OperatorInvoices.tsx`
- [ ] Test invoice creation
- [ ] Test invoice listing
- [ ] Test invoice updates
- [ ] Test invoice deletion

### Pools
- [ ] Update `src/pages/OperatorPools.tsx`
- [ ] Update `src/components/DeFiPools.tsx`
- [ ] Test pool listing
- [ ] Test pool creation (operator)
- [ ] Test pool updates (operator)

### Positions
- [ ] Update position fetching
- [ ] Update position creation
- [ ] Update position updates
- [ ] Test funder positions

### Users
- [ ] Update `src/pages/Settings.tsx`
- [ ] Update user profile fetching
- [ ] Update user profile updates
- [ ] Test user management (operator)

## Phase 6: Dashboard Updates

### Seller Dashboard
- [ ] Update `src/pages/SellerDashboard.tsx`
- [ ] Test invoice statistics
- [ ] Test invoice listing
- [ ] Test invoice creation

### Funder Dashboard
- [ ] Update `src/pages/FunderDashboard.tsx`
- [ ] Test position listing
- [ ] Test pool information
- [ ] Test yield calculations

### Operator Dashboard
- [ ] Update `src/pages/OperatorDashboard.tsx`
- [ ] Test organization management
- [ ] Test KYB review
- [ ] Test system statistics

## Phase 7: Component Updates

### Hooks
- [ ] Update `src/hooks/useFunderProfile.ts`
- [ ] Update `src/hooks/useRiftScore.ts`
- [ ] Update `src/hooks/useGateVerification.ts`
- [ ] Test all custom hooks

### Components
- [ ] Update `src/components/OperatorKYBConsole.tsx`
- [ ] Update `src/components/OperatorFunderReview.tsx`
- [ ] Update `src/components/RiftScoreOverride.tsx`
- [ ] Update `src/components/SellerOnboarding.tsx`
- [ ] Update `src/components/AllocationModal.tsx`
- [ ] Test all components

## Phase 8: Features Testing

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Token persistence works
- [ ] Protected routes work
- [ ] Role-based access works

### Invoice Management
- [ ] Can create invoice
- [ ] Can view invoice list
- [ ] Can view invoice details
- [ ] Can update invoice
- [ ] Can delete invoice
- [ ] Invoice status changes work

### Organization Management
- [ ] Can view organization
- [ ] Can update organization
- [ ] KYB status updates work
- [ ] Organization listing works (operator)

### Pool Management
- [ ] Can view pools
- [ ] Can create pool (operator)
- [ ] Can update pool (operator)
- [ ] Pool statistics display correctly

### Position Management
- [ ] Can create position
- [ ] Can view positions
- [ ] Can update position
- [ ] Position calculations correct

### Ledger & Audit
- [ ] Ledger entries created
- [ ] Audit logs created
- [ ] Can view ledger (authorized)
- [ ] Can view audit logs (operator)

## Phase 9: Real-time Features

- [ ] Identify real-time subscriptions in code
- [ ] Replace with polling or WebSockets
- [ ] Test data refresh
- [ ] Optimize polling intervals

## Phase 10: File Storage (if used)

- [ ] Identify file upload features
- [ ] Implement file storage solution (S3, local, etc.)
- [ ] Update file upload endpoints
- [ ] Test file uploads
- [ ] Test file downloads

## Phase 11: Performance & Optimization

- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Optimize API calls
- [ ] Add request caching
- [ ] Test with slow network
- [ ] Add retry logic

## Phase 12: Security Review

- [ ] JWT_SECRET is strong and unique
- [ ] Passwords are hashed
- [ ] SQL injection protection verified
- [ ] CORS configured correctly
- [ ] HTTPS enabled (production)
- [ ] Rate limiting considered
- [ ] Input validation working

## Phase 13: Production Preparation

### Backend
- [ ] Set `NODE_ENV=production`
- [ ] Use production MySQL server
- [ ] Configure database backups
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (nginx)
- [ ] SSL/TLS certificates installed

### Frontend
- [ ] Update `VITE_API_URL` to production
- [ ] Build frontend (`npm run build`)
- [ ] Test production build
- [ ] Deploy to hosting
- [ ] Configure CDN (optional)

### Database
- [ ] Production MySQL configured
- [ ] Automated backups enabled
- [ ] Connection pooling optimized
- [ ] Indexes optimized
- [ ] Security hardened

## Phase 14: Final Testing

- [ ] End-to-end testing complete
- [ ] All user roles tested
- [ ] All features working
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser tested

## Phase 15: Cleanup

- [ ] Remove Supabase dependencies (`npm uninstall @supabase/supabase-js`)
- [ ] Remove unused Supabase files
- [ ] Update documentation
- [ ] Remove old environment variables
- [ ] Archive old code (if needed)

## Phase 16: Documentation

- [ ] Update README.md
- [ ] Document API endpoints
- [ ] Create deployment guide
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Update team documentation

## Phase 17: Monitoring & Maintenance

- [ ] Set up error tracking
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure alerts
- [ ] Plan backup strategy
- [ ] Plan update strategy

## Notes & Issues

Use this section to track any issues or notes during migration:

```
Date: ___________
Issue: ___________________________________________________________
Solution: _________________________________________________________

Date: ___________
Issue: ___________________________________________________________
Solution: _________________________________________________________

Date: ___________
Issue: ___________________________________________________________
Solution: _________________________________________________________
```

## Migration Status

- **Started**: ___________
- **Backend Complete**: ___________
- **Frontend Complete**: ___________
- **Testing Complete**: ___________
- **Production Deployed**: ___________

## Team Sign-off

- [ ] Backend Developer: ___________
- [ ] Frontend Developer: ___________
- [ ] QA/Testing: ___________
- [ ] DevOps: ___________
- [ ] Project Manager: ___________

---

**Remember**: Test thoroughly after each phase before moving to the next!
