export default function Step4Consultation({ form, updateForm }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Motif de consultation</label>
          <input
            type="text"
            value={form.motif}
            onChange={(e) => updateForm({ motif: e.target.value })}
            placeholder="Ex: Douleur thoracique"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Sévérité</label>
          <select
            value={form.severite}
            onChange={(e) => updateForm({ severite: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">Sélectionner</option>
            <option value="Faible">Faible</option>
            <option value="Modérée">Modérée</option>
            <option value="Élevée">Élevée</option>
            <option value="Urgente">Urgente</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Diagnostic</label>
        <textarea
          value={form.diagnostic}
          onChange={(e) => updateForm({ diagnostic: e.target.value })}
          rows="3"
          placeholder="Entrez le diagnostic..."
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Notes de consultation</label>
        <textarea
          value={form.consultationNotes}
          onChange={(e) => updateForm({ consultationNotes: e.target.value })}
          rows="3"
          placeholder="Observations supplémentaires..."
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Montant (DA)</label>
          <input
            type="number"
            value={form.montant}
            onChange={(e) => updateForm({ montant: e.target.value })}
            placeholder="0.00"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Mode de Paiement</label>
          <select
            value={form.modePaiement}
            onChange={(e) => updateForm({ modePaiement: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
          >
            <option value="especes">Espèces</option>
            <option value="carte">Carte Bancaire</option>
            <option value="cheque">Chèque</option>
          </select>
        </div>
      </div>
    </div>
  )
}
