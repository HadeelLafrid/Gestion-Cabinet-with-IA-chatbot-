import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../../../services/apiClient'

export default function ConsultationReport() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const printRef = useRef()

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)
  const [generatedResume, setGeneratedResume] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await apiClient.get(`/consultations/${id}`)
        const data = response.data

        // Map API data to match frontend expectations
        setReport({
          id: data.id ? `EH-${data.id}` : 'N/A',
          date: data.consultation_date ? new Date(data.consultation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Inconnue',
          doctor: 'Dr. Jean Dupont',
          specialty: 'Cardiologie',
          patient: {
            name: data.patient ? `${data.patient.first_name || ''} ${data.patient.last_name || ''}`.trim() : 'Patient Inconnu',
            id: data.patient?.id ? `PT-${data.patient.id}` : 'N/A',
            age: data.patient?.age ? `${data.patient.age} ans` : 'N/A',
            genre: data.patient?.gender === 'male' ? 'Homme' : data.patient?.gender === 'female' ? 'Femme' : 'N/A',
            telephone: data.patient?.phone || '—',
            adresse: data.patient?.address || '—',
          },
          motif: data.motif || 'Aucun motif spécifié',
          observations: data.clinical_observation || 'Aucune observation spécifiée',
          diagnostics: data.diagnosis ? data.diagnosis.split(',').map(d => ({ code: 'CIM-10', label: d.trim() })) : [],
          severite: data.severity || 'Modérée',
          traitements: [
            ...(data.medicines || []).map(m => ({
              name: m.medicine_name,
              instruction: m.dosage || '',
              type: 'Médicament'
            })),
            ...(data.exams || []).map(e => ({
              name: e.exam_name,
              instruction: e.notes || '',
              type: 'Examen'
            }))
          ],
          notes: data.additional_notes || 'Aucune note',
          aiSummary: data.clinical_observation || 'Résumé non disponible.',
          aiSuggestions: [],
          generatedAt: data.consultation_date ? new Date(data.consultation_date).toLocaleDateString('fr-FR') : 'N/A',
        })
      } catch (error) {
        console.error("Error fetching consultation report", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReport()
    }
  }, [id])

  const buildResumeText = () => {
    const aiText = generatedResume || report.aiSummary || 'Résumé non disponible.'
    return {
      aiText,
      title: `Résumé de consultation - ${report.id}`,
      subtitle: `${report.patient.name} · ${report.date}`,
      diagnoses: report.diagnostics.map((d) => d.label),
    }
  }

  const handlePrint = () => {
    if (!report) return

    const printWindow = window.open('', '_blank', 'width=1200,height=900')
    if (!printWindow) {
      alert("Impossible d'ouvrir la fenêtre d'impression. Vérifiez le blocage des pop-ups.")
      return
    }

    const { aiText } = buildResumeText()
    const diagnosisList = report.diagnostics.length
      ? report.diagnostics.map((d) => `<span class="tag"><strong>${d.code}</strong> ${d.label}</span>`).join('')
      : '<p class="muted">Aucun diagnostic renseigné</p>'

    const treatmentList = report.traitements.length
      ? report.traitements.map((t) => `<div class="item"><span class="pill">${t.type}</span><div><strong>${t.name}</strong><div class="muted">${t.instruction || '—'}</div></div></div>`).join('')
      : '<p class="muted">Aucun traitement renseigné</p>'

    printWindow.document.write(`
      <html>
        <head>
          <title>${report.id}</title>
          <style>
            @page { size: A4; margin: 14mm; }
            body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; background: #fff; }
            .sheet { max-width: 800px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; padding: 24px; border-radius: 18px; }
            .header-top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
            .kicker { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #c7d2fe; margin-bottom: 8px; }
            .title { font-size: 24px; font-weight: 800; margin: 0; }
            .meta { text-align: right; font-size: 12px; color: #e0e7ff; line-height: 1.6; }
            .section { margin-top: 18px; padding: 18px; border: 1px solid #e5e7eb; border-radius: 16px; background: #fff; }
            .section-title { font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #6b7280; margin: 0 0 12px; }
            .resume-box { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 16px; white-space: pre-wrap; line-height: 1.8; font-size: 13px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .card { background: #f9fafb; border: 1px solid #eef2f7; border-radius: 12px; padding: 10px 12px; }
            .label { font-size: 10px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 6px; }
            .value { font-size: 13px; font-weight: 700; color: #111827; }
            .twocol { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .box { background: #f9fafb; border-radius: 12px; border: 1px solid #eef2f7; padding: 12px 14px; min-height: 72px; }
            .tag { display: inline-flex; gap: 6px; align-items: center; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; border-radius: 999px; padding: 7px 12px; margin: 0 8px 8px 0; font-size: 12px; font-weight: 700; }
            .pill { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 999px; font-size: 10px; font-weight: 800; margin-right: 8px; }
            .item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .item:last-child { border-bottom: 0; }
            .muted { color: #6b7280; font-size: 12px; line-height: 1.6; }
            .footer { margin-top: 18px; display: flex; justify-content: space-between; gap: 12px; font-size: 10px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div class="header-top">
                <div>
                  <div class="kicker">Résumé médical IA</div>
                  <h1 class="title">${report.id}</h1>
                  <div style="margin-top:8px;font-size:13px;color:#eef2ff;font-weight:700;">${report.patient.name}</div>
                </div>
                <div class="meta">
                  <div>${report.date}</div>
                  <div>${report.doctor}</div>
                  <div>${report.specialty}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Synthèse clinique</div>
              <div class="resume-box">${aiText.replace(/\n/g, '<br/>')}</div>
            </div>

            <div class="section">
              <div class="section-title">Informations patient</div>
              <div class="grid">
                <div class="card"><div class="label">Nom complet</div><div class="value">${report.patient.name}</div></div>
                <div class="card"><div class="label">ID Patient</div><div class="value">${report.patient.id}</div></div>
                <div class="card"><div class="label">Âge</div><div class="value">${report.patient.age}</div></div>
                <div class="card"><div class="label">Genre</div><div class="value">${report.patient.genre}</div></div>
                <div class="card"><div class="label">Téléphone</div><div class="value">${report.patient.telephone}</div></div>
                <div class="card"><div class="label">Adresse</div><div class="value">${report.patient.adresse}</div></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Motif et observations</div>
              <div class="twocol">
                <div class="box"><div class="label">Motif</div><div class="value">${report.motif}</div></div>
                <div class="box"><div class="label">Observations cliniques</div><div class="value">${report.observations}</div></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Diagnostics</div>
              <div>${diagnosisList}</div>
              <div style="margin-top:10px;"><span class="muted">Sévérité :</span> <strong>${report.severite}</strong></div>
            </div>

            <div class="section">
              <div class="section-title">Plan de traitement</div>
              <div>${treatmentList}</div>
            </div>

            <div class="section">
              <div class="section-title">Notes & recommandations</div>
              <div class="box">${report.notes}</div>
            </div>

            <div class="footer">
              <div>ID Consultation: ${report.id}</div>
              <div>Date: ${report.date}</div>
              <div>Document confidentiel — usage médical uniquement</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
            window.onafterprint = function() { window.close(); };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleGenerateResume = async () => {
    if (!report) return

    setIsGeneratingResume(true)
    try {
      const payload = {
        patient_name: report.patient.name || 'Non spécifié',
        patient_id: report.patient.id || 'Non spécifié',
        age: report.patient.age || 'Non spécifié',
        gender: report.patient.genre || 'Non spécifié',
        motif: report.motif || '',
        observations: report.observations || '',
        diagnostic: report.diagnostics.map((d) => d.label),
        severite: report.severite || '',
        treatments: report.traitements.map((item) => ({
          name: item.name,
          instruction: item.instruction || '',
        })),
        notes: report.notes || '',
        chat_history: [],
        montant: 'Non spécifié',
      }

      const response = await apiClient.post('/api/ai/resume/generate', payload)
      setGeneratedResume(response.data.resume_text || '')
    } catch (error) {
      console.error('Error generating consultation resume', error)
      alert("L'IA n'a pas pu générer le résumé de consultation.")
    } finally {
      setIsGeneratingResume(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!printRef.current || !report) return

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const marginX = 14
      const pageWidth = 210
      const contentWidth = pageWidth - marginX * 2
      let cursorY = 0
      const pageBottom = 282
      const colors = {
        navy: [15, 23, 42],
        indigo: [79, 70, 229],
        indigoSoft: [238, 242, 255],
        slate: [100, 116, 139],
        border: [226, 232, 240],
        paper: [249, 250, 251],
        warning: [245, 158, 11],
      }

      const { aiText } = buildResumeText()
      const addPageHeader = () => {
        doc.setFillColor(...colors.navy)
        doc.rect(0, 0, pageWidth, 42, 'F')
        doc.setFillColor(...colors.indigo)
        doc.rect(0, 0, pageWidth, 8, 'F')

        doc.setFillColor(255, 255, 255)
        doc.circle(marginX + 10, 22, 7, 'F')
        doc.setTextColor(...colors.indigo)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('MIA', marginX + 10, 23.4, { align: 'center' })

        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(17)
        doc.text(`Résumé de consultation - ${report.id}`, marginX + 22, 18)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`${report.patient.name}`, marginX + 22, 26)
        doc.text(`${report.date}  •  ${report.doctor}  •  ${report.specialty}`, marginX + 22, 32)

        doc.setFillColor(255, 255, 255)
        doc.roundedRect(pageWidth - 62, 12, 48, 24, 4, 4, 'F')
        doc.setTextColor(...colors.navy)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.text('DOCUMENT', pageWidth - 38, 20, { align: 'center' })
        doc.setFontSize(7.2)
        doc.setFont('helvetica', 'normal')
        doc.text('CONFIDENTIAL', pageWidth - 38, 25, { align: 'center' })
        doc.text('USAGE MÉDICAL', pageWidth - 38, 29.5, { align: 'center' })

        doc.setTextColor(31, 41, 55)
        cursorY = 48
      }

      const ensureSpace = (needed) => {
        if (cursorY + needed > pageBottom) {
          doc.addPage()
          addPageHeader()
        }
      }

      const addSectionTitle = (title) => {
        ensureSpace(14)
        doc.setFillColor(...colors.indigoSoft)
        doc.roundedRect(marginX, cursorY - 1, 66, 8, 2, 2, 'F')
        doc.setDrawColor(199, 210, 254)
        doc.setLineWidth(0.4)
        doc.line(marginX, cursorY + 10, marginX + contentWidth, cursorY + 10)
        doc.setTextColor(...colors.indigo)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        doc.text(title.toUpperCase(), marginX + 3, cursorY + 4.7)
        cursorY += 12
      }

      const addParagraph = (text, boxFill = colors.paper, textColor = colors.navy, opts = {}) => {
        const lines = doc.splitTextToSize(String(text || '—'), contentWidth - 6)
        const height = Math.max(opts.minHeight || 16, lines.length * 5.8 + 6)
        ensureSpace(height + 4)
        doc.setFillColor(...boxFill)
        doc.setDrawColor(...colors.border)
        doc.roundedRect(marginX, cursorY, contentWidth, height, 3, 3, 'FD')
        doc.setTextColor(...textColor)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10.2)
        doc.text(lines, marginX + 3, cursorY + 6)
        cursorY += height + 6
      }

      const addCardGrid = (items) => {
        const cardWidth = (contentWidth - 6) / 3
        const cardHeight = 23
        const rows = Math.ceil(items.length / 3)
        ensureSpace(rows * (cardHeight + 4) + 2)

        items.forEach((item, index) => {
          const col = index % 3
          const row = Math.floor(index / 3)
          const x = marginX + col * (cardWidth + 3)
          const y = cursorY + row * (cardHeight + 4)

          doc.setFillColor(...colors.paper)
          doc.setDrawColor(...colors.border)
          doc.roundedRect(x, y, cardWidth, cardHeight, 2.5, 2.5, 'FD')
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.5)
          doc.setTextColor(...colors.slate)
          doc.text(item.label.toUpperCase(), x + 2.5, y + 6)

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9.2)
          doc.setTextColor(...colors.navy)
          const wrappedValue = doc.splitTextToSize(String(item.value || '—'), cardWidth - 5)
          doc.text(wrappedValue.slice(0, 2), x + 2.5, y + 13)
        })

        cursorY += rows * (cardHeight + 4) + 2
      }

      const addChipWrap = (items) => {
        const chipMaxWidth = 54
        let x = marginX
        let y = cursorY
        const chipHeight = 8.5

        ensureSpace(18)

        if (!items.length) {
          addParagraph('Aucun élément renseigné.', [249, 250, 251], [107, 114, 128], { minHeight: 14 })
          return
        }

        items.forEach((item) => {
          const text = String(item)
          const width = Math.min(chipMaxWidth, doc.getTextWidth(text) + 14)
          if (x + width > marginX + contentWidth) {
            x = marginX
            y += chipHeight + 3
          }
          ensureSpace(y + chipHeight - cursorY + 8)
          doc.setFillColor(...colors.indigoSoft)
          doc.setDrawColor(199, 210, 254)
          doc.roundedRect(x, y, width, chipHeight, 4, 4, 'FD')
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(8)
          doc.setTextColor(...colors.indigo)
          doc.text(text, x + 7, y + 5.7)
          x += width + 3
        })

        cursorY = y + chipHeight + 5
      }

      const addKeyValueRow = (label, value, accentFill = [243, 244, 246]) => {
        ensureSpace(22)
        doc.setFillColor(...accentFill)
        doc.roundedRect(marginX, cursorY, contentWidth, 16, 3, 3, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(...colors.slate)
        doc.text(label.toUpperCase(), marginX + 3, cursorY + 5.5)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9.8)
        doc.setTextColor(...colors.navy)
        doc.text(doc.splitTextToSize(String(value || '—'), contentWidth - 40), marginX + 3, cursorY + 11.5)
        cursorY += 19
      }

      const addSignatureBlocks = () => {
        ensureSpace(42)
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(...colors.border)
        doc.roundedRect(marginX, cursorY, contentWidth, 34, 4, 4, 'FD')

        const leftWidth = (contentWidth - 8) / 2
        const rightX = marginX + leftWidth + 8

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...colors.slate)
        doc.text('MÉDECIN TRAITANT', marginX + 4, cursorY + 6)
        doc.text('PATIENT / REPRÉSENTANT', rightX + 4, cursorY + 6)

        doc.setDrawColor(203, 213, 225)
        doc.line(marginX + 4, cursorY + 22, marginX + leftWidth - 4, cursorY + 22)
        doc.line(rightX + 4, cursorY + 22, rightX + leftWidth - 4, cursorY + 22)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...colors.slate)
        doc.text('Signature et cachet', marginX + 4, cursorY + 27)
        doc.text('Signature', rightX + 4, cursorY + 27)

        cursorY += 40
      }

      const addFooter = () => {
        const totalPages = doc.internal.getNumberOfPages()
        for (let page = 1; page <= totalPages; page += 1) {
          doc.setPage(page)
          doc.setDrawColor(226, 232, 240)
          doc.line(marginX, 286, pageWidth - marginX, 286)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(100, 116, 128)
          doc.text(`Consultation ${report.id}`, marginX, 291)
          doc.text(`Page ${page}/${totalPages}`, 105, 291, { align: 'center' })
          doc.text('Document confidentiel — usage médical uniquement', pageWidth - marginX, 291, { align: 'right' })
        }
      }

      addPageHeader()

      addSectionTitle('Synthèse clinique')
      addParagraph(aiText, [238, 242, 255], [49, 46, 129], { minHeight: 30 })

      addSectionTitle('Informations patient')
      addCardGrid([
        { label: 'Nom complet', value: report.patient.name },
        { label: 'ID Patient', value: report.patient.id },
        { label: 'Âge', value: report.patient.age },
        { label: 'Genre', value: report.patient.genre },
        { label: 'Téléphone', value: report.patient.telephone },
        { label: 'Adresse', value: report.patient.adresse },
      ])

      addSectionTitle('Motif et observations')
      addKeyValueRow('Motif', report.motif, [249, 250, 251])
      addKeyValueRow('Observations cliniques', report.observations, [249, 250, 251])

      addSectionTitle('Diagnostics')
      addChipWrap(report.diagnostics.length ? report.diagnostics.map((d) => `${d.code} ${d.label}`) : [])
      ensureSpace(8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      doc.text('Sévérité', marginX, cursorY + 2)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.2)
      doc.setTextColor(245, 158, 11)
      doc.text(report.severite || '—', marginX + 22, cursorY + 2)
      cursorY += 10

      addSectionTitle('Plan de traitement')
      if (report.traitements.length) {
        report.traitements.forEach((t) => {
          ensureSpace(20)
          doc.setFillColor(249, 250, 251)
          doc.setDrawColor(226, 232, 240)
          doc.roundedRect(marginX, cursorY, contentWidth, 16, 3, 3, 'FD')
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(8)
          doc.setTextColor(67, 56, 202)
          doc.text(t.type || 'Traitement', marginX + 3, cursorY + 5.2)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9.6)
          doc.setTextColor(15, 23, 42)
          doc.text(doc.splitTextToSize(String(t.name || '—'), contentWidth - 56), marginX + 28, cursorY + 5.2)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8.6)
          doc.setTextColor(100, 116, 139)
          doc.text(doc.splitTextToSize(String(t.instruction || '—'), contentWidth - 56), marginX + 28, cursorY + 10.8)
          cursorY += 19
        })
      } else {
        addParagraph('Aucun traitement renseigné.', [249, 250, 251], [107, 114, 128], { minHeight: 14 })
      }

      addSectionTitle('Notes & recommandations')
      addParagraph(report.notes || 'Aucune note', [249, 250, 251], [31, 41, 55], { minHeight: 22 })

      addSectionTitle('Validation')
      addSignatureBlocks()

      addFooter()
      doc.save(`resume-consultation-${report.id}.pdf`)
    } catch (error) {
      console.error('Error generating PDF', error)
      alert("Impossible de générer le PDF pour le moment.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Consultation non trouvée
      </div>
    )
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
            <h1 className="text-4xl font-black text-gray-900">
              Rapport de Consultation{' '}
              <span className="text-indigo-600">#{report.id}</span>
            </h1>
            <p className="text-lg font-bold text-gray-600 mt-2">
              Généré par l'IA le {report.generatedAt}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateResume}
              disabled={isGeneratingResume}
              className="flex items-center gap-2 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-wait text-base font-bold px-7 py-3.5 rounded-full transition-all shadow-sm"
            >
              {isGeneratingResume ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M22 12a10 10 0 00-10-10" />
                  </svg>
                  Génération...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Générer le résumé IA
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-base font-bold px-7 py-3.5 rounded-full transition-all shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black px-7 py-3.5 rounded-full transition-all shadow-lg active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

          <div className="p-8 flex flex-col gap-8 bg-gradient-to-b from-white to-slate-50">

            {(generatedResume || report.aiSummary) && (
              <div className="mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Résumé IA
                </h3>
                <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-black text-indigo-700 uppercase tracking-widest">Synthèse générée</p>
                      <p className="text-xs text-gray-500 mt-1">Optimisée pour archivage et impression PDF</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap text-gray-800 text-base leading-7 font-medium font-sans">
                    {generatedResume || report.aiSummary}
                  </pre>
                </div>
              </div>
            )}

            {/* Patient info */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" />
                </svg>
                Informations Patient
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Nom complet', value: report.patient.name },
                  { label: 'ID Patient', value: report.patient.id },
                  { label: 'Âge', value: report.patient.age },
                  { label: 'Genre', value: report.patient.genre },
                  { label: 'Téléphone', value: report.patient.telephone },
                  { label: 'Adresse', value: report.patient.adresse },
                ].map((f) => (
                  <div key={f.label} className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 shadow-sm">
                    <p className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">{f.label}</p>
                    <p className="text-lg font-black text-gray-800">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Motif + Observations */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-4">
                  Motif de consultation
                </h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-6 py-5 text-lg font-bold text-gray-800 leading-relaxed shadow-inner">
                  {report.motif}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-4">
                  Observations cliniques
                </h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-6 py-5 text-lg font-bold text-gray-800 leading-relaxed shadow-inner">
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
              <div className="flex items-center gap-3 flex-wrap mb-4">
                {report.diagnostics.map(d => (
                  <span key={d.code} className="flex items-center gap-3 bg-indigo-50 border-2 border-indigo-100 text-indigo-800 text-lg font-black px-6 py-3 rounded-full shadow-sm">
                    <span className="text-indigo-400 font-mono text-sm">{d.code}</span>
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