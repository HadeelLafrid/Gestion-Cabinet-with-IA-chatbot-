from typing import Optional
from sqlmodel import SQLModel, Field

class Medicine(SQLModel, table=True):
    __tablename__ = "medicines"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)