import { UserRole } from './user';

export const ROLE_PERMISSIONS = {
  seller: {
    canUploadInvoices: true,
    canViewOwnInvoices: true,
    canAccessMarket: false,
    canAccessOperatorTools: false,
    canFundInvoices: false,
  },
  buyer: {
    canUploadInvoices: false,
    canViewOwnInvoices: false,
    canAccessMarket: false,
    canAccessOperatorTools: false,
    canFundInvoices: false,
  },
  funder: {
    canUploadInvoices: false,
    canViewOwnInvoices: false,
    canAccessMarket: true,
    canAccessOperatorTools: false,
    canFundInvoices: true,
  },
  operator: {
    canUploadInvoices: false,
    canViewOwnInvoices: false,
    canAccessMarket: true,
    canAccessOperatorTools: true,
    canFundInvoices: true,
  },
  admin: {
    canUploadInvoices: true,
    canViewOwnInvoices: true,
    canAccessMarket: true,
    canAccessOperatorTools: true,
    canFundInvoices: true,
  },
} as const;

export function hasPermission(role: UserRole | null, permission: keyof typeof ROLE_PERMISSIONS.seller): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function canAccessRoute(role: UserRole | null, path: string): boolean {
  if (!role) return false;

  // Public routes
  if (path === '/' || path === '/auth') return true;

  // Seller routes
  if (path.startsWith('/invoices') || path.startsWith('/dashboard/seller') || path.startsWith('/onboarding/seller')) {
    return role === 'seller' || role === 'admin';
  }

  // Funder routes
  if (path.startsWith('/market') || path.startsWith('/dashboard/funder') || path.startsWith('/onboarding/funder')) {
    return role === 'funder' || role === 'operator' || role === 'admin';
  }

  // Operator routes
  if (path.startsWith('/ops/') || path.startsWith('/dashboard/operator')) {
    return role === 'operator' || role === 'admin';
  }

  // Shared routes
  if (path.startsWith('/settings')) return true;

  return false;
}
