from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class AIReport(SQLModel, table=True):
    __tablename__ = "ai_reports"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id", index=True)
    consultation_id: Optional[int] = Field(default=None, foreign_key="consultations.id")
    type: Optional[str] = None
    content: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)