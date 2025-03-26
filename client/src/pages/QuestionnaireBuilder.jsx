import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { questionnaireService } from '../services/api';
import '../styles/QuestionnaireBuilder.css';

const QuestionnaireBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [questionnaire, setQuestionnaire] = useState({
    name: '',
    description: '',
    questions: []
  });
  
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchQuestionnaire();
    }
  }, [id]);

  const fetchQuestionnaire = async () => {
    try {
      const data = await questionnaireService.getQuestionnaireById(id);
      setQuestionnaire(data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке опросника:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await questionnaireService.updateQuestionnaire(id, questionnaire);
      } else {
        await questionnaireService.createQuestionnaire(questionnaire);
      }
      navigate('/');
    } catch (error) {
      console.error('Ошибка при сохранении опросника:', error);
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      type,
      text: '',
      options: type !== 'text' ? [{ text: '' }, { text: '' }] : [],
      order: questionnaire.questions.length
    };
    
    setQuestionnaire({
      ...questionnaire,
      questions: [...questionnaire.questions, newQuestion]
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'question') {
      const questions = Array.from(questionnaire.questions);
      const [removed] = questions.splice(source.index, 1);
      questions.splice(destination.index, 0, removed);

      const reorderedQuestions = questions.map((q, index) => ({
        ...q,
        order: index
      }));

      setQuestionnaire({
        ...questionnaire,
        questions: reorderedQuestions
      });
    } else if (type.startsWith('options-')) {
      const questionIndex = parseInt(type.split('-')[1]);
      const options = Array.from(questionnaire.questions[questionIndex].options);
      const [removed] = options.splice(source.index, 1);
      options.splice(destination.index, 0, removed);

      const updatedQuestions = [...questionnaire.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options
      };

      setQuestionnaire({
        ...questionnaire,
        questions: updatedQuestions
      });
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="questionnaire-builder">
      <h1>{isEditMode ? 'Редагування опитування' : 'Створення опитування'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Назва опитування:</label>
          <input
            type="text"
            value={questionnaire.name}
            onChange={(e) => setQuestionnaire({
              ...questionnaire,
              name: e.target.value
            })}
            required
          />
        </div>

        <div className="form-group">
          <label>Опис опитування:</label>
          <textarea
            value={questionnaire.description}
            onChange={(e) => setQuestionnaire({
              ...questionnaire,
              description: e.target.value
            })}
            required
          />
        </div>

        <div className="questions-section">
          <h2>Питання</h2>
          
          <div className="question-type-buttons">
            <button type="button" onClick={() => addQuestion('text')}>
              Додати текстове питання
            </button>
            <button type="button" onClick={() => addQuestion('single')}>
              Додати питання з одним варіантом
            </button>
            <button type="button" onClick={() => addQuestion('multiple')}>
              Додати питання з кількома варіантами
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions" type="question">
              {(provided) => (
                <div
                  className="questions-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {questionnaire.questions.map((question, index) => (
                    <QuestionItem
                      key={index}
                      question={question}
                      index={index}
                      onUpdate={(updatedQuestion) => {
                        const questions = [...questionnaire.questions];
                        questions[index] = updatedQuestion;
                        setQuestionnaire({ ...questionnaire, questions });
                      }}
                      onDelete={() => {
                        const questions = questionnaire.questions.filter((_, i) => i !== index);
                        setQuestionnaire({ ...questionnaire, questions });
                      }}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            {isEditMode ? 'Зберегти зміни' : 'Створити опитування'}
          </button>
          <button type="button" className="cancel-button" onClick={() => navigate('/')}>
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
};

const QuestionItem = ({ question, index, onUpdate, onDelete }) => {
  return (
    <Draggable draggableId={`question-${index}`} index={index}>
      {(provided) => (
        <div
          className="question-item"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="question-header">
            <div className="drag-handle" {...provided.dragHandleProps}>⋮⋮</div>
            <span className="question-number">Питання {index + 1}</span>
            <button type="button" className="delete-button" onClick={onDelete}>
              Видалити
            </button>
          </div>

          <div className="question-content">
            <input
              type="text"
              value={question.text}
              onChange={(e) => onUpdate({ ...question, text: e.target.value })}
              placeholder="Текст питання"
              required
            />

            {question.type !== 'text' && (
              <OptionsEditor
                questionIndex={index}
                options={question.options}
                onUpdate={(options) => onUpdate({ ...question, options })}
              />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

const OptionsEditor = ({ questionIndex, options, onUpdate }) => {
  const addOption = () => {
    onUpdate([...options, { text: '' }]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      onUpdate(options.filter((_, i) => i !== index));
    }
  };

  return (
    <Droppable droppableId={`options-${questionIndex}`} type={`options-${questionIndex}`}>
      {(provided) => (
        <div className="options-list" {...provided.droppableProps} ref={provided.innerRef}>
          {options.map((option, index) => (
            <Draggable
              key={`option-${questionIndex}-${index}`}
              draggableId={`option-${questionIndex}-${index}`}
              index={index}
            >
              {(provided) => (
                <div
                  className="option-item"
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                >
                  <div className="drag-handle" {...provided.dragHandleProps}>⋮⋮</div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => {
                      const updatedOptions = [...options];
                      updatedOptions[index] = { text: e.target.value };
                      onUpdate(updatedOptions);
                    }}
                    placeholder={`Варіант ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    className="remove-option"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                  >
                    ✕
                  </button>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          <button type="button" className="add-option" onClick={addOption}>
            Додати варіант
          </button>
        </div>
      )}
    </Droppable>
  );
};

export default QuestionnaireBuilder; 