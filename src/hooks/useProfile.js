import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single()

      if (!error) return data

      // PGRST116 = no rows → trigger on_auth_user_created may not exist or failed silently
      // Recover by creating the profile from the user's signup metadata
      if (error.code === 'PGRST116') {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw error

        const studioName = user.user_metadata?.studio_name ?? 'Meu Estúdio'
        const { data: created, error: upsertError } = await supabase
          .from('profiles')
          .upsert({ id: user.id, studio_name: studioName })
          .select()
          .single()
        if (upsertError) throw upsertError
        return created
      }

      throw error
    },
  })
}
