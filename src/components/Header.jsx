import { supabase } from '../lib/supabase'
import { useProfile } from '../hooks/useProfile'

export default function Header({ view, onViewChange }) {
  const { data: profile } = useProfile()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-surface border-b border-elevated flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-accent text-lg tracking-tight">TattooFlow</span>
        {profile?.studio_name && (
          <span className="text-muted text-sm truncate hidden sm:inline">
            · {profile.studio_name}
          </span>
        )}
      </div>

      <div className="mx-auto flex gap-1 bg-elevated rounded-lg p-1">
        <button
          onClick={() => onViewChange('kanban')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'kanban' ? 'bg-accent text-white' : 'text-muted hover:text-primary'
          }`}
        >
          Kanban
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'list' ? 'bg-accent text-white' : 'text-muted hover:text-primary'
          }`}
        >
          Lista
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="text-muted hover:text-primary text-sm transition-colors"
      >
        Sair
      </button>
    </header>
  )
}
