from datetime import date
from app.schemas.consultation_schema import ConsultationCreate
from sqlmodel import Session, select
from app.models import (User)
from fastapi import HTTPException
import bcrypt

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    try:
        pwd_bytes = plain.encode('utf-8')[:72]
        hash_bytes = hashed.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

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

