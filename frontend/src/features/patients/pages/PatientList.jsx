import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

const avatarColors = [
  'bg-cyan-200 text-cyan-700',
  'bg-indigo-200 text-indigo-700',
  'bg-pink-200 text-pink-700',
  'bg-purple-200 text-purple-700',
  'bg-green-200 text-green-700',
  'bg-amber-200 text-amber-700',
]

function getInitials(first, last) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}
function getAvatarColor(name) {
  return avatarColors[(name ?? '').charCodeAt(0) % avatarColors.length]
}

export default function PatientList() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  const hasSearched = query.trim().length > 0

  // ← SINGLE useEffect, no duplicate
  useEffect(() => {
    if (!query.trim()) {
      setPatients([])
      return
    }
    fetch(`http://localhost:8001/api/v1/patients/?search=${query}`)
      .then(res => res.json())
      .then(data => setPatients(data.data ?? []))
  }, [query])

  const confirmDelete = () => {
    setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Liste des Patients</h1>
        <p className="text-sm text-gray-400 mt-1">
          Gérez votre base de patients et leurs dossiers médicaux.
        </p>
      </div>

      {/* Search bar + add button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 flex-1 max-w-2xl shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un patient par nom..."
            className="flex-1 text-sm text-gray-600 placeholder-gray-300 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => navigate(ROUTES.ADD_PATIENT)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouveau patient
        </button>
      </div>

      {/* Empty state — before search */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-300">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium text-base">Recherchez un patient pour afficher les résultats</p>
          <p className="text-gray-400 text-sm">Tapez un nom dans la barre de recherche</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <>
          <p className="text-sm text-gray-400 -mt-2">
            {patients.length} résultat{patients.length !== 1 ? 's' : ''} pour{' '}
            <span className="text-indigo-600 font-medium">"{query}"</span>
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">ID</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Nom & Prénom</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Sexe</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Âge</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Téléphone</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                          <circle cx="11" cy="11" r="8" />
                          <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <p className="text-sm text-gray-400">
                          Aucun patient trouvé pour{' '}
                          <span className="font-medium text-gray-500">"{query}"</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{p.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* ← fixed: uses first_name + last_name */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(p.first_name)}`}>
                            {getInitials(p.first_name, p.last_name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {p.first_name} {p.last_name}
                            </p>
                            <p className="text-xs text-gray-400">{p.phone ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {/* ← fixed: uses gender instead of sexe */}
                        <span className={`text-xs font-semibold px-4 py-1.5 rounded-full
                          ${p.gender === 'female' ? 'bg-pink-100 text-pink-500' : 'bg-cyan-100 text-cyan-600'}`}>
                          {p.gender === 'female' ? 'Femme' : 'Homme'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.age ? `${p.age} ans` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.phone ?? '—'}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/patients/${p.id}`)}
                            className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-500 flex items-center justify-center transition-colors"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {patients.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-50">
                <p className="text-xs text-gray-400">
                  Affichage de {patients.length} patients
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-400">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Supprimer le dossier ?</h3>
                <p className="text-sm text-gray-500">
                  Vous êtes sur le point de supprimer le dossier de{' '}
                  <span className="font-semibold text-gray-700">
                    {deleteTarget.first_name} {deleteTarget.last_name}
                  </span>. Cette action est irréversible.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}