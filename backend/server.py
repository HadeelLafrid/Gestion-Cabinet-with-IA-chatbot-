from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.patient_routes import router as patient_router
from app.routes.profile_routes import router as profile_router
import app.routes.consultationRoute as consultationRoute
import app.routes.authenticationRoute as authenticationRoute

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient_router)
app.include_router(profile_router)
app.include_router(consultationRoute.router)
app.include_router(authenticationRoute.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}