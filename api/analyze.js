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
You are a smart AI assistant integrated into a CRM. Your job is to process a conversation with a client and return the following:

1. Automatically detect the language (e.g., English, Russian, etc.)
2. Briefly analyze the client's intent, doubts, and current sales stage (lead, warm-up, decision)
3. Generate a polite and effective response for the client in the same language
4. Provide clear sales recommendations for the manager

Return your output **strictly** as a JSON like this:

{
  "language": "Русский",
  "analysis": "Клиент интересуется системой, но не уверен, нужна ли она сейчас. Он на этапе принятия решения.",
  "reply": "Здравствуйте! Спасибо за интерес к нашей системе. Готов ответить на любые вопросы или провести демонстрацию — как вам будет удобно?",
  "sales_recommendation": "Предложить бесплатную демонстрацию, затем зафиксировать воронку как 'переговоры'"
}

Here is the full conversation:
"""${message}"""
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

    // Попробуем безопасно распарсить JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        reply: content,
        error: "⚠️ Ответ не удалось распарсить как JSON"
      };
    }

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
