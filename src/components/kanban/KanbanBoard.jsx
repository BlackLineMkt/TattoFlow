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
  const [dealModal, setDealModal] = useState(null) // { lead, toStage }
  const [dealValue, setDealValue] = useState('')
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

    if (targetStage === 'fechado') {
      setDealModal({ lead, toStage: targetStage })
      setDealValue('')
    } else {
      moveLead({ lead, toStage: targetStage })
    }
  }

  function handleConfirmDeal() {
    if (!dealModal) return
    const value = dealValue ? parseFloat(dealValue.replace(',', '.')) : null
    moveLead({ lead: dealModal.lead, toStage: dealModal.toStage, dealValue: value })
    setDealModal(null)
    setDealValue('')
  }

  function handleSkipDeal() {
    if (!dealModal) return
    moveLead({ lead: dealModal.lead, toStage: dealModal.toStage })
    setDealModal(null)
    setDealValue('')
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 pb-4 h-full items-start w-full">
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

      {/* Modal de valor do fechamento */}
      {dealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-text text-lg mb-1">Lead fechado! 🎉</h3>
            <p className="text-muted text-sm mb-5">
              Qual foi o valor da sessão de <span className="text-text font-semibold">{dealModal.lead.name}</span>?
            </p>

            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">R$</span>
              <input
                type="number"
                placeholder="0,00"
                value={dealValue}
                onChange={e => setDealValue(e.target.value)}
                className="w-full bg-surface border border-border rounded-md pl-9 pr-4 py-2.5 text-text text-sm
                  focus:outline-none focus:border-gold transition-all"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleConfirmDeal()}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSkipDeal}
                className="flex-1 border border-border text-muted text-sm rounded-md py-2.5 hover:text-text
                  hover:border-muted transition-all"
              >
                Pular
              </button>
              <button
                onClick={handleConfirmDeal}
                className="flex-1 bg-gold text-black font-bold text-sm rounded-md py-2.5 hover:bg-gold/90
                  transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
