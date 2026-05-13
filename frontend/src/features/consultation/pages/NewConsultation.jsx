import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  COMMON_MEDICINES,
  MEDICINE_CATEGORIES,
} from "../../../constants/medicines";
import apiClient from "../../../services/apiClient";
import VoiceInputButton from "../../../components/VoiceInputButton";

export default function NewConsultation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');

  // find id of the patient
  const panelRef = useRef(null);
  const draftHistoryKey = `assistant_chat_draft_${patientId || "unknown"}`;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await apiClient.get(`/api/v1/patients/${patientId}`);
        const p = response.data;
        let age = "N/A";
        if (p.date_of_birth) {
          const birthDate = new Date(p.date_of_birth);
          const ageDifMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(ageDifMs);
          age = Math.abs(ageDate.getUTCFullYear() - 1970) + " ans";
        }
        setPatient({
          ...p,
          name:
            `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Inconnu",
          age: age,
          genre:
            p.gender === "M"
              ? "Homme"
              : p.gender === "F"
                ? "Femme"
                : p.gender || "Non spécifié",
          id: p.id,
        });

        // Remove fetching medicines from last consultation as requested
        // try {
        //   const medsRes = await apiClient.get(
        //     `/consultations/medicines/${patientId}`,
        //   );
        //   if (medsRes.data) {
        //     setMeds(
        //       medsRes.data.map((m) => ({
        //         id: m.id || Date.now() + Math.random(),
        //         name: m.name,
        //         instruction: m.dosage || "",
        //         icon: "pill",
        //       })),
        //     );
        //   }
        // } catch (err) {
        //   console.warn(
        //     "Could not fetch medicines for patient or none found",
        //     err,
        //   );
        // }

        try {
          const historyPatientId = parseInt(String(p.id).replace(/\D/g, ""));
          const historyRes = await apiClient.get(
            `/api/ai/assistant/history/${historyPatientId}`,
          );
          const historyMessages = (historyRes.data || []).map((item) => ({
            role: item.sender === "doctor" ? "user" : "ai",
            text: item.message || "",
          }));
          setChatConversation(historyMessages);
          setChatBaselineIndex(historyMessages.length);
        } catch (historyError) {
          console.warn("Could not fetch assistant history", historyError);
          setChatConversation([]);
          setChatBaselineIndex(0);
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
    motif: "",
    observations: "",
    diagnostic: "",
    severite: "",
    notes: "",
    montant: "",
    modePaiement: "especes",
  });
  const [tags, setTags] = useState([]);
  const [predictedDiagnoses, setPredictedDiagnoses] = useState([]);
  const [meds, setMeds] = useState([]);
  const [aiChat, setAiChat] = useState("");

  useEffect(() => {
    const fetchConsultation = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const editId = queryParams.get("edit");
      if (!editId) return;

      try {
        const res = await apiClient.get(`/consultations/${editId}`);
        const data = res.data;
        if (data) {
          setForm({
            motif: data.motif || "",
            observations: data.clinical_observation || "",
            diagnostic: "",
            severite: data.severity || "",
            notes: data.additional_notes || "",
            montant: data.payment?.amount ? String(data.payment.amount) : "",
            modePaiement: "especes",
          });
          if (data.diagnosis) {
            setTags(data.diagnosis.split(",").map((d) => d.trim()));
          } else {
            setTags([]);
          }

          const backendMeds = [
            ...(data.medicines || []).map((m) => ({
              id: m.id || Date.now() + Math.random(),
              name: m.medicine_name,
              instruction: m.dosage || "",
              icon: "pill",
            })),
            ...(data.exams || []).map((e) => ({
              id: e.id || Date.now() + Math.random(),
              name: e.exam_name,
              instruction: e.notes || "",
              icon: "lab",
            })),
          ];
          setMeds(backendMeds);
        }
      } catch (err) {
        console.error("Error fetching edit consultation", err);
      }
    };
    fetchConsultation();
  }, [patientId]);
  const [showMedForm, setShowMedForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: "",
    instruction: "",
    icon: "pill",
  });
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState("");
  const [showResumePanel, setShowResumePanel] = useState(false);
  const [chatConversation, setChatConversation] = useState([]);
  const [chatBaselineIndex, setChatBaselineIndex] = useState(0);

  useEffect(() => {
    if (editId) {
      const fetchConsultation = async () => {
        try {
          const response = await apiClient.get(`/consultations/${editId}`);
          const data = response.data;
          setForm(prev => ({
            ...prev,
            motif: data.motif || "",
            observations: data.clinical_observation || "",
            severite: data.severity || "",
            notes: data.additional_notes || "",
            montant: data.payment?.amount ? String(data.payment.amount) : "",
          }));
          if (data.diagnosis) {
            setTags(data.diagnosis.split(',').map(t => t.trim()).filter(Boolean));
          } else {
            setTags([]);
          }
          if (data.medicines) {
            setMeds(data.medicines.map(m => ({
              id: m.id || Date.now() + Math.random(),
              name: m.medicine_name || m.name,
              instruction: m.dosage || "",
              icon: "pill"
            })));
          }
        } catch (error) {
          console.error("Error fetching consultation for edit:", error);
        }
      };
      fetchConsultation();
    }
  }, [editId]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(draftHistoryKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setChatConversation(parsed);
          setChatBaselineIndex(parsed.length);
        }
      }
    } catch (error) {
      console.warn("Could not restore draft assistant history", error);
    }
  }, [draftHistoryKey]);

  useEffect(() => {
    try {
      localStorage.setItem(draftHistoryKey, JSON.stringify(chatConversation));
    } catch (error) {
      console.warn("Could not persist draft assistant history", error);
    }
  }, [chatConversation, draftHistoryKey]);

  // Chat editing state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingText, setEditingText] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [isPredictingMedicines, setIsPredictingMedicines] = useState(false);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));
  const addTag = () => {
    if (form.diagnostic.trim()) {
      setTags((prev) => [...prev, form.diagnostic.trim()]);
      setForm((f) => ({ ...f, diagnostic: "" }));
    }
  };

  const removeMed = (id) => setMeds((prev) => prev.filter((m) => m.id !== id));

  const addMedicine = () => {
    if (!newMed.name.trim() || !newMed.instruction.trim()) return;
    setMeds((prev) => [...prev, { id: Date.now(), ...newMed }]);
    setNewMed({ name: "", instruction: "", icon: "pill" });
    setShowMedForm(false);
  };

  const handlePredictDiagnosis = async () => {
    if (!form.motif.trim() && !form.observations.trim()) {
      alert("Veuillez saisir un motif ou des observations pour l'analyse.");
      return;
    }

    setIsPredicting(true);
    try {
      const diagnosticsInput = {
        motif: form.motif,
        symptoms: form.observations || "Aucune observation",
        patient_id: patient.id ? parseInt(String(patient.id).replace(/\D/g, "")) : null,
        age: patient.age ? parseInt(String(patient.age)) : null,
        gender: patient.genre === "Femme" ? "female" : "male",
      };

      const response_diagnostics = await apiClient.post(
        "/api/ai/diagnosis/predict/diagnosis",
        diagnosticsInput,
      );
      const diagnosticsResponse = response_diagnostics.data;
      console.log(diagnosticsResponse);
      if (diagnosticsResponse.possible_diagnoses) {
        const topDiag = diagnosticsResponse.possible_diagnoses;

        if (topDiag.length > 0) {
          setPredictedDiagnoses(topDiag);
        }
      }

      if (diagnosticsResponse.severity) {
        const mappedSeverity = diagnosticsResponse.severity
          .toLowerCase()
          .includes("sévère")
          ? "Sévère"
          : "Modéré";
        setForm((f) => ({ ...f, severite: mappedSeverity }));
      }

      if (diagnosticsResponse.possible_diagnoses && diagnosticsResponse.possible_diagnoses.length > 0) {
        alert("IA: Analyse terminée. Le diagnostic a été suggéré.");
      } else {
        alert("IA: Analyse terminée. Aucune pathologie n'a pu être identifiée avec les données fournies.");
      }

    } catch (error) {
      console.error("AI Prediction error:", error);
      alert(
        "L'IA n'a pas pu générer de prévision. Vérifiez votre connexion au serveur.",
      );
    } finally {
      setIsPredicting(false);
    }
  };

  const handlePredictMedicines = async () => {
    const currentDiagnosis =
      form.diagnostic || (tags.length > 0 ? tags.join(", ") : "");
    if (!currentDiagnosis.trim()) {
      alert(
        "Veuillez d'abord saisir ou faire prédire un diagnostic avant de générer le traitement.",
      );
      return;
    }

    setIsPredictingMedicines(true);
    try {
      const medicinesInput = {
        diagnosis: currentDiagnosis,
        age: patient.age ? parseInt(String(patient.age)) : null,
        gender: patient.genre === "Femme" ? "female" : "male",
      };

      console.log("Input Medicines:", medicinesInput);

      const response_medicines = await apiClient.post(
        "api/ai/medicines/predict/medicines",
        medicinesInput,
      );

      const medicinesResponse = response_medicines.data;
      console.log(medicinesResponse);
      if (medicinesResponse && medicinesResponse.length > 0) {
        const newMeds = medicinesResponse.map((m) => ({
          id: Date.now() + Math.random(),
          name: m.name,
          instruction: `${m.dosage} - ${m.frequency} pendant ${m.duration} (${m.instructions})`,
          icon: "pill",
        }));
        setMeds((prev) => [...prev, ...newMeds]);
        alert("IA: Plan de traitement suggéré avec succès.");
      } else {
        alert("IA: Aucun traitement n'a pu être suggéré pour ce diagnostic.");
      }
    } catch (error) {
      console.error("AI Prediction error:", error);
      alert(
        "L'IA n'a pas pu générer de traitement. Vérifiez votre connexion au serveur.",
      );
    } finally {
      setIsPredictingMedicines(false);
    }
  };

  // Generate resume based on consultation data (now via AI)
  const handleSaveConsultation = async () => {
    try {
      const pId = parseInt(String(patient.id || patientId).replace(/\D/g, ""));
      const payload = {
        patient_id: pId,
        consultation_date: new Date().toISOString(),
        motif: form.motif,
        clinical_observation: form.observations,
        diagnosis: tags.join(", "),
        severity: form.severite,
        additional_notes: form.notes,
        medicines: meds
          .filter((m) => m.icon === "pill")
          .map((m) => ({
            medicine_name: m.name,
            dosage: m.instruction,
          })),
        exams: meds
          .filter((m) => m.icon === "lab")
          .map((m) => ({
            exam_name: m.name,
            notes: m.instruction,
          })),
        payment: form.montant ? { amount: parseFloat(form.montant) } : null,
      };

      const queryParams = new URLSearchParams(window.location.search);
      const editId = queryParams.get("edit");

      let created;
      if (editId) {
        created = await apiClient.put(`/consultations/${editId}`, payload);
      } else {
        created = await apiClient.post("/consultations/", payload);
      }

      const consultationId = created?.data?.id;
      const sessionMessages = chatConversation.slice(chatBaselineIndex);
      if (consultationId && sessionMessages.length > 0) {
        try {
          await apiClient.post(`/api/ai/assistant/history/${consultationId}`, {
            messages: sessionMessages.map((message) => ({
              sender: message.role === "user" ? "doctor" : "ai",
              message: message.text,
            })),
          });
        } catch (historySaveError) {
          console.warn("Could not save assistant history", historySaveError);
        }
      }

      try {
        localStorage.removeItem(draftHistoryKey);
      } catch (storageError) {
        console.warn("Could not clear draft assistant history", storageError);
      }

      alert("Consultation enregistrée avec succès !");
      navigate("/");
    } catch (error) {
      console.error("Error saving consultation", error);
      alert("Erreur lors de l'enregistrement de la consultation. Vérifiez que toutes les informations sont correctes.");
    }
  };

  // Generate resume based on consultation data
  const generateResume = async () => {
    setIsGeneratingResume(true);
    try {
      const payload = {
        patient_name: patient.name || "Non spécifié",
        patient_id: patient.id || "Non spécifié",
        age: String(patient.age) || "Non spécifié",
        gender: patient.genre || "Non spécifié",
        motif: form.motif || "Non spécifié",
        observations: form.observations || "Non spécifiées",
        diagnostic: tags,
        severite: form.severite || "Non spécifiée",
        treatments: meds.map((m) => ({
          name: m.name,
          instruction: m.instruction,
        })),
        notes: form.notes || "Aucune note",
        chat_history: chatConversation || [],
        montant: form.montant ? String(form.montant) : "Non spécifié",
      };

      const response = await apiClient.post("api/ai/resume/generate", payload);
      setGeneratedResume(response.data.resume_text);
      setShowResumeModal(true);
    } catch (error) {
      console.error("Resume generation error:", error);
      alert(
        "L'IA n'a pas pu générer le résumé. Vérifiez votre connexion au serveur.",
      );
    } finally {
      setIsGeneratingResume(false);
    }
  };

  // Close modal and show resume panel at bottom
  const closeModalAndShowPanel = () => {
    setShowResumeModal(false);
    setShowResumePanel(true);

    setTimeout(() => {
      if (panelRef.current) {
        panelRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
  };

  // Regenerate AI response for given user message
  const regenerateAiResponse = async (userMessage, messageIndex) => {
    try {
      const pId = String(patient.id || patientId).replace(/\D/g, '');
      const base = (apiClient.defaults && apiClient.defaults.baseURL) || '';
      const urlBase = base.replace(/\/$/, '');
      
      // Include consultation context: motif and observations
      const params = new URLSearchParams({
        question: userMessage,
        patient_id: pId,
        motif: form.motif || '',
        observations: form.observations || ''
      });
      
      const url = `${urlBase}/api/ai/assistant/stream?${params.toString()}`;
      let latestConversation = null;

      // Remove old AI response if exists at messageIndex + 1
      setChatConversation((prev) => {
        const copy = [...prev];
        if (messageIndex + 1 < copy.length && copy[messageIndex + 1].role === 'ai') {
          copy.splice(messageIndex + 1, 1);
        }
        copy.splice(messageIndex + 1, 0, { role: 'ai', text: '' });
        latestConversation = copy;
        return copy;
      });

      return await new Promise((resolve) => {
        const es = new EventSource(url);

        es.onmessage = (e) => {
          const chunk = e.data;
          setChatConversation((prev) => {
            if (prev.length <= messageIndex + 1) return prev;
            const copy = [...prev];
            copy[messageIndex + 1] = { ...copy[messageIndex + 1], text: (copy[messageIndex + 1].text || '') + chunk };
            latestConversation = copy;
            return copy;
          });
        };

        es.addEventListener('done', () => {
          es.close();
          resolve(latestConversation || []);
        });

        es.addEventListener('error', () => {
          es.close();
          setChatConversation((prev) => {
            if (prev.length <= messageIndex + 1) return prev;
            const copy = [...prev];
            if (!copy[messageIndex + 1].text) {
              copy[messageIndex + 1].text = 'Désolé, une erreur est survenue lors de la régénération de la réponse.';
            }
            latestConversation = copy;
            return copy;
          });
          resolve(latestConversation || []);
        });
      });
    } catch (error) {
      console.error('Error regenerating AI response:', error);
      return [];
    }
  };

  // Sync conversation to database
  const syncHistoryToDb = async (messages) => {
    try {
      const pId = String(patient.id || patientId).replace(/\D/g, '');
      if (pId) {
        await apiClient.put(`/api/ai/assistant/history/${pId}`, {
          messages: messages.map(m => ({ sender: m.role === 'user' ? 'doctor' : 'ai', message: m.text }))
        });
      }
    } catch (err) {
      console.error('Error syncing history to DB', err);
    }
  };

  // Send message to AI with full consultation context
  const sendAiMessage = async () => {
    if (!aiChat.trim()) return;

    const currentChat = aiChat;
    setAiChat('');

    // add user message
    setChatConversation((prev) => [...prev, { role: 'user', text: currentChat }]);

    // add placeholder AI message to update progressively
    setChatConversation((prev) => [...prev, { role: 'ai', text: '' }]);

    try {
      const pId = String(patient.id || patientId).replace(/\D/g, '');
      const base = (apiClient.defaults && apiClient.defaults.baseURL) || '';
      const urlBase = base.replace(/\/$/, '');
      
      // Include consultation context: motif and observations
      const params = new URLSearchParams({
        question: currentChat,
        patient_id: pId,
        motif: form.motif || '',
        observations: form.observations || ''
      });
      
      const url = `${urlBase}/api/ai/assistant/stream?${params.toString()}`;

      const es = new EventSource(url);

      es.onmessage = (e) => {
        // standard message contains a chunk of content
        const chunk = e.data;
        setChatConversation((prev) => {
          if (prev.length === 0) return prev;
          const copy = [...prev];
          // find last AI message index
          let lastAiIndex = -1;
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === 'ai') {
              lastAiIndex = i;
              break;
            }
          }
          if (lastAiIndex === -1) return prev;
          copy[lastAiIndex] = { ...copy[lastAiIndex], text: (copy[lastAiIndex].text || '') + chunk };
          return copy;
        });
      };

      es.addEventListener('done', () => {
        es.close();
      });

      es.addEventListener('error', (ev) => {
        es.close();
        setChatConversation((prev) => {
          const copy = [...prev];
          // replace last AI message with error notice if empty
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === 'ai') {
              if (!copy[i].text) copy[i] = { ...copy[i], text: 'Désolé, une erreur est survenue lors de la communication avec l\'assistant.' };
              break;
            }
          }
          return copy;
        });
      });
    } catch (error) {
      console.error('Erreur lors de la communication avec l\'IA:', error);
      setChatConversation((prev) => [
        ...prev,
        { role: 'ai', text: "Désolé, une erreur est survenue lors de la communication avec l'assistant." },
      ]);
    }
  };


  const regenerateResumeWithChat = async () => {
    await generateResume();
  };

  // Scroll to top of page when modal opens
  useEffect(() => {
    if (showResumeModal) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showResumeModal]);

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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  {isGeneratingResume
                    ? "Génération du résumé..."
                    : "Résumé de consultation"}
                </h3>
              </div>
              {!isGeneratingResume && (
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto p-6">
              {isGeneratingResume ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-gray-500">
                    Claude analyse la consultation...
                  </p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-xl p-8 overflow-auto">
                  <pre className="text-gray-100 text-lg font-mono leading-relaxed whitespace-pre-wrap font-['Courier_New', 'Monaco', 'Menlo', monospace]">
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0116 0" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">Patient</p>
          <p className="text-xl font-black text-gray-900">{patient.name}</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div>
          <p className="text-sm font-bold text-gray-500">ID Patient</p>
          <p className="text-lg font-extrabold text-gray-800">{patient.id}</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div>
          <p className="text-sm font-bold text-gray-500">Âge</p>
          <p className="text-lg font-extrabold text-gray-800">{patient.age}</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div>
          <p className="text-sm font-bold text-gray-500">Genre</p>
          <p className="text-lg font-extrabold text-gray-800">{patient.genre}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="text-sm font-semibold bg-white border border-indigo-100 text-indigo-700 px-4 py-2 rounded-full shadow-sm hover:bg-indigo-50 transition-colors"
          >
            Voir le patient
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex gap-5 items-start">
        {/* Left — form sections */}
        <div className="flex-[0.92] flex flex-col gap-5 min-w-0">
          {/* Section 1 — Motif & Observations */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                1
              </div>
              <h2 className="text-xl font-black text-gray-900">
                Motif & Observations
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-gray-700">
                  Motif de consultation
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="motif"
                    value={form.motif}
                    onChange={handle}
                    placeholder="Ex: Douleurs thoraciques persistantes"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-5 pr-14 py-4 text-lg font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 transition-colors shadow-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceInputButton 
                      onResult={(text) => setForm(f => ({ ...f, motif: f.motif ? `${f.motif} ${text}` : text }))} 
                    />
                  </div>
                </div>

              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-gray-700">
                  Observations cliniques
                </label>
                <div className="relative group">
                  <textarea
                    name="observations"
                    value={form.observations}
                    onChange={handle}
                    placeholder="Décrivez les symptômes et signes vitaux..."
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 transition-colors resize-none shadow-sm"
                  />
                  <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <VoiceInputButton 
                      onResult={(text) => setForm(f => ({ ...f, observations: f.observations ? `${f.observations} ${text}` : text }))} 
                    />
                  </div>
                </div>

              </div>
              <button
                className={`flex items-center gap-2 text-white px-5 py-2.5 rounded-xl w-fit font-medium transition-all shadow-sm
                  ${isPredicting ? "bg-indigo-400 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer"}`}
                onClick={handlePredictDiagnosis}
                disabled={isPredicting}
              >
                {isPredicting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    Prédire le diagnostic (IA)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2 — Diagnostic */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                2
              </div>
              <h2 className="text-xl font-black text-gray-900">
                Diagnostic Clinique
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-gray-700">
                  Diagnostic Principal
                </label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <input
                    type="text"
                    name="diagnostic"
                    value={form.diagnostic}
                    onChange={handle}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="Rechercher CIM-10..."
                    className="flex-1 bg-transparent text-lg font-medium text-gray-900 placeholder-gray-400 outline-none"
                  />
                  <VoiceInputButton 
                    className="mr-2"
                    onResult={(text) => setForm(f => ({ ...f, diagnostic: f.diagnostic ? `${f.diagnostic} ${text}` : text }))} 
                  />

                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-sm font-bold px-4 py-2 rounded-full shadow-sm"
                    >
                      {t}
                      <button
                        onClick={() => removeTag(t)}
                        className="hover:text-indigo-800"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={addTag}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold px-4 py-2 rounded-full transition-colors border border-gray-200"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Ajouter
                  </button>
                </div>
                {predictedDiagnoses.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap items-center">
                    <span className="text-sm text-gray-600 font-bold">
                      Suggestions IA:
                    </span>
                    {predictedDiagnoses.map((pd) => (
                      <button
                        key={pd.name}
                        title={`Probabilité : ${pd.likelihood.toUpperCase()}\nRaisonnement : ${pd.reasoning}`}
                        onClick={() => {
                          setTags((prev) => [...new Set([...prev, pd.name])]);
                          setPredictedDiagnoses((prev) =>
                            prev.filter((x) => x.name !== pd.name),
                          );
                        }}
                        className="flex items-center gap-2 bg-white border-2 border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 text-indigo-700 text-sm font-bold px-4 py-2 rounded-full transition-all"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        {pd.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 mt-2">
                <label className="text-base font-bold text-gray-700">Sévérité</label>
                <div className="flex items-center gap-6">
                  {["Modéré", "Sévère"].map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="severite"
                        value={s}
                        checked={form.severite === s}
                        onChange={handle}
                        className="w-5 h-5 accent-indigo-600"
                      />
                      <span className="text-lg font-bold text-gray-800">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 — Plan de traitement */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                  3
                </div>
                <h2 className="text-xl font-black text-gray-900">
                  Plan de traitement
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePredictMedicines}
                  disabled={isPredictingMedicines}
                  className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl text-base font-bold transition-all shadow-md
                    ${isPredictingMedicines ? "bg-indigo-400 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer"}`}
                >
                  {isPredictingMedicines ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      Prédire le traitement (IA)
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowMedForm(!showMedForm)}
                  className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 text-base font-bold transition-colors bg-indigo-50 px-4 py-2 rounded-lg"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Ajouter un médicament
                </button>
              </div>
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
                        onClick={() => setSelectedCategory("")}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                          ${
                            selectedCategory === ""
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-gray-200 text-gray-500 hover:border-indigo-300"
                          }`}
                      >
                        Tous
                      </button>
                      {MEDICINE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                            ${
                              selectedCategory === cat
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-white border-gray-200 text-gray-500 hover:border-indigo-300"
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
                      onChange={(e) => {
                        const selected = COMMON_MEDICINES.find(
                          (m) => m.name === e.target.value,
                        );
                        if (selected) {
                          setNewMed((prev) => ({
                            ...prev,
                            name: selected.name,
                            icon: selected.icon,
                            instruction: "",
                          }));
                        }
                      }}
                      className="bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
                    >
                      <option value="">
                        — Choisir un médicament courant —
                      </option>
                      {COMMON_MEDICINES.filter(
                        (m) =>
                          selectedCategory === "" ||
                          m.category === selectedCategory,
                      ).map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-indigo-200" />
                    <span className="text-xs text-indigo-400 font-medium">
                      ou saisir manuellement
                    </span>
                    <div className="flex-1 h-px bg-indigo-200" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Nom du médicament / examen{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMed.name}
                      onChange={(e) =>
                        setNewMed((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Ex: Amoxicilline 500mg, Bilan hépatique..."
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Posologie / Instructions{" "}
                      <span className="text-red-400">*</span>
                      <span className="text-gray-400 font-normal ml-1">
                        (à saisir par le médecin)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={newMed.instruction}
                      onChange={(e) =>
                        setNewMed((prev) => ({
                          ...prev,
                          instruction: e.target.value,
                        }))
                      }
                      placeholder="Ex: 1 comprimé 3x/jour après repas pendant 7 jours"
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Type
                    </label>
                    <div className="flex items-center gap-3">
                      {[
                        { value: "pill", label: "Médicament", emoji: "💊" },
                        { value: "lab", label: "Examen / Labo", emoji: "🔬" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() =>
                            setNewMed((prev) => ({ ...prev, icon: t.value }))
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors
                            ${
                              newMed.icon === t.value
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
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
                      disabled={
                        !newMed.name.trim() || !newMed.instruction.trim()
                      }
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Ajouter
                    </button>
                    <button
                      onClick={() => {
                        setShowMedForm(false);
                        setNewMed({ name: "", instruction: "", icon: "pill" });
                        setSelectedCategory("");
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
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                <p className="text-sm">Aucun médicament ajouté</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {meds.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500 flex-shrink-0">
                      {m.icon === "pill" ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M12 8v8M8 12h8" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-black text-gray-900">
                        {m.name}
                      </p>
                      <p className="text-base font-bold text-gray-600 mt-0.5">
                        {m.instruction}
                      </p>
                    </div>
                    <button className="text-gray-300 hover:text-indigo-500 transition-colors p-1">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeMed(m.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                4
              </div>
              <h2 className="text-xl font-black text-gray-900">
                Notes Additionnelles
              </h2>
            </div>
            <div className="relative group">
              <textarea
                name="notes"
                value={form.notes}
                onChange={handle}
                placeholder="Recommandations hygiéno-diététiques, notes pour le secrétariat..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 transition-colors resize-none shadow-sm"
              />
              <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <VoiceInputButton 
                  onResult={(text) => setForm(f => ({ ...f, notes: f.notes ? `${f.notes} ${text}` : text }))} 
                />
              </div>
            </div>

          </div>

          {/* Section 5 — Honoraires */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                5
              </div>
              <h2 className="text-xl font-black text-gray-900">Honoraires</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-gray-700">
                  Montant (DA) <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 focus-within:border-indigo-500 transition-colors shadow-sm">
                  <input
                    type="number"
                    name="montant"
                    value={form.montant}
                    onChange={handle}
                    placeholder="0"
                    min="0"
                    className="flex-1 bg-transparent text-2xl font-black text-gray-900 placeholder-gray-400 outline-none"
                  />
                  <span className="text-lg font-black text-gray-500">
                    DA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-3 pb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-full border-2 border-gray-200 text-gray-700 text-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={generateResume}
              disabled={isGeneratingResume}
              className={`px-8 py-4 rounded-full border-2 border-indigo-200 text-indigo-700 text-lg font-black transition-colors flex items-center gap-3
                ${isGeneratingResume ? "bg-indigo-50 cursor-wait" : "bg-white hover:bg-indigo-50 shadow-sm"}`}
            >
              {isGeneratingResume ? (
                <>
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Générer le résumé IA
                </>
              )}
            </button>
            <button
              onClick={handleSaveConsultation}
              className="px-10 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-black transition-all shadow-lg active:scale-95 flex items-center gap-3"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
              </svg>
              Enregistrer la consultation
            </button>
          </div>
        </div>

        {/* Right — AI Assistant panel */}
        <div className="w-[26rem] flex-shrink-0 sticky top-20">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Assistant IA</p>
                  <p className="text-indigo-200 text-xs">
                    Analyse en temps réel
                  </p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>

            <div className="p-5 flex flex-col gap-5">

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-black text-gray-500 uppercase tracking-widest">
                    Assistant Chat
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!window.confirm("Supprimer tout l'historique de l'assistant pour ce patient ?")) return;
                        try {
                          const pId = String(patient.id).replace(/\D/g, "");
                          if (!pId) return;
                          await apiClient.delete(`/api/ai/assistant/history/${pId}`);
                          setChatConversation([]);
                          try { localStorage.removeItem(draftHistoryKey); } catch(e){}
                          alert("Historique supprimé.");
                        } catch (err) {
                          console.error('Error deleting history', err);
                          alert("Impossible de supprimer l'historique.");
                        }
                      }}
                      className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-100 hover:bg-red-100 transition-colors"
                    >
                      Supprimer l'historique
                    </button>
                  </div>
                </div>

                {chatConversation.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-[640px] overflow-y-auto mb-3 p-3 bg-gray-50 rounded-xl">
                    {chatConversation.map((m, i) => (
                      <div key={i} className="relative group">
                        {editingIndex === i ? (
                          <div className="bg-indigo-100 text-indigo-800 self-end ml-6 shadow-sm px-4 py-3 rounded-2xl">
                            <span className="font-black text-sm block mb-2 uppercase tracking-tight">Modifier votre message</span>
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-white border border-indigo-300 rounded-lg p-2 text-base font-medium resize-none outline-none focus:border-indigo-500"
                              rows={3}
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={async () => {
                                  const updated = chatConversation.map((msg, idx) => idx === i ? { ...msg, text: editingText } : msg);
                                  setChatConversation(updated);
                                  setEditingIndex(-1);
                                  setEditingText("");
                                  const regenerated = await regenerateAiResponse(editingText, i);
                                  await syncHistoryToDb(regenerated.length ? regenerated : updated);
                                }}
                                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIndex(-1);
                                  setEditingText("");
                                }}
                                className="px-4 py-1.5 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-sm font-semibold"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`text-base font-medium px-4 py-3 rounded-2xl ${m.role === "user" ? "bg-indigo-100 text-indigo-800 self-end ml-6 shadow-sm" : "bg-white border-2 border-gray-100 text-gray-900 self-start mr-6 shadow-sm"}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <span className="font-black text-sm block mb-1 uppercase tracking-tight">
                                  {m.role === "user" ? "Médecin" : "Assistant IA"}
                                </span>
                                {m.text}
                              </div>
                              {m.role === "user" && (
                                <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingIndex(i);
                                      setEditingText(m.text || "");
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 text-lg"
                                    title="Modifier"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm('Supprimer ce message et sa réponse ?')) return;
                                      const messagesBefore = chatConversation.slice(0, i);
                                      const aiResponseAfter = chatConversation[i + 1]?.role === 'ai' ? 1 : 0;
                                      const updated = [...messagesBefore, ...chatConversation.slice(i + 1 + aiResponseAfter)];
                                      setChatConversation(updated);
                                      await syncHistoryToDb(updated);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-lg"
                                    title="Supprimer"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 shadow-inner">
                  <input
                    type="text"
                    value={aiChat}
                    onChange={(e) => setAiChat(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
                    placeholder="Posez une question..."
                    className="flex-1 bg-transparent text-base font-bold text-gray-900 placeholder-gray-400 outline-none"
                  />
                  <VoiceInputButton
                    onResult={(text) => setAiChat((prev) => (prev ? `${prev} ${text}` : text))}
                    className="ml-2"
                  />
                  <button
                    onClick={sendAiMessage}
                    disabled={!aiChat.trim()}
                    className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Panel at bottom - shown after modal is closed */}
      {showResumePanel && (
        <div
          ref={panelRef}
          id="resume-panel"
          className="mt-5 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  Résumé de consultation
                </p>
                <p className="text-indigo-200 text-xs">Généré par IA</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={regenerateResumeWithChat}
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Régénérer le résumé
              </button>
              <button
                onClick={() => setShowResumePanel(false)}
                className="text-white/70 hover:text-white"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="bg-gray-900 rounded-2xl p-10 overflow-auto max-h-[600px]">
              <pre className="text-gray-100 text-xl font-mono font-bold leading-loose whitespace-pre-wrap">
                {generatedResume}
              </pre>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
