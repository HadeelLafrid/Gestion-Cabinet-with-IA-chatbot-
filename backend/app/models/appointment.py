from datetime import date, time, datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Appointment(SQLModel, table=True):
    __tablename__ = "appointments"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id", index=True)
    appointment_date: date = Field(index=True)
    appointment_time: Optional[time] = Field(default=None, nullable=True)
    reason: Optional[str] = None
    status: str = Field(default="confirmed", index=True)
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)