// file: backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { noEncontrado, manejadorErrores } = require('./middlewares/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const candidatoRoutes = require('./routes/candidatoRoutes'); 

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parseo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    exito: true,
    mensaje: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/candidatos', candidatoRoutes); // 👈 NUEVO

// Manejo de errores
app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;