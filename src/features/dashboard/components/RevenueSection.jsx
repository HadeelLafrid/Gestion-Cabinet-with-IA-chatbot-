import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

export default function RevenueSection() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-3 gap-4">

      {/* Big revenue card */}
      <div className="col-span-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl p-8 relative overflow-hidden">
        {/* Background watermark icon */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <svg width="160" height="160" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0.5">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </div>

        <p className="text-indigo-200 text-xs font-semibold tracking-widest uppercase mb-2">
          Chiffre d'affaires
        </p>
        <h2 className="text-white text-3xl font-bold mb-2">Recette Totale</h2>
        <p className="text-indigo-200 text-sm mb-6 max-w-xs">
          Suivi en temps réel de vos honoraires perçus ce mois-ci.
        </p>
        <p className="text-white text-4xl font-bold">
          24000 <span className="text-2xl">DA</span>
        </p>
      </div>

      {/* Two shortcut cards */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(ROUTES.APPOINTMENTS)}
          className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors"
        >
          <div className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center text-indigo-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <span className="text-sm text-gray-600 font-medium">Recherche d'un RDV</span>
        </button>

        <button
          onClick={() => navigate(ROUTES.PROFILE)}
          className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors"
        >
          <div className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center text-indigo-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20a8 8 0 0116 0" />
            </svg>
          </div>
          <span className="text-sm text-gray-600 font-medium">Mon profil</span>
        </button>
      </div>
    </div>
  )
}