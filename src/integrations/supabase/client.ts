// DEPRECATED: This file is kept for backward compatibility
// The app now uses MySQL backend with apiClient instead of Supabase
// TODO: Replace all imports of this file with: import { apiClient } from '@/lib/api-client'

import type { Database } from './types';

console.warn('⚠️ DEPRECATED: Supabase client is disabled. Please migrate to apiClient from @/lib/api-client');

// Create a mock client that returns rejected promises to prevent network calls
export const supabase = {
  from: (table: string) => ({
    select: () => Promise.reject(new Error('Supabase is disabled - use apiClient')),
    insert: () => Promise.reject(new Error('Supabase is disabled - use apiClient')),
    update: () => Promise.reject(new Error('Supabase is disabled - use apiClient')),
    delete: () => Promise.reject(new Error('Supabase is disabled - use apiClient')),
    upsert: () => Promise.reject(new Error('Supabase is disabled - use apiClient')),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.reject(new Error('Supabase is disabled - use apiClient')),
    signInWithPassword: () => Promise.reject(new Error('Supabase is disabled - use apiClient')),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: () => Promise.reject(new Error('Supabase is disabled - use apiClient')),
  },
  functions: {
    invoke: () => Promise.reject(new Error('Supabase Edge Functions are disabled - implement with MySQL backend')),
  },
} as any;