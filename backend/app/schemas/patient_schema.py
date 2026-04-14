from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel

class PatientCreate(SQLModel):
    chifa_card_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    profession: Optional[str] = None
    number_of_children: Optional[int] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    personal_history: Optional[str] = None
    family_history: Optional[str] = None
    notes: Optional[str] = None
    general_observation: Optional[str] = None
    documents: Optional[str] = None

class PatientUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    profession: Optional[str] = None
    number_of_children: Optional[int] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    personal_history: Optional[str] = None
    family_history: Optional[str] = None
    notes: Optional[str] = None
    general_observation: Optional[str] = None
    documents: Optional[str] = None

class PatientRead(SQLModel):
    id: int
    chifa_card_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    profession: Optional[str] = None
    number_of_children: Optional[int] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    personal_history: Optional[str] = None
    family_history: Optional[str] = None
    notes: Optional[str] = None
    general_observation: Optional[str] = None
    documents: Optional[str] = None
    created_at: Optional[datetime] = None