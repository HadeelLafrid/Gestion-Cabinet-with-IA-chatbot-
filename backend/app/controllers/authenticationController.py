from app.schemas.consultation_schema import ConsultationCreate
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.db.session import get_session
from app.services.authenticationService import authenticate_user

def login_controller(username: str, password: str, db: Session = Depends(get_session)):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": user.id}