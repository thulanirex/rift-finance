import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useFunderProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user?.id) return null;

    try {
      // Return approved profile for now - implement proper profile management later
      return {
        status: 'approved',
        user_id: user.id,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch funder profile:', error);
      throw error;
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['funder-profile'],
    queryFn: fetchProfile,
  });

  const submitProfile = useMutation({
    mutationFn: async (payload: any) => {
      // TODO: Implement submit profile API endpoint
      console.log('Submit profile:', payload);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funder-profile'] });
      toast({
        title: 'Profile submitted',
        description: 'Your verification is now under review',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    isLoading,
    submitProfile: submitProfile.mutate,
    isSubmitting: submitProfile.isPending,
  };
}

export function useFunderCase(caseId: string | null) {
  return useQuery({
    queryKey: ['funder-case', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      // TODO: Implement case retrieval API endpoint
      console.log('Fetch case:', caseId);
      return { success: true };
    },
    enabled: !!caseId,
  });
}

export function useFunderDecision() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, decision, notes }: any) => {
      // TODO: Implement decision API endpoint
      console.log('Record decision:', caseId, decision, notes);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funder-cases'] });
      toast({
        title: 'Decision recorded',
        description: 'The funder has been notified',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Decision failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRequestMoreInfo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, missing, message }: any) => {
      // TODO: Implement request more info API endpoint
      console.log('Request more info:', caseId, missing, message);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funder-cases'] });
      toast({
        title: 'Request sent',
        description: 'The funder will be notified',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}