from typing import Optional
from sqlmodel import SQLModel

class ExamCreate(SQLModel):
    name: str

class ExamUpdate(SQLModel):
    name: Optional[str] = None

class ExamRead(SQLModel):
    id: int
    name: str