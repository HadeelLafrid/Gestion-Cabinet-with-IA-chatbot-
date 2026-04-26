from datetime import date
from app.schemas.consultation_schema import ConsultationCreate
from sqlmodel import Session, select
from app.models import (User)
from fastapi import HTTPException
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# just for testing, never store plain passwords in production!
def fake_hash(password: str) -> str:
    return f"hashed_{password}"
def authenticate_user(db: Session, username: str, password: str):
    user = db.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return user

