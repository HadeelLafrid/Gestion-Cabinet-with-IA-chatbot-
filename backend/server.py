from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
app.include_router(consultationRoute.router)
app.include_router(authenticationRoute.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
