import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GateStatus {
  gate_status: 'unverified' | 'pending' | 'verified' | 'denied';
  gate_updated_at: string | null;
  wallet_address: string | null;
  hasSbt: boolean;
  latest_verification?: any;
}

export function useGateStatus() {
  const { user } = useAuth();
  const [gateStatus, setGateStatus] = useState<GateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGateStatus = async () => {
    if (!user?.id) return null;

    try {
      // For now, return mock data - implement proper KYC/Gate verification later
      return {
        gate_status: 'verified',
        wallet_address: null,
        verified_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch gate status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchGateStatus();
  }, []);

  return { gateStatus, loading, error, refetch: fetchGateStatus };
}

export function useGateVerify() {
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  const verify = async (method?: 'kyb_only' | 'email_allowlist' | 'sanctions_check' | 'combo') => {
    try {
      const startGateVerification = async () => {
        try {
          // Implement Gate/Civic verification flow
          console.log('Starting Gate verification...');
          return { success: true };
        } catch (error) {
          console.error('Failed to start gate verification:', error);
          throw error;
        }
      };

      setVerifying(true);

      const { success } = await startGateVerification();

      if (success) {
        toast({
          title: 'Verification successful',
          description: 'You can now fund invoices',
        });
        return { success: true };
      } else {
        toast({
          title: 'Verification failed',
          description: 'Verification requirements not met',
          variant: 'destructive',
        });
        return { success: false };
      }
    } catch (err: any) {
      console.error('Gate verification failed:', err);
      toast({
        title: 'Verification error',
        description: err.message || 'Failed to verify',
        variant: 'destructive',
      });
      return { success: false, error: err };
    } finally {
      setVerifying(false);
    }
  };

  return { verify, verifying };
}
