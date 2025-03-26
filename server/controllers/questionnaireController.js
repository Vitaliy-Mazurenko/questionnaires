const Questionnaire = require('../models/Questionnaire');

exports.getQuestionnaires = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    const skip = (page - 1) * limit;
    
    const questionnaires = await Questionnaire.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
      
    const total = await Questionnaire.countDocuments();
    
    res.json({
      questionnaires,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestionnaireById = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Опитування не знайдено' });
    }
    res.json(questionnaire);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createQuestionnaire = async (req, res) => {
  try {
    const questionnaire = new Questionnaire(req.body);
    const savedQuestionnaire = await questionnaire.save();
    res.status(201).json(savedQuestionnaire);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!questionnaire) {
      return res.status(404).json({ message: 'Опитування не знайдено' });
    }
    res.json(questionnaire);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findByIdAndDelete(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Опитування не знайдено' });
    }
    res.json({ message: 'Опитування успішно видалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 