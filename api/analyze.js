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
Ты — AI-ассистент для CRM-системы. Получаешь переписку с клиентом и должен:
1. Определить язык переписки
2. Кратко проанализировать цель клиента, его сомнения и фазу диалога
3. Сгенерировать вежливый и уместный ответ на том же языке
4. Дать рекомендации для менеджера по следующему действию в продажах

Переписка:
"""${message}"""

Верни ответ строго в формате:
{
  "language": "английский",
  "analysis": "...",
  "reply": "...",
  "sales_recommendation": "..."
}
`;

    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = openaiRes.data.choices[0].message.content;

    // Попробуем распарсить как JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { reply: content }; // если невалидный JSON, просто вернём текст
    }

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
