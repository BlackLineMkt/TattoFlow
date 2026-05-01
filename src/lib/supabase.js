import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const STAGES = [
  { id: 'novo',      label: 'Novo Lead',          color: '#7C3AED' },
  { id: 'contato',   label: 'Contato Feito',       color: '#2563EB' },
  { id: 'orcamento', label: 'Orçamento Enviado',   color: '#C8A84B' },
  { id: 'agendado',  label: 'Agendado',            color: '#EA580C' },
  { id: 'fechado',   label: 'Fechado',             color: '#059669' },
  { id: 'perdido',   label: 'Perdido',             color: '#DC2626' },
]

export const ORIGINS = [
  { id: 'anuncio',       label: 'Anúncio Meta' },
  { id: 'lp',            label: 'Landing Page' },
  { id: 'organico',      label: 'Orgânico' },
  { id: 'indicacao',     label: 'Indicação' },
  { id: 'whatsapp_meta', label: 'WhatsApp / Meta' },
]
