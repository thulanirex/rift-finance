import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { AuthUser, UserRole } from '@/types/user';

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
      console.log('🔍 Fetching user profile from MySQL backend...');
      
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
    try {
      const profile = await fetchUserProfile();
      setUser(profile);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    console.log('🚀 AuthContext initializing with MySQL backend...');
    
    // Check if user is logged in (has token)
    const checkAuth = async () => {
      try {
        // Only check if we have a token
        if (localStorage.getItem('auth_token')) {
          const profile = await fetchUserProfile();
          setUser(profile);
          console.log('✅ Initial auth check complete - user logged in');
        } else {
          console.log('📋 No token found');
          setUser(null);
        }
      } catch (error) {
        console.log('📋 No active session');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
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
