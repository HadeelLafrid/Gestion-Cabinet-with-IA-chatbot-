from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.dependencies import get_db
from app.services.dashboardService import get_dashboard_data

router = APIRouter()

@router.get("/dashboard")
def read_dashboard(db: Session = Depends(get_db)):
    return get_dashboard_data(db)   