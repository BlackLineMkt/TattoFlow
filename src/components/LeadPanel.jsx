import { useState, useRef, useCallback, useEffect } from 'react'
import { STAGES, ORIGINS } from '../lib/supabase'
import { formatPhone, buildWhatsAppUrl, getDaysSince } from '../lib/utils'
import { useMoveLeadStage, useUpdateNotes, useDeleteLead } from '../hooks/useLeads'
import { useLeadHistory } from '../hooks/useLeadHistory'

export default function LeadPanel({ lead, onClose }) {
  const [localNotes, setLocalNotes] = useState(lead.notes ?? '')
  const [moveTarget, setMoveTarget] = useState(lead.stage)
  const timerRef = useRef(null)

  const { data: history = [] } = useLeadHistory(lead.id)
  const { mutate: moveLead, isPending: isMoving } = useMoveLeadStage()
  const { mutate: updateNotes } = useUpdateNotes()
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead()

  useEffect(() => {
    setLocalNotes(lead.notes ?? '')
    setMoveTarget(lead.stage)
  }, [lead.id, lead.notes, lead.stage])

  const handleNotesChange = useCallback(
    (e) => {
      const value = e.target.value
      setLocalNotes(value)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        updateNotes({ leadId: lead.id, notes: value })
      }, 1000)
    },
    [lead.id, updateNotes]
  )

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
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-elevated flex-shrink-0">
        <div className="min-w-0 pr-2">
          <h3 className="font-semibold text-primary truncate">{lead.name}</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
            style={{ background: `${stage?.color}20`, color: stage?.color }}
          >
            {stage?.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-primary text-2xl leading-none flex-shrink-0 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* WhatsApp */}
        <a
          href={buildWhatsAppUrl(lead.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-accent-light hover:text-accent transition-colors"
        >
          <span>📱</span>
          <span>{formatPhone(lead.phone)}</span>
          <span className="text-xs opacity-70">— Abrir WhatsApp →</span>
        </a>

        {/* Info block */}
        <div className="bg-elevated rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted text-xs w-16">Origem</span>
            <span className="text-primary">{origin?.icon} {origin?.label}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted text-xs w-16">Entrada</span>
            <span className="text-primary">
              {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted text-xs w-16">No funil</span>
            <span className="text-primary">{totalDays} dia{totalDays !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Move stage */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Mover para etapa
          </p>
          <div className="flex gap-2">
            <select
              value={moveTarget}
              onChange={e => setMoveTarget(e.target.value)}
              className="flex-1 bg-bg border border-elevated rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleMove}
              disabled={isMoving || moveTarget === lead.stage}
              className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              {isMoving ? '...' : 'Mover'}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Anotações
          </p>
          <textarea
            value={localNotes}
            onChange={handleNotesChange}
            rows={4}
            className="w-full bg-bg border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="Adicione notas sobre este lead..."
          />
        </div>

        {/* History */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Histórico
          </p>
          {history.length === 0 ? (
            <p className="text-xs text-muted/50">Sem movimentações ainda.</p>
          ) : (
            <div className="space-y-2">
              {history.map(entry => {
                const fromStage = STAGES.find(s => s.id === entry.from_stage)
                const toStage = STAGES.find(s => s.id === entry.to_stage)
                return (
                  <div key={entry.id} className="flex items-start gap-3 text-xs">
                    <span className="text-muted flex-shrink-0 mt-0.5 tabular-nums">
                      {new Date(entry.changed_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-primary">
                      {entry.from_stage
                        ? `${fromStage?.label ?? entry.from_stage} → ${toStage?.label ?? entry.to_stage}`
                        : `Entrada: ${toStage?.label ?? entry.to_stage}`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete */}
      <div className="p-4 border-t border-elevated flex-shrink-0">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full py-2 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        >
          {isDeleting ? 'Excluindo...' : 'Excluir lead'}
        </button>
      </div>
    </div>
  )
}
