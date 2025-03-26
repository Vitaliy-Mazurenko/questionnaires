const Response = require('../models/Response');
const Questionnaire = require('../models/Questionnaire');

// Создать новый ответ (начать прохождение опросника)
exports.createResponse = async (req, res) => {
  try {
    const { questionnaireId } = req.body;
    
    // Проверяем существование опросника
    const questionnaire = await Questionnaire.findById(questionnaireId);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Опитування не знайдено' });
    }
    
    const response = new Response({
      questionnaireId,
      answers: [],
      completed: false
    });
    
    const savedResponse = await response.save();
    res.status(201).json(savedResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Обновить ответ (сохранить промежуточное состояние)
exports.updateResponse = async (req, res) => {
  try {
    const { answers } = req.body;
    
    const response = await Response.findByIdAndUpdate(
      req.params.id,
      { answers },
      { new: true }
    );
    
    if (!response) {
      return res.status(404).json({ message: 'Відповідь не знайдена' });
    }
    
    res.json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Завершить прохождение опросника
exports.completeResponse = async (req, res) => {
  try {
    const { answers, completionTime } = req.body;
    
    const response = await Response.findByIdAndUpdate(
      req.params.id,
      { 
        answers, 
        completionTime, 
        completed: true 
      },
      { new: true }
    );
    
    if (!response) {
      return res.status(404).json({ message: 'Відповідь не знайдена' });
    }
    
    // Увеличиваем счетчик завершений опросника
    await Questionnaire.findByIdAndUpdate(
      response.questionnaireId,
      { $inc: { completions: 1 } }
    );
    
    res.json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Получить ответ по ID
exports.getResponseById = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ message: 'Відповідь не знайдена' });
    }
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 