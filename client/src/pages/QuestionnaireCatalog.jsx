import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questionnaireService } from '../services/api';
import '../styles/QuestionnaireCatalog.css';

const QuestionnaireCatalog = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchQuestionnaires();
  }, [currentPage, sortBy, sortOrder]);

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      const data = await questionnaireService.getQuestionnaires(
        currentPage, 
        10, 
        sortBy, 
        sortOrder
      );
      setQuestionnaires(data.questionnaires);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке опросников:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот опросник?')) {
      try {
        await questionnaireService.deleteQuestionnaire(id);
        fetchQuestionnaires();
      } catch (error) {
        console.error('Ошибка при удалении опросника:', error);
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="questionnaire-catalog">
      <h1>Каталог опитувань</h1>
      
      <div className="sort-controls">
        <span>Сортувати за:</span>
        <button 
          className={sortBy === 'name' ? 'active' : ''} 
          onClick={() => handleSort('name')}
        >
          Назвою {renderSortIcon('name')}
        </button>
        <button 
          className={sortBy === 'questions.length' ? 'active' : ''} 
          onClick={() => handleSort('questions.length')}
        >
          Кількістю питань {renderSortIcon('questions.length')}
        </button>
        <button 
          className={sortBy === 'completions' ? 'active' : ''} 
          onClick={() => handleSort('completions')}
        >
          Кількістю проходжень {renderSortIcon('completions')}
        </button>
      </div>
      
      <Link to="/create" className="create-button">Створити нове опитування</Link>
      
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <>
          <div className="questionnaire-grid">
            {questionnaires.map((questionnaire) => (
              <div key={questionnaire._id} className="questionnaire-card">
                <h2>{questionnaire.name}</h2>
                <p>{questionnaire.description}</p>
                <div className="questionnaire-stats">
                  <span>Питань: {questionnaire.questions.length}</span>
                  <span>Проходжень: {questionnaire.completions}</span>
                </div>
                <div className="questionnaire-actions">
                  <Link to={`/edit/${questionnaire._id}`} className="edit-button">
                    Редагувати
                  </Link>
                  <Link to={`/run/${questionnaire._id}`} className="run-button">
                    Пройти
                  </Link>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(questionnaire._id)}
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pagination">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Попередня
            </button>
            <span>
              Сторінка {currentPage} з {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Наступна
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionnaireCatalog; 