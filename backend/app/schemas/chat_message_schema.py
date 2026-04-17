from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class ChatMessageCreate(SQLModel):
    consultation_id: int
    sender: Optional[str] = None
    message: Optional[str] = None

class ChatMessageUpdate(SQLModel):
    message: Optional[str] = None

class ChatMessageRead(SQLModel):
    id: int
    consultation_id: int
    sender: Optional[str] = None
    message: Optional[str] = None
    created_at: Optional[datetime] = None