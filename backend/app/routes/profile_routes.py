from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlmodel import Session
from typing import Optional
from datetime import date
from pydantic import BaseModel
from app.db.session import get_session
from app.controllers import profile_controller

router = APIRouter(prefix="/api/v1/profile", tags=["Profile"])


class ProfileUpdate(BaseModel):
    first_name:               Optional[str]  = None
    last_name:                Optional[str]  = None
    email:                    Optional[str]  = None
    phone:                    Optional[str]  = None
    date_of_birth:            Optional[date] = None
    sex:                      Optional[str]  = None
    specialization:           Optional[str]  = None
    experience:               Optional[int]  = None
    languages:                Optional[str]  = None
    medical_facility_name:    Optional[str]  = None
    medical_facility_address: Optional[str]  = None


@router.get("/")
def get_profile(session: Session = Depends(get_session)):
    return profile_controller.handle_get_profile(session)


@router.put("/")
def update_profile(data: ProfileUpdate, session: Session = Depends(get_session)):
    return profile_controller.handle_update_profile(
        session, data=data.model_dump(exclude_unset=True)
    )


@router.get("/backup")
def backup_database():
    backup_path, backup_filename = profile_controller.handle_backup_database()
    return FileResponse(
        path=str(backup_path),
        filename=backup_filename,
        media_type="application/sql",
    )