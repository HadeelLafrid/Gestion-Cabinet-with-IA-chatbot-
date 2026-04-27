from fastapi import HTTPException
from sqlmodel import Session
from app.schemas.patient_schema import PatientCreate, PatientUpdate
from app.services import patient_service
from typing import Optional


def handle_create_patient(session: Session, data: PatientCreate):
    return patient_service.create_patient(session, data)


def handle_get_all_patients(
    session: Session,
    search: Optional[str],
    page: int,
    limit: int,
):
    return patient_service.get_all_patients(session, search, page, limit)


def handle_get_patient(session: Session, patient_id: int):
    patient = patient_service.get_patient_detail(session, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    return patient


def handle_update_patient(session: Session, patient_id: int, data: PatientUpdate):
    patient = patient_service.update_patient(session, patient_id, data)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    return patient_service.get_patient_detail(session, patient_id)


def handle_delete_patient(session: Session, patient_id: int):
    deleted = patient_service.delete_patient(session, patient_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Patient non trouvé")