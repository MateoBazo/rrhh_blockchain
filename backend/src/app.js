// file: backend/src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API Sistema RRHH Blockchain',
    version: '1.0.0',
    status: 'online'
  });
});

// ============================================
// RUTAS S004
// ============================================
const authRoutes = require('./routes/authRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const candidatoRoutes = require('./routes/candidatoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/candidatos', candidatoRoutes);

// ============================================
// RUTAS S005 (NUEVAS)
// ============================================
const uploadRoutes = require('./routes/upload');
const educacionRoutes = require('./routes/educacion');
const experienciaRoutes = require('./routes/experiencia');
const habilidadRoutes = require('./routes/habilidad');

app.use('/api/upload', uploadRoutes);
app.use('/api/educacion', educacionRoutes);
app.use('/api/experiencia', experienciaRoutes);
app.use('/api/habilidades', habilidadRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Error handler global
app.use(errorHandler);

module.exports = app;