from typing import Optional
from sqlmodel import Session, select, or_
from app.models.patient import Patient
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
        q = f"%{search}%"
        statement = statement.where(
            or_(
                Patient.first_name.ilike(q),
                Patient.last_name.ilike(q),
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
    session.delete(patient)
    session.commit()
    return True