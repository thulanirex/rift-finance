export type UserRole = 'seller' | 'buyer' | 'funder' | 'operator' | 'admin';

export interface User {
  id: string;
  auth_id: string;
  email: string;
  role: UserRole | null;
  org_id: string | null;
  wallet_id: string | null;
  civic_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole | null;
  orgId?: string | null;
  needsRoleSelection: boolean;
  needsOnboarding: boolean;
}
