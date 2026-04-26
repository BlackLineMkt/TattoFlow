import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import LeadCard from './LeadCard'

export default function KanbanColumn({ stage, leads, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-t-md border transition-all duration-200 ${
          isOver ? 'border-gold' : 'border-border'
        }`}
        style={{ background: `${stage.color}14` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
          <span className="text-sm font-semibold text-text">{stage.label}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-sm"
          style={{ background: `${stage.color}22`, color: stage.color }}
        >
          {leads.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 p-2 rounded-b-md min-h-[120px] border border-t-0 transition-all duration-150 ${
          isOver ? 'bg-gold/5 border-gold' : 'bg-surface border-border'
        }`}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-6">
            <span className="text-xs text-dim">Arraste um lead aqui</span>
          </div>
        )}
      </div>
    </div>
  )
}
