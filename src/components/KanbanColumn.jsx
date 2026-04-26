import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import LeadCard from './LeadCard'

export default function KanbanColumn({ stage, leads, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-lg border-b-2"
        style={{
          background: `${stage.color}14`,
          borderColor: stage.color,
        }}
      >
        <span className="text-sm font-semibold text-primary">{stage.label}</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${stage.color}22`, color: stage.color }}
        >
          {leads.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 p-2 rounded-b-lg min-h-[120px] transition-colors duration-150 ${
          isOver ? 'bg-elevated' : 'bg-surface'
        }`}
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onCardClick(lead)}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-6">
            <span className="text-xs text-muted/40">Arraste um lead aqui</span>
          </div>
        )}
      </div>
    </div>
  )
}
