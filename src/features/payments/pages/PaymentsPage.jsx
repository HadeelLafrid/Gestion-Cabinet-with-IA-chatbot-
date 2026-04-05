import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MOCK_PAYMENTS = {
  '2024-10-12': {
    total: 4000,
    previousDay: 3570,
    consultations: 8,
    maxSlots: 10,
    payments: [
      { id: 'RX-8920', patient: 'lafrid hadil', initials: 'BM', color: 'bg-blue-200 text-blue-700',   address: 'Cité des Oliviers, Alger', datetime: '14/10/2023 • 09:15', montant: 500  },
      { id: 'RX-8921', patient: 'Lakhdar Karima',    initials: 'LK', color: 'bg-cyan-200 text-cyan-700',   address: 'Rue Didouche Mourad, Alger', datetime: '14/10/2023 • 10:00', montant: 500  },
      { id: 'RX-8922', patient: 'Amrani Sofiane',    initials: 'AS', color: 'bg-green-200 text-green-700', address: 'Hydra - Les Pins, Alger', datetime: '14/10/2023 • 10:45', montant: 500  },
      { id: 'RX-8923', patient: 'Hadj-Baba Meriem',  initials: 'HM', color: 'bg-pink-200 text-pink-700',   address: 'Bir Mourad Raïs, Alger', datetime: '14/10/2023 • 11:30', montant: 500  },
      { id: 'RX-8924', patient: 'Benaïssa Omar',     initials: 'BO', color: 'bg-amber-200 text-amber-700', address: 'El Biar, Alger', datetime: '14/10/2023 • 14:00', montant: 500  },
      { id: 'RX-8925', patient: 'Ferhat Nadia',      initials: 'FN', color: 'bg-purple-200 text-purple-700',address: 'Kouba, Alger', datetime: '14/10/2023 • 14:45', montant: 500  },
      { id: 'RX-8926', patient: 'Chikhi Riad',       initials: 'CR', color: 'bg-teal-200 text-teal-700',   address: 'Ben Aknoun, Alger', datetime: '14/10/2023 • 15:30', montant: 500  },
      { id: 'RX-8927', patient: 'Mebarki Assia',     initials: 'MA', color: 'bg-red-200 text-red-700',     address: 'Dély Ibrahim, Alger', datetime: '14/10/2023 • 16:15', montant: 500  },
    ],
  },
  '2023-10-13': {
    total: 3570,
    previousDay: 3200,
    consultations: 6,
    maxSlots: 10,
    payments: [
      { id: 'RX-8910', patient: 'Saïdi Mourad',   initials: 'SM', color: 'bg-indigo-200 text-indigo-700', address: 'Hussein Dey, Alger', datetime: '13/10/2023 • 09:00', montant: 600  },
      { id: 'RX-8911', patient: 'Yelles Faïza',   initials: 'YF', color: 'bg-pink-200 text-pink-700',    address: 'Bab Ezzouar, Alger', datetime: '13/10/2023 • 10:00', montant: 595  },
      { id: 'RX-8912', patient: 'Tlemçani Ali',   initials: 'TA', color: 'bg-green-200 text-green-700',  address: 'Saoula, Alger', datetime: '13/10/2023 • 11:00', montant: 595  },
      { id: 'RX-8913', patient: 'Kaci Lynda',     initials: 'KL', color: 'bg-cyan-200 text-cyan-700',    address: 'Cheraga, Alger', datetime: '13/10/2023 • 14:00', montant: 595  },
      { id: 'RX-8914', patient: 'Bouras Djamel',  initials: 'BD', color: 'bg-amber-200 text-amber-700',  address: 'Ouled Fayet, Alger', datetime: '13/10/2023 • 15:00', montant: 595  },
      { id: 'RX-8915', patient: 'Rezaïg Widad',   initials: 'RW', color: 'bg-purple-200 text-purple-700',address: 'Zeralda, Alger', datetime: '13/10/2023 • 16:00', montant: 590  },
    ],
  },
}

const ITEMS_PER_PAGE = 4

