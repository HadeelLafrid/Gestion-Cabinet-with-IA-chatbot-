from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

import sqlalchemy as sa
from sqlmodel import create_engine
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import settings

import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')



def _split_tuples(values_block: str) -> list[str]:
    tuples: list[str] = []
    in_string = False
    escaped = False
    depth = 0
    current: list[str] = []

    for ch in values_block:
        if in_string:
            current.append(ch)
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == "'":
                in_string = False
            continue

        if ch == "'":
            in_string = True
            current.append(ch)
            continue

        if ch == "(":
            depth += 1
            current.append(ch)
            continue

        if ch == ")":
            depth -= 1
            current.append(ch)
            if depth == 0:
                tuples.append("".join(current).strip())
                current = []
            continue

        if depth > 0:
            current.append(ch)

    return tuples


def _split_fields(tuple_text: str) -> list[str]:
    body = tuple_text.strip()
    if body.startswith("(") and body.endswith(")"):
        body = body[1:-1]

    fields: list[str] = []
    current: list[str] = []
    in_string = False
    escaped = False

    for ch in body:
        if in_string:
            current.append(ch)
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == "'":
                in_string = False
            continue

        if ch == "'":
            in_string = True
            current.append(ch)
            continue

        if ch == ",":
            fields.append("".join(current).strip())
            current = []
            continue

        current.append(ch)

    fields.append("".join(current).strip())
    return fields


def _decode_literal(token: str) -> Any:
    t = token.strip()
    if t.upper() == "NULL":
        return None

    if len(t) >= 2 and t[0] == "'" and t[-1] == "'":
        s = t[1:-1]
        s = s.replace("\\r", "\r").replace("\\n", "\n").replace("\\t", "\t")
        s = s.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")
        return s

    if re.fullmatch(r"-?\d+", t):
        return int(t)

    if re.fullmatch(r"-?\d+\.\d+", t):
        return float(t)

    return t


def iter_insert_rows(sql_text: str, table_name: str) -> Iterable[dict[str, Any]]:
    pattern = re.compile(
        rf"INSERT INTO `{re.escape(table_name)}`\s*\((.*?)\)\s*VALUES\s*(.*?);",
        re.IGNORECASE | re.DOTALL,
    )

    for match in pattern.finditer(sql_text):
        raw_columns = match.group(1)
        values_block = match.group(2)
        columns = [c.strip().strip("`") for c in raw_columns.split(",")]

        for tuple_text in _split_tuples(values_block):
            values = [_decode_literal(x) for x in _split_fields(tuple_text)]
            if len(values) != len(columns):
                continue
            yield dict(zip(columns, values))


def _clean_str(value: Any) -> str | None:
    if value is None:
        return None
    s = str(value).strip()
    if s == "" or s == "--":
        return None
    return s


def _to_int(value: Any) -> int | None:
    if value is None:
        return None
    s = str(value).strip()
    if s == "" or s == "--":
        return None
    try:
        return int(float(s))
    except ValueError:
        return None


def _to_float(value: Any) -> float | None:
    if value is None:
        return None
    s = str(value).strip().replace(",", ".")
    if s == "" or s == "--":
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _parse_gender(civil: Any) -> str | None:
    c = _clean_str(civil)
    if not c:
        return None
    cl = c.lower()
    if cl.startswith("m.") or cl == "m":
        return "male"
    if cl.startswith("mme") or cl.startswith("mlle"):
        return "female"
    return None


