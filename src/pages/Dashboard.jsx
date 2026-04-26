import { useState } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import KanbanBoard from '../components/kanban/KanbanBoard'
import LeadTable from '../components/list/LeadTable'
import LeadPanel from '../components/panels/LeadPanel'
import NewLeadModal from '../components/modals/NewLeadModal'
import { useLeads } from '../hooks/useLeads'

function SkeletonCard() {
  return (
    <div className="rounded-md overflow-hidden animate-pulse">
      <div className="h-16 bg-surface" />
      <div className="h-8 bg-card border-t border-border" />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[280px]">
          <div className="h-10 bg-surface/50 rounded-t-md animate-pulse border border-border" />
          <div className="bg-card rounded-b-md p-2 space-y-2 min-h-[120px] border border-t-0 border-border">
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

  return (
    <div className="flex flex-col h-screen bg-bg text-text font-sans overflow-hidden">
      <Header
        view={view}
        onViewChange={setView}
        onNewLead={() => setShowModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : view === 'kanban' ? (
            <KanbanBoard leads={leads} onCardClick={l => setSelectedLeadId(l.id)} />
          ) : (
            <LeadTable leads={leads} onRowClick={l => setSelectedLeadId(l.id)} />
          )}
        </div>

        {selectedLead && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setSelectedLeadId(null)}
            />
            <div className="w-80 flex-shrink-0 border-l border-border overflow-hidden z-20 relative">
              <LeadPanel
                key={selectedLead.id}
                lead={selectedLead}
                onClose={() => setSelectedLeadId(null)}
              />
            </div>
          </>
        )}
      </div>

      <Footer compact />

      {showModal && <NewLeadModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
