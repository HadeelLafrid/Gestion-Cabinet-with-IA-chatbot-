from datetime import date, timedelta
from app.models import Consultation, Payment, Patient
from sqlmodel import Session, select, func
from sqlalchemy import extract

def get_dashboard_data(db: Session):
    today = date.today()

    # new patients this month
    new_patients = db.exec(
        select(Patient).where(extract('month', Patient.created_at) == today.month)
    ).all()

    # last month patients (avoid division by zero)
    last_month_patients = db.exec(
        select(Patient).where(extract('month', Patient.created_at) == today.month - 1)
    ).all()
    change = 0
    if len(last_month_patients) > 0:
        change = round((len(new_patients) - len(last_month_patients)) / len(last_month_patients) * 100, 1)

    # total consultations this month
    total_consultations = db.exec(
        select(Consultation).where(extract('month', Consultation.consultation_date) == today.month)
    ).all()

    # total revenue this month
    total_revenue = db.exec(
        select(func.sum(Payment.amount)).where(extract('month', Payment.payment_date) == today.month)
    ).one_or_none()
    total_revenue = float(total_revenue) if total_revenue else 0.0

    # total patients ever
    total_patients = db.exec(select(func.count(Patient.id))).one()

    # consultations today
    patients_today = db.exec(
        select(func.count(Consultation.id)).where(func.date(Consultation.consultation_date) == today)
    ).one()

    # recent 7 patients this month
    last_patients = db.exec(
        select(Patient).order_by(Patient.created_at.desc()).limit(7)
    ).all()

    # consultations per day last 7 days
    week_ago = today - timedelta(days=6)
    last_week_consultations = db.exec(
        select(Consultation).where(func.date(Consultation.consultation_date) >= week_ago)
    ).all()

    days_fr = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
    weekly = {day: 0 for day in days_fr}
    for c in last_week_consultations:
        day_index = c.consultation_date.weekday()  # 0=Monday
        weekly[days_fr[day_index]] += 1

    return {
        "stats": {
            "new_patients_month": len(new_patients),
            "change_in_patients": change,
            "total_patients": total_patients,
            "patients_today": patients_today,
            "consultations_month": len(total_consultations),
        },
        "revenue_month": total_revenue,
        "recent_patients": [
            {
                "id": p.id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "age": today.year - p.date_of_birth.year - (
                    (today.month, today.day) < (p.date_of_birth.month, p.date_of_birth.day)
                ) if p.date_of_birth else None,
                "address": p.address,
                "last_consult_date": db.exec(
                    select(func.max(Consultation.consultation_date)).where(Consultation.patient_id == p.id)
                ).one_or_none(),
            }
            for p in last_patients
        ],
        "weekly_activity": [
            {"day": day, "consultations": count}
            for day, count in weekly.items()
        ]
    }