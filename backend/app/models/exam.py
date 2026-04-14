from typing import Optional
from sqlmodel import SQLModel, Field

class Exam(SQLModel, table=True):
    __tablename__ = "exams"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
 