import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ROUTES } from '../../../constants/routes'
import apiClient from '../../../services/apiClient'

// Removed mock data

function SectionHeader({ icon, title, color = 'bg-indigo-50 text-indigo-500' }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </div>
  )
}

function FieldBox({ label, value, unit }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
        <span className="text-sm text-gray-700 flex-1">{value}</span>
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
    </div>
  )
}

export default function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await apiClient.get(`/api/v1/patients/${id}`);
        const p = response.data;
        let age = 'N/A';
        if (p.date_of_birth) {
           const birthDate = new Date(p.date_of_birth);
           const ageDifMs = Date.now() - birthDate.getTime();
           const ageDate = new Date(ageDifMs);
           age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
        setPatient({
           id: p.id,
           carteChifa: p.chifa_card_number || 'Non renseigné',
           civilite: p.gender === 'M' || p.gender === 'male' ? 'Monsieur' : p.gender === 'F' || p.gender === 'female' ? 'Madame' : 'Non spécifié',
           nom: p.last_name || '',
           prenom: p.first_name || '',
           age: age,
           poids: p.weight || null,
           taille: p.height || null,
           sitFamiliale: p.marital_status || 'Non renseigné',
           nbEnfants: p.number_of_children || 0,
           profession: p.profession || 'Non renseigné',
           telephone: p.phone || 'Non renseigné',
           adresse: p.address || 'Non renseigné',
           antecedentsPerso: p.personal_history || 'Aucun antécédent personnel signalé.',
           antecedentsFamiliaux: p.family_history || 'Aucun antécédent familial signalé.',
           noteClinique: p.general_observation || 'Aucune note clinique.',
           dateCreation: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
           lastUpdate: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
        });
      } catch (error) {
        console.error("Error fetching patient", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchPatient();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Patient non trouvé
      </div>
    );
  }

  const imc = patient.poids && patient.taille
    ? (patient.poids / Math.pow(patient.taille / 100, 2)).toFixed(1)
    : null

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dossier Patient :{' '}
            <span className="text-indigo-500">{patient.prenom} {patient.nom}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Dernière mise à jour : {patient.lastUpdate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.PATIENTS)}
            className="px-6 py-2.5 rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => alert('Enregistré !')}
            className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
            </svg>
            Enregistrer
          </button>
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
              <FieldBox label="N° Carte Chifa" value={patient.carteChifa} />
              <FieldBox label="Civilité"       value={patient.civilite}  />
              <FieldBox label="Nom"            value={patient.nom}       />
              <FieldBox label="Prénom"         value={patient.prenom}    />
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
            <div className="grid grid-cols-3 gap-4">
              <FieldBox label="Âge"    value={patient.age}    unit="ans" />
              <FieldBox label="Poids"  value={patient.poids}  unit="kg"  />
              <FieldBox label="Taille" value={patient.taille} unit="cm"  />
            </div>
            {imc && (
              <div className="mt-4 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">IMC Calculé</span>
                <span className="text-lg font-bold text-cyan-700">{imc}</span>
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Antécédents Personnels
                </label>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 min-h-16">
                  {patient.antecedentsPerso}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Antécédents Familiaux
                </label>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 min-h-16">
                  {patient.antecedentsFamiliaux}
                </div>
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
              <FieldBox label="Sit. Familiale" value={patient.sitFamiliale} />
              <FieldBox label="NB Enfants"     value={patient.nbEnfants}    />
              <FieldBox label="Profession"     value={patient.profession}   />
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
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 013 1.18 2 2 0 014.18 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span className="text-sm text-gray-700">{patient.telephone}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adresse</label>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
                  {patient.adresse}
                </div>
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
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
              {patient.noteClinique}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 pb-4 border-t border-gray-100">
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span>ID Dossier : <span className="font-bold text-gray-600">{patient.id}</span></span>
          <span>Date de création : <span className="font-medium">{patient.dateCreation}</span></span>
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