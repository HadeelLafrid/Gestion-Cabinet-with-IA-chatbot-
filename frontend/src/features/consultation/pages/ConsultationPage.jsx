import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../../services/apiClient'

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const COLORS = [
  'bg-pink-200 text-pink-700', 'bg-cyan-200 text-cyan-700',
  'bg-indigo-200 text-indigo-700', 'bg-purple-200 text-purple-700',
  'bg-amber-200 text-amber-700', 'bg-green-200 text-green-700',
  'bg-teal-200 text-teal-700'
]
function getColor(id) {
  return COLORS[id % COLORS.length]
}

export default function ConsultationSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [searched, setSearched] = useState(false)
  const [patients, setPatients] = useState([])
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isDateSearch = date !== ''
  const isNameSearch = query.trim() !== ''
  const hasSearched = searched && (isNameSearch || isDateSearch)

  const handleSearch = async () => {
    setSearched(true)
    setLoading(true)
    setError('')
    setPatients([])
    setConsultations([])
    try {
      if (isNameSearch && !isDateSearch) {
        // search patients by name
        const response = await apiClient.get('/api/v1/patients', { params: { search: query } })
        setPatients(response.data.data || [])
      } else if (isDateSearch) {
        // search consultations by date
        const response = await apiClient.get('/consultations/', { params: { date } })
        setConsultations(response.data.data || response.data || [])
      }
    } catch (err) {
      setError('Erreur lors de la recherche.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Nouvelle Consultation</h1>
        <p className="text-sm text-gray-400 mt-1">
          Recherchez un patient pour démarrer une consultation.
        </p>
      </div>

      {/* Search panel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-end gap-4">

          {/* Name search */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-gray-600">Patient</label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSearched(false) }}
                onKeyDown={handleKeyDown}
                placeholder="Nom du patient..."
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(''); setSearched(false) }} className="text-gray-300 hover:text-gray-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date search */}
          <div className="flex flex-col gap-1.5 w-48">
            <label className="text-sm font-medium text-gray-600">Date de consultation</label>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setSearched(false) }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            Rechercher
          </button>

          {/* Clear */}
          {(query || date) && (
            <button
              onClick={() => { setQuery(''); setDate(''); setSearched(false); setPatients([]); setConsultations([]) }}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!hasSearched && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-300">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Recherchez un patient pour démarrer</p>
          <p className="text-gray-400 text-sm">Ou filtrez par date pour voir les consultations du jour</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Recherche en cours...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Results — patient name search */}
      {hasSearched && isNameSearch && !isDateSearch && !loading && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-400">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} trouvé{patients.length !== 1 ? 's' : ''} pour{' '}
            <span className="text-indigo-600 font-medium">"{query}"</span>
          </p>

          {patients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" />
              </svg>
              <p className="text-sm text-gray-400">Aucun patient trouvé</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {patients.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getColor(p.id)}`}>
                    {getInitials(`${p.first_name} ${p.last_name}`)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-400">#{p.id} · {p.age} ans · {p.gender === 'M' || p.gender === 'male' ? 'Homme' : 'Femme'}</p>
                  </div>
                  {p.last_consult && (
                    <div className="text-right mr-4">
                      <p className="text-xs text-gray-400">Dernière consultation</p>
                      <p className="text-xs font-medium text-gray-600">{p.last_consult.date}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/consultation/rapport/${p.id}`)}
                      className="flex items-center gap-1.5 border border-indigo-200 text-indigo-500 hover:bg-indigo-50 text-xs font-medium px-4 py-2 rounded-full transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Rapport IA
                    </button>
                    <button
                      onClick={() => navigate(`/consultation/${p.id}`)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Nouvelle consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results — date search */}
      {hasSearched && isDateSearch && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-bold text-indigo-600">Résultats de recherche</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-wide">
              {consultations.length} consultations trouvées
            </span>
          </div>

          {consultations.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <p className="text-sm text-gray-400">Aucune consultation ce jour-là</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Patient</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Motif</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map(c => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-indigo-500">#{c.id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(c.consultation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {c.patient ? (
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getColor(c.patient.id)}`}>
                            {getInitials(`${c.patient.first_name} ${c.patient.last_name}`)}
                          </div>
                          <span className="text-sm text-gray-700">{c.patient.first_name} {c.patient.last_name}</span>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{c.motif || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/consultation/rapport/${c.id}`)}
                        className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 text-sm font-medium ml-auto"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                        </svg>
                        Voir Rapport IA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}