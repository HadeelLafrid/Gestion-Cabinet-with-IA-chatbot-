import os
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote, urlparse

from sqlmodel import Session, select
from app.models.user import User
from app.core.config import settings


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


def _resolve_pg_dump_path() -> str:
    """Find pg_dump in PATH or common Windows install locations."""
    found = shutil.which("pg_dump")
    if found:
        return found

    if os.name == "nt":
        base_dirs = [
            Path("C:/Program Files/PostgreSQL"),
            Path("C:/Program Files (x86)/PostgreSQL"),
        ]
        for base in base_dirs:
            if not base.exists():
                continue
            for version_dir in sorted(base.iterdir(), reverse=True):
                candidate = version_dir / "bin" / "pg_dump.exe"
                if candidate.exists():
                    return str(candidate)

    raise RuntimeError(
        "pg_dump introuvable. Installez PostgreSQL client tools "
        "ou ajoutez pg_dump au PATH système."
    )


def create_database_backup() -> tuple[Path, str]:
    """Create a PostgreSQL SQL backup file and return (path, filename)."""
    db_url = settings.DATABASE_URL
    parsed = urlparse(db_url)

    if not parsed.scheme.startswith("postgresql"):
        raise RuntimeError("Le backup automatique est disponible uniquement pour PostgreSQL.")

    backend_root = Path(__file__).resolve().parents[2]
    backup_dir = backend_root / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"db_backup_{timestamp}.sql"
    backup_path = backup_dir / backup_filename

    username = unquote(parsed.username or "")
    password = unquote(parsed.password or "")
    host = parsed.hostname or "localhost"
    port = str(parsed.port or 5432)
    db_name = (parsed.path or "").lstrip("/")

    if not db_name:
        raise RuntimeError("Nom de base PostgreSQL introuvable dans DATABASE_URL.")

    pg_dump = _resolve_pg_dump_path()

    env = os.environ.copy()
    env["PGPASSWORD"] = password

    cmd = [
        pg_dump,
        "-h", host,
        "-p", port,
        "-U", username,
        "-d", db_name,
        "-f", str(backup_path),
    ]

    try:
        subprocess.run(cmd, check=True, env=env, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        stderr = (exc.stderr or "").strip()
        raise RuntimeError(f"Échec de création du backup: {stderr or 'erreur inconnue'}") from exc

    return backup_path, backup_filename