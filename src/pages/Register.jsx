import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Footer from '../components/layout/Footer'

export default function Register() {
  const [studioName, setStudioName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
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
          <h1 className="text-4xl font-bold text-text mb-4">
            Tattoo<span className="text-gold">Flow</span>
          </h1>
          <p className="text-text font-medium">Conta criada com sucesso!</p>
          <p className="text-muted text-sm mt-2">
            Verifique seu email e depois{' '}
            <Link to="/login" className="text-gold hover:underline">faça login</Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text">
            Tattoo<span className="text-gold">Flow</span>
          </h1>
          <p className="text-muted text-sm mt-2">CRM para estúdios de tatuagem</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do Estúdio"
              type="text"
              value={studioName}
              onChange={e => setStudioName(e.target.value)}
              required
              placeholder="Ex: Dark Art Tattoo"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repita a senha"
            />

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </div>

        <p className="text-muted text-sm text-center mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-gold hover:underline">Entrar</Link>
        </p>

        <Footer />
      </div>
    </div>
  )
}
