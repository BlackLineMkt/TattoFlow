import { useState } from 'react'
import { ORIGINS } from '../lib/supabase'
import { cleanPhone, formatPhone } from '../lib/utils'
import { useCreateLead } from '../hooks/useLeads'

export default function LeadModal({ onClose }) {
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [origin, setOrigin] = useState('anuncio')
  const { mutate: createLead, isPending } = useCreateLead()

  function handlePhoneChange(e) {
    const digits = cleanPhone(e.target.value).slice(0, 11)
    setPhoneDigits(digits)
  }

  function handleSubmit(e) {
    e.preventDefault()
    createLead(
      { name: name.trim(), phone: phoneDigits, origin },
      { onSuccess: onClose }
    )
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-elevated">
          <h2 className="text-base font-semibold text-primary">Novo Lead</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-bg border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              WhatsApp *
            </label>
            <input
              type="tel"
              value={formatPhone(phoneDigits)}
              onChange={handlePhoneChange}
              required
              className="w-full bg-bg border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Origem *
            </label>
            <select
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="w-full bg-bg border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            >
              {ORIGINS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.icon} {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-elevated text-muted text-sm hover:text-primary hover:border-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim() || phoneDigits.length < 10}
              className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Salvando...' : 'Salvar lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
