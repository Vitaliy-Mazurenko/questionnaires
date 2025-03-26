import { Routes, Route } from 'react-router-dom';
import QuestionnaireCatalog from './pages/QuestionnaireCatalog';
import QuestionnaireBuilder from './pages/QuestionnaireBuilder';
import QuestionnaireRunner from './pages/QuestionnaireRunner';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<QuestionnaireCatalog />} />
      <Route path="/create" element={<QuestionnaireBuilder />} />
      <Route path="/edit/:id" element={<QuestionnaireBuilder />} />
      <Route path="/run/:id" element={<QuestionnaireRunner />} />
    </Routes>
  );
};

export default App; 