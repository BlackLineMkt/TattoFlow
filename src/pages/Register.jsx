import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [studioName, setStudioName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { studio_name: studioName } },
    })
    if (error) setError(error.message)
    else setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-accent mb-3">TattooFlow</h1>
          <p className="text-primary font-medium">Conta criada com sucesso!</p>
          <p className="text-muted text-sm mt-2">
            Verifique seu email para confirmar e depois{' '}
            <Link to="/login" className="text-accent-light hover:underline">
              faça login
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-accent">TattooFlow</h1>
          <p className="text-muted text-sm mt-1">Crie a conta do seu estúdio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Nome do Estúdio
            </label>
            <input
              type="text"
              value={studioName}
              onChange={e => setStudioName(e.target.value)}
              required
              className="w-full bg-surface border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="Ex: Dark Art Tattoo"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-surface border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-accent-light hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
