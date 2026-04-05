import { useParams, useNavigate } from 'react-router-dom'
import { useRef } from 'react'

const MOCK_REPORT = {
  id:            'EH-9281',
  date:          '24 Octobre 2023',
  doctor:        'Dr. Jean Dupont',
  specialty:     'Cardiologie',
  patient: {
    name:        'Jean Dupont',
    id:          'PT-4402',
    age:         '31 ans',
    genre:       'Homme',
    telephone:   '0550 12 34 56',
    adresse:     '12 Rue des Oliviers, Alger Centre',
  },
  motif:         'Douleurs thoraciques persistantes depuis 3 jours avec essoufflement à l\'effort.',
  observations:  'Tension artérielle : 155/90 mmHg. Fréquence cardiaque : 88 bpm. Patient conscient, orienté. Légère dyspnée à l\'effort. Auscultation : souffle systolique grade 2.',
  diagnostics: [
    { code: 'I10',   label: 'Hypertension artérielle essentielle' },
    { code: 'R07.9', label: 'Douleur thoracique, sans précision'   },
  ],
  severite:      'Modérée',
  traitements: [
    { name: 'Lisinopril 10mg',       instruction: '1 comprimé par jour — Le matin', type: 'Médicament' },
    { name: 'Bilan sanguin complet', instruction: 'À réaliser sous 72h à jeun',     type: 'Examen'     },
  ],
  notes:         'Recommander une alimentation pauvre en sel. Éviter les efforts intenses. Contrôle tensionnel dans 2 semaines. Orienter vers cardiologue si pas d\'amélioration.',
  aiSummary:     'Le patient présente une tension artérielle élevée (155/90) associée à des céphalées matinales et une dyspnée à l\'effort. Les antécédents familiaux d\'hypertension et le profil lipidique suggèrent un risque cardiovasculaire modéré. Un traitement par Lisinopril est initié avec suivi biologique et contrôle tensionnel à 2 semaines.',
  aiSuggestions: [
    { title: 'Risque de Diabète Type 2',      desc: 'Antécédents familiaux et IMC à surveiller. Envisager HbA1c.',       color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
    { title: 'Interaction Médicamenteuse',    desc: 'Lisinopril + suppléments potassium — surveiller kaliémie.',         color: 'bg-cyan-50 border-cyan-200 text-cyan-700'       },
    { title: 'Suivi cardiologique recommandé',desc: 'Souffle systolique détecté. Échocardiographie conseillée.',         color: 'bg-amber-50 border-amber-200 text-amber-700'    },
  ],
  generatedAt:   '24 Oct 2023 à 14h32',
}

export default function ConsultationReport() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const printRef = useRef()

  const report = MOCK_REPORT

  const handlePrint = () => window.print()

  const handleDownload = () => {
    const content = printRef.current.innerHTML
    const blob = new Blob([`
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Rapport Consultation ${report.id}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 13px; color: #1f2937; padding: 32px; }
            h1   { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
            h2   { font-size: 15px; font-weight: bold; margin: 20px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
            p    { margin: 4px 0; line-height: 1.6; }
            .badge { display: inline-block; background: #eef2ff; color: #4338ca; padding: 2px 10px; border-radius: 99px; font-size: 12px; margin: 2px; }
            .row  { display: flex; gap: 40px; margin-bottom: 16px; }
            .col  { flex: 1; }
            .tag  { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 3px 10px; border-radius: 6px; font-size: 12px; margin: 2px; }
            .ai-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th    { text-align: left; font-size: 11px; color: #6b7280; text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
            td    { padding: 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href    = url
    a.download = `rapport-${report.id}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="flex flex-col gap-5">

        {/* Page header — no print */}
        <div className="no-print flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 text-sm font-medium mb-2 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Rapport de Consultation{' '}
              <span className="text-indigo-500">#{report.id}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Généré par l'IA le {report.generatedAt}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Imprimer
            </button>
          </div>
        </div>

        {/* Report card */}
        <div ref={printRef} className="print-area bg-white rounded-2xl border border-gray-100 overflow-hidden">

          {/* Report header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-xs uppercase tracking-widest font-semibold mb-1">
                  Rapport de Consultation IA
                </p>
                <h2 className="text-white text-2xl font-bold">Med-IA</h2>
                <p className="text-indigo-200 text-sm mt-0.5">Gestion Cabinaire</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">#{report.id}</p>
                <p className="text-indigo-200 text-sm">{report.date}</p>
                <p className="text-indigo-200 text-sm">{report.doctor} — {report.specialty}</p>
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col gap-8">

            {/* Patient info */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" />
                </svg>
                Informations Patient
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Nom complet', value: report.patient.name    },
                  { label: 'ID Patient',  value: report.patient.id      },
                  { label: 'Âge',         value: report.patient.age     },
                  { label: 'Genre',       value: report.patient.genre   },
                  { label: 'Téléphone',   value: report.patient.telephone },
                  { label: 'Adresse',     value: report.patient.adresse },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                    <p className="text-sm font-semibold text-gray-700">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Motif + Observations */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Motif de consultation
                </h3>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                  {report.motif}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Observations cliniques
                </h3>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                  {report.observations}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Diagnostics */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Diagnostics
              </h3>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {report.diagnostics.map(d => (
                  <span key={d.code} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full">
                    <span className="text-indigo-400">{d.code}</span>
                    {d.label}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Sévérité :</span>
                <span className="text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full">
                  {report.severite}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Treatment plan */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Plan de traitement
              </h3>
              <div className="flex flex-col gap-2">
                {report.traitements.map((t, i) => (
                  <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg">
                      {t.type}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Notes */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Notes & Recommandations
              </h3>
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                {report.notes}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* AI section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
                  Analyse & Résumé IA
                </h3>
              </div>

              {/* AI Summary */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-indigo-700 italic leading-relaxed">
                  "{report.aiSummary}"
                </p>
              </div>

              {/* AI Suggestions */}
              <div className="grid grid-cols-3 gap-3">
                {report.aiSuggestions.map((s, i) => (
                  <div key={i} className={`border rounded-xl p-4 ${s.color}`}>
                    <p className="text-xs font-bold mb-1">{s.title}</p>
                    <p className="text-xs leading-relaxed opacity-80">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-6 text-xs text-gray-400">
                <span>ID Consultation : <span className="font-bold text-gray-600">#{report.id}</span></span>
                <span>Date : <span className="font-medium text-gray-600">{report.date}</span></span>
                <span>Médecin : <span className="font-medium text-gray-600">{report.doctor}</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Document confidentiel — usage médical uniquement
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}