export default function PaymentsPage() {
  const navigate     = useNavigate()
  const [mode,       setMode]       = useState('jour')   // 'jour' | 'periode'
  const [date,       setDate]       = useState('')
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')
  const [searched,   setSearched]   = useState(false)
  const [page,       setPage]       = useState(1)

  const handleSearch = () => {
    if (mode === 'jour' && date) setSearched(true)
    if (mode === 'periode' && dateFrom && dateTo) setSearched(true)
    setPage(1)
  }

  const handleModify = () => {
    setSearched(false)
    setDate('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  // Get data for selected date
  const data = searched && mode === 'jour'
    ? MOCK_PAYMENTS[date] || null
    : null

  // For period mode — aggregate all days in range
  const periodData = searched && mode === 'periode'
    ? Object.entries(MOCK_PAYMENTS)
        .filter(([d]) => d >= dateFrom && d <= dateTo)
        .reduce((acc, [, val]) => {
          acc.total        += val.total
          acc.consultations += val.consultations
          acc.payments      = [...acc.payments, ...val.payments]
          return acc
        }, { total: 0, consultations: 0, payments: [] })
    : null

  const activeData = mode === 'jour' ? data : periodData

  const growth = data
    ? Math.round(((data.total - data.previousDay) / data.previousDay) * 100)
    : null

  // Pagination
  const allPayments  = activeData?.payments || []
  const totalPages   = Math.ceil(allPayments.length / ITEMS_PER_PAGE)
  const pagedPayments = allPayments.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Export PDF (print)
  const handleExport = () => window.print()

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col gap-6">

        {/* Search panel — shown before search */}
        {!searched && (
          <>
            {/* Centered title */}
            <div className="text-center py-6">
              <h1 className="text-4xl font-bold text-gray-800">Calcul de la recette</h1>
              <p className="text-gray-400 mt-2">Analysez vos honoraires avec précision et élégance.</p>
            </div>

            {/* Search card */}
            <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl border border-gray-100 p-8 flex flex-col gap-6">

              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Recherche</h2>
              </div>

              {/* Mode toggle */}
              <div className="bg-gray-100 rounded-2xl p-1 flex">
                {[
                  { value: 'jour',    label: 'Par jour'    },
                  { value: 'periode', label: 'Par période' },
                ].map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${mode === m.value
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Date inputs */}
              {mode === 'jour' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-600">Sélectionner une date</label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-gray-600">Date de début</label>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-gray-600">Date de fin</label>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              

              {/* Submit button */}
              <button
                onClick={handleSearch}
                disabled={mode === 'jour' ? !date : !dateFrom || !dateTo}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-base"
              >
                Valider la recherche
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Results page */}
        {searched && (
          <>
            {/* Results header */}
            <div className="no-print flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <span>Finance</span>
                  <span>›</span>
                  <span className="text-indigo-500 font-medium">
                    {mode === 'jour' ? 'Recette quotidienne' : 'Recette période'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Calcul de la recette</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {mode === 'jour'
                    ? <span className="capitalize">{formatDate(date)}</span>
                    : <span>{formatDate(dateFrom)} — {formatDate(dateTo)}</span>
                  }
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleModify}
                  className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2.5 rounded-full transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Modifier la date
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Exporter PDF
                </button>
              </div>
            </div>

            {/* No data state */}
            {!activeData || activeData.payments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-20 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Aucune recette trouvée pour cette période</p>
                <button
                  onClick={handleModify}
                  className="text-indigo-500 hover:underline text-sm font-medium"
                >
                  Modifier la recherche
                </button>
              </div>
            ) : (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">

                  {/* Total */}
                  <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 relative overflow-hidden">
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5">
                      <svg width="140" height="140" viewBox="0 0 24 24" fill="#6366f1" stroke="none">
                        <rect x="2" y="6" width="20" height="14" rx="2" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Total de la recette
                    </p>
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-bold text-gray-800">
                        {activeData.total.toLocaleString('fr-FR')}
                        <span className="text-2xl ml-2 text-gray-500">DA</span>
                      </p>
                      {growth !== null && (
                        <span className={`flex items-center gap-1 text-sm font-bold mb-1 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            {growth >= 0
                              ? <path d="M18 15l-6-6-6 6" />
                              : <path d="M6 9l6 6 6-6" />
                            }
                          </svg>
                          {Math.abs(growth)}%
                        </span>
                      )}
                    </div>
                    {data?.previousDay && (
                      <p className="text-xs text-gray-400 mt-2">
                        Par rapport à la journée d'hier ({data.previousDay.toLocaleString('fr-FR')} DA)
                      </p>
                    )}
                  </div>

                  {/* Consultations count */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                      </div>
                      {data && (
                        <span className="text-xs text-indigo-500 font-medium">
                          Capacité {Math.round((data.consultations / data.maxSlots) * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Nombre de patients
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {String(activeData.consultations).padStart(2, '0')}
                      <span className="text-base font-normal text-gray-400 ml-2">Consultations</span>
                    </p>
                    {data && (
                      <>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Flux quotidien</span>
                          <span>{data.consultations} / {data.maxSlots} créneaux</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${(data.consultations / data.maxSlots) * 100}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Payments table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Détails des paiements</h2>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Patient</th>
                        <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Adresse</th>
                        <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Date Consult.</th>
                        <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Honoraires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPayments.map((p, i) => (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.color}`}>
                                {p.initials}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{p.patient}</p>
                                <p className="text-xs text-gray-400">#{p.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{p.address}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{p.datetime}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-bold text-gray-800">
                              {p.montant.toLocaleString('fr-FR')} DA
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-indigo-50 border-t border-indigo-100">
                        <td colSpan={3} className="px-6 py-4 text-sm font-bold text-indigo-600">
                          Total — {pagedPayments.length} consultations affichées
                        </td>
                        <td className="px-6 py-4 text-right text-base font-bold text-indigo-700">
                          {pagedPayments.reduce((s, p) => s + p.montant, 0).toLocaleString('fr-FR')} DA
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Affichage de {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, allPayments.length)} sur {allPayments.length} patients
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-30 text-gray-400 flex items-center justify-center transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                          <button
                            key={n}
                            onClick={() => setPage(n)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                              ${page === n
                                ? 'bg-indigo-600 text-white'
                                : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {n}
                          </button>
                        ))}
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-30 text-gray-400 flex items-center justify-center transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}