from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class ConsultationCreate(SQLModel):
    patient_id: int
    consultation_date: Optional[datetime] = None
    motif: Optional[str] = None
    clinical_observation: Optional[str] = None
    diagnosis: Optional[str] = None
    severity: Optional[str] = None
    additional_notes: Optional[str] = None

class ConsultationUpdate(SQLModel):
    consultation_date: Optional[datetime] = None
    motif: Optional[str] = None
    clinical_observation: Optional[str] = None
    diagnosis: Optional[str] = None
    severity: Optional[str] = None
    additional_notes: Optional[str] = None

class ConsultationRead(SQLModel):
    id: int
    patient_id: int
    consultation_date: Optional[datetime] = None
    motif: Optional[str] = None
    clinical_observation: Optional[str] = None
    diagnosis: Optional[str] = None
    severity: Optional[str] = None
    additional_notes: Optional[str] = None
    created_at: Optional[datetime] = None