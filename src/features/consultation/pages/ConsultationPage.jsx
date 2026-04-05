import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MOCK_PATIENTS = [
  { id: 'PT-4401', name: 'Hadil Lafrid',  age: '42 ans', genre: 'Femme', color: 'bg-pink-200 text-pink-700'   },
  { id: 'PT-4402', name: 'Jean Dupont',     age: '31 ans', genre: 'Homme', color: 'bg-cyan-200 text-cyan-700'   },
  { id: 'PT-4403', name: 'Robert Martin',   age: '68 ans', genre: 'Homme', color: 'bg-indigo-200 text-indigo-700'},
  { id: 'PT-4404', name: 'Alice Dubois',    age: '25 ans', genre: 'Femme', color: 'bg-purple-200 text-purple-700'},
  { id: 'PT-4405', name: 'Sophie Girard',   age: '54 ans', genre: 'Femme', color: 'bg-amber-200 text-amber-700' },
  { id: 'PT-4406', name: 'Pierre Bernard',  age: '47 ans', genre: 'Homme', color: 'bg-green-200 text-green-700' },
  { id: 'PT-4407', name: 'Karim Benali',    age: '38 ans', genre: 'Homme', color: 'bg-teal-200 text-teal-700'   },
]

const MOCK_CONSULTATIONS = [
  { id: 'EH-9281', date: '2025-10-24', patient: 'Jean Dupont',    type: 'ROUTINE',  doctor: 'Dr. Marc Leroy',   color: 'bg-cyan-200 text-cyan-700'    },
  { id: 'EH-9150', date: '2023-10-22', patient: 'Sophie Martin',  type: 'URGENCE',  doctor: 'Dr. Marc Leroy',   color: 'bg-pink-200 text-pink-700'    },
  { id: 'EH-8992', date: '2023-10-19', patient: 'Robert Bernard', type: 'SUIVI',    doctor: 'Dr. Marc Leroy',   color: 'bg-indigo-200 text-indigo-700' },
  { id: 'EH-8821', date: '2023-10-15', patient: 'Alice Dubois',   type: 'ROUTINE',  doctor: 'Dr. Elena Costa',  color: 'bg-purple-200 text-purple-700' },
  { id: 'EH-8700', date: '2023-10-24', patient: 'Pierre Bernard', type: 'SUIVI',    doctor: 'Dr. Elena Costa',  color: 'bg-green-200 text-green-700'  },
]

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function typeStyle(type) {
  switch (type) {
    case 'URGENCE': return 'bg-red-100 text-red-500 border border-red-200'
    case 'SUIVI':   return 'bg-blue-100 text-blue-500 border border-blue-200'
    default:        return 'bg-gray-100 text-gray-500 border border-gray-200'
  }
}

export default function ConsultationSearch() {
  const navigate  = useNavigate()
  const [query,   setQuery]   = useState('')
  const [date,    setDate]    = useState('')
  const [searched, setSearched] = useState(false)

  const isDateSearch = date !== ''
  const isNameSearch = query.trim() !== ''
  const hasSearched  = searched && (isNameSearch || isDateSearch)

  const filteredPatients = isNameSearch
    ? MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : []

  const filteredConsultations = isDateSearch
    ? MOCK_CONSULTATIONS.filter(c => c.date === date)
    : []

  const handleSearch = () => setSearched(true)

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
                placeholder="Nom, ID ou Spécialité..."
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
              onClick={() => { setQuery(''); setDate(''); setSearched(false) }}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!hasSearched && (
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

      {/* Results — patient name search */}
      {hasSearched && isNameSearch && !isDateSearch && (
  <div className="flex flex-col gap-3">
    <p className="text-sm text-gray-400">
      {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} trouvé{filteredPatients.length !== 1 ? 's' : ''} pour{' '}
      <span className="text-indigo-600 font-medium">"{query}"</span>
    </p>

    {filteredPatients.length === 0 ? (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" />
        </svg>
        <p className="text-sm text-gray-400">Aucun patient trouvé</p>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {filteredPatients.map(p => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${p.color}`}>
              {getInitials(p.name)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-400">{p.id} · {p.age} · {p.genre}</p>
            </div>

            {/* Last consultation info if exists */}
            {p.lastConsult && (
              <div className="text-right mr-4">
                <p className="text-xs text-gray-400">Dernière consultation</p>
                <p className="text-xs font-medium text-gray-600">{p.lastConsult}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* View report button */}
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

              {/* Start consultation — big + button */}
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
      {hasSearched && isDateSearch && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-bold text-indigo-600">Résultats de recherche</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-wide">
              {filteredConsultations.length} consultations trouvées
            </span>
          </div>

          {filteredConsultations.length === 0 ? (
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
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Docteur</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.map(c => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-indigo-500 cursor-pointer hover:underline">
                        #{c.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(c.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${c.color}`}>
                          {getInitials(c.patient)}
                        </div>
                        <span className="text-sm text-gray-700">{c.patient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${typeStyle(c.type)}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.doctor}</td>
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