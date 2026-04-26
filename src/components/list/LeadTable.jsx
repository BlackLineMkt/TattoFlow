import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { STAGES, ORIGINS } from '../../lib/supabase'
import { formatPhone, getDaysSince } from '../../lib/helpers'
import LeadFilters from './LeadFilters'

function SortIcon({ active, dir }) {
  if (!active) return <ChevronsUpDown size={12} className="text-dim" />
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-gold" />
    : <ChevronDown size={12} className="text-gold" />
}

export default function LeadTable({ leads, onRowClick }) {
  const [stageFilter, setStageFilter] = useState([])
  const [originFilter, setOriginFilter] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const filtered = leads
    .filter(l => stageFilter.length === 0 || stageFilter.includes(l.stage))
    .filter(l => originFilter.length === 0 || originFilter.includes(l.origin))
    .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'pt-BR') * dir
      if (sortBy === 'days') return (getDaysSince(a.created_at) - getDaysSince(b.created_at)) * dir
      return (new Date(a.created_at) - new Date(b.created_at)) * dir
    })

  const columns = [
    { key: 'name',       label: 'Nome',         sortable: true },
    { key: 'phone',      label: 'WhatsApp',      sortable: false },
    { key: 'origin',     label: 'Origem',        sortable: false },
    { key: 'stage',      label: 'Etapa',         sortable: false },
    { key: 'days',       label: 'Dias no funil', sortable: true },
    { key: 'created_at', label: 'Entrada',       sortable: true },
  ]

  return (
    <div className="flex flex-col gap-4 pb-20">
      <LeadFilters
        stageFilter={stageFilter} setStageFilter={setStageFilter}
        originFilter={originFilter} setOriginFilter={setOriginFilter}
        search={search} setSearch={setSearch}
      />

      <p className="text-xs text-muted px-1">
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    className={`text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold whitespace-nowrap select-none bg-bg ${
                      col.sortable ? 'cursor-pointer hover:text-text' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon active={sortBy === col.key} dir={sortDir} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, idx) => {
                const stage = STAGES.find(s => s.id === lead.stage)
                const origin = ORIGINS.find(o => o.id === lead.origin)
                const days = getDaysSince(lead.created_at)
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onRowClick(lead)}
                    className={`border-b border-border/40 cursor-pointer hover:bg-surface transition-colors ${
                      idx % 2 === 0 ? 'bg-card' : 'bg-surface/30'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-text whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatPhone(lead.phone)}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{origin?.label}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm"
                        style={{ background: `${stage?.color}22`, color: stage?.color }}
                      >
                        {stage?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{days}d</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted text-sm">Nenhum lead encontrado.</p>
              <p className="text-dim text-xs mt-1">Tente ajustar os filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
