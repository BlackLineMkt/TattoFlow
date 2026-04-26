import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const STAGES = [
  { id: 'novo',      label: '🟣 Novo Lead',        color: '#7c3aed' },
  { id: 'contato',   label: '🔵 Contato Feito',     color: '#3b82f6' },
  { id: 'orcamento', label: '🟡 Orçamento Enviado', color: '#eab308' },
  { id: 'agendado',  label: '🟠 Agendado',          color: '#f97316' },
  { id: 'fechado',   label: '🟢 Fechado',           color: '#22c55e' },
  { id: 'perdido',   label: '🔴 Perdido',           color: '#ef4444' },
]

export const ORIGINS = [
  { id: 'anuncio',   label: 'Anúncio',      icon: '📢' },
  { id: 'lp',        label: 'Landing Page', icon: '🔗' },
  { id: 'organico',  label: 'Orgânico',     icon: '🌱' },
  { id: 'indicacao', label: 'Indicação',    icon: '👥' },
]
