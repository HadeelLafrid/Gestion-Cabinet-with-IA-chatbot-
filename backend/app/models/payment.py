from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Payment(SQLModel, table=True):
    __tablename__ = "payments"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: int = Field(foreign_key="consultations.id", index=True)
    amount: float
    payment_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    status: Optional[str] = None