import os
import json
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ValidationError
from sqlmodel import Session
from dotenv import load_dotenv
from groq import Groq

from app.db.session import get_session

load_dotenv()

router = APIRouter()

api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"').strip("'")
client = Groq(api_key=api_key) if api_key else None

class SymptomsInput(BaseModel):
    diagnosis: str
    age: int
    gender: str

class MedicineOut(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: str

class AIResponse(BaseModel):
    medicines: List[MedicineOut]

@router.post("/predict/medicines")
async def predict_medicines(data: SymptomsInput):
    if not client:
        raise HTTPException(status_code=500, detail="API Key missing")

    prompt = f"""
CONTEXTE MÉDICAL:
- Diagnostic: {data.diagnosis}
- Patient: {data.age} ans, Genre {data.gender}

MISSION:
Générer une liste de médicaments appropriés pour ce diagnostic.
Réponds UNIQUEMENT en JSON. Ne pas ajouter de texte avant ou après.

FORMAT JSON ATTENDU:
{{
    "medicines": [
        {{
            "name": "Nom du médicament",
            "dosage": "Quantité (ex: 500mg)",
            "frequency": "Fréquence (ex: 3 fois par jour)",
            "duration": "Durée du traitement (ex: 7 jours)",
            "instructions": "Moment de prise (ex: pendant les repas)"
        }}
    ]
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Tu es un expert en pharmacologie. Tu réponds uniquement par un objet JSON contenant une liste de médicaments."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
        )

        raw_text = response.choices[0].message.content
        clean_json = raw_text.replace('```json', '').replace('```', '').strip()
        
        parsed = json.loads(clean_json)
        validated = AIResponse(**parsed)
        
        return validated.medicines

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")