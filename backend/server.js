const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./db');

const app = express();

// Conectar a DB solo si NO estamos en test
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/movies', require('./routes/movies.routes'));
app.use('/api/tvshows', require('./routes/tvshows.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Backend funcionando correctamente', 
    timestamp: new Date().toISOString() 
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor!' });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Exportar app para testing
module.exports = app;

// Solo iniciar servidor si NO estamos en test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
  });
}