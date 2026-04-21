from fastapi import FastAPI
import app.routes.consultationRoute as consultationRoute
import app.routes.authenticationRoute as authenticationRoute

app = FastAPI()
app.include_router(consultationRoute.router)
app.include_router(authenticationRoute.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
