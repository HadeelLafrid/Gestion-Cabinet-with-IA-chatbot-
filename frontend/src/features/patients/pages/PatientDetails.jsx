import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ROUTES } from '../../../constants/routes'

function SectionHeader({ icon, title, color = 'bg-indigo-50 text-indigo-500' }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <h2 className="text-2xl font-black text-gray-900">{title}</h2>
    </div>
  )
}

function FieldBox({ label, value, unit }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
        <span className="text-sm text-gray-700 flex-1">{value ?? '—'}</span>
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
    </div>
  )
}

export default function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/patients/${id}`)
      .then(res => res.json())
      .then(data => setPatient(data))
      .catch((error) => {
        console.error('Erreur de chargement patient', error)
      })
  }, [id])

  useEffect(() => {
    if (!patient) return
    setEditForm({
      chifa_card_number: patient.chifa_card_number || '',
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth
        ? patient.date_of_birth.split?.('T')?.[0] || patient.date_of_birth
        : '',
      gender: patient.gender || '',
      weight: patient.weight != null ? String(patient.weight) : '',
      height: patient.height != null ? String(patient.height) : '',
      marital_status: patient.marital_status || '',
      number_of_children: patient.number_of_children != null ? String(patient.number_of_children) : '',
      profession: patient.profession || '',
      phone: patient.phone || '',
      address: patient.address || '',
      personal_history: patient.personal_history || '',
      family_history: patient.family_history || '',
      notes: patient.notes || '',
      general_observation: patient.general_observation || '',
    })
  }, [patient])

  const calculateAge = (dateString) => {
    if (!dateString) return null
    const birthDate = new Date(dateString)
    if (Number.isNaN(birthDate.getTime())) return null
    const ageDifMs = Date.now() - birthDate.getTime()
    const ageDate = new Date(ageDifMs)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSavePatient = async () => {
    if (!editForm) return
    setSaving(true)
    try {
      const payload = {
        chifa_card_number: editForm.chifa_card_number || null,
        first_name: editForm.first_name || null,
        last_name: editForm.last_name || null,
        date_of_birth: editForm.date_of_birth || null,
        gender: editForm.gender || null,
        weight: editForm.weight ? parseFloat(editForm.weight) : null,
        height: editForm.height ? parseFloat(editForm.height) : null,
        marital_status: editForm.marital_status || null,
        number_of_children: editForm.number_of_children
          ? parseInt(editForm.number_of_children, 10)
          : null,
        profession: editForm.profession || null,
        phone: editForm.phone || null,
        address: editForm.address || null,
        personal_history: editForm.personal_history || null,
        family_history: editForm.family_history || null,
        notes: editForm.notes || null,
        general_observation: editForm.general_observation || null,
      }

      const response = await fetch(`http://localhost:8000/api/v1/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Impossible de mettre à jour le patient')
      }

      const updated = await response.json()
      setPatient(updated)
      setEditMode(false)
      alert('Patient mis à jour avec succès.')
    } catch (error) {
      console.error('Erreur de mise à jour patient', error)
      alert('Erreur lors de la sauvegarde. Vérifiez les informations et réessayez.')
    } finally {
      setSaving(false)
    }
  }

  if (!patient) return <div className="p-8 text-gray-400">Chargement...</div>

  const imc = patient.weight && patient.height
    ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)
    : null

  const age = calculateAge(patient.date_of_birth)

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Dossier Patient :{' '}
            <span className="text-indigo-500">{patient.first_name} {patient.last_name}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Créé le : {patient.created_at ? new Date(patient.created_at).toLocaleDateString('fr-FR') : '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.PATIENTS)}
            className="px-8 py-3.5 rounded-full border-2 border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-700 text-base font-bold transition-all shadow-sm"
          >
            Retour
          </button>
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className="px-6 py-3.5 rounded-full border border-indigo-200 bg-white text-indigo-700 text-base font-bold transition-all hover:bg-indigo-50 shadow-sm"
          >
            {editMode ? 'Annuler' : 'Modifier le dossier'}
          </button>
          {editMode && (
            <button
              onClick={handleSavePatient}
              disabled={saving}
              className="px-6 py-3.5 rounded-full bg-indigo-600 text-white text-base font-bold transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400 shadow-sm"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}
        </div>
      </div>

      {/* Main content — 2 columns */}
      <div className="flex gap-6 items-start">

        {/* Left column */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Identité & État Civil */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <SectionHeader
              title="Identité & État Civil"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20a8 8 0 0116 0" />
                </svg>
              }
            />
            <div className="grid grid-cols-2 gap-4">
              {editMode ? (
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">N° Carte Chifa</span>
                  <input
                    name="chifa_card_number"
                    value={editForm?.chifa_card_number}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                  />
                </label>
              ) : (
                <FieldBox label="N° Carte Chifa" value={patient.chifa_card_number} />
              )}
              {editMode ? (
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Genre</span>
                  <select
                    name="gender"
                    value={editForm?.gender}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </label>
              ) : (
                <FieldBox label="Genre" value={patient.gender} />
              )}
              {editMode ? (
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Nom</span>
                  <input
                    name="last_name"
                    value={editForm?.last_name}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                  />
                </label>
              ) : (
                <FieldBox label="Nom" value={patient.last_name} />
              )}
              {editMode ? (
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Prénom</span>
                  <input
                    name="first_name"
                    value={editForm?.first_name}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                  />
                </label>
              ) : (
                <FieldBox label="Prénom" value={patient.first_name} />
              )}
            </div>
          </div>

          {/* Paramètres Biométriques */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <SectionHeader
              title="Paramètres Biométriques"
              color="bg-cyan-50 text-cyan-500"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="3" width="20" height="18" rx="2" />
                  <path d="M8 10h8M8 14h5" />
                </svg>
              }
            />
            {editMode ? (
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Date de naissance</span>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editForm?.date_of_birth}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                  />
                </label>
                <FieldBox label="Âge" value={age != null ? `${age} ans` : '—'} />
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Poids</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    name="weight"
                    value={editForm?.weight}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Taille</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    name="height"
                    value={editForm?.height}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <FieldBox label="Âge" value={age != null ? `${age}` : patient.age} unit="ans" />
                <FieldBox label="Poids" value={patient.weight} unit="kg" />
                <FieldBox label="Taille" value={patient.height} unit="cm" />
              </div>
            )}
            {imc && (
              <div className="mt-5 bg-cyan-50 border-2 border-cyan-100 rounded-2xl px-6 py-5 flex items-center justify-between shadow-sm">
                <span className="text-sm font-black text-cyan-600 uppercase tracking-widest">IMC Calculé</span>
                <span className="text-3xl font-black text-cyan-700">{imc}</span>
              </div>
            )}
          </div>

          {/* Antécédents Médicaux */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <SectionHeader
              title="Antécédents Médicaux"
              color="bg-red-50 text-red-400"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6M9 15h6" />
                </svg>
              }
            />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">
                  Antécédents Personnels
                </label>
                {editMode ? (
                  <textarea
                    name="personal_history"
                    value={editForm?.personal_history}
                    onChange={handleEditChange}
                    rows={4}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 min-h-16">
                    {patient.personal_history ?? '—'}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">
                  Antécédents Familiaux
                </label>
                {editMode ? (
                  <textarea
                    name="family_history"
                    value={editForm?.family_history}
                    onChange={handleEditChange}
                    rows={4}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 min-h-16">
                    {patient.family_history ?? '—'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-80 flex flex-col gap-5 flex-shrink-0">

          {/* Situation Sociale */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <SectionHeader
              title="Situation Sociale"
              color="bg-purple-50 text-purple-500"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              }
            />
            <div className="flex flex-col gap-4">
              {editMode ? (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Sit. Familiale</span>
                    <input
                      name="marital_status"
                      value={editForm?.marital_status}
                      onChange={handleEditChange}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">NB Enfants</span>
                    <input
                      type="number"
                      min="0"
                      name="number_of_children"
                      value={editForm?.number_of_children}
                      onChange={handleEditChange}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Profession</span>
                    <input
                      name="profession"
                      value={editForm?.profession}
                      onChange={handleEditChange}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
                    />
                  </label>
                </>
              ) : (
                <>
                  <FieldBox label="Sit. Familiale" value={patient.marital_status} />
                  <FieldBox label="NB Enfants" value={patient.number_of_children} />
                  <FieldBox label="Profession" value={patient.profession} />
                </>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <SectionHeader
              title="Contact"
              color="bg-indigo-50 text-indigo-500"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <circle cx="12" cy="15" r="2" />
                </svg>
              }
            />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Téléphone</label>
                {editMode ? (
                  <input
                    name="phone"
                    value={editForm?.phone}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 013 1.18 2 2 0 014.18 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <span className="text-sm text-gray-700">{patient.phone ?? '—'}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adresse</label>
                {editMode ? (
                  <input
                    name="address"
                    value={editForm?.address}
                    onChange={handleEditChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
                    {patient.address ?? '—'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Note Clinique */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <SectionHeader
              title="Note Clinique"
              color="bg-indigo-100 text-indigo-500"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
            />
            <p className="text-xs text-gray-400 mb-3">
              Ces notes sont visibles uniquement par le personnel médical autorisé.
            </p>
            {editMode ? (
              <textarea
                name="notes"
                value={editForm?.notes}
                onChange={handleEditChange}
                rows={6}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            ) : (
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                {patient.notes ?? '—'}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <SectionHeader
              title="Observations Générales"
              color="bg-gray-50 text-gray-600"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16v4H4z" />
                  <path d="M4 12h16v8H4z" />
                </svg>
              }
            />
            {editMode ? (
              <textarea
                name="general_observation"
                value={editForm?.general_observation}
                onChange={handleEditChange}
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            ) : (
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed min-h-[80px]">
                {patient.general_observation ?? '—'}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 pb-4 border-t border-gray-100">
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span>ID Dossier : <span className="font-bold text-gray-600">{patient.id}</span></span>
          <span>Date de création : <span className="font-medium">
            {patient.created_at ? new Date(patient.created_at).toLocaleDateString('fr-FR') : '—'}
          </span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Données cryptées conformes aux normes de santé (LPS)
        </div>
      </div>

    </div>
  )
}