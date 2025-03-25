from fastapi import FastAPI, Path, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests

app = FastAPI()

ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ2MjJhZ..."

class AnalyzeRequest(BaseModel):
    messages: str

@app.get("/")
async def root():
    return JSONResponse({"message": "🚀 Mist Jarvis backend live"})

@app.get("/messages/{lead_id}")
async def get_messages(lead_id: int = Path(...)):
    url = f"https://kommo.com/api/v4/leads/{lead_id}/chats/messages"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
    