import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../hooks/useAuth'
import apiClient from '../../../services/apiClient'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.post('/auth/login', { username, password })
      const { access_token, user } = response.data
      login(user, access_token)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Nom d\'utilisateur ou mot de passe incorrect.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#eef0f8] flex flex-col items-center justify-center px-4">
      <p className="absolute top-6 right-8 text-sm text-gray-500">Portail Clinique</p>

      <div className="bg-white rounded-2xl shadow-sm w-full max-w-md px-10 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Connexion</h1>
        <p className="text-gray-500 text-sm mb-8">Bienvenue au Portail Clinique.</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Username — changed from email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
              Nom d'utilisateur
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="dr.benali"
                required
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
              />
            </div>
          </div>

          {/* Password — unchanged */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
              Mot de passe
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-indigo-600"
              />
              <span className="text-sm text-gray-500">Se souvenir de moi</span>
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : (
              <>
                Connexion
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Vous n'avez pas de compte ?{' '}
          <Link to={ROUTES.REGISTER} className="text-indigo-600 font-semibold hover:underline">
            Contactez l'administration
          </Link>
        </p>
      </div>
    </div>
  )
}