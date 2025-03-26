const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'single', 'multiple'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  options: [{
    text: String
  }],
  order: {
    type: Number,
    required: true
  }
});

const QuestionnaireSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  questions: [QuestionSchema],
  completions: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Questionnaire', QuestionnaireSchema); 