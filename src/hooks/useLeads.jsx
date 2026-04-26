import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase, STAGES } from '../lib/supabase'
import { buildWhatsAppUrl } from '../lib/utils'

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, phone, origin }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const { data, error } = await supabase
        .from('leads')
        .insert({ name, phone, origin, stage: 'novo', studio_id: session.user.id })
        .select()
        .single()
      if (error) throw error
      await supabase.from('lead_history').insert({
        lead_id: data.id,
        from_stage: null,
        to_stage: 'novo',
      })
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      const url = buildWhatsAppUrl(data.phone)
      toast.success(
        <span>
          Lead criado!{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline', fontWeight: 600 }}
          >
            Abrir WhatsApp →
          </a>
        </span>
      )
    },
    onError: () => toast.error('Erro ao criar lead'),
  })
}

export function useMoveLeadStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ lead, toStage }) => {
      const { error } = await supabase
        .from('leads')
        .update({ stage: toStage })
        .eq('id', lead.id)
      if (error) throw error
      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        from_stage: lead.stage,
        to_stage: toStage,
      })
    },
    onSuccess: (_data, { toStage }) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      const stage = STAGES.find(s => s.id === toStage)
      toast.success(`Movido para ${stage?.label ?? toStage}`)
    },
    onError: () => toast.error('Erro ao mover lead'),
  })
}

export function useUpdateNotes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, notes }) => {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', leadId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Salvo ✓', { duration: 1500 })
    },
    onError: () => toast.error('Erro ao salvar anotação'),
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (leadId) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead excluído')
    },
    onError: () => toast.error('Erro ao excluir lead'),
  })
}
