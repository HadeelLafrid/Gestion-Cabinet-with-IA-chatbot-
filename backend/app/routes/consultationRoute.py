from fastapi import APIRouter, Depends, HTTPException
import app.controllers.consultationController as consultationController

router = APIRouter(prefix="/consultations", tags=["Consultations"])

@router.post("/", status_code=201)
def create_consultation(result=Depends(consultationController.create_consultation_controller)):
    return result

@router.get("/", status_code=200)
def get_consultations(
    skip: int = 0,
    limit: int = 100,
    patient_search: str = None,
    patient_id: int = None,
    date: str = None,
    result=Depends(consultationController.get_consultations_controller)
):
    return result

@router.get("/{consultation_id}", status_code=200)
def get_consultation(consultation_id: int, result=Depends(consultationController.get_consultation_controller)):
    return result

@router.put("/{consultation_id}", status_code=200)
def update_consultation(consultation_id: int, result=Depends(consultationController.update_consultation_controller)):
    return result

@router.delete("/{consultation_id}", status_code=200)
def delete_consultation(consultation_id: int, result=Depends(consultationController.delete_consultation_controller)):
    return result

@router.get("/medicines/{patient_id}", status_code=200)
def get_medicines(patient_id: int, result=Depends(consultationController.get_medicines_controller)):
    return result
