import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, UserRole } from '@/types/user';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (): Promise<AuthUser | null> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('⚠️ No auth token found');
        return null;
      }

      console.log('🔍 Fetching user profile from API...');
      const userData = await apiClient.auth.getUser();
      
      console.log('✅ User profile loaded:', userData.email, 'Role:', userData.role, 'OrgId:', userData.orgId);
      
      return {
        id: userData.id,
        email: userData.email,
        role: userData.role as UserRole | null,
        orgId: userData.orgId,
        needsRoleSelection: !userData.role,
        needsOnboarding: !userData.orgId && userData.role !== 'operator' && userData.role !== 'admin',
      };
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    const profile = await fetchUserProfile();
    setUser(profile);
  };

  useEffect(() => {
    console.log('🚀 AuthContext initializing (MySQL backend)...');
    
    // Check if user has a token
    const token = localStorage.getItem('auth_token');
    console.log('📋 Token check:', token ? 'Token found' : 'No token');
    
    if (token) {
      fetchUserProfile().then((profile) => {
        setUser(profile);
        setLoading(false);
        console.log('✅ Initial auth check complete');
      }).catch((error) => {
        console.error('❌ Error checking auth:', error);
        setLoading(false);
      });
    } else {
      setLoading(false);
      console.log('✅ No token, user not logged in');
    }
  }, []);

  const signOut = () => {
    apiClient.clearToken();
    setUser(null);
    console.log('✅ User signed out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
