from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional
from app.db.session import get_session
from app.schemas.patient_schema import PatientCreate, PatientUpdate
from app.controllers import patient_controller

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])


# GET /api/v1/patients?search=ali&page=1&limit=10
@router.get("/")
def list_patients(
    search: Optional[str] = Query(default=None),
    page:   int           = Query(default=1,  ge=1),
    limit:  int           = Query(default=10, ge=1, le=100),
    session: Session      = Depends(get_session),
):
    return patient_controller.handle_get_all_patients(session, search, page, limit)


# POST /api/v1/patients
@router.post("/", status_code=201)
def create_patient(data: PatientCreate, session: Session = Depends(get_session)):
    patient = patient_controller.handle_create_patient(session, data)
    return {"id": patient.id, "message": "Patient créé avec succès"}


# GET /api/v1/patients/123
@router.get("/{patient_id}")
def get_patient(patient_id: int, session: Session = Depends(get_session)):
    return patient_controller.handle_get_patient(session, patient_id)


# PUT /api/v1/patients/123
@router.put("/{patient_id}")
def update_patient(
    patient_id: int,
    data: PatientUpdate,
    session: Session = Depends(get_session),
):
    return patient_controller.handle_update_patient(session, patient_id, data)


# DELETE /api/v1/patients/123
@router.delete("/{patient_id}", status_code=204)
def delete_patient(patient_id: int, session: Session = Depends(get_session)):
    patient_controller.handle_delete_patient(session, patient_id)