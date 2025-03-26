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
Твоя задача: внимательно обработать переписку с клиентом и выдать структурированный отчёт.

🔍 Инструкция:

1. Определи язык переписки (например, "Русский" или "English")
2. Выдели ВСЕ ключевые параметры, которые уже упоминаются (без выдумок!)
3. Дай краткий анализ цели клиента, стадии диалога, его ожиданий
4. Сгенерируй ответ на том же языке, с учётом уже полученной информации (не повторяй запросов данных)
5. Дай конкретную рекомендацию для менеджера по следующему шагу в продажах

💬 Формат вывода:
{
  "language": "Русский",
  "keywords": ["площадь 120м2", "крыша", "Чангу", "установка в апреле"],
  "analysis": "Клиент предоставил все размеры и указал локацию. Он ждёт предложение. Готовность высокая.",
  "reply": "Спасибо! Размеры и локация получены. Подготовим коммерческое предложение и отправим вам в ближайшее время.",
  "sales_recommendation": "Сформировать КП и отправить. Затем — предложить демо или выезд на объект."
}

📥 Переписка:
"""${message}"""

⚠️ Важно: верни только чистый JSON. Не используй markdown, не добавляй \`\`\`, никаких пояснений.
`;

    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const raw = openaiRes.data.choices[0].message.content;

    // Удаляем лишние обёртки вроде ```json
    const cleaned = raw
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      parsed = {
        reply: cleaned,
        error: "⚠️ Ошибка парсинга JSON. Вот сырой текст:",
        raw
      };
    }

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
