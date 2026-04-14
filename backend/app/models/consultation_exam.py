from typing import Optional
from sqlmodel import SQLModel, Field

class ConsultationExam(SQLModel, table=True):
    __tablename__ = "consultation_exams"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: int = Field(foreign_key="consultations.id", index=True)
    exam_id: int = Field(foreign_key="exams.id")
    notes: Optional[str] = None