import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    professionalId: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-sm">

        {/* Left panel */}
        <div className="w-2/5 bg-gradient-to-br from-indigo-400 to-indigo-600 p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
             Bienvenu sur Med-IA, votre assistant clinique intelligent.
            </h2>
            <p className="text-indigo-100 text-sm leading-relaxed">
                Rejoignez la révolution de la gestion de cabinet médical avec notre plateforme intuitive et sécurisée.
            </p>
          </div>

          {/* Security badge
          <div className="bg-white/20 rounded-xl p-5 mt-10">
            <div className="flex items-center gap-2 mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-white text-xs font-bold tracking-widest uppercase">
                Confiance & Sécurité
              </span>
            </div>
            <p className="text-indigo-100 text-xs leading-relaxed">
              Conformité HIPAA et protection des données de santé au cœur de notre architecture.
            </p>
          </div> */}
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white px-10 py-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Inscription</h1>
          <p className="text-gray-400 text-sm mb-8">Commencez votre expérience Med-IA aujourd'hui.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* First + Last name */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  required
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Email Professionnel</label>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="dr.dupont@clinique.fr"
                  required
                  className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                />
              </div>
            </div>

            {/* Professional ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                ID Professionnel (RPPS/ADELI)
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M8 4v4M16 4v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
                </svg>
                <input
                  type="text"
                  name="professionalId"
                  value={form.professionalId}
                  onChange={handleChange}
                  placeholder="10001234567"
                  required
                  className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Mot de passe</label>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                  className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Minimum 12 caractères avec majuscules et chiffres.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 rounded-full transition-colors mt-1 disabled:opacity-60"
            >
              {loading ? 'Création...' : "Créer un compte"}
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-400">
              En cliquant sur "Créer un compte", vous acceptez nos{' '}
              <a href="#" className="text-indigo-600 hover:underline">Conditions d'Utilisation</a>
              {' '}et notre{' '}
              <a href="#" className="text-indigo-600 hover:underline">Politique de Confidentialité</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}