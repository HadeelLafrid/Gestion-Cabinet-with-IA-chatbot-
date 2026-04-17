from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Consultation(SQLModel, table=True):
    __tablename__ = "consultations"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id", index=True)
    consultation_date: Optional[datetime] = None
    motif: Optional[str] = None           
    clinical_observation: Optional[str] = None
    diagnosis: Optional[str] = None       
    severity: Optional[str] = None
    additional_notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)