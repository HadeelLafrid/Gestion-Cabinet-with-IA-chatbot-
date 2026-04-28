from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Standard route imports
import app.routes.consultationRoute as consultationRoute
import app.routes.authenticationRoute as authenticationRoute
from app.routes.patient_routes import router as patient_router
from app.routes.dashboardRoute import router as dashboardRoute
# AI endpoint imports from friend's branch
from app.api.endpoints import (
    ai_consultation,
    ai_diagnosis,
    ai_medicines,
    ai_safe_medicines,
    ai_resume
)

app = FastAPI()

# Middleware settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(consultationRoute.router)
app.include_router(authenticationRoute.router)
app.include_router(patient_router)  
app.include_router(dashboardRoute)

@app.get("/")
async def root():
    return {"message": "Hello World"}

# Register AI routes with prefixes and tags
app.include_router(ai_consultation.router, prefix="/api/ai/consultation", tags=["Ai Consultation"])
app.include_router(ai_diagnosis.router, prefix="/api/ai/diagnosis", tags=["Ai Diagnosis"])
app.include_router(ai_medicines.router, prefix="/api/ai/medicines", tags=["Ai Medicines"])
app.include_router(ai_safe_medicines.router, prefix="/api/ai/safe-medicines", tags=["Ai Safe Medicines"])
app.include_router(ai_resume.router, prefix="/api/ai/resume", tags=["Ai Resume"])


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)