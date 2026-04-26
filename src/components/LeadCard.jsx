import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { STAGES, ORIGINS } from '../lib/supabase'
import { formatPhone, getDaysSince, isLate } from '../lib/utils'

export default function LeadCard({ lead, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const stage = STAGES.find(s => s.id === lead.stage)
  const origin = ORIGINS.find(o => o.id === lead.origin)
  const days = getDaysSince(lead.updated_at)
  const late = isLate(lead.updated_at)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg overflow-hidden select-none transition-all ${
        isDragging ? 'opacity-40 shadow-2xl scale-105' : 'hover:brightness-110 cursor-pointer'
      } ${late ? 'outline outline-2 outline-red-500' : ''}`}
      onClick={!isDragging ? onClick : undefined}
      {...attributes}
      {...listeners}
    >
      {/* Colored header */}
      <div
        className="px-3 py-2"
        style={{ background: stage ? `${stage.color}28` : '#27272a' }}
      >
        <div
          className="text-xs font-bold uppercase tracking-wider mb-1"
          style={{ color: stage?.color ?? '#fff' }}
        >
          {stage?.label}
        </div>
        <div className="text-sm font-semibold text-primary leading-tight">{lead.name}</div>
        <div className="text-xs text-muted mt-0.5">📱 {formatPhone(lead.phone)}</div>
      </div>

      {/* Body */}
      <div className="bg-surface px-3 py-2 flex items-center justify-between border-t border-elevated/50">
        <span className="text-xs text-muted">
          {origin?.icon} {origin?.label}
        </span>
        <span className={`text-xs font-medium ${late ? 'text-red-400' : 'text-muted'}`}>
          {late ? `⚠️ ${days}d` : `${days}d`}
        </span>
      </div>
    </div>
  )
}
