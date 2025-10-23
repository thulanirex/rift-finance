import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRiftScore(entityType: 'invoice' | 'organization', entityId: string | undefined) {
  return useQuery({
    queryKey: ['rift-score', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return null;
      
      const { data, error } = await supabase.functions.invoke('rift-score-get', {
        method: 'GET',
        body: null,
      });

      // Build URL manually for GET request
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rift-score-get?entity_type=${entityType}&entity_id=${entityId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch score');
      }

      return await response.json();
    },
    enabled: !!entityId,
  });
}

export async function calculateRiftScore(entityType: 'invoice' | 'organization', entityId: string) {
  const { data, error } = await supabase.functions.invoke('rift-score-calc', {
    body: { entity_type: entityType, entity_id: entityId },
  });

  if (error) throw error;
  return data;
}
