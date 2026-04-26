import os
from sqlmodel import Session, create_engine, select
from dotenv import load_dotenv
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.medicine import Medicine
from app.models.consultation_medicine import ConsultationMedicine
from datetime import datetime, date

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def create_test_patient():
    with Session(engine) as session:
        # Use a high ID to avoid conflicts
        TEST_ID = 12345
        
        # Check if exists to avoid UniqueViolation
        existing = session.get(Patient, TEST_ID)
        if existing:
            session.delete(existing)
            session.commit()

        # 1. Create Patient
        patient = Patient(
            id=TEST_ID, 
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1970, 5, 15), # ~55 years old
            gender="Homme",
            personal_history="Diabète de type 2, Asthme chronique",
            family_history="Hypertension (Père)"
        )
        session.add(patient)
        session.commit()
        session.refresh(patient)
        print(f"✅ Patient created: {patient.first_name} {patient.last_name} (ID: {patient.id})")

        # 2. Add an old Consultation
        consult = Consultation(
            id=5555,
            patient_id=patient.id,
            consultation_date=datetime.now(),
            motif="Suivi Routine",
            diagnostic="Diabète stable",
            severite="modérée"
        )
        session.add(consult)
        session.commit()
        session.refresh(consult)

        # 3. Add an old Medicine (Metformine)
        med = session.exec(select(Medicine).where(Medicine.name == "Metformine")).first()
        if not med:
            med = Medicine(name="Metformine", description="Anti-diabétique")
            session.add(med)
            session.commit()
            session.refresh(med)

        link = ConsultationMedicine(
            consultation_id=consult.id,
            medicine_id=med.id,
            dosage="500mg - 2 fois par jour"
        )
        session.add(link)
        session.commit()
        print("✅ Success: John Doe is ready for testing!")

if __name__ == "__main__":
    create_test_patient()
