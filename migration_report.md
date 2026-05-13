# Legacy Migration Report 📊

**Date**: April 21, 2026
**Topic**: Database Migration from Legacy SQL Dump (`gestcab_anonymized.sql`)
**Target System**: New Python FastAPI/SQLModel Backend Architecture

This document summarizes the steps taken to successfully parse the legacy SQL database dump and migrate its data into the new, normalized PostgreSQL database models.

---

## 1. Migration Architecture

Instead of directly importing tables structurally, a Python script (`backend/scripts/load_legacy_dump.py`) acts as the ETL (Extract, Transform, Load) bridge:
1. **Extracts** raw insert statements from the `.sql` dump directly using regex and string splitting.
2. **Transforms** the legacy data, cleans up strings, handles nulls, and standardizes formats (e.g., merging split dates and times into a single Datetime object, hashing passwords).
3. **Loads** the sanitized data structurally into the new models (`patients`, `consultations`, `payments`, `users`, etc.) utilizing SQLAlchemy Core.

---

## 2. Table Mappings & Transformations

Here are all the data mappings that have been handled in the script:

### A. Security & Login (`login` ➡️ `users`)
We successfully integrated user extraction. Since the legacy system used plain text passwords, we integrated **Bcrypt hashing** via `passlib` to secure accounts seamlessly during the migration.
* `login` → `username`
* `password` → Filtered through `bcrypt.hash()`
* `Prenom`, `Nom` → `first_name`, `last_name`
* `mail` → `email`
* `Specialite`, `Adresse` → `specialization`, `medical_facility_address`

### B. Patients (`patient` ➡️ `patients`)
* Standardized names, addresses, and contacts.
* `CIVIL` strings ("M.", "Mme.") transformed into semantic `gender` ("male", "female").
* `POIDS` (weight) and `TAILLE` (height) imported, with an automatic calculation added for `BMI` indices missing from the old system.
* Mapped `ANTECEDANTPERSO` and `ANTECEDANTFAM` to personal and family histories.

### C. Consultations & Payments (`consultation` ➡️ `consultations` + `payments`)
* **Time Consolidation**: Exploded the legacy `DATE` and `HEURE` columns into a solid, standard `consultation_date` timestamp.
* **Clinical Data**: Mapped `CONSTAT`, `DIAGNOSTIC`, `EXPLORATION`, and `MALADIE` completely to the new fields.
* **Payment Extraction**: The legacy system didn't have a payments ledger. It stored the price inside the consultation (`TARIF`). We parse this and automatically generate standard ledger entries in the `payments` table, setting status to `"paid"` or `"free"`.

### D. Medical Prescriptions (`ordonnance` ➡️ `medicines` + `consultation_medicines`)
The old database tied prescriptions in single strings. We normalized this to a proper relational structure:
* **Medicines Dictionary**: We dynamically harvest unique `MEDICAMENT` names across all prescriptions and inject them into a unified `medicines` catalog.
* **Prescription Ledger**: We pair `ID_CONSULT` and the extracted `medicine_id` alongside `PRISE` and `TYPE` (which form `dosage`) and `DUREE` (`duration`) to correctly populate `consultation_medicines`.

---

## 3. Next Steps
- Connect your new FastAPI database URL in the `.env` settings.
- Run `python -m backend.scripts.load_legacy_dump` from your terminal to execute the ETL process.
- Review the `__pycache__` and endpoints to ensure `users` route leverages Bcrypt `verify` exactly identically.
