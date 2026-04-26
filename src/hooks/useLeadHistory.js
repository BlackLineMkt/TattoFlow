import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useLeadHistory(leadId) {
  return useQuery({
    queryKey: ['lead_history', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_history')
        .select('*')
        .eq('lead_id', leadId)
        .order('changed_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!leadId,
  })
}
