import { useRef } from 'react'

export default function Step3Documents({ form, updateForm }) {
  const fileRef = useRef()

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files)
    const newDocs = files.map((f) => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.type,
    }))
    updateForm({ documents: [...form.documents, ...newDocs] })
  }

  const removeDoc = (index) => {
    updateForm({ documents: form.documents.filter((_, i) => i !== index) })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-indigo-600 rounded-full" />
        <h2 className="text-xl font-bold text-gray-800">3- Documents & Notes</h2>
      </div>

      <div className="flex flex-col gap-6">

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-50 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-indigo-600">
            Cliquez pour importer des documents
          </p>
          <p className="text-xs text-gray-400">PDF, JPG, PNG — max 10 MB</p>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileAdd}
          />
        </div>

        {/* Document list */}
        {form.documents.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Fichiers ajoutés ({form.documents.length})
            </p>
            {form.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400">{doc.size}</p>
                </div>
                <button
                  onClick={() => removeDoc(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Observations */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
            Observations générales
          </label>
          <textarea
            name="observations"
            value={form.observations}
            onChange={(e) => updateForm({ observations: e.target.value })}
            placeholder="Observations et remarques générales sur le dossier..."
            rows={5}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors resize-none"
          />
        </div>

      </div>
    </div>
  )
}