from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: int = Field(foreign_key="consultations.id", index=True)
    sender: Optional[str] = None         # "doctor" or "ai"
    message: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)