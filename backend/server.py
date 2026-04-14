from FASTAPI import FASTAPI

app = FASTAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}