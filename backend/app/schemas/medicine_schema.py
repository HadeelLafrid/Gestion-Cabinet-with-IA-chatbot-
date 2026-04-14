from typing import Optional
from sqlmodel import SQLModel

class MedicineCreate(SQLModel):
    name: str

class MedicineUpdate(SQLModel):
    name: Optional[str] = None

class MedicineRead(SQLModel):
    id: int
    name: str