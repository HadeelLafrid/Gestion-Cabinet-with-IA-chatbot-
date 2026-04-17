from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class PaymentCreate(SQLModel):
    consultation_id: int
    amount: float
    payment_date: Optional[datetime] = None
    status: Optional[str] = None

class PaymentUpdate(SQLModel):
    amount: Optional[float] = None
    payment_date: Optional[datetime] = None
    status: Optional[str] = None

class PaymentRead(SQLModel):
    id: int
    consultation_id: int
    amount: float
    payment_date: Optional[datetime] = None
    status: Optional[str] = None