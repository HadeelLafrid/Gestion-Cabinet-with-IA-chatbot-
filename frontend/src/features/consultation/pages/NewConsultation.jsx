import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { COMMON_MEDICINES, MEDICINE_CATEGORIES } from '../../../constants/medicines'

const MOCK_PATIENTS = {
  'PT-4401': { name: 'Lafrid hadil',  id: '4401-X', age: '42 ans', genre: 'Femme' },
  'PT-4402': { name: 'Jean Dupont',     id: '4402-X', age: '31 ans', genre: 'Homme' },
  'PT-4403': { name: 'Robert Martin',   id: '4403-X', age: '68 ans', genre: 'Homme' },
  'PT-4404': { name: 'Alice Dubois',    id: '4404-X', age: '25 ans', genre: 'Femme' },
  'PT-4405': { name: 'Sophie Girard',   id: '4405-X', age: '54 ans', genre: 'Femme' },
  'PT-4406': { name: 'Pierre Bernard',  id: '4406-X', age: '47 ans', genre: 'Homme' },
  'PT-4407': { name: 'Karim Benali',    id: '4407-X', age: '38 ans', genre: 'Homme' },
}



const MOCK_MEDICATIONS = [
  { id: 1, name: 'Lisinopril 10mg',      instruction: '1 comprimé par jour - Le matin', icon: 'pill'  },
  { id: 2, name: 'Bilan sanguin complet', instruction: 'À réaliser sous 72h à jeun',      icon: 'lab'   },
]

export default function NewConsultation() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const patient  = MOCK_PATIENTS[patientId] || MOCK_PATIENTS['PT-4402']
  const addMedicine = () => {
  if (!newMed.name.trim() || !newMed.instruction.trim()) return
  setMeds(prev => [...prev, { id: Date.now(), ...newMed }])
  setNewMed({ name: '', instruction: '', icon: 'pill' })
  setShowMedForm(false)
}

  const [form, setForm] = useState({
    motif:         '',
    observations:  '',
    diagnostic:    '',
    severite:      '',
    notes:         '',
    montant:      '',
  modePaiement: 'especes',
  })
  const [tags,   setTags]   = useState(['I10 - Hypertension'])
  const [meds,   setMeds]   = useState(MOCK_MEDICATIONS)
  const [aiChat, setAiChat] = useState('')
  const [aiMessages, setAiMessages] = useState([])
const [showMedForm, setShowMedForm] = useState(false)
const [newMed,      setNewMed]      = useState({ name: '', instruction: '', icon: 'pill' })
const [selectedCategory, setSelectedCategory] = useState('')
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t))
  const addTag    = () => {
    if (form.diagnostic.trim()) {
      setTags(prev => [...prev, form.diagnostic.trim()])
      setForm(f => ({ ...f, diagnostic: '' }))
    }
  }

  const removeMed = (id) => setMeds(prev => prev.filter(m => m.id !== id))

  const sendAiMessage = () => {
    if (!aiChat.trim()) return
    setAiMessages(prev => [...prev, { role: 'user', text: aiChat }])
    setAiChat('')
    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        role: 'ai',
        text: "Sur la base des informations de consultation, je recommande de vérifier les valeurs de tension artérielle et d'envisager un bilan lipidique complet.",
      }])
    }, 800)
  }

  return (
    <div className="flex flex-col gap-5">

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
                {/* Tags */}
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
              {/* Sévérité */}
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

  {/* Add medicine form */}
  {showMedForm && (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-5">
      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">
        Nouveau médicament / examen
      </p>
      <div className="flex flex-col gap-4">

        {/* Step 1 — filter by category */}
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

        {/* Step 2 — pick from filtered list */}
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
                  instruction: '', // always empty — doctor must type
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

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-indigo-200" />
          <span className="text-xs text-indigo-400 font-medium">ou saisir manuellement</span>
          <div className="flex-1 h-px bg-indigo-200" />
        </div>

        {/* Manual name input */}
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

        {/* Posologie — always typed by doctor */}
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

        {/* Type selector */}
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

        {/* Buttons */}
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

  {/* Medicine list */}
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
    {/* <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500">Mode de paiement</label>
      <select
        name="modePaiement"
        value={form.modePaiement}
        onChange={handle}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
      >
        <option value="especes">Espèces</option>
        <option value="carte">Carte bancaire</option>
        <option value="virement">Virement</option>
        <option value="cheque">Chèque</option>
        <option value="cnas">CNAS</option>
      </select>
    </div> */}
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
              onClick={() => alert('Consultation enregistrée !')}
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

            {/* AI header */}
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

              {/* REMOVED: Suggestions section */}

              {/* Auto summary */}
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

              {/* AI Chat messages */}
              {aiMessages.length > 0 && (
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {aiMessages.map((m, i) => (
                    <div key={i} className={`text-xs px-3 py-2 rounded-xl ${
                      m.role === 'user'
                        ? 'bg-indigo-100 text-indigo-700 self-end ml-4'
                        : 'bg-gray-100 text-gray-600 self-start mr-4'
                    }`}>
                      {m.text}
                    </div>
                  ))}
                </div>
              )}

              {/* AI Chat input */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <input
                  type="text"
                  value={aiChat}
                  onChange={e => setAiChat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
                  placeholder="Poser une question à l'IA..."
                  className="flex-1 bg-transparent text-xs text-gray-600 placeholder-gray-300 outline-none"
                />
                <button
                  onClick={sendAiMessage}
                  disabled={!aiChat.trim()}
                  className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}