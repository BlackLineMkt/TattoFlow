import { useState } from 'react'
import { Plus, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../hooks/useProfile'

export default function Header({ view, onViewChange, onNewLead }) {
  const { data: profile } = useProfile()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const initial = profile?.studio_name?.[0]?.toUpperCase() ?? '?'

  async function handleLogout() {
    setDropdownOpen(false)
    await supabase.auth.signOut()
  }

  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-card border-b border-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-text text-lg tracking-tight">
          Tattoo<span className="text-gold">Flow</span>
        </span>
        {profile?.studio_name && (
          <span className="text-muted text-sm truncate hidden sm:inline">
            · {profile.studio_name}
          </span>
        )}
      </div>

      {/* View toggle pill */}
      <div className="mx-auto flex gap-1 bg-surface border border-border rounded-md p-1">
        {[
          { key: 'kanban', label: 'Kanban' },
          { key: 'lista', label: 'Lista' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
              view === key ? 'bg-gold text-black font-bold' : 'text-muted hover:text-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewLead}
          className="flex items-center gap-1.5 bg-gold text-black font-bold text-sm px-4 py-2 rounded-md hover:bg-gold/90 transition-all duration-200"
        >
          <Plus size={16} strokeWidth={2.5} />
          Novo Lead
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-sm font-bold hover:bg-gold/30 transition-all"
          >
            {initial}
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-10 z-20 bg-surface border border-border rounded-lg shadow-2xl min-w-[140px] py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted hover:text-text hover:bg-card transition-colors"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
