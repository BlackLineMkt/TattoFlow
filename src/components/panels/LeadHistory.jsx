import { useLeadHistory } from '../../hooks/useLeadHistory'
import { STAGES } from '../../lib/supabase'

export default function LeadHistory({ leadId }) {
  const { data: history = [], isLoading } = useLeadHistory(leadId)

  if (isLoading) {
    return <div className="text-xs text-muted animate-pulse">Carregando...</div>
  }

  if (history.length === 0) {
    return <p className="text-xs text-dim">Sem movimentações ainda.</p>
  }

  return (
    <div className="space-y-2">
      {history.map(entry => {
        const fromStage = STAGES.find(s => s.id === entry.from_stage)
        const toStage = STAGES.find(s => s.id === entry.to_stage)
        return (
          <div key={entry.id} className="flex items-start gap-3 text-xs">
            <span className="text-dim flex-shrink-0 tabular-nums">
              {new Date(entry.changed_at).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
            <span className="text-muted">
              {entry.from_stage
                ? `${fromStage?.label ?? entry.from_stage} → ${toStage?.label ?? entry.to_stage}`
                : `Entrada: ${toStage?.label ?? entry.to_stage}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}
