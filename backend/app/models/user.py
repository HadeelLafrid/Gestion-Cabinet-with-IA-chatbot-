from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    password: str
    first_name: str
    last_name: str
    email: str = Field(unique=True, index=True)
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    photo: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    languages: Optional[str] = None
    medical_facility_name: Optional[str] = None
    medical_facility_address: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)