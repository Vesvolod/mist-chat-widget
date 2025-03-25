export default function handler(req, res) {
  const { messages } = req.body;
  res.status(200).json({
    goals: "Уточнить потребность клиента и площадь объекта",
    doubts: "Цена, сроки, технические условия",
    manager_score: "Отвечает уверенно, но не уточняет детали",
    recommendation: "Задать уточняющие вопросы, предложить кейсы и закрыть на действие"
  });
}
