from datetime import date, datetime, time as time_obj
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Field, Session, SQLModel, select

from app.db.session import get_session
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.schemas.patient_schema import PatientCreate


class AppointmentCreate(SQLModel):
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    patient_note: Optional[str] = None
    appointment_date: date
    appointment_time: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[str] = "confirmed"
    notes: Optional[str] = None


class AppointmentUpdate(SQLModel):
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    patient_note: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])


def _serialize(appt: Appointment, patient: Optional[Patient] = None):
    patient_name = ""
    if patient:
        patient_name = f"{patient.first_name or ''} {patient.last_name or ''}".strip()
    return {
        "id": appt.id,
        "patient_id": appt.patient_id,
        "patient_name": patient_name,
        "appointment_date": appt.appointment_date.isoformat() if appt.appointment_date else None,
        "appointment_time": appt.appointment_time.strftime("%H:%M") if appt.appointment_time else None,
        "reason": appt.reason,
        "status": appt.status,
        "notes": appt.notes,
        "created_at": appt.created_at,
    }


def _split_patient_name(full_name: str) -> tuple[str, Optional[str]]:
    parts = [part for part in full_name.strip().split() if part]
    if not parts:
        return "", None
    if len(parts) == 1:
        return parts[0], None
    return parts[0], " ".join(parts[1:])


def _resolve_patient(session: Session, payload: AppointmentCreate) -> Patient:
    if payload.patient_id is not None:
        patient = session.get(Patient, payload.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient non trouvé")
        return patient

    typed_name = (payload.patient_name or "").strip()
    if not typed_name:
        raise HTTPException(status_code=400, detail="Nom du patient requis")

    normalized = " ".join(typed_name.lower().split())
    existing_patient = session.exec(select(Patient)).all()
    for patient in existing_patient:
        full_name = " ".join(part for part in [patient.first_name or "", patient.last_name or ""] if part).strip()
        if full_name and " ".join(full_name.lower().split()) == normalized:
            return patient

    first_name, last_name = _split_patient_name(typed_name)
    patient = Patient(
        first_name=first_name,
        last_name=last_name,
        notes=payload.patient_note or payload.notes,
    )
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient


@router.get("/")
def list_appointments(
    patient_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    statement = select(Appointment).order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc())
    if patient_id:
        statement = statement.where(Appointment.patient_id == patient_id)
    appointments = session.exec(statement).all()
    patient_ids = [a.patient_id for a in appointments]
    patients = session.exec(select(Patient).where(Patient.id.in_(patient_ids))).all() if patient_ids else []
    patient_map = {patient.id: patient for patient in patients}
    return [_serialize(appt, patient_map.get(appt.patient_id)) for appt in appointments]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_appointment(payload: AppointmentCreate, session: Session = Depends(get_session)):
    patient = _resolve_patient(session, payload)

    appointment_time = None
    if payload.appointment_time:
        appointment_time = datetime.strptime(payload.appointment_time, "%H:%M").time()

    appointment = Appointment(
        patient_id=patient.id,
        appointment_date=payload.appointment_date,
        appointment_time=appointment_time,
        reason=payload.reason,
        status=payload.status or "confirmed",
        notes=payload.notes,
    )
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return _serialize(appointment, patient)


@router.put("/{appointment_id}")
def update_appointment(appointment_id: int, payload: AppointmentUpdate, session: Session = Depends(get_session)):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")

    if payload.patient_id is not None:
        patient = session.get(Patient, payload.patient_id)
        if not patient:
          raise HTTPException(status_code=404, detail="Patient non trouvé")
        appointment.patient_id = payload.patient_id
    elif payload.patient_name is not None:
        appointment.patient_id = _resolve_patient(
            session,
            AppointmentCreate(
                patient_name=payload.patient_name,
                patient_note=payload.patient_note,
                appointment_date=appointment.appointment_date,
                appointment_time=payload.appointment_time,
                reason=payload.reason,
                status=payload.status,
                notes=payload.notes,
            ),
        ).id
    if payload.appointment_date is not None:
        appointment.appointment_date = payload.appointment_date
    if payload.appointment_time is not None:
        appointment.appointment_time = datetime.strptime(payload.appointment_time, "%H:%M").time() if payload.appointment_time else None
    if payload.reason is not None:
        appointment.reason = payload.reason
    if payload.status is not None:
        appointment.status = payload.status
    if payload.notes is not None:
        appointment.notes = payload.notes

    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    patient = session.get(Patient, appointment.patient_id)
    return _serialize(appointment, patient)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, session: Session = Depends(get_session)):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")
    session.delete(appointment)
    session.commit()