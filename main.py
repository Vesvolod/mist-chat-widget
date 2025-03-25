from fastapi import FastAPI, Path, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests
import os

app = FastAPI()
ACCESS_TOKEN = os.getenv("KOMMO_ACCESS_TOKEN")

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
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        messages = []

        for m in data.get('_embedded', {}).get('messages', []):
            author = m.get('author_id', 'unknown')
            text = m.get('text', '')
            if text:
                messages.append(f"{author}: {text}")

        return {"messages": "\n".join(messages)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    text = req.messages.strip()
    return {
        "goals": "Выяснить потребность клиента",
        "doubts": "Клиент не уверен в цене/сроках",
        "manager_score": "Отвечает, но не уточняет мотивацию",
        "recommendation": "Задай больше уточняющих вопросов и предложи следующее действие"
    }
