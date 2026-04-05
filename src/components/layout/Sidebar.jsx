import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ROUTES } from '../../constants/routes'

const ChevronIcon = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export default function Sidebar() {
  const navigate = useNavigate()
  const [patientOpen, setPatientOpen] = useState(false)
  const [consultOpen, setConsultOpen] = useState(false)

  return (
    <aside className="w-52 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 fixed top-0 left-0 z-10">

      {/* Logo */}
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold text-indigo-700 tracking-tight">Med-IA</h1>
        <p className="text-xs text-gray-400 mt-0.5">Gestion Cabinaire</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">

        {/* Dashboard */}
        <NavLink
          to={ROUTES.DASHBOARD}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative
            ${isActive
              ? 'text-indigo-700 font-semibold bg-indigo-50 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-600 before:rounded-full'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
            }`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </NavLink>

        {/* Dossier patient — dropdown */}
        <div>
          <button
            onClick={() => setPatientOpen(!patientOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
              ${patientOpen
                ? 'text-indigo-700 font-semibold bg-indigo-50'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
              }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 12h8M8 8h8M8 16h5" />
            </svg>
            Dossier patient
            <ChevronIcon open={patientOpen} />
          </button>

          {/* Dropdown items */}
          {patientOpen && (
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-indigo-100 pl-3">
              <NavLink
                to={ROUTES.ADD_PATIENT}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all
                  ${isActive
                    ? 'text-indigo-700 font-semibold bg-indigo-50'
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'
                  }`
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="7" r="4" />
                  <path d="M10 15H6a4 4 0 00-4 4" />
                  <path d="M19 12v6M16 15h6" />
                </svg>
                Nouveau patient
              </NavLink>

              <NavLink
                to={ROUTES.PATIENTS}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all
                  ${isActive
                    ? 'text-indigo-700 font-semibold bg-indigo-50'
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'
                  }`
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="5" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                Rechercher patient
              </NavLink>
            </div>
          )}
        </div>

        {/* Consultations — dropdown */}
        <div>
          <button
            onClick={() => setConsultOpen(!consultOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
              ${consultOpen
                ? 'text-indigo-700 font-semibold bg-indigo-50'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
              }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Consultations
            <ChevronIcon open={consultOpen} />
          </button>

          {consultOpen && (
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-indigo-100 pl-3">
              <NavLink
                to={ROUTES.CONSULTATION.replace('/:patientId', '')}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all
                  ${isActive
                    ? 'text-indigo-700 font-semibold bg-indigo-50'
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'
                  }`
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Nouvelle consultation
              </NavLink>

              <NavLink
                to="/consultations/archive"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all
                  ${isActive
                    ? 'text-indigo-700 font-semibold bg-indigo-50'
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'
                  }`
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
                Archive
              </NavLink>
            </div>
          )}
        </div>

        {/* Rendez-vous */}
        <NavLink
          to={ROUTES.APPOINTMENTS}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative
            ${isActive
              ? 'text-indigo-700 font-semibold bg-indigo-50 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-600 before:rounded-full'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
            }`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Rendez-vous
        </NavLink>

        {/* Recette */}
        <NavLink
          to={ROUTES.PAYMENTS}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative
            ${isActive
              ? 'text-indigo-700 font-semibold bg-indigo-50 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-600 before:rounded-full'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
            }`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
          Recette
        </NavLink>

        {/* Contact */}
        <NavLink
          to={ROUTES.CONTACT}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative
            ${isActive
              ? 'text-indigo-700 font-semibold bg-indigo-50 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-600 before:rounded-full'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
            }`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          Contact
        </NavLink>

      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* New Consultation button */}
      <div className="px-2 pb-2">
        <button
          onClick={() => navigate(ROUTES.CONSULTATION.replace('/:patientId', ''))}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold py-3 px-4 rounded-full transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Consultation
        </button>
      </div>

    </aside>
  )
}