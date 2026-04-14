from typing import Optional
from sqlmodel import SQLModel, Field

class ConsultationMedicine(SQLModel, table=True):
    __tablename__ = "consultation_medicines"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: int = Field(foreign_key="consultations.id", index=True)
    medicine_id: int = Field(foreign_key="medicines.id")
    dosage: Optional[str] = None
    duration: Optional[str] = None