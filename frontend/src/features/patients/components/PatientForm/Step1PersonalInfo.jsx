export default function Step1PersonalInfo({ form, updateForm }) {
  const handle = (e) => updateForm({ [e.target.name]: e.target.value })

  return (
    <div>
      {/* Section title */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-indigo-600 rounded-full" />
        <h2 className="text-xl font-bold text-gray-800">1- Informations Personnelles</h2>
      </div>

      <div className="flex flex-col gap-6">

        {/* Carte Chifa + Civilité */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              N° Carte Chifa
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <input
                type="text"
                name="carteChifa"
                value={form.carteChifa}
                onChange={handle}
                placeholder="0000 0000 0000 0000"
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Civilité
            </label>
            <select
              name="civilite"
              value={form.civilite}
              onChange={handle}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
            >
              <option value="Mr">Mr</option>
              <option value="Mme">Mme</option>
              <option value="Dr">Dr</option>
              <option value="Pr">Pr</option>
            </select>
          </div>
        </div>

        {/* Nom + Prénom + Age */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Nom (*)
            </label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handle}
              placeholder="Ex: BOUDIAF"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Prénom (*)
            </label>
            <input
              type="text"
              name="prenom"
              value={form.prenom}
              onChange={handle}
              placeholder="Ex: Amine"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Age (*)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 flex-1">
                <input
                  type="number"
                  name="ageAns"
                  value={form.ageAns}
                  onChange={handle}
                  placeholder="Ans"
                  min="0"
                  className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                />
                <span className="text-xs text-gray-400">ans</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 flex-1">
                <input
                  type="number"
                  name="ageMois"
                  value={form.ageMois}
                  onChange={handle}
                  placeholder="Mois"
                  min="0"
                  max="11"
                  className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                />
                <span className="text-xs text-gray-400">mois</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profession + Sit. Familiale + NB Enfants */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={form.profession}
              onChange={handle}
              placeholder="Ex: Enseignant"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Sit. Familiale
            </label>
            <select
              name="sitFamiliale"
              value={form.sitFamiliale}
              onChange={handle}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
            >
              <option>Célibataire</option>
              <option>Marié(e)</option>
              <option>Divorcé(e)</option>
              <option>Veuf/Veuve</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              NB Enfants
            </label>
            <input
              type="number"
              name="nbEnfants"
              value={form.nbEnfants}
              onChange={handle}
              min="0"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 outline-none focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {/* Téléphone + Adresse */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Téléphone
            </label>
            <input
              type="tel"
              name="telephone"
              value={form.telephone}
              onChange={handle}
              placeholder="0X XX XX XX XX"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              value={form.adresse}
              onChange={handle}
              placeholder="Adresse complète..."
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

      </div>
    </div>
  )
}