from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel

class UserCreate(SQLModel):
    username: Optional[str] = None
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    photo: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    languages: Optional[str] = None
    medical_facility_name: Optional[str] = None
    medical_facility_address: Optional[str] = None

class UserUpdate(SQLModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    photo: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    languages: Optional[str] = None
    medical_facility_name: Optional[str] = None
    medical_facility_address: Optional[str] = None

class UserRead(SQLModel):
    id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    photo: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    languages: Optional[str] = None
    medical_facility_name: Optional[str] = None
    medical_facility_address: Optional[str] = None
    created_at: Optional[datetime] = None
    # password is intentionally excluded