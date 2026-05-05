from fastapi import HTTPException
from sqlmodel import Session
from app.services import profile_service


def handle_get_profile(session: Session, user_id: int):
    profile = profile_service.get_profile(session, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return profile


def handle_update_profile(session: Session, user_id: int, data: dict):
    profile = profile_service.update_profile(session, user_id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return profile