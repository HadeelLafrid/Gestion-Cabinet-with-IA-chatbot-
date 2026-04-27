from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.routes.consultationRoute as consultationRoute
import app.routes.authenticationRoute as authenticationRoute
from app.routes.patient_routes import router as patient_router 

app = FastAPI()


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


@app.get("/")
async def root():
    return {"message": "Hello World"}

