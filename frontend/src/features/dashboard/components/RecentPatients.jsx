import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

const avatarColors = [
  'bg-blue-100 text-blue-600',
  'bg-cyan-100 text-cyan-600',
  'bg-pink-100 text-pink-600',
  'bg-purple-100 text-purple-600',
  'bg-green-100 text-green-600',
]

const patients = [
  { id: 1, initials: 'MB', name: 'Marc Bernard',    age: '42 ans', address: '12 Rue de la Paix, Paris',       lastConsult: '12 Oct 2023', color: 0 },
  { id: 2, initials: 'SD', name: 'Sophie Durand',   age: '29 ans', address: '45 Av. des Champs-Élysées',      lastConsult: '11 Oct 2023', color: 1 },
  { id: 3, initials: 'PL', name: 'Pierre Lefebvre', age: '56 ans', address: '8 Rue de Rivoli, Paris',         lastConsult: '10 Oct 2023', color: 2 },
  { id: 4, initials: 'AL', name: 'Alice Laurent',   age: '34 ans', address: '22 Bd Haussmann, Paris',         lastConsult: '09 Oct 2023', color: 3 },
  { id: 5, initials: 'JM', name: 'Jean Martin',     age: '61 ans', address: '5 Rue du Faubourg, Paris',       lastConsult: '08 Oct 2023', color: 4 },
]

export default function RecentPatients() {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-base font-bold text-gray-800">Patients vus récemment</h2>
          <p className="text-xs text-gray-400 mt-0.5">Liste des 10 dernières consultations effectuées.</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.PATIENTS)}
          className="text-sm text-indigo-600 hover:underline font-medium flex items-center gap-1"
        >
          Voir tout
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <table className="w-full mt-4">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Patient</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Âge</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Adresse</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Dernière Consult.</th>
            <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[p.color]}`}>
                    {p.initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                </div>
              </td>
              <td className="py-4 text-sm text-gray-500">{p.age}</td>
              <td className="py-4 text-sm text-gray-500">{p.address}</td>
              <td className="py-4">
                <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">
                  {p.lastConsult}
                </span>
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="text-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button className="text-red-300 hover:text-red-500 transition-colors">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}