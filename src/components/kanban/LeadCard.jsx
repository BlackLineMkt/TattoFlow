import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Phone, DollarSign } from 'lucide-react'
import { ORIGINS } from '../../lib/supabase'
import { formatPhone, getDaysSince, isLate } from '../../lib/helpers'

function daysLabel(n) {
  if (n === 0) return 'hoje'
  if (n === 1) return 'há 1 dia'
  return `há ${n} dias`
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function LeadCard({ lead, onClick }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: lead.id })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const origin = ORIGINS.find(o => o.id === lead.origin)
  const days = getDaysSince(lead.updated_at)
  const late = isLate(lead.updated_at)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-surface border rounded-md p-3 select-none transition-all duration-200
        ${isDragging ? 'opacity-40 scale-105' : 'cursor-pointer hover:border-muted/50'}
        ${late ? 'border-red-600' : 'border-border'}`}
      onClick={!isDragging ? onClick : undefined}
      {...attributes}
      {...listeners}
    >
      <p className="font-bold text-text text-sm leading-tight mb-2">{lead.name}</p>

      <div className="flex items-center gap-1.5 text-muted text-xs mb-2">
        <Phone size={11} />
        <span>{formatPhone(lead.phone)}</span>
      </div>

      {lead.deal_value != null && (
        <div className="flex items-center gap-1.5 text-xs mb-2 text-emerald-400 font-semibold">
          <DollarSign size={11} />
          <span>{formatCurrency(lead.deal_value)}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          {origin?.label ?? lead.origin}
        </span>
        <span className={`text-[10px] font-medium ${late ? 'text-red-400' : 'text-dim'}`}>
          {late ? `⚠ ${daysLabel(days)}` : daysLabel(days)}
        </span>
      </div>
    </div>
  )
}
