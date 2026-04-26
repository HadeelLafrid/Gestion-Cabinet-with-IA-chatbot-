import sys
from pathlib import Path
from sqlmodel import Session, create_engine, select

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.models.patient import Patient

def update_existing_patients():
    engine = create_engine(settings.DATABASE_URL)
    with Session(engine) as session:
        print("Fetching patients from database...")
        statement = select(Patient).order_by(Patient.id)
        patients = session.exec(statement).all()
        
        total = len(patients)
        print(f"Found {total} patients. Starting update...")
        
        for i, patient in enumerate(patients, 1):
            patient.first_name = f"mohamed{i}"
            patient.last_name = "Patient"
            session.add(patient)
            
            if i % 500 == 0:
                session.commit()
                print(f"Updated {i}/{total} patients...")
        
        session.commit()
        print(f"Successfully updated all {total} patients.")

if __name__ == "__main__":
    update_existing_patients()
