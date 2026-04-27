from datetime import date
from app.schemas.consultation_schema import ConsultationCreate
from sqlmodel import Session, select, delete
from app.models import (Consultation, Medicine, Exam, Payment,
                        ConsultationMedicine, ConsultationExam, Patient)
from fastapi import HTTPException
from sqlalchemy import func, cast, String


def create_consultation(db: Session, data: ConsultationCreate) -> Consultation:
    consultation = Consultation(
        patient_id=data.patient_id,
        consultation_date=data.consultation_date,
        motif=data.motif,
        clinical_observation=data.clinical_observation,
        diagnosis=data.diagnosis,
        severity=data.severity,
        additional_notes=data.additional_notes,
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # handle medicines
    for medicine_data in data.medicines:
        medicine = db.exec(                                          
            select(Medicine).where(Medicine.name == medicine_data.medicine_name)
        ).first()                                                  
        if not medicine:
            medicine = Medicine(name=medicine_data.medicine_name)
            db.add(medicine)
            db.commit()
            db.refresh(medicine)
        consultation_medicine = ConsultationMedicine(
            consultation_id=consultation.id,
            medicine_id=medicine.id,
            dosage=medicine_data.dosage,
            duration=medicine_data.duration,
        )
        db.add(consultation_medicine)                                
        db.commit()
        db.refresh(consultation_medicine)

    # handle exams
    for exam_data in data.exams:
        exam = db.exec(                                             
            select(Exam).where(Exam.name == exam_data.exam_name)
        ).first()                                                    
        if not exam:
            exam = Exam(name=exam_data.exam_name)
            db.add(exam)
            db.commit()
            db.refresh(exam)
        consultation_exam = ConsultationExam(
            consultation_id=consultation.id,
            exam_id=exam.id,
            notes=exam_data.notes,                                   
        )
        db.add(consultation_exam)
        db.commit()
        db.refresh(consultation_exam)

    # handle payment
    if data.payment:
        payment = Payment(
            consultation_id=consultation.id,
            amount=data.payment.amount,
            status=data.payment.status,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

    return consultation


def _calculate_age(date_of_birth) -> int | None:
    if not date_of_birth:
        return None
    today = date.today()
    dob = date_of_birth if isinstance(date_of_birth, date) else date_of_birth.date()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def get_consultation(db: Session, consultation_id: int):
    consultation = db.get(Consultation, consultation_id)
    if not consultation:
        return None

    patient = db.get(Patient, consultation.patient_id)             # ✅ fixed typo

    # Fetch medicines with junction table data (contract shape)
    cm_rows = db.exec(
        select(ConsultationMedicine, Medicine)
        .join(Medicine, ConsultationMedicine.medicine_id == Medicine.id)
        .where(ConsultationMedicine.consultation_id == consultation_id)
    ).all()
    medicines = [
        {
            "id": cm.id,
            "medicine_id": cm.medicine_id,
            "medicine_name": med.name,
            "dosage": cm.dosage,
            "duration": cm.duration,
        }
        for cm, med in cm_rows
    ]

    # Fetch exams with junction table data (contract shape)
    ce_rows = db.exec(
        select(ConsultationExam, Exam)
        .join(Exam, ConsultationExam.exam_id == Exam.id)
        .where(ConsultationExam.consultation_id == consultation_id)
    ).all()
    exams = [
        {
            "id": ce.id,
            "exam_id": ce.exam_id,
            "exam_name": exam.name,
            "notes": ce.notes,                                      # ✅ "notes" per contract
        }
        for ce, exam in ce_rows
    ]

    payment = db.exec(
        select(Payment).where(Payment.consultation_id == consultation_id)
    ).first()

    payment_data = None
    if payment:
        payment_data = {
            "id": payment.id,
            "amount": payment.amount,
            "payment_date": payment.payment_date,                    
            "status": payment.status,
        }

    patient_data = None
    if patient:
        patient_data = {
            "id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "age": _calculate_age(patient.date_of_birth),          
            "gender": patient.gender,
            "phone": patient.phone,
            "address": patient.address,
            "personal_history": patient.personal_history,
            "family_history": patient.family_history,
        }

    return {
        "id": consultation.id,
        "consultation_date": consultation.consultation_date,
        "motif": consultation.motif,
        "clinical_observation": consultation.clinical_observation,
        "diagnosis": consultation.diagnosis,
        "severity": consultation.severity,
        "additional_notes": consultation.additional_notes,
        "created_at": consultation.created_at,
        "patient": patient_data,
        "medicines": medicines,
        "exams": exams,
        "payment": payment_data,
    }


def update_consultation(db: Session, consultation_id: int, data: ConsultationCreate):
    consultation = db.get(Consultation, consultation_id)
    if not consultation:
        return None
    for key, value in data.dict().items():
        setattr(consultation, key, value)
    db.commit()
    db.refresh(consultation)
    return consultation


def delete_consultation(db: Session, consultation_id: int):
    consultation = db.get(Consultation, consultation_id)
    if not consultation:
        return None

    # delete related records first
    db.exec(delete(ConsultationMedicine).where(ConsultationMedicine.consultation_id == consultation_id))
    db.exec(delete(ConsultationExam).where(ConsultationExam.consultation_id == consultation_id))
    db.exec(delete(Payment).where(Payment.consultation_id == consultation_id))

    db.delete(consultation)
    db.commit()
    return {"message": "Consultation deleted successfully"}


def get_consultations(db: Session, skip: int = 0, limit: int = 100,
                      patient_id: int = None, date: str = None, patient_search: str = None):
    query = select(Consultation)
    if patient_id:
        query = query.where(Consultation.patient_id == patient_id)
    if date:
        query = query.where(func.date(Consultation.consultation_date) == date)
    if patient_search:
        if patient_search.isdigit():
            query = query.join(Patient).where(
                (Patient.id == int(patient_search))
            )
        else:
            query = query.join(Patient).where(
                (Patient.first_name.contains(patient_search)) |
                (Patient.last_name.contains(patient_search)) 
            )
    consultations = db.exec(query.offset(skip).limit(limit)).all()
    
    if not consultations:
        return []
    
    # Get unique patient IDs
    patient_ids = {c.patient_id for c in consultations}
    
    # Fetch all patients at once
    patients = db.exec(select(Patient).where(Patient.id.in_(patient_ids))).all()
    patient_map = {p.id: p for p in patients}
    
    # Build response with patient info
    result = []
    for consultation in consultations:
        patient = patient_map.get(consultation.patient_id)
        result.append({
            "id": consultation.id,
            "consultation_date": consultation.consultation_date,
            "motif": consultation.motif,
            "clinical_observation": consultation.clinical_observation,
            "diagnosis": consultation.diagnosis,
            "severity": consultation.severity,
            "additional_notes": consultation.additional_notes,
            "created_at": consultation.created_at,
            "patient": {
                "id": patient.id,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "age": _calculate_age(patient.date_of_birth),
                "gender": patient.gender,
            }
            if patient else None
        })
    
    return result

# since there is no direct link between patient and medicine table
# we will fetch all consultations of the patient and get the medicines from there 
def fetch_medicines(db: Session, patient_id: int):
    consultations = db.exec(select(Consultation).where(Consultation.patient_id == patient_id)).all()
    if not consultations:
        return []
    # Get unique medicine IDs
    medicine_consultaions = db.exec(select(ConsultationMedicine).where(ConsultationMedicine.consultation_id.in_([c.id for c in consultations]))).all()
    medicine_ids = {mc.medicine_id for mc in medicine_consultaions}
    if not medicine_ids:
        return []
    medicines = db.exec(select(Medicine).where(Medicine.id.in_(medicine_ids))).all()
    medicine_map = {m.id: m for m in medicines}
    result = []
    for mc in medicine_consultaions:
        medicine = medicine_map.get(mc.medicine_id)
        if medicine:
            result.append({
                "id": medicine.id,
                "name": medicine.name,
                "dosage": mc.dosage,
                "duration": mc.duration,
            })
    return result
    