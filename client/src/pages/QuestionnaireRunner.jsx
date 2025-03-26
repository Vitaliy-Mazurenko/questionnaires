import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionnaireService, responseService } from '../services/api';
import '../styles/QuestionnaireRunner.css';

const QuestionnaireRunner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [questionnaire, setQuestionnaire] = useState(null);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [completionTime, setCompletionTime] = useState(null);

  useEffect(() => {
    fetchQuestionnaire();
  }, [id]);

  useEffect(() => {
    const savedState = localStorage.getItem(`questionnaire_${id}`);
    if (savedState) {
      const { responseId, answers, currentQuestionIndex, startTime } = JSON.parse(savedState);
      setCurrentResponse({ _id: responseId });
      setAnswers(answers);
      setCurrentQuestionIndex(currentQuestionIndex);
      setStartTime(startTime);
    } else {
      setStartTime(Date.now());
    }
  }, [id]);

  const fetchQuestionnaire = async () => {
    try {
      const data = await questionnaireService.getQuestionnaireById(id);
      setQuestionnaire(data);
      
      if (!localStorage.getItem(`questionnaire_${id}`)) {
        const response = await responseService.createResponse(id);
        setCurrentResponse(response);
        saveState(response._id, {}, 0);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке опросника:', error);
      setLoading(false);
    }
  };

  const saveState = (responseId, currentAnswers, questionIndex) => {
    localStorage.setItem(`questionnaire_${id}`, JSON.stringify({
      responseId,
      answers: currentAnswers,
      currentQuestionIndex: questionIndex,
      startTime: startTime
    }));
  };

  const handleAnswer = (answer) => {
    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: answer
    };
    setAnswers(updatedAnswers);
    
    saveState(currentResponse._id, updatedAnswers, currentQuestionIndex);
    
    if (currentQuestionIndex < questionnaire.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleComplete = async () => {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    try {
      const formattedAnswers = questionnaire.questions.map((question, index) => ({
        questionId: question._id,
        questionText: question.text,
        answer: answers[index],
        questionType: question.type
      }));

      await responseService.completeResponse(
        currentResponse._id,
        formattedAnswers,
        totalTime
      );

      setCompleted(true);
      setCompletionTime(totalTime);
      
      localStorage.removeItem(`questionnaire_${id}`);
    } catch (error) {
      console.error('Ошибка при сохранении ответов:', error);
    }
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  if (completed) {
    return (
      <div className="questionnaire-results">
        <h1>Опитування завершено!</h1>
        <div className="completion-info">
          <p>Час проходження: {Math.round(completionTime / 1000)} секунд</p>
        </div>
        
        <div className="answers-summary">
          <h2>Ваші відповіді:</h2>
          {questionnaire.questions.map((question, index) => (
            <div key={index} className="answer-item">
              <h3>Питання {index + 1}: {question.text}</h3>
              <div className="answer">
                {question.type === 'text' ? (
                  <p>{answers[index]}</p>
                ) : question.type === 'multiple' ? (
                  <ul>
                    {answers[index]?.map((optionIndex) => (
                      <li key={optionIndex}>{question.options[optionIndex].text}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{question.options[answers[index]]?.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button className="return-button" onClick={() => navigate('/')}>
          Повернутися до списку опитувань
        </button>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];

  return (
    <div className="questionnaire-runner">
      <h1>{questionnaire.name}</h1>
      <div className="progress-bar">
        <div 
          className="progress"
          style={{ width: `${(currentQuestionIndex / questionnaire.questions.length) * 100}%` }}
        />
      </div>
      
      <div className="question-container">
        <h2>Питання {currentQuestionIndex + 1} з {questionnaire.questions.length}</h2>
        <p className="question-text">{currentQuestion.text}</p>
        
        <div className="answer-section">
          {currentQuestion.type === 'text' ? (
            <div className="text-answer">
              <textarea
                value={answers[currentQuestionIndex] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Введіть вашу відповідь..."
              />
            </div>
          ) : currentQuestion.type === 'single' ? (
            <div className="single-choice">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="radio-label">
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    checked={answers[currentQuestionIndex] === index}
                    onChange={() => handleAnswer(index)}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          ) : (
            <div className="multiple-choice">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={answers[currentQuestionIndex]?.includes(index)}
                    onChange={(e) => {
                      const currentAnswers = answers[currentQuestionIndex] || [];
                      const updatedAnswers = e.target.checked
                        ? [...currentAnswers, index]
                        : currentAnswers.filter(i => i !== index);
                      handleAnswer(updatedAnswers);
                    }}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          )}
        </div>
        
        <div className="navigation-buttons">
          <button
            className="prev-button"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            Назад
          </button>
          
          {currentQuestionIndex === questionnaire.questions.length - 1 ? (
            <button
              className="complete-button"
              onClick={handleComplete}
              disabled={!answers[currentQuestionIndex]}
            >
              Завершити
            </button>
          ) : (
            <button
              className="next-button"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={!answers[currentQuestionIndex]}
            >
              Далі
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireRunner; 