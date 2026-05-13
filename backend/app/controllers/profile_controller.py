from fastapi import HTTPException
from sqlmodel import Session
from app.services import profile_service


def handle_get_profile(session: Session):
    profile = profile_service.get_profile(session)
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return profile


def handle_update_profile(session: Session, data: dict):
    profile = profile_service.update_profile(session, data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return profile


def handle_backup_database():
    try:
        return profile_service.create_database_backup()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc