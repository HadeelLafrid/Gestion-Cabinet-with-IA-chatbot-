from typing import Optional
from sqlmodel import SQLModel

class ConsultationMedicineCreate(SQLModel):
    consultation_id: int
    medicine_id: int
    dosage: Optional[str] = None
    duration: Optional[str] = None

class ConsultationMedicineUpdate(SQLModel):
    dosage: Optional[str] = None
    duration: Optional[str] = None

class ConsultationMedicineRead(SQLModel):
    id: int
    consultation_id: int
    medicine_id: int
    dosage: Optional[str] = None
    duration: Optional[str] = None