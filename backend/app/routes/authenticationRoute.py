from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from app.db.session import get_session
import app.controllers.authenticationController as authenticationController

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", status_code=200)
def login(data: LoginRequest, db: Session = Depends(get_session)):
    return authenticationController.login_controller(data.username, data.password, db)