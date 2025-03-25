export default function handler(req, res) {
  const { id } = req.query;
  const messages = [
    { from: "Client", text: "Сколько стоит охлаждение?" },
    { from: "Менеджер", text: "Это зависит от площади. Пришлите план." },
    { from: "Client", text: "Понял, спасибо!" }
  ];
  res.status(200).json({ id, messages: messages.map(m => m.from + ': ' + m.text).join('\n') });
}
