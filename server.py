from flask import Flask, request, jsonify
import os
import openai
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return "Mist Chat Widget is running!"

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        messages = data.get("messages", [])
        chat_text = "\n".join(messages)

        prompt = f"""
Клиент пишет:
{chat_text}

Проанализируй сегодняшнюю переписку. Ответь кратко:
1. Цель клиента?
2. Сомнения или возражения?
3. Что менеджеру сделать дальше?
        """

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )

        return jsonify({"analysis": response.choices[0].message["content"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)