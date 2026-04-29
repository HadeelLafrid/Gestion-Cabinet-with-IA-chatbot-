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


class MedicineOut(BaseModel):
    name: str
    dosage: str
    purpose: str

class ConflictWarning(BaseModel):
    medicine_name: str
    reason_for_exclusion: str
    interacts_with: str

class AIResponse(BaseModel):
    safe_medicines: List[MedicineOut]
    excluded_due_to_conflict: List[ConflictWarning]

@router.post("/predict/safe-medicines")
async def predict_safe_medicines(data: dict, db: Session = Depends(get_session)):
    if not client:
        raise HTTPException(status_code=500, detail="API Key missing")

    patient_id = data.get("patient_id")
    diagnosis = data.get("diagnosis")
    target_age = data.get("age")
    target_gender = data.get("gender")
    
    current_meds_list = []

    if patient_id:
        patient = db.get(Patient, patient_id)
        if patient:
            target_age = patient.age or target_age
            target_gender = patient.gender or target_gender
            
            query = (
                select(Medicine.name)
                .join(ConsultationMedicine)
                .join(Consultation)
                .where(Consultation.patient_id == patient_id)
                .limit(15)
            )
            results = db.exec(query).all()
            current_meds_list = list(set(results))

    current_meds_str = ", ".join(current_meds_list) if current_meds_list else "Aucun"

    prompt = f"""
PATIENT: {target_age} ans, {target_gender}
TRAITEMENT ACTUEL: {current_meds_str}
DIAGNOSTIC CIBLE: {diagnosis}

MISSION:
1. Identifie les médicaments standards pour traiter ce diagnostic.
2. ANALYSE DES INTERACTIONS: Compare ces médicaments avec le traitement actuel ({current_meds_str}).
3. FILTRAGE STRICT: 
   - Si un médicament présente un risque d'interaction, NE PAS l'inclure dans 'safe_medicines'.
   - Place ces médicaments refusés dans 'excluded_due_to_conflict' avec l'explication.
4. Répondre uniquement en JSON.

FORMAT JSON:
{{
    "safe_medicines": [
        {{ "name": "...", "dosage": "...", "purpose": "..." }}
    ],
    "excluded_due_to_conflict": [
        {{
            "medicine_name": "...",
            "reason_for_exclusion": "...",
            "interacts_with": "..."
        }}
    ],

}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Tu es un pharmacologue expert. Ta priorité est de ne jamais prescrire un médicament qui interagit avec le traitement actuel du patient."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )

        raw_text = response.choices[0].message.content
        clean_json = raw_text.replace('```json', '').replace('```', '').strip()
        
        parsed = json.loads(clean_json)
        return AIResponse(**parsed).dict()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")