// file: backend/src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();

// ==========================================
// MIDDLEWARES DE SEGURIDAD
// ==========================================
// ✅ HELMET configurado para permitir imágenes del mismo origen
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // 🆕 Permite recursos cross-origin
  contentSecurityPolicy: false, // Desactivar temporalmente para desarrollo
}));

// ==========================================
// CORS CONFIGURADO PARA VITE + IMÁGENES
// ==========================================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',  // ✅ VITE
      'http://localhost:5174',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Permitir requests sin origin (Postman, cURL, imágenes)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type'], // 🆕 Exponer headers
};

app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// SERVIR ARCHIVOS ESTÁTICOS CON CORS EXPLÍCITO
// ==========================================
// 🆕 Middleware para agregar headers CORS a archivos estáticos
app.use('/uploads', (req, res, next) => {
  // Headers CORS para imágenes
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin'); // 🆕 IMPORTANTE
  
  // Cache control para imágenes
  res.header('Cache-Control', 'public, max-age=0'); // No cache para desarrollo
  
  // Si es OPTIONS (preflight), responder inmediatamente
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}, express.static('uploads'));

// ==========================================
// HEALTH CHECK
// ==========================================
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
    version: '1.9.0',
    status: 'online'
  });
});

// ==========================================
// RUTAS
// ==========================================
const authRoutes = require('./routes/authRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const candidatoRoutes = require('./routes/candidatoRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const educacionRoutes = require('./routes/educacion');
const experienciaRoutes = require('./routes/experiencia');
const habilidadRoutes = require('./routes/habilidad');
const vacanteHabilidadesRoutes = require('./routes/vacanteHabilidadesRoutes');
const postulacionesRoutes = require('./routes/postulacionesRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/candidatos', candidatoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/educacion', educacionRoutes);
app.use('/api/experiencia', experienciaRoutes);
app.use('/api/habilidades', habilidadRoutes);

// Rutas S006
app.use('/api/referencias', require('./routes/referenciasRoutes'));
app.use('/api/certificaciones', require('./routes/certificacionesRoutes'));
app.use('/api/idiomas', require('./routes/idiomasRoutes'));
app.use('/api/documentos', require('./routes/documentosRoutes'));
app.use('/api/contratos', require('./routes/contratosRoutes'));
app.use('/api/notificaciones', require('./routes/notificacionesRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// 🆕 S009 - Historial Laboral
app.use('/api/historial-laboral', require('./routes/historialLaboralRoutes'));
app.use('/api/vacantes', require('./routes/vacantesRoutes')); // CRUD Vacantes
app.use('/api/postulaciones', postulacionesRoutes);
// ==========================================
// MANEJO DE ERRORES
// ==========================================

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