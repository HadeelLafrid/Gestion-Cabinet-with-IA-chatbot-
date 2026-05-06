import { useEffect, useMemo, useRef, useState } from 'react'
import apiClient from '../../../services/apiClient'

const emptyForm = {
  appointment_date: '',
  appointment_time: '',
  reason: '',
  notes: '',
}

function patientLabel(patient) {
  if (!patient) return ''
  const name = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || `Patient #${patient.id}`
  const extra = [patient.age ? `${patient.age} ans` : null, patient.phone || null].filter(Boolean)
  return extra.length ? `${name} • ${extra.join(' • ')}` : name
}

export default function AppointmentsPage() {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [patientQuery, setPatientQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [creatingPatient, setCreatingPatient] = useState(false)
  const searchWrapRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadPatients = async () => {
    setLoadingPatients(true)
    try {
      const response = await apiClient.get('/api/v1/patients', {
        params: { limit: 100, page: 1 },
      })
      console.log('Patients loaded:', response.data)
      setPatients(response.data?.data || [])
    } catch (error) {
      console.error('Error loading patients', error)
      setPatients([])
    } finally {
      setLoadingPatients(false)
    }
  }

  const loadAppointments = async () => {
    setLoadingAppointments(true)
    try {
      const response = await apiClient.get('/api/v1/appointments')
      setAppointments(response.data || [])
    } catch (error) {
      console.error('Error loading appointments', error)
      setAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }

  useEffect(() => {
    loadPatients()
    loadAppointments()
  }, [])

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase()
    if (!q) return patients.slice(0, 8)
    return patients.filter((patient) => {
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase()
      const idText = String(patient.id || '').toLowerCase()
      const phone = String(patient.phone || '').toLowerCase()
      return fullName.includes(q) || idText.includes(q) || phone.includes(q)
    }).slice(0, 8)
  }, [patients, patientQuery])

  const upcomingCount = appointments.length
  const confirmedCount = appointments.filter((appointment) => (appointment.status || 'confirmed') === 'confirmed').length
  const todayIso = new Date().toISOString().slice(0, 10)
  const todayCount = appointments.filter((appointment) => appointment.appointment_date === todayIso).length

  const selectPatient = (patient) => {
    setSelectedPatient(patient)
    setPatientQuery(patientLabel(patient))
    setShowSuggestions(false)
    setCreatingPatient(false)
  }

  const typedPatientName = patientQuery.trim()

  const exactPatientMatch = useMemo(() => {
    if (!typedPatientName) return null
    const normalizedQuery = typedPatientName.toLowerCase().replace(/\s+/g, ' ').trim()
    return patients.find((patient) => {
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase().replace(/\s+/g, ' ').trim()
      return fullName === normalizedQuery
    }) || null
  }, [patients, typedPatientName])

  const resolvedPatient = selectedPatient || exactPatientMatch

  const isNewPatientFlow = !selectedPatient && typedPatientName.length > 0 && !exactPatientMatch

  const createPayloadPatient = () => {
    if (resolvedPatient) {
      return { patient_id: resolvedPatient.id }
    }

    const patient_name = typedPatientName
    return {
      patient_name,
      patient_note: form.notes || null,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!typedPatientName || !form.appointment_date) return

    setSaving(true)
    try {
      await apiClient.post('/api/v1/appointments', {
        ...createPayloadPatient(),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time?.trim() || null,
        reason: form.reason || null,
        notes: form.notes || null,
      })
      setForm(emptyForm)
      setSelectedPatient(null)
      setPatientQuery('')
      await loadAppointments()
    } catch (error) {
      console.error('Error creating appointment', error)
      const message = error.response?.data?.detail || "Impossible d'enregistrer le rendez-vous."
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm('Supprimer ce rendez-vous ?')) return
    setDeletingId(appointmentId)
    try {
      await apiClient.delete(`/api/v1/appointments/${appointmentId}`)
      await loadAppointments()
    } catch (error) {
      console.error('Error deleting appointment', error)
      alert('Impossible de supprimer le rendez-vous.')
    } finally {
      setDeletingId(null)
    }
  }

  const sortedAppointments = [...appointments].sort((left, right) => {
    const leftKey = `${left.appointment_date}T${left.appointment_time || '23:59'}`
    const rightKey = `${right.appointment_date}T${right.appointment_time || '23:59'}`
    return leftKey.localeCompare(rightKey)
  })

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-700 via-indigo-600 to-slate-900 text-white shadow-[0_18px_60px_rgba(79,70,229,0.25)]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_32%),radial-gradient(circle_at_bottom_left,_white,_transparent_28%)]" />
        <div className="relative px-7 py-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-indigo-200">Rendez-vous</p>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">Planifier vos rendez-vous avec une vue claire</h1>
            <p className="text-indigo-100 text-base lg:text-lg max-w-xl">Recherchez un patient une seule fois, sélectionnez-le dans la liste, puis enregistrez le rendez-vous dans la base de données.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[280px]">
            <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-indigo-200">Total</p>
              <p className="text-3xl font-black mt-1">{upcomingCount}</p>
            </div>
            <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-indigo-200">Confirmés</p>
              <p className="text-3xl font-black mt-1">{confirmedCount}</p>
            </div>
            <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-indigo-200">Aujourd'hui</p>
              <p className="text-3xl font-black mt-1">{todayCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
        <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Nouveau rendez-vous</p>
              <h2 className="text-2xl font-black text-gray-900 mt-1">Sélectionner un patient ou créer un nouveau dossier</h2>
            </div>
            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-right">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.3em]">Patients</p>
              <p className="text-2xl font-black text-indigo-700">{loadingPatients ? '...' : patients.length}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 relative" ref={searchWrapRef}>
              <label className="text-sm font-bold text-gray-700">Patient</label>
              <input
                value={patientQuery}
                onChange={(event) => {
                  setPatientQuery(event.target.value)
                  setShowSuggestions(true)
                  setSelectedPatient(null)
                  setCreatingPatient(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Tapez le nom, l'ID ou le téléphone..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
              {showSuggestions && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                  {loadingPatients ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Chargement...</div>
                  ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => selectPatient(patient)}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-50 last:border-b-0"
                      >
                        <div className="font-bold text-gray-900">{patientLabel(patient)}</div>
                        <div className="text-xs text-gray-500">ID patient: {patient.id}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 space-y-2">
                      <div className="text-sm text-gray-500">Aucun patient trouvé</div>
                      {typedPatientName && (
                        <button
                          type="button"
                          onClick={() => {
                            setCreatingPatient(true)
                            setShowSuggestions(false)
                          }}
                          className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-sm font-semibold text-indigo-800 hover:bg-indigo-100"
                        >
                          Créer un nouveau patient: <span className="font-black">{typedPatientName}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {(selectedPatient || isNewPatientFlow || creatingPatient) && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                      {resolvedPatient ? 'Patient sélectionné' : 'Nouveau patient'}
                    </p>
                    <p className="text-base font-black text-indigo-900 mt-1">
                      {resolvedPatient ? patientLabel(resolvedPatient) : typedPatientName}
                    </p>
                    {!resolvedPatient && (
                      <p className="text-xs font-medium text-indigo-700 mt-1">
                        Un nouveau patient sera créé lors de l'enregistrement.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null)
                      setPatientQuery('')
                      setCreatingPatient(false)
                    }}
                    className="text-sm font-bold text-indigo-700 hover:text-indigo-900"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Date</label>
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, appointment_date: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Heure <span className="text-gray-400 font-semibold">(facultatif)</span></label>
                <input
                  type="time"
                  value={form.appointment_time}
                  onChange={(event) => setForm((prev) => ({ ...prev, appointment_time: event.target.value }))}
                  placeholder="Optionnelle"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Motif</label>
              <input
                value={form.reason}
                onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                placeholder="Contrôle, résultats, suivi..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Notes</label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Observations rapides ou consignes"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !typedPatientName || !form.appointment_date}
              className="w-full rounded-2xl bg-indigo-600 px-5 py-4 text-white font-black text-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving
                ? 'Enregistrement...'
                : resolvedPatient
                  ? 'Enregistrer le rendez-vous'
                  : 'Créer le patient et enregistrer le rendez-vous'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Si vous ne sélectionnez pas un patient existant, le nom saisi créera un nouveau dossier patient.
            </p>
          </form>
        </section>

        <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Planning</p>
              <h2 className="text-2xl font-black text-gray-900 mt-1">Rendez-vous à venir</h2>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-right">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.3em]">Chargement</p>
              <p className="text-2xl font-black text-gray-900">{loadingAppointments ? '...' : appointments.length}</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1">
            {loadingAppointments ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
                Chargement des rendez-vous...
              </div>
            ) : sortedAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                <p className="text-lg font-bold text-gray-700">Aucun rendez-vous pour le moment</p>
                <p className="text-sm text-gray-500 mt-2">Créez votre premier rendez-vous à gauche.</p>
              </div>
            ) : (
              sortedAppointments.map((appointment) => (
                <article key={appointment.id} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-black text-gray-900">{appointment.patient_name || `Patient #${appointment.patient_id}`}</h3>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 uppercase tracking-wider">
                          {appointment.status || 'confirmed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {appointment.appointment_date}{appointment.appointment_time ? ` • ${appointment.appointment_time}` : ' • Sans heure'}
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        {appointment.reason || 'Sans motif'}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 mt-2">{appointment.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      disabled={deletingId === appointment.id}
                      className="shrink-0 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === appointment.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
