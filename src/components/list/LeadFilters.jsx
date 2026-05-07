import { STAGES, ORIGINS } from '../../lib/supabase'

const PERIODS = [
  { id: 'all', label: 'Todos' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mês' },
  { id: 'last_month', label: 'Mês anterior' },
]

export default function LeadFilters({
  stageFilter, setStageFilter,
  originFilter, setOriginFilter,
  search, setSearch,
  periodFilter, setPeriodFilter,
}) {
  function togglePill(arr, setArr, value) {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  return (
    <div className="bg-card border border-border rounded-md p-4 space-y-3">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nome..."
        className="w-full bg-surface border border-border rounded-md px-3 py-2 text-text text-sm focus:outline-none focus:border-gold transition-all placeholder:text-dim"
      />

      {/* Filtro de período */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold mb-2">Período</p>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id)}
              className="text-xs px-3 py-1 rounded-full border transition-all duration-200"
              style={
                periodFilter === p.id
                  ? { background: '#C8A84B', color: '#000', borderColor: '#C8A84B' }
                  : { background: 'transparent', color: '#888888', borderColor: '#2A2A2A' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro de etapa */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold mb-2">Etapa</p>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map(s => (
            <button
              key={s.id}
              onClick={() => togglePill(stageFilter, setStageFilter, s.id)}
              className="text-xs px-3 py-1 rounded-full border transition-all duration-200"
              style={
                stageFilter.includes(s.id)
                  ? { background: s.color, color: '#fff', borderColor: s.color }
                  : { background: 'transparent', color: '#888888', borderColor: '#2A2A2A' }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro de origem */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold mb-2">Origem</p>
        <div className="flex flex-wrap gap-1.5">
          {ORIGINS.map(o => (
            <button
              key={o.id}
              onClick={() => togglePill(originFilter, setOriginFilter, o.id)}
              className="text-xs px-3 py-1 rounded-full border transition-all duration-200"
              style={
                originFilter.includes(o.id)
                  ? { background: '#C8A84B', color: '#000', borderColor: '#C8A84B' }
                  : { background: 'transparent', color: '#888888', borderColor: '#2A2A2A' }
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
