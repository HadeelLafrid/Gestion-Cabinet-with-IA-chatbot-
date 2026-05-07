from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.db.session import get_session
from app.services.authenticationService import authenticate_user
from app.models import User
from sqlmodel import select

def login_controller(username: str, password: str, db: Session = Depends(get_session)):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {
        "access_token": "simple-session-token",  # replace with real token later
        "user": {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "specialization": user.specialization,
            "photo": user.photo if hasattr(user, 'photo') else None,
        }
    }

def has_users_controller(db: Session = Depends(get_session)):
    user = db.exec(select(User)).first()
    return {"has_users": user is not None}