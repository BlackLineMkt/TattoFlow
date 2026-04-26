import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import LeadCard from './LeadCard'
import { STAGES } from '../../lib/supabase'
import { useMoveLeadStage } from '../../hooks/useLeads'

export default function KanbanBoard({ leads, onCardClick }) {
  const [activeId, setActiveId] = useState(null)
  const { mutate: moveLead } = useMoveLeadStage()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const stageIds = STAGES.map(s => s.id)
  const leadsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(l => l.stage === stage.id)
    return acc
  }, {})
  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  function handleDragStart({ active }) { setActiveId(active.id) }

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return
    const lead = leads.find(l => l.id === active.id)
    if (!lead) return
    const targetStage = stageIds.includes(over.id)
      ? over.id
      : leads.find(l => l.id === over.id)?.stage
    if (!targetStage || lead.stage === targetStage) return
    moveLead({ lead, toStage: targetStage })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={leadsByStage[stage.id] ?? []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150 }}>
        {activeLead ? (
          <div className="rotate-1 opacity-95">
            <LeadCard lead={activeLead} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
