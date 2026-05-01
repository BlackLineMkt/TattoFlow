import { useState } from 'react'
import { X } from 'lucide-react'
import { ORIGINS } from '../../lib/supabase'
import { cleanPhone, formatPhone } from '../../lib/helpers'
import { useCreateLead } from '../../hooks/useLeads'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

function parseWhatsApp(text) {
  const namePatterns = [
    /nome[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ ]+)/i,
    /meu nome[eé\s]+([A-Za-zÀ-ÖØ-öø-ÿ ]+)/i,
    /me chamo[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ ]+)/i,
    /sou (?:a|o|eu)?\s*([A-Za-zÀ-ÖØ-öø-ÿ]{2,}(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+)*)/i,
  ]

  let name = ''
  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match) {
      name = match[1].trim().replace(/[.,!?]+$/, '').trim()
      break
    }
  }

  const phoneMatch = text.match(/(?:\+?55\s?)?(\(?\d{2}\)?\s?\d{4,5}[\s-]?\d{4})/)
  let phone = ''
  if (phoneMatch) {
    phone = phoneMatch[0].replace(/\D/g, '')
    if (phone.startsWith('55') && phone.length === 13) {
      phone = phone.slice(2)
    }
  }

  return { name, phone }
}

export default function NewLeadModal({ onClose }) {
  const [tab, setTab] = useState('manual')
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [origin, setOrigin] = useState('anuncio')
  const [conversation, setConversation] = useState('')
  const [parseError, setParseError] = useState('')

  const { mutate: createLead, isPending } = useCreateLead()

  function handlePhoneChange(e) {
    const digits = cleanPhone(e.target.value).slice(0, 11)
    setPhoneDigits(digits)
  }

  function handleExtract() {
    setParseError('')
    const { name: extractedName, phone: extractedPhone } = parseWhatsApp(conversation)
    if (!extractedName && !extractedPhone) {
      setParseError('Não foi possível identificar nome ou telefone. Revise o texto e preencha manualmente.')
      return
    }
    if (extractedName) setName(extractedName)
    if (extractedPhone) setPhoneDigits(extractedPhone.slice(0, 11))
    setOrigin('whatsapp_meta')
    setTab('manual')
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

        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'manual'
                ? 'text-gold border-b-2 border-gold'
                : 'text-muted hover:text-text'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => { setTab('whatsapp'); setParseError('') }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'whatsapp'
                ? 'text-gold border-b-2 border-gold'
                : 'text-muted hover:text-text'
            }`}
          >
            Importar do WhatsApp
          </button>
        </div>

        {tab === 'whatsapp' && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted">
              Cole a conversa do WhatsApp abaixo. Vamos tentar extrair o nome e o telefone automaticamente.
            </p>
            <textarea
              className="w-full h-40 bg-background border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder={"Exemplo:\n12/04/2025, 14:32 - João Silva: Olá, meu nome é João Silva, meu telefone é (11) 99999-8888"}
              value={conversation}
              onChange={e => setConversation(e.target.value)}
              autoFocus
            />
            {parseError && (
              <p className="text-xs text-red-400">{parseError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleExtract}
                disabled={!conversation.trim()}
                className="flex-1"
              >
                Extrair Dados
              </Button>
            </div>
          </div>
        )}

        {tab === 'manual' && (
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
        )}
      </div>
    </div>
  )
}
