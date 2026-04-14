from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class AIReportCreate(SQLModel):
    patient_id: int
    consultation_id: Optional[int] = None
    type: Optional[str] = None
    content: Optional[str] = None

class AIReportUpdate(SQLModel):
    type: Optional[str] = None
    content: Optional[str] = None

class AIReportRead(SQLModel):
    id: int
    patient_id: int
    consultation_id: Optional[int] = None
    type: Optional[str] = None
    content: Optional[str] = None
    created_at: Optional[datetime] = None