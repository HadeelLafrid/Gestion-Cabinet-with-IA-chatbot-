from sqlmodel import Session, select
from app.models.user import User


def get_profile(session: Session):
    user = session.exec(select(User)).first()
    if not user:
        return None
    return {
        "id":                      user.id,
        "username":                user.username,
        "first_name":              user.first_name,
        "last_name":               user.last_name,
        "email":                   user.email,
        "phone":                   user.phone,
        "date_of_birth":           user.date_of_birth,
        "sex":                     user.sex,
        "photo":                   user.photo,
        "specialization":          user.specialization,
        "experience":              user.experience,
        "languages":               user.languages,
        "medical_facility_name":   user.medical_facility_name,
        "medical_facility_address":user.medical_facility_address,
    }


def update_profile(session: Session, data: dict):
    user = session.exec(select(User)).first()
    if not user:
        return None

    allowed_fields = [
        "first_name", "last_name", "email", "phone",
        "date_of_birth", "sex", "specialization", "experience",
        "languages", "medical_facility_name", "medical_facility_address",
    ]

    for field in allowed_fields:
        if field in data and data[field] is not None:
            setattr(user, field, data[field])

    session.add(user)
    session.commit()
    session.refresh(user)
    return get_profile(session)