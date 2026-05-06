#!/usr/bin/env python
"""Create appointments table using direct SQL"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from sqlmodel import create_engine
from app.core.config import settings

# Create engine
engine = create_engine(settings.DATABASE_URL, echo=False)

# SQL to create appointments table
create_appointments_sql = """
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME,
    reason VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'confirmed',
    notes VARCHAR,
    created_at TIMESTAMP,
    INDEX ix_appointments_patient_id (patient_id),
    INDEX ix_appointments_appointment_date (appointment_date),
    INDEX ix_appointments_status (status)
);
"""

try:
    with engine.connect() as conn:
        # Try PostgreSQL syntax for creating indexes
        conn.execute(text("CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id), appointment_date DATE NOT NULL, appointment_time TIME, reason VARCHAR, status VARCHAR NOT NULL DEFAULT 'confirmed', notes VARCHAR, created_at TIMESTAMP)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_appointments_patient_id ON appointments(patient_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_appointments_appointment_date ON appointments(appointment_date)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_appointments_status ON appointments(status)"))
        conn.commit()
    print("✅ Appointments table created successfully!")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
