import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import Step1PersonalInfo from '../components/PatientForm/Step1PersonalInfo'
import Step2Medical from '../components/PatientForm/Step2Medical'
import Step3Documents from '../components/PatientForm/Step3Documents'


const steps = [
  { id: 1, label: 'Informations Personnelles', sub: 'Identité et contact'          },
  { id: 2, label: 'Consultation & Médical',    sub: 'Paramètres et antécédents'    },
  { id: 3, label: 'Documents & Notes',         sub: 'Pièces jointes et observations'},
  { id: 4, label: 'Première Consultation',     sub: 'Motif, diagnostic, traitement' },
]

export default function AddPatient() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
  // Step 1
  carteChifa: '', civilite: 'Mr', nom: '', prenom: '',
  ageAns: '', ageMois: '', profession: '', sitFamiliale: 'Célibataire',
  nbEnfants: '0', telephone: '', adresse: '',
  // Step 2
  poids: '', taille: '', antecedentsPerso: '', antecedentsFamiliaux: '', notes: '',
  // Step 3
  documents: [], observations: '',
  // Step 4
  motif: '', observations_consult: '', diagnostic: '', severite: '',
  medications: [], montant: '', modePaiement: 'especes', consultationNotes: '',
})

  const updateForm = (fields) => setForm((prev) => ({ ...prev, ...fields }))

  const imc = form.poids && form.taille
    ? (parseFloat(form.poids) / Math.pow(parseFloat(form.taille) / 100, 2)).toFixed(1)
    : null

  const handleSave = async () => {
  const response = await fetch('http://localhost:8000/api/v1/patients/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chifa_card_number: form.carteChifa || null,
      first_name:        form.prenom || null,   
      last_name:         form.nom || null,      
      gender:            form.civilite === 'Mr' ? 'male' : 'female',
      marital_status:    form.sitFamiliale || null,
      profession:        form.profession || null,
      phone:             form.telephone || null,
      address:           form.adresse || null,
      weight:            parseFloat(form.poids) || null,
      height:            parseFloat(form.taille) || null,
      personal_history:  form.antecedentsPerso || null,
      family_history:    form.antecedentsFamiliaux || null,
      notes:             form.notes || null,
      general_observation: form.observations || null,
    })
  })

  if (response.ok) {
    navigate(ROUTES.PATIENTS)
  } else {
    alert('Erreur lors de la création du patient')
  }
}

 const handleReset = () => {
  setForm({
    carteChifa: '', civilite: 'Mr', nom: '', prenom: '',
    ageAns: '', ageMois: '', profession: '', sitFamiliale: 'Célibataire',
    nbEnfants: '0', telephone: '', adresse: '',
    poids: '', taille: '', antecedentsPerso: '', antecedentsFamiliaux: '', notes: '',
    documents: [], observations: '',
    motif: '', diagnostic: '', severite: '',
    medications: [], montant: '', modePaiement: 'especes', consultationNotes: '',
  })
  setCurrentStep(1)
}

  return (
    <div className="min-h-screen bg-[#f0f2f9]">

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Nouveau Patient</h1>
          <p className="text-sm mt-1">
            <span className="text-gray-400">Patients</span>
            <span className="text-gray-400"> › </span>
            <span className="text-indigo-500 font-medium">Ajouter un dossier</span>
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
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Enregistrer le dossier
          </button>
        </div>
      </div>

      <div className="flex gap-6">

        {/* Left sidebar — progression */}
        <div className="w-72 flex flex-col gap-4 flex-shrink-0">

          {/* Steps */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">
              Progression
            </p>
            <div className="flex flex-col gap-1">
              {steps.map((step) => {
                const isDone    = step.id < currentStep
                const isActive  = step.id === currentStep
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all
                      ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                  >
                    {/* Step circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${isActive  ? 'bg-indigo-600 text-white'
                      : isDone    ? 'bg-indigo-200 text-indigo-700'
                      : 'bg-gray-100 text-gray-400'}`}
                    >
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : step.id}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400">{step.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            {currentStep === 1 && (
              <Step1PersonalInfo form={form} updateForm={updateForm} />
            )}
            {currentStep === 2 && (
              <Step2Medical form={form} updateForm={updateForm} imc={imc} />
            )}
            {currentStep === 3 && (
              <Step3Documents form={form} updateForm={updateForm} />
            )}
            {currentStep === 4 && (
  <Step4Consultation form={form} updateForm={updateForm} />
)}
          </div>

          {/* Bottom action buttons */}
          <div className="flex items-center justify-end gap-3 mt-6">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors"
              >
                Précédent
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors"
            >
              Réinitialiser
            </button>
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                Suivant
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                </svg>
                Enregistrer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Assistant IA button
      <button className="fixed bottom-6 left-72 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg transition-colors z-50">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        Assistant IA
      </button> */}
    </div>
  )
}