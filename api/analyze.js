const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      let body = '';
      await new Promise((resolve) => {
        req.on('data', chunk => { body += chunk });
        req.on('end', resolve);
      });

      const { message } = JSON.parse(body);

      const prompt = `Ты — вежливый и внимательный менеджер по продажам. Ответь на сообщение клиента с учётом вежливости, ясности и цели продолжить диалог.  
      
Сообщение клиента:
"${message}"`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      res.status(200).json({ reply: response.data.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
