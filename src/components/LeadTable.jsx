import { useState } from 'react'
import { STAGES, ORIGINS } from '../lib/supabase'
import { formatPhone, getDaysSince } from '../lib/utils'

export default function LeadTable({ leads, onRowClick }) {
  const [stageFilter, setStageFilter] = useState([])
  const [originFilter, setOriginFilter] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  function togglePill(arr, setArr, value) {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const filtered = leads
    .filter(l => stageFilter.length === 0 || stageFilter.includes(l.stage))
    .filter(l => originFilter.length === 0 || originFilter.includes(l.origin))
    .filter(l => !dateFrom || new Date(l.created_at) >= new Date(dateFrom))
    .filter(l => !dateTo || new Date(l.created_at) <= new Date(`${dateTo}T23:59:59`))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'pt-BR') * dir
      if (sortBy === 'days') return (getDaysSince(a.created_at) - getDaysSince(b.created_at)) * dir
      if (sortBy === 'updated_at') return (new Date(a.updated_at) - new Date(b.updated_at)) * dir
      return (new Date(a.created_at) - new Date(b.created_at)) * dir
    })

  const sortIcon = col => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const columns = [
    { key: 'name',       label: 'Nome' },
    { key: 'phone',      label: 'WhatsApp',           sortable: false },
    { key: 'origin',     label: 'Origem',             sortable: false },
    { key: 'stage',      label: 'Etapa',              sortable: false },
    { key: 'days',       label: 'Dias no funil' },
    { key: 'updated_at', label: 'Última atualização' },
  ]

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Filters */}
      <div className="bg-surface rounded-xl p-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Etapa</p>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button
                key={s.id}
                onClick={() => togglePill(stageFilter, setStageFilter, s.id)}
                className="text-xs px-3 py-1 rounded-full border transition-colors"
                style={
                  stageFilter.includes(s.id)
                    ? { background: s.color, color: '#fff', borderColor: s.color }
                    : { background: 'transparent', color: '#8888a0', borderColor: '#272a35' }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Origem</p>
          <div className="flex flex-wrap gap-1.5">
            {ORIGINS.map(o => (
              <button
                key={o.id}
                onClick={() => togglePill(originFilter, setOriginFilter, o.id)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  originFilter.includes(o.id)
                    ? 'bg-accent text-white border-accent'
                    : 'text-muted border-elevated hover:text-primary'
                }`}
              >
                {o.icon} {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Período de entrada
          </p>
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-bg border border-elevated rounded-lg px-3 py-1.5 text-primary text-xs focus:outline-none focus:border-accent transition-colors"
            />
            <span className="text-muted text-xs">até</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-bg border border-elevated rounded-lg px-3 py-1.5 text-primary text-xs focus:outline-none focus:border-accent transition-colors"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo('') }}
                className="text-xs text-muted hover:text-primary"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted px-1">
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="bg-surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-elevated">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                    className={`text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap select-none ${
                      col.sortable !== false ? 'cursor-pointer hover:text-primary' : ''
                    }`}
                  >
                    {col.label}{col.sortable !== false ? sortIcon(col.key) : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const stage = STAGES.find(s => s.id === lead.stage)
                const origin = ORIGINS.find(o => o.id === lead.origin)
                const days = getDaysSince(lead.created_at)
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onRowClick(lead)}
                    className="border-b border-elevated/40 hover:bg-elevated cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatPhone(lead.phone)}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{origin?.icon} {origin?.label}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${stage?.color}20`, color: stage?.color }}
                      >
                        {stage?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{days}d</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {new Date(lead.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted text-sm">
              Nenhum lead com os filtros aplicados.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
