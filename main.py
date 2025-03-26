from fastapi import FastAPI
from fastapi.responses import JSONResponse
import openai
import os
from dotenv import load_dotenv

# Загружаем переменные окружения (для локального тестирования)
load_dotenv()

app = FastAPI()

# Инициализация ключей API из переменных окружения
openai.api_key = os.getenv("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")

@app.get("/")
async def root():
    return {"message": "Mist Jarvis успешно запущен и работает на Vercel!"}

@app.get("/status")
async def status():
    return JSONResponse({"status": "running", "version": "Mist Jarvis 4.5"})

@app.post("/analyze")
async def analyze(conversation: dict):
    messages = conversation.get("messages", [])

    if not messages:
        return JSONResponse({"error": "Нет сообщений для анализа"}, status_code=400)

    prompt = "Проанализируй переписку и выдай краткое резюме:\n\n"
    for msg in messages:
        prompt += f"{msg['role']}: {msg['content']}\n"

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Ты — Mist Jarvis, эксперт по анализу переписок в CRM."},
            {"role": "user", "content": prompt}
        ]
    )

    analysis_result = response['choices'][0]['message']['content']
    return JSONResponse({"analysis": analysis_result})
