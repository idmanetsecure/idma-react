import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useShowToast } from '../contexts/ToastContext'

export default function Login() {
  const [username, setUsername]     = useState('')
  const [password, setPassword]     = useState('')
  const [loading,  setLoading]      = useState(false)
  const [error,    setError]        = useState('')
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const showToast  = useShowToast()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) { setError('Email et mot de passe requis'); return }
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError('Identifiants incorrects')
      showToast('❌ Connexion échouée', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#0D2B5E] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">IN</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0D2B5E]">IDMA NetSecure</h1>
          <p className="text-sm text-gray-500 mt-1">Solutions courant faible & sécurité</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nom d'utilisateur ou email
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="massi ou massi@idma.dz"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20 focus:border-[#0D2B5E] transition-all"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20 focus:border-[#0D2B5E] transition-all"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-2.5 px-4 rounded-xl
                bg-[#0D2B5E] hover:bg-[#1E3A7A]
                text-white text-sm font-semibold
                transition-colors duration-150
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-sm hover:shadow-md
              "
            >
              {loading ? '⏳ Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          IDMA NetSecure · Tizi-Ouzou, Algérie
        </p>
      </div>
    </div>
  )
}
