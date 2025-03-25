from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/")
async def root():
    return JSONResponse({"message": "🚀 Mist Chat Widget is live!"})
