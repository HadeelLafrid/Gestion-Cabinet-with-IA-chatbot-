from fastapi import FastAPI
from app.routes.patient_routes import router as patient_router  # ADD THIS

app = FastAPI()


app.include_router(patient_router)  