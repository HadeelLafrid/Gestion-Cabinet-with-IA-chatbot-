from typing import Optional
from sqlmodel import Session, select, or_
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.consultation import Consultation
from app.models.ai_report import AIReport
from app.models.chat_message import ChatMessage
from app.models.consultation_exam import ConsultationExam
from app.models.consultation_medicine import ConsultationMedicine
from app.models.payment import Payment
from app.schemas.patient_schema import PatientCreate, PatientUpdate
from datetime import date


def calculate_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - (
        (today.month, today.day) < (dob.month, dob.day)
    )


def calculate_bmi(weight: float, height: float) -> float:
    return round(weight / (height / 100) ** 2, 1)


def create_patient(session: Session, data: PatientCreate) -> Patient:
    patient_data = data.model_dump()

    # Auto-calculate BMI if weight + height provided
    if data.weight and data.height:
        patient_data["bmi"] = calculate_bmi(data.weight, data.height)

    patient = Patient(**patient_data)
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient


def get_patient(session: Session, patient_id: int) -> Optional[Patient]:
    return session.get(Patient, patient_id)


def get_all_patients(
    session: Session,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
):
    statement = select(Patient)

    if search:
        search_term = search.strip()
        if search_term.upper().startswith("PT-"):
            search_term = search_term[3:]
        
        if search_term.isdigit():
            statement = statement.where(Patient.id == int(search_term))
        else:
            q = f"%{search_term}%"
            statement = statement.where(
                or_(
                    Patient.first_name.ilike(q),
                    Patient.last_name.ilike(q),
                    (Patient.first_name + " " + Patient.last_name).ilike(q),
                    (Patient.last_name + " " + Patient.first_name).ilike(q)
                )
            )

    total = len(session.exec(statement).all())
    statement = statement.offset((page - 1) * limit).limit(limit)
    patients = session.exec(statement).all()

    results = []
    for p in patients:
        age = calculate_age(p.date_of_birth) if p.date_of_birth else None
        results.append({
            "id":         p.id,
            "first_name": p.first_name,
            "last_name":  p.last_name,
            "phone":      p.phone,
            "gender":     p.gender,
            "age":        age,
        })

    return {"data": results, "total": total, "page": page, "limit": limit}


def get_patient_detail(session: Session, patient_id: int):
    p = session.get(Patient, patient_id)
    if not p:
        return None

    age = calculate_age(p.date_of_birth) if p.date_of_birth else None
    bmi = calculate_bmi(p.weight, p.height) if p.weight and p.height else None

    return {
        "id":                  p.id,
        "chifa_card_number":   p.chifa_card_number,
        "first_name":          p.first_name,
        "last_name":           p.last_name,
        "date_of_birth":       p.date_of_birth,
        "gender":              p.gender,
        "marital_status":      p.marital_status,
        "profession":          p.profession,
        "number_of_children":  p.number_of_children,
        "phone":               p.phone,
        "address":             p.address,
        "age":                 age,
        "weight":              p.weight,
        "height":              p.height,
        "bmi":                 bmi,
        "personal_history":    p.personal_history,
        "family_history":      p.family_history,
        "notes":               p.notes,
        "general_observation": p.general_observation,
        "documents":           p.documents,
        "created_at":          p.created_at,
    }


def update_patient(
    session: Session, patient_id: int, data: PatientUpdate
) -> Optional[Patient]:
    patient = session.get(Patient, patient_id)
    if not patient:
        return None

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(patient, key, value)

    # Recalculate BMI if weight or height changed
    if patient.weight and patient.height:
        patient.bmi = calculate_bmi(patient.weight, patient.height)

    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient


def delete_patient(session: Session, patient_id: int) -> bool:
    patient = session.get(Patient, patient_id)
    if not patient:
        return False
    # Prevent deletion if related records exist
    has_appointments = session.exec(select(Appointment).where(Appointment.patient_id == patient_id)).first() is not None
    has_consultations = session.exec(select(Consultation).where(Consultation.patient_id == patient_id)).first() is not None
    if has_appointments or has_consultations:
        return False

    session.delete(patient)
    session.commit()
    return True


def force_delete_patient_with_related(session: Session, patient_id: int) -> bool:
    patient = session.get(Patient, patient_id)
    if not patient:
        return False

    consultations = session.exec(
        select(Consultation).where(Consultation.patient_id == patient_id)
    ).all()
    consultation_ids = [c.id for c in consultations if c.id is not None]

    appointments = session.exec(
        select(Appointment).where(Appointment.patient_id == patient_id)
    ).all()

    ai_reports_by_patient = session.exec(
        select(AIReport).where(AIReport.patient_id == patient_id)
    ).all()

    ai_reports_by_consultation = (
        session.exec(select(AIReport).where(AIReport.consultation_id.in_(consultation_ids))).all()
        if consultation_ids
        else []
    )
    payments = (
        session.exec(select(Payment).where(Payment.consultation_id.in_(consultation_ids))).all()
        if consultation_ids
        else []
    )
    chat_messages = (
        session.exec(select(ChatMessage).where(ChatMessage.consultation_id.in_(consultation_ids))).all()
        if consultation_ids
        else []
    )
    consultation_exams = (
        session.exec(select(ConsultationExam).where(ConsultationExam.consultation_id.in_(consultation_ids))).all()
        if consultation_ids
        else []
    )
    consultation_medicines = (
        session.exec(select(ConsultationMedicine).where(ConsultationMedicine.consultation_id.in_(consultation_ids))).all()
        if consultation_ids
        else []
    )

    for row in appointments:
        session.delete(row)
    for row in ai_reports_by_patient:
        session.delete(row)
    for row in ai_reports_by_consultation:
        if row not in ai_reports_by_patient:
            session.delete(row)
    for row in payments:
        session.delete(row)
    for row in chat_messages:
        session.delete(row)
    for row in consultation_exams:
        session.delete(row)
    for row in consultation_medicines:
        session.delete(row)
    for row in consultations:
        session.delete(row)

    session.delete(patient)
    session.commit()
    return True