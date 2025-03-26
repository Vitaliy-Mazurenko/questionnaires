import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Сервис для работы с опросниками
export const questionnaireService = {
  // Получить все опросники с пагинацией и сортировкой
  getQuestionnaires: async (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
    const response = await axios.get(`${API_URL}/questionnaires`, {
      params: { page, limit, sortBy, sortOrder }
    });
    return response.data;
  },
  
  // Получить опросник по ID
  getQuestionnaireById: async (id) => {
    const response = await axios.get(`${API_URL}/questionnaires/${id}`);
    return response.data;
  },
  
  // Создать новый опросник
  createQuestionnaire: async (questionnaire) => {
    const response = await axios.post(`${API_URL}/questionnaires`, questionnaire);
    return response.data;
  },
  
  // Обновить опросник
  updateQuestionnaire: async (id, questionnaire) => {
    const response = await axios.put(`${API_URL}/questionnaires/${id}`, questionnaire);
    return response.data;
  },
  
  // Удалить опросник
  deleteQuestionnaire: async (id) => {
    const response = await axios.delete(`${API_URL}/questionnaires/${id}`);
    return response.data;
  }
};

// Сервис для работы с ответами
export const responseService = {
  // Создать новый ответ (начать прохождение опросника)
  createResponse: async (questionnaireId) => {
    const response = await axios.post(`${API_URL}/responses`, { questionnaireId });
    return response.data;
  },
  
  // Получить ответ по ID
  getResponseById: async (id) => {
    const response = await axios.get(`${API_URL}/responses/${id}`);
    return response.data;
  },
  
  // Обновить ответ (сохранить промежуточное состояние)
  updateResponse: async (id, answers) => {
    const response = await axios.put(`${API_URL}/responses/${id}`, { answers });
    return response.data;
  },
  
  // Завершить прохождение опросника
  completeResponse: async (id, answers, completionTime) => {
    const response = await axios.put(`${API_URL}/responses/${id}/complete`, { 
      answers, 
      completionTime 
    });
    return response.data;
  }
}; 