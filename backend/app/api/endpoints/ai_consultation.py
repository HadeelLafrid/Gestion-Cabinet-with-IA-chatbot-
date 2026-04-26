import os
import json
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ValidationError
from sqlmodel import Session, select
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

class SymptomsInput(BaseModel):
    symptoms: str
    patient_id: Optional[int] = None
    age: Optional[int] = None
    gender: Optional[str] = None

class MedicineOut(BaseModel):
    name: str
    dosage: str
    purpose: Optional[str]


class DiagnosisOut(BaseModel):
    name: str
    likelihood: str
    reasoning: str


class AIResponse(BaseModel):
    severity: str
    possible_diagnoses: List[DiagnosisOut]
    medicines: List[MedicineOut]
    red_flags: List[str]
    advice: str
    safety_notice: str


@router.post("/predict")
async def predict_consultation(data: SymptomsInput, db: Session = Depends(get_session)):
    if not client:
        raise HTTPException(status_code=500, detail="Clé API GROQ manquante")

    history_context = ""
    target_age = data.age
    target_gender = data.gender


    if data.patient_id:
        patient = db.get(Patient, data.patient_id)
        if patient:
            if patient.date_of_birth:
                today = datetime.now().date()
                target_age = today.year - patient.date_of_birth.year - ((today.month, today.day) < (patient.date_of_birth.month, patient.date_of_birth.day))
            
            target_gender = patient.gender or target_gender
            history_context += f"- Nom du patient: {patient.first_name} {patient.last_name}\n"
            history_context += f"- Antécédents personnels: {patient.personal_history or 'Aucun'}\n"
            history_context += f"- Antécédents familiaux: {patient.family_history or 'Aucun'}\n"

            past_meds_query = (
                select(Medicine.name)
                .join(ConsultationMedicine)
                .join(Consultation)
                .where(Consultation.patient_id == data.patient_id)
                .order_by(Consultation.consultation_date.desc())
                .limit(10)
            )

            past_meds = db.exec(past_meds_query).all()
            if past_meds:
                history_context += f"- Médicaments précédents: {', '.join(set(past_meds))}\n"


    prompt = f"""
PATIENT:
- Âge: {target_age}
- Genre: {target_gender}
{history_context}

SYMPTÔMES:
{data.symptoms}

INSTRUCTIONS STRICTES:
- Ne jamais donner un seul diagnostic → fournir plusieurs diagnostics classés par probabilité
- Toujours inclure un niveau de gravité (faible, modérée, élevée)
- Ne proposer des médicaments QUE si clairement indiqués
- Toujours inclure des signaux d’alerte (red flags)
- Inclure les doses MAXIMALES si applicable
- Éviter les médicaments spécifiques (ex: bronchodilatateurs) sans indication claire
- Si incertitude → l'indiquer explicitement

FORMAT JSON STRICT:
{{
    "severity": "...",
    "possible_diagnoses": [
        {{
            "name": "...",
            "likelihood": "élevée | modérée | faible",
            "reasoning": "..."
        }}
    ],
    "medicines": [
        {{
            "name": "...",
            "dosage": "...",
            "purpose": "..."
        }}
    ],
    "red_flags": ["..."],
    "advice": "...",
    "safety_notice": "..."
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Tu es un assistant médical prudent. "
                        "Tu ne fais jamais de diagnostic définitif. "
                        "Tu priorises la sécurité du patient. "
                        "Tu réponds uniquement en JSON valide."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1200,
        )

        raw_text = response.choices[0].message.content

        clean_json = raw_text.replace('```json', '').replace('```', '').strip()

        parsed = json.loads(clean_json)

       
        validated = AIResponse(**parsed)

        return validated.dict()

    except ValidationError as ve:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur validation réponse IA: {ve}"
        )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Réponse IA invalide (JSON incorrect)"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur IA: {str(e)}"
        )