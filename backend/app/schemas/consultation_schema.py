from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

# ── Nested inputs (used only inside ConsultationCreate) ──
class MedicineInput(SQLModel):
    medicine_name: str
    dosage: Optional[str] = None
    duration: Optional[str] = None

class ExamInput(SQLModel):
    exam_name: str
    notes: Optional[str] = None

class PaymentInput(SQLModel):
    amount: float
    status: Optional[str] = "pending"

# ── Main schemas ──────────────────────────────────────────
class ConsultationCreate(SQLModel):
    patient_id: int
    consultation_date: Optional[datetime] = None
    motif: Optional[str] = None
    clinical_observation: Optional[str] = None
    diagnosis: Optional[str] = None
    severity: Optional[str] = None
    additional_notes: Optional[str] = None
    medicines: list[MedicineInput] = []   # ← added
    exams: list[ExamInput] = []           # ← added
    payment: Optional[PaymentInput] = None # ← added

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