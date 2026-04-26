import { useState } from 'react'
import Header from '../components/Header'
import KanbanBoard from '../components/KanbanBoard'
import LeadTable from '../components/LeadTable'
import LeadPanel from '../components/LeadPanel'
import LeadModal from '../components/LeadModal'
import { useLeads } from '../hooks/useLeads'

function SkeletonCard() {
  return (
    <div className="rounded-lg overflow-hidden animate-pulse">
      <div className="h-14 bg-elevated" />
      <div className="h-9 bg-surface border-t border-elevated/50" />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[280px] max-w-[280px]">
          <div className="h-10 bg-elevated rounded-t-lg animate-pulse" />
          <div className="bg-surface rounded-b-lg p-2 space-y-2 min-h-[120px]">
            {i < 3 && <SkeletonCard />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [view, setView] = useState('kanban')
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { data: leads = [], isLoading } = useLeads()

  const selectedLead = leads.find(l => l.id === selectedLeadId) ?? null

  function handleCardClick(lead) {
    setSelectedLeadId(lead.id)
  }

  function handlePanelClose() {
    setSelectedLeadId(null)
  }

  return (
    <div className="flex flex-col h-screen bg-bg text-primary font-sans overflow-hidden">
      <Header view={view} onViewChange={setView} />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : view === 'kanban' ? (
            <KanbanBoard leads={leads} onCardClick={handleCardClick} />
          ) : (
            <LeadTable leads={leads} onRowClick={handleCardClick} />
          )}
        </div>

        {/* Push side panel */}
        {selectedLead && (
          <div className="w-96 flex-shrink-0 border-l border-elevated overflow-hidden">
            <LeadPanel
              key={selectedLead.id}
              lead={selectedLead}
              onClose={handlePanelClose}
            />
          </div>
        )}
      </div>

      {/* FAB — "+ Novo Lead" */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white shadow-xl flex items-center justify-center text-3xl hover:bg-accent/90 active:scale-95 transition-all z-10"
        title="Novo Lead"
        aria-label="Novo Lead"
      >
        +
      </button>

      {showModal && <LeadModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
