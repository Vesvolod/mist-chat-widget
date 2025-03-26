const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      let body = '';

      // Собираем тело запроса вручную
      await new Promise((resolve) => {
        req.on('data', chunk => { body += chunk });
        req.on('end', resolve);
      });

      const { conversation } = JSON.parse(body);

      const prompt = `Проанализируй переписку с клиентом и дай краткий отчёт:
1. Цель клиента
2. Сомнения клиента
3. Оценка действий менеджера
4. Рекомендации по следующим шагам

Переписка:
${conversation}`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      res.status(200).json({ analysis: response.data.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
