from fastapi import APIRouter, Depends, HTTPException
import app.controllers.authenticationController as authenticationController

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", status_code=200)
def login(username: str, password: str, result=Depends(authenticationController.login_controller)):
    return result