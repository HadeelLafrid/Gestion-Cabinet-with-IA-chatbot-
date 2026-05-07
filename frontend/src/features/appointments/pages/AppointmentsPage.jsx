import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const TYPE_OPTIONS = ['Consultation', 'Suivi', 'Première visite', 'Résultats labo', 'Urgence', 'Autre']
const API_BASE = 'http://localhost:8000/api/v1/appointments'
const PATIENTS_API_BASE = 'http://localhost:8000/api/v1/patients'

function getInitials(name) {
  return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function getTimeSortValue(value) {
  return value || '99:99'
}

function formatTime(value) {
  return value || 'Toute la journée'
}

export default function AppointmentList() {
  const navigate = useNavigate()
  const today = new Date()

  const [appointments, setAppointments] = useState([])
  const [patientOptions, setPatientOptions] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [viewMode, setViewMode] = useState('all')
  const [patientQuery, setPatientQuery] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [patientMenuOpen, setPatientMenuOpen] = useState(false)
  const [form, setForm] = useState({ patient: '', phone: '', date: '', heure: '', type: 'Consultation' })

  const handleFormChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const loadPatientOptions = async (search = '') => {
    try {
      const response = await fetch(`${PATIENTS_API_BASE}/?search=${encodeURIComponent(search)}&limit=20`)
      if (!response.ok) throw new Error('Failed to fetch patients')
      const data = await response.json()
      setPatientOptions(data.data || [])
    } catch (error) {
      console.error(error)
      setPatientOptions([])
    }
  }

  const handlePatientQueryChange = (value) => {
    setPatientQuery(value)
    setSelectedPatientId('')
    setForm((current) => ({ ...current, patient: value }))
    setPatientMenuOpen(true)
    if (value.trim().length >= 1) {
      loadPatientOptions(value)
    } else {
      loadPatientOptions('')
    }
  }

  const selectExistingPatient = (patient) => {
    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
    setSelectedPatientId(String(patient.id))
    setPatientQuery(fullName)
    setForm((current) => ({ ...current, patient: fullName }))
    setPatientMenuOpen(false)
  }

  const openAddForm = () => {
    setForm({
      patient: '',
      phone: '',
      date: selectedDate || today.toISOString().split('T')[0],
      heure: '',
      type: 'Consultation',
    })
    setPatientQuery('')
    setSelectedPatientId('')
    setPatientMenuOpen(false)
    setEditTarget(null)
    setShowForm(true)
  }

  const openEditForm = (appointment) => {
    const fullName = appointment.patient || ''
    setForm({
      patient: fullName,
      phone: appointment.phone,
      date: appointment.date,
      heure: appointment.heure || '',
      type: appointment.type,
    })
    setPatientQuery(fullName)
    setSelectedPatientId(appointment.patient_id ? String(appointment.patient_id) : '')
    setPatientMenuOpen(false)
    setEditTarget(appointment)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.patient.trim() || !form.date) return

    try {
      const payload = {
        appointment_date: form.date,
        appointment_time: form.heure,
        reason: form.type,
      }

      if (selectedPatientId) {
        payload.patient_id = Number(selectedPatientId)
      } else {
        payload.patient_name = form.patient.trim()
      }

      if (editTarget) {
        const response = await fetch(`${API_BASE}/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('Update failed')
        const updated = await response.json()
        setAppointments((current) => current.map((appointment) => (
          appointment.id === updated.id
            ? {
                ...appointment,
                patient: updated.patient_name || form.patient,
                patient_id: updated.patient_id || appointment.patient_id || null,
                phone: appointment.phone || '',
                date: updated.appointment_date,
                heure: updated.appointment_time || '',
                type: updated.reason || form.type,
              }
            : appointment
        )))
      } else {
        const response = await fetch(`${API_BASE}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('Create failed')
        const created = await response.json()
        setAppointments((current) => [
          ...current,
          {
            id: created.id,
            patient: created.patient_name || form.patient,
            patient_id: created.patient_id || (selectedPatientId ? Number(selectedPatientId) : null),
            phone: form.phone || '',
            date: created.appointment_date,
            heure: created.appointment_time || '',
            type: created.reason || form.type,
            color: 'bg-indigo-100 text-indigo-700',
          },
        ])
      }

      setShowForm(false)
      setEditTarget(null)
      setPatientMenuOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      const response = await fetch(`${API_BASE}/${deleteTarget.id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) throw new Error('Delete failed')
      setAppointments((current) => current.filter((appointment) => appointment.id !== deleteTarget.id))
    } catch (error) {
      console.error(error)
    } finally {
      setDeleteTarget(null)
    }
  }

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const response = await fetch(`${API_BASE}/`)
        if (!response.ok) throw new Error('Failed to fetch appointments')
        const data = await response.json()
        if (!active) return

        setAppointments(
          data.map((appointment) => ({
            id: appointment.id,
            patient: appointment.patient_name || '',
            patient_id: appointment.patient_id || null,
            phone: '',
            date: appointment.appointment_date,
            heure: appointment.appointment_time || '',
            type: appointment.reason || '',
            color: 'bg-indigo-100 text-indigo-700',
          })),
        )
        loadPatientOptions('')
      } catch (error) {
        console.error(error)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((year) => year - 1)
      setCalMonth(11)
    } else {
      setCalMonth((month) => month - 1)
    }
  }
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((year) => year + 1)
      setCalMonth(0)
    } else {
      setCalMonth((month) => month + 1)
    }
  }

  const apptsByDate = appointments.reduce((accumulator, appointment) => {
    accumulator[appointment.date] = accumulator[appointment.date] || []
    accumulator[appointment.date].push(appointment)
    return accumulator
  }, {})

  const displayedAppointments = selectedDate && viewMode === 'day'
    ? [...appointments].filter((appointment) => appointment.date === selectedDate).sort((a, b) => getTimeSortValue(a.heure).localeCompare(getTimeSortValue(b.heure)))
    : [...appointments].sort((a, b) => a.date.localeCompare(b.date) || getTimeSortValue(a.heure).localeCompare(getTimeSortValue(b.heure)))

  const todayStr = today.toISOString().split('T')[0]
  const todayCount = appointments.filter((appointment) => appointment.date === todayStr).length
  const weekCount = appointments.filter((appointment) => {
    const date = new Date(appointment.date)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return date >= startOfWeek && date <= endOfWeek
  }).length
  const totalCount = appointments.length

  return (
    <div className="flex flex-col gap-6">
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  {editTarget ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Nom du patient <span className="text-red-400">*</span>
                </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="patient"
                      value={patientQuery}
                      onChange={(event) => handlePatientQueryChange(event.target.value)}
                      onFocus={() => setPatientMenuOpen(true)}
                      onBlur={() => setTimeout(() => setPatientMenuOpen(false), 150)}
                      placeholder="Ex: Karim Amrani"
                      list="patient-suggestions"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors w-full"
                    />
                    {patientMenuOpen && patientOptions.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-56 overflow-auto">
                        {patientOptions.map((patient) => {
                          const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
                          return (
                            <button
                              key={patient.id}
                              type="button"
                              onMouseDown={() => selectExistingPatient(patient)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                            >
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{fullName || `Patient #${patient.id}`}</p>
                                <p className="text-xs text-gray-400">Patient existant</p>
                              </div>
                              <span className="text-xs font-bold text-indigo-600">Sélectionner</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  {patientQuery.trim() && !selectedPatientId && (
                    <p className="text-xs text-amber-600">Ce nom sera créé comme nouveau patient si vous enregistrez.</p>
                  )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="0550 12 34 56"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Heure (optionnel)
                  </label>
                  <input
                    type="time"
                    name="heure"
                    value={form.heure}
                    onChange={handleFormChange}
                    placeholder="Laisser vide si non précisé"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
                >
                  {TYPE_OPTIONS.map((typeOption) => (
                    <option key={typeOption} value={typeOption}>{typeOption}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!form.patient.trim() || !form.date}
                className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                </svg>
                {editTarget ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-400">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Supprimer le rendez-vous ?</h3>
                <p className="text-sm text-gray-500">
                  Rendez-vous de{' '}
                  <span className="font-semibold text-gray-700">{deleteTarget.patient}</span>{' '}
                  le <span className="font-semibold text-gray-700">{new Date(deleteTarget.date).toLocaleDateString('fr-FR')}</span>{' '}
                  à <span className="font-semibold text-gray-700">{deleteTarget.heure}</span>.
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

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Rendez-vous</h1>
          <p className="text-sm text-gray-400 mt-1">Gérez le planning et les rendez-vous des patients.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouveau rendez-vous
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Aujourd'hui",
            value: todayCount,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            ),
            color: 'bg-indigo-100 text-indigo-500',
            valueColor: 'text-indigo-700',
          },
          {
            label: 'Cette semaine',
            value: weekCount,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
              </svg>
            ),
            color: 'bg-cyan-100 text-cyan-500',
            valueColor: 'text-cyan-700',
          },
          {
            label: 'Total',
            value: totalCount,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            ),
            color: 'bg-emerald-100 text-emerald-500',
            valueColor: 'text-emerald-700',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${stat.valueColor}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-5 items-start">
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <p className="text-sm font-bold text-gray-800 capitalize">
                {MONTHS_FR[calMonth]} {calYear}
              </p>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DAYS_FR.map((dayLabel) => (
                <div key={dayLabel} className="text-center text-xs font-semibold text-gray-400 py-1">{dayLabel}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}

              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const hasAppt = !!apptsByDate[dateStr]
                const count = apptsByDate[dateStr]?.length || 0
                const isToday = dateStr === todayStr
                const isSelected = dateStr === selectedDate

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (selectedDate === dateStr) {
                        setSelectedDate(null)
                        setViewMode('all')
                      } else {
                        setSelectedDate(dateStr)
                        setViewMode('day')
                      }
                    }}
                    className={`relative flex flex-col items-center justify-center h-9 w-9 mx-auto rounded-xl text-xs font-semibold transition-all ${
                      isSelected ? 'bg-indigo-600 text-white shadow-md' : isToday ? 'bg-indigo-100 text-indigo-700' : hasAppt ? 'hover:bg-indigo-50 text-gray-700' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                    {hasAppt && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {Array.from({ length: Math.min(count, 3) }).map((_, dotIndex) => (
                          <span key={dotIndex} className={`w-1 h-1 rounded-full ${isToday ? 'bg-indigo-500' : 'bg-indigo-400'}`} />
                        ))}
                      </span>
                    )}
                    {hasAppt && isSelected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-xs text-gray-400">RDV planifié</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-100 border border-indigo-300" />
                <span className="text-xs text-gray-400">Aujourd'hui</span>
              </div>
            </div>
          </div>

          {selectedDate && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <button onClick={openAddForm} className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
              {(apptsByDate[selectedDate] || []).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Aucun rendez-vous ce jour</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {(apptsByDate[selectedDate] || []).sort((a, b) => getTimeSortValue(a.heure).localeCompare(getTimeSortValue(b.heure))).map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-500 w-24 flex-shrink-0">{formatTime(appointment.heure)}</span>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-indigo-400" />
                      <span className="text-xs text-gray-700 font-medium truncate">{appointment.patient}</span>
                      <button
                        type="button"
                        onClick={() => appointment.patient_id && navigate(`/consultation/${appointment.patient_id}`)}
                        disabled={!appointment.patient_id}
                        title={appointment.patient_id ? 'Démarrer la consultation de ce patient' : 'Patient sans identifiant'}
                        className="ml-auto w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:hover:bg-indigo-50 text-indigo-600 flex items-center justify-center transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {viewMode === 'day' && selectedDate
                    ? `Rendez-vous du ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`
                    : 'Tous les rendez-vous'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{displayedAppointments.length} rendez-vous</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedDate && (
                  <button
                    onClick={() => {
                      setSelectedDate(null)
                      setViewMode('all')
                    }}
                    className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium border border-indigo-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Voir tout
                  </button>
                )}
              </div>
            </div>

            {displayedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Aucun rendez-vous ce jour</p>
                <button onClick={openAddForm} className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 text-sm font-medium transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Ajouter un rendez-vous
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Patient</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Date & Heure</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Type</th>
                    <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAppointments.map((appointment) => {
                    const dateObj = new Date(appointment.date + 'T12:00:00')
                    const dateDisplay = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                    const isPast = appointment.date < todayStr

                    return (
                      <tr key={appointment.id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${appointment.color}`}>
                              {getInitials(appointment.patient)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{appointment.patient}</p>
                              {appointment.phone && <p className="text-xs text-gray-400">{appointment.phone}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 font-medium">{dateDisplay}</p>
                          <p className="text-xs text-indigo-500 font-bold mt-0.5">{formatTime(appointment.heure)}</p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">{appointment.type}</span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => appointment.patient_id && navigate(`/consultation/${appointment.patient_id}`)}
                              disabled={!appointment.patient_id}
                              title={appointment.patient_id ? 'Démarrer la consultation' : 'Patient sans identifiant'}
                              className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:hover:bg-indigo-50 text-indigo-500 flex items-center justify-center transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M12 8v8M8 12h8" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditForm(appointment)}
                              className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-500 flex items-center justify-center transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(appointment)}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}