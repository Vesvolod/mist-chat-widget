const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = '';
    await new Promise((resolve) => {
      req.on('data', chunk => { body += chunk });
      req.on('end', resolve);
    });

    const { message } = JSON.parse(body);

    const prompt = `
Ты — профессиональный AI-ассистент отдела продаж в CRM.  
Ты получаешь полный лог переписки, в котором есть:
- реальные сообщения от клиента и менеджера
- технические поля CRM: "Moved to", "The value of field", "Invoice sent", "Delivered", "From Robot", и т.п.

🔍 Важно: полностью игнорируй технические строки. Анализируй и формируй выводы только на основе живых сообщений от клиента и менеджера.

🎯 Твоя задача:

1. Определи язык переписки (например, "Русский", "English", "Bahasa")
2. Выдели ВСЕ ключевые параметры (локация, размеры, бюджет, интерес, сроки)
3. Проанализируй: чего хочет клиент, на какой стадии он, есть ли возражения
4. Сформируй вежливый, полезный ответ **всегда на русском**, независимо от языка клиента
5. Дай рекомендации по следующему шагу продаж

📦 Формат JSON-ответа:
{
  "language": "Bahasa",
  "keywords": ["Jakarta", "установка", "периметр 150 метров", "стоимость", "смета", "интерес", "готовность"],
  "analysis": "Клиент проявляет интерес, отправлены параметры. Он ожидает КП. Готовность высокая.",
  "reply": "Спасибо за информацию! Мы подготовим для вас коммерческое предложение и свяжемся с вами в ближайшее время. Если возникнут дополнительные вопросы — пожалуйста, дайте знать.",
  "sales_recommendation": "Отправить КП и назначить звонок/демо. Уточнить сроки принятия решения."
}

📥 Переписка (включая технические строки):
"""${message}"""

⚠️ Обязательно: верни строго валидный JSON без markdown, без пояснений, без обёрток \`\`\`
`;

    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const raw = openaiRes.data.choices[0].message.content;

    // Удаляем возможные markdown-обёртки
    const cleaned = raw
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        reply: cleaned,
        error: "⚠️ Ответ не удалось распарсить как JSON",
        raw
      };
    }

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
