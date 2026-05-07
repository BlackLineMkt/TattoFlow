import { useState, useMemo } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import KanbanBoard from '../components/kanban/KanbanBoard'
import LeadTable from '../components/list/LeadTable'
import LeadPanel from '../components/panels/LeadPanel'
import LeadFilters from '../components/list/LeadFilters'
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

function getStartOf(period) {
  const now = new Date()
  if (period === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(now.setDate(diff))
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  if (period === 'last_month') {
    return new Date(now.getFullYear(), now.getMonth() - 1, 1)
  }
  return null
}

function getEndOf(period) {
  const now = new Date()
  if (period === 'last_month') {
    return new Date(now.getFullYear(), now.getMonth(), 0)
  }
  return null
}

export default function Dashboard() {
  const [view, setView] = useState('kanban')
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState([])
  const [originFilter, setOriginFilter] = useState([])
  const [periodFilter, setPeriodFilter] = useState('all')

  const { data: leads = [], isLoading } = useLeads()
  const selectedLead = leads.find(l => l.id === selectedLeadId) ?? null

  const filteredLeads = useMemo(() => {
    let result = leads

    if (search.trim()) {
      result = result.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (stageFilter.length > 0) {
      result = result.filter(l => stageFilter.includes(l.stage))
    }

    if (originFilter.length > 0) {
      result = result.filter(l => originFilter.includes(l.origin))
    }

    if (periodFilter !== 'all') {
      const start = getStartOf(periodFilter)
      const end = getEndOf(periodFilter)
      result = result.filter(l => {
        const date = new Date(l.created_at)
        if (start && date < start) return false
        if (end && date > end) return false
        return true
      })
    }

    return result
  }, [leads, search, stageFilter, originFilter, periodFilter])

  const hasActiveFilters = search || stageFilter.length > 0 || originFilter.length > 0 || periodFilter !== 'all'

  return (
    <div className="flex flex-col h-screen bg-bg text-text font-sans overflow-hidden">
      <Header
        view={view}
        onViewChange={setView}
        onNewLead={() => setShowModal(true)}
        onToggleFilters={() => setShowFilters(v => !v)}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4 space-y-4">

          {showFilters && (
            <LeadFilters
              search={search} setSearch={setSearch}
              stageFilter={stageFilter} setStageFilter={setStageFilter}
              originFilter={originFilter} setOriginFilter={setOriginFilter}
              periodFilter={periodFilter} setPeriodFilter={setPeriodFilter}
            />
          )}

          {isLoading ? (
            <LoadingSkeleton />
          ) : view === 'kanban' ? (
            <KanbanBoard leads={filteredLeads} onCardClick={l => setSelectedLeadId(l.id)} />
          ) : (
            <LeadTable leads={filteredLeads} onRowClick={l => setSelectedLeadId(l.id)} />
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
