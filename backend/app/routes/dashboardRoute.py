from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.services.dashboardService import get_dashboard_data

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/", status_code=200)
def read_dashboard(db: Session = Depends(get_session)):
    return get_dashboard_data(db)