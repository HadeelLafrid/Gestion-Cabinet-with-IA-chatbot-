import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../../services/apiClient'

function getNumericId(patientId) {
  // Extract numeric ID from format "PT-4401" -> "4401"
  const match = patientId.match(/PT-(\d+)/)
  return match ? match[1] : patientId.replace('PT-', '')
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getColor(index) {
  const colors = [
    'bg-pink-200 text-pink-700',
    'bg-cyan-200 text-cyan-700',
    'bg-indigo-200 text-indigo-700',
    'bg-purple-200 text-purple-700',
    'bg-amber-200 text-amber-700',
    'bg-green-200 text-green-700',
  ]
  return colors[index % colors.length]
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ArchivePage() {
  const navigate     = useNavigate()
  const [query,      setQuery]      = useState('')
  const [searched,   setSearched]   = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [archive,    setArchive]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const hasSearched = searched && query.trim() !== ''

  const filteredPatients = hasSearched
    ? archive.filter(p =>
        p.patientName.toLowerCase().includes(query.toLowerCase()) ||
        p.patientId.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const totalConsultations = filteredPatients.reduce(
    (acc, p) => acc + p.consultations.length, 0
  )

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setSearched(true)
    
    try {
      // Fetch consultations with patient search
      const response = await apiClient.get('/consultations/', {
        params: { patient_search: query.trim() }
      })
      
      const consultations = response.data
      
      // Group consultations by patient
      // Backend returns: array of consultations with patient info
      const patientMap = new Map()
      
      consultations.forEach((consultation, index) => {
        const patient = consultation.patient
        if (!patient) return
        
        const patientKey = patient.id
        
        if (!patientMap.has(patientKey)) {
          patientMap.set(patientKey, {
            patientId: `PT-${patient.id}`,
            patientName: `${patient.first_name} ${patient.last_name}`,
            age: patient.age ? `${patient.age} ans` : '—',
            genre: patient.gender === 'M' || patient.gender === 'male' ? 'Homme' : patient.gender === 'F' || patient.gender === 'female' ? 'Femme' : '—',
            color: getColor(index),
            consultations: [],
          })
        }
        
        const patientData = patientMap.get(patientKey)
        patientData.consultations.push({
          id: consultation.id,
          date: formatDate(consultation.consultation_date),
          motif: consultation.motif || '—',
          diagnostic: consultation.diagnosis || '—',
        })
      })
      
      // Sort consultations by date (newest first)
      patientMap.forEach(patient => {
        patient.consultations.sort((a, b) => new Date(b.date) - new Date(a.date))
      })
      
      setArchive(Array.from(patientMap.values()))
    } catch (error) {
      console.error('Error fetching consultations:', error)
      setArchive([])
    } finally {
      setLoading(false)
    }
  }

  // Delete a single consultation
  const confirmDelete = async () => {
    if (!deleteTarget) return
    
    try {
      await apiClient.delete(`/consultations/${deleteTarget.id}`)
      
      setArchive(prev => prev.map(patient => {
        if (patient.patientId !== deleteTarget.patientId) return patient
        return {
          ...patient,
          consultations: patient.consultations.filter(c => c.id !== deleteTarget.id),
        }
      }))
    } catch (error) {
      console.error('Error deleting consultation:', error)
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Archive des Consultations</h1>
        <p className="text-sm text-gray-400 mt-1">
          Parcourez l'historique complet des consultations par patient.
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1.5 flex-1 max-w-xl">
            <label className="text-sm font-medium text-gray-600">
              Rechercher un patient
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSearched(false) }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Nom du patient ou ID..."
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setSearched(false) }}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Rechercher
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-300">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 13h6M9 17h4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Recherchez un patient pour voir son historique</p>
          <p className="text-gray-400 text-sm">Toutes les consultations archivées seront affichées</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="flex flex-col gap-4">

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Chargement des consultations...</p>
            </div>
          )}

          {/* Summary */}
          {!loading && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{filteredPatients.length}</span>{' '}
                patient{filteredPatients.length !== 1 ? 's' : ''} —{' '}
                <span className="font-semibold text-indigo-600">{totalConsultations}</span>{' '}
                consultation{totalConsultations !== 1 ? 's' : ''} archivée{totalConsultations !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* No results */}
          {filteredPatients.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <p className="text-sm text-gray-400">
                Aucun patient trouvé pour{' '}
                <span className="font-medium text-gray-600">"{query}"</span>
              </p>
            </div>
          )}

          {/* Patient cards */}
          {!loading && filteredPatients.map(patient => {
            const isExpanded = expandedId === patient.patientId

            return (
              <div
                key={patient.patientId}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Patient header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : patient.patientId)}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${patient.color}`}>
                    {getInitials(patient.patientName)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-base">{patient.patientName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {patient.patientId} · {patient.age} · {patient.genre}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">
                      {patient.consultations.length} consultation{patient.consultations.length > 1 ? 's' : ''}
                    </span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#9ca3af" strokeWidth="2"
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {/* Consultations table */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {patient.consultations.length === 0 ? (
                      <div className="py-10 flex flex-col items-center gap-2 text-gray-300">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p className="text-sm">Aucune consultation archivée</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">ID</th>
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Motif</th>
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Diagnostic</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patient.consultations.map(c => (
                            <tr
                              key={c.id}
                              className="border-t border-gray-50 hover:bg-indigo-50/20 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-indigo-500">
                                  #{c.id}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                {c.date}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {c.motif}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                                  {c.diagnostic}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1">

                                  {/* Rapport IA */}
                                  <button
                                    onClick={() => navigate(`/consultation/rapport/${c.id}`)}
                                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    Rapport
                                  </button>

                                  {/* Divider */}
                                  <span className="text-gray-200 select-none">|</span>

                                  {/* Edit */}
                                  <button
                                    onClick={() => navigate(`/consultation/${getNumericId(patient.patientId)}?edit=${c.id}`)}
                                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Modifier
                                  </button>

                                  {/* Divider */}
                                  <span className="text-gray-200 select-none">|</span>

                                  {/* Delete */}
                                  <button
                                    onClick={() => setDeleteTarget({ ...c, patientId: patient.patientId, patientName: patient.patientName })}
                                    className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                    </svg>
                                    Supprimer
                                  </button>

                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Patient footer */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Dernière consultation :{' '}
                        <span className="font-medium text-gray-600">
                          {patient.consultations[0]?.date || '—'}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/patients/${getNumericId(patient.patientId)}`)}
                          className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:bg-gray-100 text-xs font-medium px-3 py-2 rounded-full transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20a8 8 0 0116 0" />
                          </svg>
                          Dossier patient
                        </button>
                        <button
                          onClick={() => navigate(`/consultation/${getNumericId(patient.patientId)}`)}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-full transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Nouvelle consultation
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
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
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Supprimer la consultation ?
                </h3>
                <p className="text-sm text-gray-500">
                  Vous êtes sur le point de supprimer la consultation{' '}
                  <span className="font-semibold text-gray-700">#{deleteTarget.id}</span>{' '}
                  du{' '}
                  <span className="font-semibold text-gray-700">{deleteTarget.date}</span>{' '}
                  pour{' '}
                  <span className="font-semibold text-gray-700">{deleteTarget.patientName}</span>.
                  Cette action est irréversible.
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