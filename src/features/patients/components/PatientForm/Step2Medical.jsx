export default function Step2Medical({ form, updateForm, imc }) {
  const handle = (e) => updateForm({ [e.target.name]: e.target.value })

  const getImcLabel = (val) => {
    if (!val) return null
    const v = parseFloat(val)
    if (v < 18.5) return { label: 'Insuffisance pondérale', color: 'text-blue-500' }
    if (v < 25)   return { label: 'Poids normal',           color: 'text-green-500' }
    if (v < 30)   return { label: 'Surpoids',               color: 'text-amber-500' }
    return              { label: 'Obésité',                 color: 'text-red-500'   }
  }

  const imcInfo = getImcLabel(imc)

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-indigo-600 rounded-full" />
        <h2 className="text-xl font-bold text-gray-800">2- Consultation & Médical</h2>
      </div>

      <div className="flex flex-col gap-6">

        {/* Poids + Taille + IMC */}
        <div className="grid grid-cols-3 gap-4">

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
              Poids (kg)
            </p>
            <div className="flex items-end gap-2">
              <input
                type="number"
                name="poids"
                value={form.poids}
                onChange={handle}
                placeholder="0.0"
                step="0.1"
                min="0"
                className="bg-transparent text-3xl font-bold text-gray-700 outline-none w-full placeholder-gray-300"
              />
              <span className="text-sm text-gray-400 mb-1">kg</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
              Taille (cm)
            </p>
            <div className="flex items-end gap-2">
              <input
                type="number"
                name="taille"
                value={form.taille}
                onChange={handle}
                placeholder="0"
                min="0"
                className="bg-transparent text-3xl font-bold text-gray-700 outline-none w-full placeholder-gray-300"
              />
              <span className="text-sm text-gray-400 mb-1">cm</span>
            </div>
          </div>

          <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-cyan-600 tracking-widest uppercase mb-3">
              IMC Calculé
            </p>
            <p className="text-3xl font-bold text-cyan-700">
              {imc ?? '-.-'}
            </p>
            {imcInfo && (
              <p className={`text-xs mt-1 font-medium ${imcInfo.color}`}>
                {imcInfo.label}
              </p>
            )}
          </div>
        </div>

        {/* Antécédents personnels */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
            Antécédents Personnels
          </label>
          <textarea
            name="antecedentsPerso"
            value={form.antecedentsPerso}
            onChange={handle}
            placeholder="Pathologies chroniques, chirurgies, allergies..."
            rows={4}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors resize-none"
          />
        </div>

        {/* Antécédents familiaux */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
            Antécédents Familiaux
          </label>
          <textarea
            name="antecedentsFamiliaux"
            value={form.antecedentsFamiliaux}
            onChange={handle}
            placeholder="Hérédité, pathologies récurrentes dans la famille..."
            rows={4}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors resize-none"
          />
        </div>

        {/* Note / Observations */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
            Note / Observations
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handle}
            placeholder="Notes additionnelles sur le patient..."
            rows={4}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors resize-none"
          />
        </div>

        {/* Qualité des Soins banner */}
        <div className="relative bg-gray-100 rounded-2xl overflow-hidden p-8 mt-2">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <svg width="300" height="120" viewBox="0 0 300 120" fill="none" stroke="#6366f1" strokeWidth="1">
              <path d="M0 60 Q75 20 150 60 T300 60" />
              <path d="M0 80 Q75 40 150 80 T300 80" />
              <path d="M0 40 Q75 0 150 40 T300 40" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-indigo-600 mb-2 relative z-10">
            Qualité des Soins
          </h3>
          <p className="text-sm text-gray-500 italic relative z-10">
            "La précision du dossier patient est le premier pas vers un traitement réussi."
          </p>
        </div>

      </div>
    </div>
  )
}