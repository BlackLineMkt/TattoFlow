import { useState, useRef, useCallback, useEffect } from 'react'
import { useUpdateNotes } from '../../hooks/useLeads'

export default function LeadNotes({ lead }) {
  const [localNotes, setLocalNotes] = useState(lead.notes ?? '')
  const [saving, setSaving] = useState(false)
  const timerRef = useRef(null)
  const { mutate: updateNotes } = useUpdateNotes()

  useEffect(() => {
    setLocalNotes(lead.notes ?? '')
  }, [lead.id, lead.notes])

  const handleChange = useCallback((e) => {
    const value = e.target.value
    setLocalNotes(value)
    setSaving(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateNotes(
        { leadId: lead.id, notes: value },
        { onSuccess: () => setSaving(false), onError: () => setSaving(false) }
      )
    }, 1000)
  }, [lead.id, updateNotes])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
          Anotações
        </p>
        {saving && (
          <span className="text-[10px] text-muted animate-pulse">Salvando...</span>
        )}
      </div>
      <textarea
        value={localNotes}
        onChange={handleChange}
        rows={4}
        className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-text text-sm focus:outline-none focus:border-gold transition-all duration-200 resize-none placeholder:text-dim"
        placeholder="Adicione notas sobre este lead..."
      />
    </div>
  )
}
