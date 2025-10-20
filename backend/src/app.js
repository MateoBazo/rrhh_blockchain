// file: backend/src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();
const app = express();

// Middlewares de seguridad
app.use(helmet());

// ✅ CORS ACTUALIZADO PARA VITE
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',  // CRA (si lo usas)
      'http://localhost:5173',  // ✅ VITE (frontend actual)
      'http://localhost:5174',  // Vite alternativo
      process.env.FRONTEND_URL, // URL de producción (.env)
    ].filter(Boolean); // Eliminar undefined

    // Permitir requests sin origin (Postman, cURL, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
const uploadRoutes = require('./routes/uploadRoutes');
const educacionRoutes = require('./routes/educacion');
const experienciaRoutes = require('./routes/experiencia');
const habilidadRoutes = require('./routes/habilidad');

app.use('/api/upload', uploadRoutes);
app.use('/api/educacion', educacionRoutes);
app.use('/api/experiencia', experienciaRoutes);
app.use('/api/habilidades', habilidadRoutes);

// Rutas nuevas (S006)
app.use('/api/referencias', require('./routes/referenciasRoutes'));
app.use('/api/certificaciones', require('./routes/certificacionesRoutes'));
app.use('/api/idiomas', require('./routes/idiomasRoutes'));
app.use('/api/documentos', require('./routes/documentosRoutes'));
app.use('/api/contratos', require('./routes/contratosRoutes'));
app.use('/api/notificaciones', require('./routes/notificacionesRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

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