from sqlmodel import Session, select
from app.db.session import engine
from app.models import (
    User, Patient, Consultation, Medicine, Exam,
    ConsultationMedicine, ConsultationExam, Payment, AIReport, ChatMessage
)
from datetime import datetime, date
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def clear_all(session: Session):
    session.exec(ChatMessage.__table__.delete())
    session.exec(AIReport.__table__.delete())
    session.exec(Payment.__table__.delete())
    session.exec(ConsultationExam.__table__.delete())
    session.exec(ConsultationMedicine.__table__.delete())
    session.exec(Consultation.__table__.delete())
    session.exec(Exam.__table__.delete())
    session.exec(Medicine.__table__.delete())
    session.exec(Patient.__table__.delete())
    session.exec(User.__table__.delete())
    session.commit()
    print("✅ All data cleared.")

def seed(session: Session):
    # ── User (Doctor) ──────────────────────────────────────────
    doctor = User(
        username="dr.benali",
        password=hash_password("password123"),
        first_name="Karim",
        last_name="Benali",
        email="karim.benali@cabinet.dz",
        phone="0555123456",
        date_of_birth=date(1980, 5, 15),
        sex="male",
        specialization="Médecine Générale",
        experience=15,
        languages="Arabe, Français",
        medical_facility_name="Cabinet Médical Benali",
        medical_facility_address="12 Rue Didouche Mourad, Alger",
    )
    session.add(doctor)

    # ── Patients ───────────────────────────────────────────────
    patient1 = Patient(
        chifa_card_number="123456789",
        first_name="Ahmed",
        last_name="Meziane",
        date_of_birth=date(1990, 3, 20),
        gender="male",
        marital_status="married",
        profession="Ingénieur",
        number_of_children=2,
        phone="0661234567",
        address="Alger Centre",
        weight=80.0,
        height=1.78,
        bmi=25.2,
        personal_history="Hypertension since 2018",
        family_history="Diabetes (father)",
        notes="Regular checkups needed",
    )
    patient2 = Patient(
        chifa_card_number="987654321",
        first_name="Fatima",
        last_name="Aouadi",
        date_of_birth=date(1975, 8, 10),
        gender="female",
        marital_status="single",
        profession="Enseignante",
        number_of_children=0,
        phone="0770987654",
        address="Bab Ezzouar, Alger",
        weight=62.0,
        height=1.65,
        bmi=22.8,
    )
    session.add_all([patient1, patient2])

    # ── Medicines ──────────────────────────────────────────────
    med1 = Medicine(name="Paracétamol 500mg")
    med2 = Medicine(name="Amoxicilline 1g")
    med3 = Medicine(name="Ibuprofène 400mg")
    session.add_all([med1, med2, med3])

    # ── Exams ──────────────────────────────────────────────────
    exam1 = Exam(name="Numération Formule Sanguine (NFS)")
    exam2 = Exam(name="Glycémie à jeun")
    exam3 = Exam(name="Radiographie thoracique")
    session.add_all([exam1, exam2, exam3])

    session.commit()
    session.refresh(patient1)
    session.refresh(patient2)
    session.refresh(med1)
    session.refresh(med2)
    session.refresh(exam1)
    session.refresh(exam2)

    # ── Consultations ──────────────────────────────────────────
    consult1 = Consultation(
        patient_id=patient1.id,
        consultation_date=datetime(2026, 4, 10, 9, 30),
        motif="Maux de tête et fièvre",
        clinical_observation="Température 38.5°C, gorge rouge",
        diagnosis="Angine bactérienne",
        severity="moderate",
        additional_notes="Repos conseillé 3 jours",
    )
    consult2 = Consultation(
        patient_id=patient2.id,
        consultation_date=datetime(2026, 4, 15, 14, 0),
        motif="Douleurs abdominales",
        clinical_observation="Douleur épigastrique",
        diagnosis="Gastrite",
        severity="mild",
    )
    session.add_all([consult1, consult2])
    session.commit()
    session.refresh(consult1)
    session.refresh(consult2)

    # ── Consultation Medicines ─────────────────────────────────
    session.add_all([
        ConsultationMedicine(consultation_id=consult1.id, medicine_id=med1.id, dosage="1 comprimé", duration="5 jours"),
        ConsultationMedicine(consultation_id=consult1.id, medicine_id=med2.id, dosage="1 comprimé", duration="7 jours"),
        ConsultationMedicine(consultation_id=consult2.id, medicine_id=med3.id, dosage="1 comprimé", duration="3 jours"),
    ])

    # ── Consultation Exams ─────────────────────────────────────
    session.add_all([
        ConsultationExam(consultation_id=consult1.id, exam_id=exam1.id, notes="Vérifier globules blancs"),
        ConsultationExam(consultation_id=consult2.id, exam_id=exam2.id, notes="À jeun depuis 12h"),
    ])

    # ── Payments ───────────────────────────────────────────────
    session.add_all([
        Payment(consultation_id=consult1.id, amount=1000.0, status="paid"),
        Payment(consultation_id=consult2.id, amount=1000.0, status="pending"),
    ])

    # ── AI Report ──────────────────────────────────────────────
    session.add(AIReport(
        patient_id=patient1.id,
        consultation_id=consult1.id,
        type="summary",
        content="Patient Ahmed Meziane consulted for bacterial angina. Prescribed Paracetamol and Amoxicillin. Follow-up in 1 week.",
    ))

    # ── Chat Messages ──────────────────────────────────────────
    session.add_all([
        ChatMessage(consultation_id=consult1.id, sender="doctor", message="Quels sont vos symptômes ?"),
        ChatMessage(consultation_id=consult1.id, sender="ai",     message="Based on symptoms, likely bacterial infection. Consider antibiotic therapy."),
    ])

    session.commit()
    print("✅ Seed data inserted successfully.")


if __name__ == "__main__":
    import sys
    with Session(engine) as session:
        if "--clear" in sys.argv:
            clear_all(session)
        elif "--seed" in sys.argv:
            seed(session)
        elif "--fresh" in sys.argv:
            clear_all(session)
            seed(session)
        else:
            print("Usage:")
            print("  python -m app.db.seed --seed     # insert data")
            print("  python -m app.db.seed --clear    # delete all data")
            print("  python -m app.db.seed --fresh    # clear then seed")