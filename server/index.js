const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const questionnaireRoutes = require('./routes/questionnaireRoutes');
const responseRoutes = require('./routes/responseRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://vit7m:tk5CD@cluster0.r43qsxo.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB подключена'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.use('/api/questionnaires', questionnaireRoutes);
app.use('/api/responses', responseRoutes);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 