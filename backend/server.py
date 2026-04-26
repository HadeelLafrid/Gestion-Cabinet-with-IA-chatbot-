from fastapi import FastAPI 
from app.api.endpoints import ai_consultation
from app.api.endpoints import ai_diagnosis
from app.api.endpoints import ai_medicines
from app.api.endpoints import ai_safe_medicines
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(ai_consultation.router,prefix="/api/ai/consultation",tags=["Ai Consultation"])
app.include_router(ai_diagnosis.router,prefix="/api/ai/diagnosis",tags=["Ai Diagnosis"])
app.include_router(ai_medicines.router,prefix="/api/ai/medicines",tags=["Ai Medicines"])
app.include_router(ai_safe_medicines.router,prefix="/api/ai/safe-medicines",tags=["Ai Safe Medicines"])
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)