import { useState, useEffect } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { STAGES, ORIGINS } from '../../lib/supabase'
import { formatPhone, buildWhatsAppUrl, getDaysSince } from '../../lib/helpers'
import { useMoveLeadStage, useDeleteLead } from '../../hooks/useLeads'
import LeadHistory from './LeadHistory'
import LeadNotes from './LeadNotes'
import Button from '../ui/Button'

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-dim text-xs w-16 flex-shrink-0">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  )
}

export default function LeadPanel({ lead, onClose }) {
  const [moveTarget, setMoveTarget] = useState(lead.stage)
  const { mutate: moveLead, isPending: isMoving } = useMoveLeadStage()
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead()

  useEffect(() => {
    setMoveTarget(lead.stage)
  }, [lead.id, lead.stage])

  function handleMove() {
    if (moveTarget === lead.stage) return
    moveLead({ lead, toStage: moveTarget })
  }

  function handleDelete() {
    if (!window.confirm(`Excluir o lead "${lead.name}"? Esta ação não pode ser desfeita.`)) return
    deleteLead(lead.id, { onSuccess: onClose })
  }

  const origin = ORIGINS.find(o => o.id === lead.origin)
  const stage = STAGES.find(s => s.id === lead.stage)
  const totalDays = getDaysSince(lead.created_at)

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="min-w-0 pr-2">
          <h3 className="font-bold text-text truncate">{lead.name}</h3>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm inline-block mt-1"
            style={{ background: `${stage?.color}22`, color: stage?.color }}
          >
            {stage?.label}
          </span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-text transition-colors flex-shrink-0 mt-0.5">
          <X size={18} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* WhatsApp CTA */}
        <a
          href={buildWhatsAppUrl(lead.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-gold text-black font-bold text-sm py-2.5 rounded-md hover:bg-gold/90 transition-all duration-200"
        >
          <MessageCircle size={16} />
          Abrir no WhatsApp
        </a>

        {/* Info block */}
        <div className="bg-surface border border-border rounded-md p-3 space-y-2">
          <InfoRow label="Origem" value={origin?.label ?? lead.origin} />
          <InfoRow
            label="Entrada"
            value={new Date(lead.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            })}
          />
          <InfoRow label="No funil" value={`${totalDays} dia${totalDays !== 1 ? 's' : ''}`} />
        </div>

        {/* Move stage */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold mb-2">
            Mover para etapa
          </p>
          <div className="flex gap-2">
            <select
              value={moveTarget}
              onChange={e => setMoveTarget(e.target.value)}
              className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-text text-sm focus:outline-none focus:border-gold transition-all"
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <Button
              onClick={handleMove}
              disabled={isMoving || moveTarget === lead.stage}
              size="sm"
              className="flex-shrink-0 py-2"
            >
              {isMoving ? '...' : 'Mover'}
            </Button>
          </div>
        </div>

        {/* Notes */}
        <LeadNotes lead={lead} />

        {/* History */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold mb-2">
            Histórico
          </p>
          <LeadHistory leadId={lead.id} />
        </div>
      </div>

      {/* Delete */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <Button variant="danger" onClick={handleDelete} disabled={isDeleting} className="w-full">
          {isDeleting ? 'Excluindo...' : 'Excluir lead'}
        </Button>
      </div>
    </div>
  )
}
