import { useState } from 'react'
import { X } from 'lucide-react'
import { ORIGINS } from '../../lib/supabase'
import { cleanPhone, formatPhone } from '../../lib/helpers'
import { useCreateLead } from '../../hooks/useLeads'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function NewLeadModal({ onClose }) {
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
    createLead({ name: name.trim(), phone: phoneDigits, origin }, { onSuccess: onClose })
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface border border-border rounded-lg w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-text">Novo Lead</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nome completo *"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
            placeholder="Nome do cliente"
          />
          <Input
            label="WhatsApp *"
            type="tel"
            value={formatPhone(phoneDigits)}
            onChange={handlePhoneChange}
            required
            placeholder="(11) 99999-9999"
          />
          <Select
            label="Origem *"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
          >
            {ORIGINS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </Select>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim() || phoneDigits.length < 10}
              className="flex-1"
            >
              {isPending ? 'Cadastrando...' : 'Cadastrar Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
