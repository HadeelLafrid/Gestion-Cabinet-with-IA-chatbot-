from typing import Optional
from sqlmodel import SQLModel

class ConsultationExamCreate(SQLModel):
    consultation_id: int
    exam_id: int
    notes: Optional[str] = None

class ConsultationExamUpdate(SQLModel):
    notes: Optional[str] = None

class ConsultationExamRead(SQLModel):
    id: int
    consultation_id: int
    exam_id: int
    notes: Optional[str] = None