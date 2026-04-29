import os
import json
from typing import Optional, List, Dict, Any

from pydantic import BaseModel
from sqlmodel import Session, select
from fastapi import APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from groq import Groq

from app.db.session import get_session
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.consultation_medicine import ConsultationMedicine
from app.models.medicine import Medicine

load_dotenv()

router = APIRouter()

api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"').strip("'")
client = Groq(api_key=api_key) if api_key else None

class MedicineInput(BaseModel):
    name: str
    instruction: str

class ResumeInput(BaseModel):
    patient_name: str = "Non spécifié"
    patient_id: str = "Non spécifié"
    age: str = "Non spécifié"
    gender: str = "Non spécifié"
    motif: str = ""
    observations: str = ""
    diagnostic: List[str] = []
    severite: str = ""
    treatments: List[MedicineInput] = []
    notes: str = ""
    chat_history: Optional[List[Dict[str, Any]]] = []
    montant: str = ""

class ResumeOut(BaseModel):
    resume_text: str

@router.post("/generate", response_model=ResumeOut)
async def generate_resume(data: ResumeInput, db: Session = Depends(get_session)):
    if not client:
        raise HTTPException(status_code=500, detail="Clé API GROQ manquante")

    # Attempt to fetch patient history from DB
    history_context = ""
    try:
        numeric_id = int("".join(filter(str.isdigit, data.patient_id))) if data.patient_id else None
        if numeric_id:
            past_consultations = db.exec(
                select(Consultation)
                .where(Consultation.patient_id == numeric_id)
                .order_by(Consultation.consultation_date.desc())
                .limit(5)
            ).all()
            
            if past_consultations:
                history_context += "\n--- HISTORIQUE DES CONSULTATIONS PRÉCÉDENTES FOURNI ---\n"
                for c in past_consultations:
                    date_str = c.consultation_date.strftime("%Y-%m-%d") if c.consultation_date else "Inconnue"
                    history_context += f"Consultation le {date_str} - Motif: {c.reason}\n"
    except Exception:
        pass # Ignore errors if ID is unparsable

    meds_text = "\n".join([f"- {m.name} : {m.instruction}" for m in data.treatments]) if data.treatments else "Aucun traitement prescrit"
    diagnostics_text = ", ".join(data.diagnostic) if data.diagnostic else "Non spécifié"
    
    chat_context = ""
    if data.chat_history and len(data.chat_history) > 0:
        chat_context = "\nÉCHANGES AVEC L'ASSISTANT IA PENDANT LA CONSULTATION:\n"
        for msg in data.chat_history:
            role = "MÉDECIN" if msg.get("role") == "user" else "IA"
            chat_context += f"{role}: {msg.get('text')}\n"

    prompt = f"""
Voici les détails d'une consultation médicale:

INFORMATIONS PATIENT:
- Nom: {data.patient_name}
- ID Patient: {data.patient_id}
- Âge: {data.age}
- Genre: {data.gender}

ÉVALUATION CLINIQUE:
- Motif: {data.motif}
- Observations: {data.observations}
- Diagnostic retenu: {diagnostics_text}
- Sévérité: {data.severite}

PLAN DE TRAITEMENT:
{meds_text}

NOTES ADDITIONNELLES:
{data.notes}

HONORAIRES: {data.montant} DA
{chat_context}

{history_context}

Génère un résumé de consultation médical très soigné. Formate-le pour qu'il soit professionnel, comme un compte-rendu textuel consigné dans le dossier ou remis au médecin traitant.
S'il existe un "HISTORIQUE DES CONSULTATIONS PRÉCÉDENTES", intègre-le de façon résumée dans une section "ANTÉCÉDENTS / SUIVI" afin de mettre en évidence l'évolution du patient.
Utilise une belle mise en page en texte clair structuré (utilise des séparateurs simples pour structurer).

INSTRUCTION CRITIQUE:
Tu dois impérativement retourner un JSON valide avec la clé "resume_text" contenant le texte formaté (utilise "\\n" pour tes retours à la ligne).
N'inclus rien d'autre que ce JSON.

Format de sortie:
{{
    "resume_text": "COMPTE RENDU MÉDICAL\\n\\n..."
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Tu es un médecin spécialiste expert en rédaction médicale. "
                        "Tu rédiges des comptes-rendus de consultation précis et synthétiques. "
                        "Tu réponds uniquement en JSON valide."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1500,
        )

        raw_text = response.choices[0].message.content
        clean_json = raw_text.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean_json)

        return ResumeOut(resume_text=parsed.get("resume_text", "Erreur lors de la génération du contenu."))

    except json.JSONDecodeError as e:
        print("Erreur de decodage JSON:", e)
        print("Texte recu:", raw_text)
        raise HTTPException(
            status_code=500,
            detail="Réponse IA invalide (JSON incorrect)"
        )
    except Exception as e:
        print("Erreur IA:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Erreur IA: {str(e)}"
        )

class RecapOut(BaseModel):
    recap_text: str

@router.get("/recap/{patient_id}", response_model=RecapOut)
async def generate_patient_recap(patient_id: int, db: Session = Depends(get_session)):
    if not client:
        raise HTTPException(status_code=500, detail="Clé API GROQ manquante")
        
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
        
    history_context = f"Patient: {patient.first_name} {patient.last_name}\n"
    history_context += f"Antécédents: {patient.personal_history or 'Aucun'}\n"
    
    past_consultations = db.exec(
        select(Consultation)
        .where(Consultation.patient_id == patient_id)
        .order_by(Consultation.consultation_date.desc())
        .limit(5)
    ).all()
    
    all_meds = []
    for c in past_consultations:
        meds = db.exec(
            select(Medicine.name)
            .join(ConsultationMedicine)
            .where(ConsultationMedicine.consultation_id == c.id)
        ).all()
        if meds:
            all_meds.extend(meds)

    unique_meds = list(set(all_meds))
    
    # Simple logic: list them or say none found
    if unique_meds:
        meds_data = f"Médicaments à lister: {', '.join(unique_meds)}"
    else:
        meds_data = "Aucun médicament trouvé"

    prompt = f"""
Infos dossier:
{history_context}
{meds_data}

Tâche: Fais un résumé médical très court (3-4 lignes) avec emojis.
Si des médicaments sont fournis au-dessus, liste-les simplement avec l'emoji 💊.
Si l'info est "Aucun médicament trouvé", écris exactement: "Aucun médicament trouvé".

Format JSON:
{{
    "recap_text": "Texte ici"
}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=300,
        )
        raw_text = response.choices[0].message.content
        clean_json = raw_text.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean_json)
        return RecapOut(recap_text=parsed.get("recap_text", "Aucun récap généré."))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))