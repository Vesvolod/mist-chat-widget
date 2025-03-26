const axios = require('axios');
const bodyParser = require('body-parser');

module.exports = async (req, res) => {
  bodyParser.json()(req, res, async () => {
    if (req.method === 'POST') {
      const { conversation } = req.body;

      try {
        const prompt = `Проанализируй переписку с клиентом и предоставь краткий отчёт:
1. Цель клиента
2. Сомнения клиента
3. Оценка действий менеджера
4. Рекомендации по следующим шагам

Переписка:
${conversation}`;

        const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }]
        }, {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });

        res.json({ analysis: openaiRes.data.choices[0].message.content });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  });
};
