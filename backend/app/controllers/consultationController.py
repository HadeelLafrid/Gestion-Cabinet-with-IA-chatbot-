from app.schemas.consultation_schema import ConsultationCreate
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.db.session import get_session
from app.services.consultationService import create_consultation, get_consultation, get_consultations, update_consultation, delete_consultation

def create_consultation_controller(data: ConsultationCreate, db: Session = Depends(get_session)):
    consultation = create_consultation(db, data)
    return {"id": consultation.id, "message": "Consultation créée avec succès"}

def get_consultation_controller(consultation_id: int, db: Session = Depends(get_session)):
    consultation = get_consultation(db, consultation_id)
    if not consultation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")
    return consultation

def update_consultation_controller(consultation_id: int, data: ConsultationCreate, db: Session = Depends(get_session)):
    consultation = update_consultation(db, consultation_id, data)
    if not consultation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")
    return consultation

def delete_consultation_controller(consultation_id: int, db: Session = Depends(get_session)):
    consultation = delete_consultation(db, consultation_id)
    if not consultation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")
    return consultation

def get_consultations_controller(skip: int = 0, limit: int = 100, db: Session = Depends(get_session), patient_search: str = None, patient_id: int = None, start_date: str = None, end_date: str = None):
    consultations = get_consultations(db, skip, limit, patient_id=patient_id, start_date=start_date, end_date=end_date, patient_search=patient_search)
    if not consultations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No consultations found")
    return consultations