def _parse_datetime(date_value: Any, time_value: Any) -> datetime | None:
    d = _clean_str(date_value)
    if not d:
        return None
    t = _clean_str(time_value) or "00:00:00"
    try:
        return datetime.strptime(f"{d} {t}", "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None


def load_dump(dump_path: Path) -> None:
    sql_text = dump_path.read_text(encoding="utf-8", errors="ignore")

    patient_rows = list(iter_insert_rows(sql_text, "patient"))
    consultation_rows = list(iter_insert_rows(sql_text, "consultation"))
    login_rows = list(iter_insert_rows(sql_text, "login"))
    ordonnance_rows = list(iter_insert_rows(sql_text, "ordonnance"))

    patients_payload: list[dict[str, Any]] = []
    patient_ids: set[int] = set()

    i = 1
    for row in patient_rows:
        patient_id = _to_int(row.get("ID"))
        if patient_id is None:
            continue

        weight = _to_float(row.get("POIDS"))
        height_cm = _to_float(row.get("TAILLE"))
        bmi = None
        if weight and height_cm and height_cm > 0:
            h_m = height_cm / 100.0
            bmi = round(weight / (h_m * h_m), 2)

        payload = {
            "id": patient_id,
            "chifa_card_number": _clean_str(row.get("CHIFA")),
            "first_name": f"mohamed{i}",
            "last_name": "Patient",
            "date_of_birth": None,
            "gender": _parse_gender(row.get("CIVIL")),
            "marital_status": _clean_str(row.get("SITUATION")),
            "profession": _clean_str(row.get("PROFESSION")),
            "number_of_children": _to_int(row.get("ENFANTS")),
            "phone": _clean_str(row.get("TELEPHONE")),
            "address": _clean_str(row.get("ADRESSE")),
            "weight": weight,
            "height": height_cm,
            "bmi": bmi,
            "personal_history": _clean_str(row.get("ANTECEDANTPERSO")),
            "family_history": _clean_str(row.get("ANTECEDANTFAM")),
            "notes": _clean_str(row.get("NOTE")),
            "general_observation": None,
            "documents": None,
            "created_at": datetime.utcnow(),
        }
        patients_payload.append(payload)
        patient_ids.add(patient_id)
        i += 1

    consultations_payload: list[dict[str, Any]] = []
    payments_payload: list[dict[str, Any]] = []

    for row in consultation_rows:
        consultation_id = _to_int(row.get("ID"))
        patient_id = _to_int(row.get("ID_PATIENT"))
        if consultation_id is None or patient_id is None or patient_id not in patient_ids:
            continue

        dt = _parse_datetime(row.get("DATE"), row.get("HEURE"))
        tariff = _to_float(row.get("TARIF"))

        consultations_payload.append(
            {
                "id": consultation_id,
                "patient_id": patient_id,
                "consultation_date": dt,
                "motif": _clean_str(row.get("MALADIE")),
                "clinical_observation": _clean_str(row.get("CONSTAT")),
                "diagnosis": _clean_str(row.get("DIAGNOSTIC")),
                "severity": _clean_str(row.get("EXPLORATION")),
                "additional_notes": _clean_str(row.get("NOTE")),
                "created_at": dt or datetime.utcnow(),
            }
        )

        if tariff is not None:
            payments_payload.append(
                {
                    "id": consultation_id,
                    "consultation_id": consultation_id,
                    "amount": tariff,
                    "payment_date": dt or datetime.utcnow(),
                    "status": "paid" if tariff > 0 else "free",
                }
            )

    engine = create_engine(settings.DATABASE_URL, echo=False)

    users_payload: list[dict[str, Any]] = []
    for row in login_rows:
        user_id = _to_int(row.get("ID"))
        if user_id is None:
            continue
        
        raw_password = _clean_str(row.get("password")) or "1234"
        hashed_password = get_password_hash(raw_password[:72])
        
        users_payload.append({
            "id": user_id,
            "username": _clean_str(row.get("login")),
            "password": hashed_password,
            "first_name": _clean_str(row.get("Prenom")) or "",
            "last_name": _clean_str(row.get("Nom")) or "",
            "email": _clean_str(row.get("mail")) or f"user{user_id}@example.com",
            "phone": _clean_str(row.get("Tel")),
            "specialization": _clean_str(row.get("Specialite")),
            "medical_facility_address": _clean_str(row.get("Adresse")),
            "created_at": datetime.utcnow()
        })

    medicines_dict: dict[str, int] = {}
    medicines_payload: list[dict[str, Any]] = []
    consultation_medicines_payload: list[dict[str, Any]] = []
    next_med_id = 1
    
    for row in ordonnance_rows:
        consultation_id = _to_int(row.get("ID_CONSULT"))
        med_name = _clean_str(row.get("MEDICAMENT"))
        
        if consultation_id is None or med_name is None:
            continue
            
        med_name_key = med_name.lower()
        if med_name_key not in medicines_dict:
            medicines_dict[med_name_key] = next_med_id
            medicines_payload.append({
                "id": next_med_id,
                "name": med_name
            })
            next_med_id += 1
            
        med_id = medicines_dict[med_name_key]
        
        prise = _clean_str(row.get("PRISE"))
        type_form = _clean_str(row.get("TYPE"))
        dosage = (f"{prise} {type_form}").strip() if (prise or type_form) else None
        
        consultation_medicines_payload.append({
            "consultation_id": consultation_id,
            "medicine_id": med_id,
            "dosage": dosage,
            "duration": _clean_str(row.get("DUREE"))
        })

    with engine.begin() as conn:
        if users_payload:
            conn.execute(
                sa.text(
                    """
                    INSERT INTO users (
                        id, username, password, first_name, last_name, email, phone,
                        specialization, medical_facility_address, created_at
                    ) VALUES (
                        :id, :username, :password, :first_name, :last_name, :email, :phone,
                        :specialization, :medical_facility_address, :created_at
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        username = EXCLUDED.username,
                        password = EXCLUDED.password,
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name,
                        email = EXCLUDED.email,
                        phone = EXCLUDED.phone,
                        specialization = EXCLUDED.specialization,
                        medical_facility_address = EXCLUDED.medical_facility_address
                    """
                ),
                users_payload,
            )

        if medicines_payload:
            conn.execute(
                sa.text(
                    """
                    INSERT INTO medicines (id, name) VALUES (:id, :name)
                    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
                    """
                ),
                medicines_payload,
            )

        if consultation_medicines_payload:
            conn.execute(
                sa.text(
                    """
                    INSERT INTO consultation_medicines (
                        consultation_id, medicine_id, dosage, duration
                    ) VALUES (
                        :consultation_id, :medicine_id, :dosage, :duration
                    )
                    """
                ),
                consultation_medicines_payload,
            )

        if patients_payload:
            conn.execute(
                sa.text(
                    """
                    INSERT INTO patients (
                        id, chifa_card_number, first_name, last_name, date_of_birth, gender,
                        marital_status, profession, number_of_children, phone, address,
                        weight, height, bmi, personal_history, family_history, notes,
                        general_observation, documents, created_at
                    ) VALUES (
                        :id, :chifa_card_number, :first_name, :last_name, :date_of_birth, :gender,
                        :marital_status, :profession, :number_of_children, :phone, :address,
                        :weight, :height, :bmi, :personal_history, :family_history, :notes,
                        :general_observation, :documents, :created_at
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        chifa_card_number = EXCLUDED.chifa_card_number,
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name,
                        date_of_birth = EXCLUDED.date_of_birth,
                        gender = EXCLUDED.gender,
                        marital_status = EXCLUDED.marital_status,
                        profession = EXCLUDED.profession,
                        number_of_children = EXCLUDED.number_of_children,
                        phone = EXCLUDED.phone,
                        address = EXCLUDED.address,
                        weight = EXCLUDED.weight,
                        height = EXCLUDED.height,
                        bmi = EXCLUDED.bmi,
                        personal_history = EXCLUDED.personal_history,
                        family_history = EXCLUDED.family_history,
                        notes = EXCLUDED.notes,
                        general_observation = EXCLUDED.general_observation,
                        documents = EXCLUDED.documents
                    """
                ),
                patients_payload,
            )

        if consultations_payload:
            conn.execute(
                sa.text(
                    """
                    INSERT INTO consultations (
                        id, patient_id, consultation_date, motif, clinical_observation,
                        diagnosis, severity, additional_notes, created_at
                    ) VALUES (
                        :id, :patient_id, :consultation_date, :motif, :clinical_observation,
                        :diagnosis, :severity, :additional_notes, :created_at
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        patient_id = EXCLUDED.patient_id,
                        consultation_date = EXCLUDED.consultation_date,
                        motif = EXCLUDED.motif,
                        clinical_observation = EXCLUDED.clinical_observation,
                        diagnosis = EXCLUDED.diagnosis,
                        severity = EXCLUDED.severity,
                        additional_notes = EXCLUDED.additional_notes
                    """
                ),
                consultations_payload,
            )

        if payments_payload:
            conn.execute(
                sa.text(
                    """
                    INSERT INTO payments (
                        id, consultation_id, amount, payment_date, status
                    ) VALUES (
                        :id, :consultation_id, :amount, :payment_date, :status
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        consultation_id = EXCLUDED.consultation_id,
                        amount = EXCLUDED.amount,
                        payment_date = EXCLUDED.payment_date,
                        status = EXCLUDED.status
                    """
                ),
                payments_payload,
            )

        conn.execute(
            sa.text(
                "SELECT setval(pg_get_serial_sequence('patients', 'id'), COALESCE((SELECT MAX(id) FROM patients), 1), true)"
            )
        )
        conn.execute(
            sa.text(
                "SELECT setval(pg_get_serial_sequence('consultations', 'id'), COALESCE((SELECT MAX(id) FROM consultations), 1), true)"
            )
        )
        conn.execute(
            sa.text(
                "SELECT setval(pg_get_serial_sequence('payments', 'id'), COALESCE((SELECT MAX(id) FROM payments), 1), true)"
            )
        )
        conn.execute(
            sa.text(
                "SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), true)"
            )
        )
        conn.execute(
            sa.text(
                "SELECT setval(pg_get_serial_sequence('medicines', 'id'), COALESCE((SELECT MAX(id) FROM medicines), 1), true)"
            )
        )
        conn.execute(
            sa.text(
                "SELECT setval(pg_get_serial_sequence('consultation_medicines', 'id'), COALESCE((SELECT MAX(id) FROM consultation_medicines), 1), true)"
            )
        )

    print(f"Imported {len(users_payload)} users")
    print(f"Imported {len(patients_payload)} patients")
    print(f"Imported {len(consultations_payload)} consultations")
    print(f"Imported {len(payments_payload)} payments")
    print(f"Imported {len(medicines_payload)} medicines")
    print(f"Imported {len(consultation_medicines_payload)} consultation medicines")


def main() -> None:
    parser = argparse.ArgumentParser(description="Load legacy MySQL dump data into PostgreSQL app tables")
    parser.add_argument(
        "--dump-file",
        default="../gestcab_anonymized.sql",
        help="Path to legacy SQL dump file",
    )

    args = parser.parse_args()
    dump_path = Path(args.dump_file).resolve()

    if not dump_path.exists():
        raise FileNotFoundError(f"Dump file not found: {dump_path}")

    load_dump(dump_path)


if __name__ == "__main__":
    main()
