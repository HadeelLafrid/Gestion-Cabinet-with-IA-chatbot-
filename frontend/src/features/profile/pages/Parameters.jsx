import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

const fontSizes = [
  { label: 'Small', value: 'sm', size: '14px' },
  { label: 'Normal', value: 'base', size: '16px' },
  { label: 'Large', value: 'lg', size: '18px' },
  { label: 'Extra Large', value: 'xl', size: '20px' },
]

export default function Parameters() {
  const navigate = useNavigate()
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('app-font-size') || 'base')

  useEffect(() => {
    const fontSizeMap = { sm: '14px', base: '16px', lg: '18px', xl: '20px' }
    document.documentElement.style.fontSize = fontSizeMap[fontSize]
    localStorage.setItem('app-font-size', fontSize)
  }, [fontSize])

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-screen transition-colors">
      <div className="flex items-center justify-between mb-6 p-8 pb-0">
        <h1 className="text-3xl font-black text-gray-900">Paramètres</h1>
        <button onClick={() => navigate(ROUTES.DASHBOARD)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm m-8 mt-6 transition-colors">
        {/* Display */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Affichage</h2>
              <p className="text-sm text-gray-500">Personnalisez l'apparence de l'application</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-3">Taille du texte</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {fontSizes.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setFontSize(font.value)}
                    className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      fontSize === font.value
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                    style={{ fontSize: font.size }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Taille actuelle: <span className="font-semibold text-gray-700">{fontSizes.find(f => f.value === fontSize)?.size}</span></p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-8 pb-8 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">Gérez vos préférences de notifications</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-700">Notifications patient</p>
                <p className="text-xs text-gray-500">Alertes pour nouveaux patients</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-700">Rappels de consultations</p>
                <p className="text-xs text-gray-500">Alertes pour consultations à venir</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-700">Email notifications</p>
                <p className="text-xs text-gray-500">Recevoir des emails importants</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Confidentialité & Sécurité</h2>
              <p className="text-sm text-gray-500">Contrôlez vos données personnelles</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700">Changer le mot de passe</p>
                <p className="text-xs text-gray-500">Mettez à jour votre mot de passe</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700">Sessions actives</p>
                <p className="text-xs text-gray-500">Gérez vos sessions connectées</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700">Données personnelles</p>
                <p className="text-xs text-gray-500">Téléchargez ou supprimez vos données</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 p-8 pt-0">
        <button onClick={() => navigate(ROUTES.DASHBOARD)} className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Retour</button>
      </div>
    </div>
  )
}
