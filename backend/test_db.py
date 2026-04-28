import os
import sys
from app.db.session import get_session
from app.services.consultationService import create_consultation
from app.schemas.consultation_schema import ConsultationCreate

try:
    db = next(get_session())
    payload = ConsultationCreate(
        patient_id=4402,
        consultation_date="2026-04-28T18:35:00Z",
        motif="Test",
        clinical_observation="Test",
        diagnosis="Test",
        severity="Modéré",
        additional_notes="Test",
        medicines=[{"medicine_name": "Test", "dosage": "Test"}],
        exams=[{"exam_name": "Test", "notes": "Test"}],
        payment={"amount": 100}
    )
    res = create_consultation(db, payload)
    print("Success:", res.id)
except Exception as e:
    import traceback
    traceback.print_exc()
