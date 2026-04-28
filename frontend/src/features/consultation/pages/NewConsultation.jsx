import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { COMMON_MEDICINES, MEDICINE_CATEGORIES } from '../../../constants/medicines'
import apiClient from '../../../services/apiClient'

const MOCK_PATIENTS = {
  'PT-4401': { name: 'Lafrid hadil',  id: '4401-X', age: '42 ans', genre: 'Femme' },
  'PT-4402': { name: 'Jean Dupont',     id: '4402-X', age: '31 ans', genre: 'Homme' },
  'PT-4403': { name: 'Robert Martin',   id: '4403-X', age: '68 ans', genre: 'Homme' },
  'PT-4404': { name: 'Alice Dubois',    id: '4404-X', age: '25 ans', genre: 'Femme' },
  'PT-4405': { name: 'Sophie Girard',   id: '4405-X', age: '54 ans', genre: 'Femme' },
  'PT-4406': { name: 'Pierre Bernard',  id: '4406-X', age: '47 ans', genre: 'Homme' },
  'PT-4407': { name: 'Karim Benali',    id: '4407-X', age: '38 ans', genre: 'Homme' },
}


export default function NewConsultation() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const panelRef = useRef(null)

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await apiClient.get(`/api/v1/patients/${patientId}`);
        const p = response.data;
        let age = 'N/A';
        if (p.date_of_birth) {
           const birthDate = new Date(p.date_of_birth);
           const ageDifMs = Date.now() - birthDate.getTime();
           const ageDate = new Date(ageDifMs);
           age = Math.abs(ageDate.getUTCFullYear() - 1970) + ' ans';
        }
        setPatient({
           ...p,
           name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Inconnu',
           age: age,
           genre: p.gender === 'M' ? 'Homme' : p.gender === 'F' ? 'Femme' : p.gender || 'Non spécifié',
           id: p.id
        });

        try {
          const medsRes = await apiClient.get(`/consultations/medicines/${patientId}`);
          if (medsRes.data) {
            setMeds(medsRes.data.map(m => ({
              id: m.id || Date.now() + Math.random(),
              name: m.name,
              instruction: m.dosage || '',
              icon: 'pill'
            })));
          }
        } catch (err) {
          console.warn("Could not fetch medicines for patient or none found", err);
        }
      } catch (error) {
        console.error("Error fetching patient", error);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetchPatient();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const [form, setForm] = useState({
    motif:         '',
    observations:  '',
    diagnostic:    '',
    severite:      '',
    notes:         '',
    montant:       '',
    modePaiement: 'especes',
  })
  const [tags,   setTags]   = useState(['I10 - Hypertension'])
  const [meds,   setMeds]   = useState([])
  const [aiChat, setAiChat] = useState('')
  const [showMedForm, setShowMedForm] = useState(false)
  const [newMed,      setNewMed]      = useState({ name: '', instruction: '', icon: 'pill' })
  const [selectedCategory, setSelectedCategory] = useState('')
  
  // State for resume modal and panel
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)
  const [generatedResume, setGeneratedResume] = useState('')
  const [showResumePanel, setShowResumePanel] = useState(false)
  const [chatConversation, setChatConversation] = useState([])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t))
  const addTag    = () => {
    if (form.diagnostic.trim()) {
      setTags(prev => [...prev, form.diagnostic.trim()])
      setForm(f => ({ ...f, diagnostic: '' }))
    }
  }

  const removeMed = (id) => setMeds(prev => prev.filter(m => m.id !== id))

  const addMedicine = () => {
    if (!newMed.name.trim() || !newMed.instruction.trim()) return
    setMeds(prev => [...prev, { id: Date.now(), ...newMed }])
    setNewMed({ name: '', instruction: '', icon: 'pill' })
    setShowMedForm(false)
  }

  const handleSaveConsultation = async () => {
    try {
      const payload = {
        patient_id: parseInt(patientId),
        consultation_date: new Date().toISOString(),
        motif: form.motif,
        clinical_observation: form.observations,
        diagnosis: tags.join(', '),
        severity: form.severite,
        additional_notes: form.notes,
        medicines: meds.filter(m => m.icon === 'pill').map(m => ({
          medicine_name: m.name,
          dosage: m.instruction
        })),
        exams: meds.filter(m => m.icon === 'lab').map(m => ({
          exam_name: m.name,
          notes: m.instruction
        })),
        payment: form.montant ? { amount: parseFloat(form.montant) } : null
      };

      await apiClient.post('/consultations/', payload);
      // Generate resume after successful save
      generateResume();
    } catch (error) {
      console.error("Error saving consultation", error);
      alert("Erreur lors de l'enregistrement de la consultation.");
    }
  };

  // Generate resume based on consultation data
  const generateResume = async () => {
    setIsGeneratingResume(true)
    
    setTimeout(() => {
      const resumeText = `
╔══════════════════════════════════════════════════════════════════╗
║                    RÉSUMÉ DE CONSULTATION                        ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│                         INFORMATIONS PATIENT                      │
└──────────────────────────────────────────────────────────────────┘
  👤 Nom complet :     ${patient.name}
  🆔 ID Patient :      ${patient.id}
  📅 Âge :             ${patient.age}
  ⚥ Genre :           ${patient.genre}
  👨‍⚕️ Médecin :        Dr. Jean Dupont

┌──────────────────────────────────────────────────────────────────┐
│                      MOTIF & OBSERVATIONS                         │
└──────────────────────────────────────────────────────────────────┘
  📌 Motif :
     ${form.motif || 'Non spécifié'}

  🔍 Observations cliniques :
     ${form.observations || 'Non spécifiées'}

┌──────────────────────────────────────────────────────────────────┐
│                         DIAGNOSTIC CLINIQUE                       │
└──────────────────────────────────────────────────────────────────┘
  🏥 Diagnostic(s) :
     ${tags.map(t => `• ${t}`).join('\n     ') || 'Non spécifié'}

  ⚠️ Sévérité :        ${form.severite || 'Non spécifiée'}

┌──────────────────────────────────────────────────────────────────┐
│                         PLAN DE TRAITEMENT                        │
└──────────────────────────────────────────────────────────────────┘
  ${meds.length === 0 ? '  Aucun traitement prescrit' : meds.map(m => `
  💊 ${m.icon === 'pill' ? 'Médicament' : 'Examen/Labo'} : ${m.name}
     📋 Posologie : ${m.instruction}
  `).join('\n')}

┌──────────────────────────────────────────────────────────────────┐
│                         NOTES ADDITIONNELLES                      │
└──────────────────────────────────────────────────────────────────┘
  📝 ${form.notes || 'Aucune note'}

┌──────────────────────────────────────────────────────────────────┐
│                            HONORAIRES                             │
└──────────────────────────────────────────────────────────────────┘
  💰 Montant : ${form.montant ? `${form.montant} DA` : 'Non spécifié'}

╔══════════════════════════════════════════════════════════════════╗
║  Consultation en cours - ${new Date().toLocaleDateString('fr-FR')}              ║
╚══════════════════════════════════════════════════════════════════╝
      `
      setGeneratedResume(resumeText)
      setIsGeneratingResume(false)
      setShowResumeModal(true)
    }, 1500)
  }

  // Close modal and show resume panel at bottom
  const closeModalAndShowPanel = () => {
    setShowResumeModal(false)
    setShowResumePanel(true)
    
    setTimeout(() => {
      if (panelRef.current) {
        panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 100)
  }

  // Send message to AI with full consultation context
  const sendAiMessage = () => {
    if (!aiChat.trim()) return
    
    const userMessage = { role: 'user', text: aiChat }
    setChatConversation(prev => [...prev, userMessage])
    setAiChat('')
    
    setTimeout(() => {
      const aiResponse = generateContextualResponse(aiChat, {
        patient,
        motif: form.motif,
        observations: form.observations,
        diagnostic: tags,
        treatments: meds,
        notes: form.notes
      })
      setChatConversation(prev => [...prev, { role: 'ai', text: aiResponse }])
    }, 800)
  }

  // Generate contextual AI response
  const generateContextualResponse = (question, context) => {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('risque') || lowerQuestion.includes('danger') || lowerQuestion.includes('effet secondaire')) {
      return `⚠️ Analyse des risques basée sur la consultation :
• Patient: ${context.patient.name}, ${context.patient.age}
• Diagnostic: ${context.diagnostic.join(', ')}
• Traitements prescrits: ${context.treatments.map(t => t.name).join(', ')}

Recommandation: Surveiller les effets indésirables potentiels. Un suivi dans 7 jours est conseillé.`
    }
    
    if (lowerQuestion.includes('examen') || lowerQuestion.includes('analyse') || lowerQuestion.includes('bilan')) {
      return `🔬 Examens complémentaires suggérés pour "${context.motif || 'ce motif'}":
• Bilan sanguin complet
• Contrôle de la tension artérielle
• ${context.diagnostic.includes('Hypertension') ? 'Échocardiogramme' : 'Bilan lipidique'}

Ces examens aideraient à confirmer le diagnostic et adapter le traitement.`
    }
    
    if (lowerQuestion.includes('traitement') || lowerQuestion.includes('médicament') || lowerQuestion.includes('posologie')) {
      return `💊 Analyse du traitement actuel:
${context.treatments.map(t => `• ${t.name}: ${t.instruction}`).join('\n')}

Le traitement semble adapté au diagnostic de ${context.diagnostic.join(', ')}. 
Rappeler au patient l'importance de l'observance et des rendez-vous de suivi.`
    }
    
    return `📊 Analyse de la consultation du patient ${context.patient.name}:

Diagnostic: ${context.diagnostic.join(', ')}
Traitement: ${context.treatments.length} élément(s) prescrit(s)
${context.notes ? `Notes: ${context.notes.substring(0, 100)}...` : ''}

Comment puis-je vous aider à approfondir ce cas?`
  }

  // Regenerate resume with chat conversation included - ALWAYS ENABLED
  const regenerateResumeWithChat = () => {
    setIsGeneratingResume(true)
    
    setTimeout(() => {
      let chatSummary = ''
      if (chatConversation.length > 0) {
        chatSummary = chatConversation
          .map(msg => `${msg.role === 'user' ? '👨‍⚕️ MÉDECIN' : '🤖 IA'}: ${msg.text}`)
          .join('\n\n     ')
      } else {
        chatSummary = 'Aucun échange avec l\'assistant'
      }
      
      const updatedResume = `
╔══════════════════════════════════════════════════════════════════╗
║                    RÉSUMÉ DE CONSULTATION                        ║
║                           (MIS À JOUR)                           ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│                         INFORMATIONS PATIENT                      │
└──────────────────────────────────────────────────────────────────┘
  👤 Nom complet :     ${patient.name}
  🆔 ID Patient :      ${patient.id}
  📅 Âge :             ${patient.age}
  ⚥ Genre :           ${patient.genre}
  👨‍⚕️ Médecin :        Dr. Jean Dupont

┌──────────────────────────────────────────────────────────────────┐
│                      MOTIF & OBSERVATIONS                         │
└──────────────────────────────────────────────────────────────────┘
  📌 Motif :
     ${form.motif || 'Non spécifié'}

  🔍 Observations cliniques :
     ${form.observations || 'Non spécifiées'}

┌──────────────────────────────────────────────────────────────────┐
│                         DIAGNOSTIC CLINIQUE                       │
└──────────────────────────────────────────────────────────────────┘
  🏥 Diagnostic(s) :
     ${tags.map(t => `• ${t}`).join('\n     ') || 'Non spécifié'}

  ⚠️ Sévérité :        ${form.severite || 'Non spécifiée'}

┌──────────────────────────────────────────────────────────────────┐
│                         PLAN DE TRAITEMENT                        │
└──────────────────────────────────────────────────────────────────┘
  ${meds.length === 0 ? '  Aucun traitement prescrit' : meds.map(m => `
  💊 ${m.icon === 'pill' ? 'Médicament' : 'Examen/Labo'} : ${m.name}
     📋 Posologie : ${m.instruction}
  `).join('\n')}

┌──────────────────────────────────────────────────────────────────┐
│                         NOTES ADDITIONNELLES                      │
└──────────────────────────────────────────────────────────────────┘
  📝 ${form.notes || 'Aucune note'}

┌──────────────────────────────────────────────────────────────────┐
│                            HONORAIRES                             │
└──────────────────────────────────────────────────────────────────┘
  💰 Montant : ${form.montant ? `${form.montant} DA` : 'Non spécifié'}

┌──────────────────────────────────────────────────────────────────┐
│                      ÉCHANGES AVEC L'ASSISTANT IA                 │
└──────────────────────────────────────────────────────────────────┘
  ${chatSummary}

╔══════════════════════════════════════════════════════════════════╗
║  Consultation en cours - ${new Date().toLocaleDateString('fr-FR')}              ║
║  Dernière mise à jour : ${new Date().toLocaleTimeString('fr-FR')}                    ║
╚══════════════════════════════════════════════════════════════════╝
      `
      
      setGeneratedResume(updatedResume)
      setIsGeneratingResume(false)
      setShowResumeModal(true)
      // Don't clear chat conversation - keep it for reference
    }, 1500)
  }

  // Scroll to top of page when modal opens
  useEffect(() => {
    if (showResumeModal) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [showResumeModal])

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

  return (
    <div className="flex flex-col gap-5">
      {/* MODAL for resume generation */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  {isGeneratingResume ? 'Génération du résumé...' : 'Résumé de consultation'}
                </h3>
              </div>
              {!isGeneratingResume && (
                <button onClick={() => setShowResumeModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {isGeneratingResume ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-gray-500">Claude analyse la consultation...</p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-xl p-6 overflow-auto">
                  <pre className="text-gray-100 text-sm font-mono leading-relaxed whitespace-pre-wrap font-['Courier_New', 'Monaco', 'Menlo', monospace]">
                    {generatedResume}
                  </pre>
                </div>
              )}
            </div>
            
            {!isGeneratingResume && (
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={closeModalAndShowPanel}
                  className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                >
                  Fermer et afficher en bas
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient banner */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center gap-6">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-400">Patient</p>
          <p className="text-base font-bold text-gray-800">{patient.name}</p>
        </div>
        <div className="w-px h-8 bg-gray-100" />
        <div>
          <p className="text-xs text-gray-400">ID Patient</p>
          <p className="text-sm font-semibold text-gray-700">{patient.id}</p>
        </div>
        <div className="w-px h-8 bg-gray-100" />
        <div>
          <p className="text-xs text-gray-400">Âge</p>
          <p className="text-sm font-semibold text-gray-700">{patient.age}</p>
        </div>
        <div className="w-px h-8 bg-gray-100" />
        <div>
          <p className="text-xs text-gray-400">Genre</p>
          <p className="text-sm font-semibold text-gray-700">{patient.genre}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full">
            Consultation en cours
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full">
            Dr. Jean Dupont
          </span>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex gap-5 items-start">
        {/* Left — form sections */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Section 1 — Motif & Observations */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">1</div>
              <h2 className="text-base font-bold text-gray-800">Motif & Observations</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-500">Motif de consultation</label>
                <input
                  type="text"
                  name="motif"
                  value={form.motif}
                  onChange={handle}
                  placeholder="Ex: Douleurs thoraciques persistantes"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-500">Observations cliniques</label>
                <textarea
                  name="observations"
                  value={form.observations}
                  onChange={handle}
                  placeholder="Décrivez les symptômes et signes vitaux..."
                  rows={4}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2 — Diagnostic */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">2</div>
              <h2 className="text-base font-bold text-gray-800">Diagnostic Clinique</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-500">Diagnostic Principal</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <input
                    type="text"
                    name="diagnostic"
                    value={form.diagnostic}
                    onChange={handle}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    placeholder="Rechercher CIM-10..."
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-300 outline-none"
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.map(t => (
                    <span key={t} className="flex items-center gap-1.5 bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {t}
                      <button onClick={() => removeTag(t)} className="hover:text-indigo-800">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={addTag}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Ajouter
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-500">Sévérité</label>
                <div className="flex items-center gap-6">
                  {['Modéré', 'Sévère'].map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="severite"
                        value={s}
                        checked={form.severite === s}
                        onChange={handle}
                        className="accent-indigo-600"
                      />
                      <span className="text-sm text-gray-600">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 — Plan de traitement */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">3</div>
                <h2 className="text-base font-bold text-gray-800">Plan de traitement</h2>
              </div>
              <button
                onClick={() => setShowMedForm(!showMedForm)}
                className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 text-sm font-medium transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Ajouter un médicament
              </button>
            </div>

            {showMedForm && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-5">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">
                  Nouveau médicament / examen
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Filtrer par catégorie
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                          ${selectedCategory === ''
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
                          }`}
                      >
                        Tous
                      </button>
                      {MEDICINE_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                            ${selectedCategory === cat
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Sélectionner depuis la liste
                    </label>
                    <select
                      onChange={e => {
                        const selected = COMMON_MEDICINES.find(m => m.name === e.target.value)
                        if (selected) {
                          setNewMed(prev => ({
                            ...prev,
                            name: selected.name,
                            icon: selected.icon,
                            instruction: '',
                          }))
                        }
                      }}
                      className="bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
                    >
                      <option value="">— Choisir un médicament courant —</option>
                      {COMMON_MEDICINES
                        .filter(m => selectedCategory === '' || m.category === selectedCategory)
                        .map(m => (
                          <option key={m.name} value={m.name}>
                            {m.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-indigo-200" />
                    <span className="text-xs text-indigo-400 font-medium">ou saisir manuellement</span>
                    <div className="flex-1 h-px bg-indigo-200" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Nom du médicament / examen <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMed.name}
                      onChange={e => setNewMed(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Amoxicilline 500mg, Bilan hépatique..."
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Posologie / Instructions{' '}
                      <span className="text-red-400">*</span>
                      <span className="text-gray-400 font-normal ml-1">(à saisir par le médecin)</span>
                    </label>
                    <input
                      type="text"
                      value={newMed.instruction}
                      onChange={e => setNewMed(prev => ({ ...prev, instruction: e.target.value }))}
                      placeholder="Ex: 1 comprimé 3x/jour après repas pendant 7 jours"
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <div className="flex items-center gap-3">
                      {[
                        { value: 'pill', label: 'Médicament',  emoji: '💊' },
                        { value: 'lab',  label: 'Examen / Labo', emoji: '🔬' },
                      ].map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setNewMed(prev => ({ ...prev, icon: t.value }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors
                            ${newMed.icon === t.value
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                            }`}
                        >
                          <span style={{ fontSize: 14 }}>{t.emoji}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={addMedicine}
                      disabled={!newMed.name.trim() || !newMed.instruction.trim()}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Ajouter
                    </button>
                    <button
                      onClick={() => {
                        setShowMedForm(false)
                        setNewMed({ name: '', instruction: '', icon: 'pill' })
                        setSelectedCategory('')
                      }}
                      className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {meds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                <p className="text-sm">Aucun médicament ajouté</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {meds.map(m => (
                  <div key={m.id} className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500 flex-shrink-0">
                      {m.icon === 'pill' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M12 8v8M8 12h8" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.instruction}</p>
                    </div>
                    <button className="text-gray-300 hover:text-indigo-500 transition-colors p-1">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button onClick={() => removeMed(m.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4 — Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">4</div>
              <h2 className="text-base font-bold text-gray-800">Notes Additionnelles</h2>
            </div>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handle}
              placeholder="Recommandations hygiéno-diététiques, notes pour le secrétariat..."
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors resize-none"
            />
          </div>

          {/* Section 5 — Honoraires */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">5</div>
              <h2 className="text-base font-bold text-gray-800">Honoraires</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Montant (DA) <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 transition-colors">
                  <input
                    type="number"
                    name="montant"
                    value={form.montant}
                    onChange={handle}
                    placeholder="0"
                    min="0"
                    className="flex-1 bg-transparent text-lg font-bold text-gray-700 placeholder-gray-300 outline-none"
                  />
                  <span className="text-sm font-semibold text-gray-400">DA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-3 pb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveConsultation}
              className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
              </svg>
              Enregistrer la consultation
            </button>
          </div>
        </div>

        {/* Right — AI Assistant panel */}
        <div className="w-80 flex-shrink-0 sticky top-20">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Assistant IA</p>
                  <p className="text-indigo-200 text-xs">Analyse en temps réel</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Résumé automatique
                </p>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    "Le patient présente une tension artérielle élevée (155/90) associée à des céphalées matinales. Un traitement par Lisinopril est initié avec suivi biologique..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Panel at bottom - shown after modal is closed */}
      {showResumePanel && (
        <div ref={panelRef} id="resume-panel" className="mt-5 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Résumé de consultation</p>
                <p className="text-indigo-200 text-xs">Généré par IA</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={regenerateResumeWithChat}
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors flex items-center gap-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Régénérer le résumé
              </button>
              <button
                onClick={() => setShowResumePanel(false)}
                className="text-white/70 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gray-900 rounded-xl p-6 overflow-auto max-h-[500px]">
              <pre className="text-gray-100 text-sm font-mono leading-relaxed whitespace-pre-wrap font-['Courier_New', 'Monaco', 'Menlo', monospace]">
                {generatedResume}
              </pre>
            </div>

            {/* Chat section for the resume panel */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">💬 Discuter avec l'IA à propos de cette consultation</p>
              </div>

              {/* Chat messages */}
              {chatConversation.length > 0 && (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-xl">
                  {chatConversation.map((m, i) => (
                    <div key={i} className={`text-sm px-3 py-2 rounded-xl ${
                      m.role === 'user'
                        ? 'bg-indigo-100 text-indigo-700 self-end ml-8'
                        : 'bg-white border border-gray-200 text-gray-600 self-start mr-8'
                    }`}>
                      <span className="font-bold text-xs block mb-1">
                        {m.role === 'user' ? '👨‍⚕️ Médecin' : '🤖 IA'}
                      </span>
                      {m.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Chat input */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <input
                  type="text"
                  value={aiChat}
                  onChange={e => setAiChat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
                  placeholder="Posez une question sur le traitement, les risques, les examens..."
                  className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                />
                <button
                  onClick={sendAiMessage}
                  disabled={!aiChat.trim()}
                  className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* <p className="text-xs text-gray-400 mt-3 text-center">
                💡 Astuce: Posez vos questions, puis cliquez sur "Régénérer le résumé" pour intégrer les réponses
              </p> */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}