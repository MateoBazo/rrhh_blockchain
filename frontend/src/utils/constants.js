// file: frontend/src/utils/constants.js

// ============================================
// 🔐 ROLES DE USUARIO
// ============================================
export const ROLES = {
  ADMIN: 'ADMIN',
  EMPRESA: 'EMPRESA',
  CANDIDATO: 'CANDIDATO',
  CONTRATISTA: 'CONTRATISTA',
};

// ============================================
// 🌐 IDIOMAS
// ============================================
export const NIVELES_IDIOMA = {
  A1: 'A1 - Principiante',
  A2: 'A2 - Elemental',
  B1: 'B1 - Intermedio',
  B2: 'B2 - Intermedio Alto',
  C1: 'C1 - Avanzado',
  C2: 'C2 - Nativo',
};

// ============================================
// 📄 DOCUMENTOS
// ============================================
export const TIPOS_DOCUMENTO = {
  CV: 'CV',
  CERTIFICADO: 'CERTIFICADO',
  CARTA_RECOMENDACION: 'CARTA_RECOMENDACION',
  OTRO: 'OTRO',
};

// ============================================
// 📝 CONTRATOS
// ============================================
export const ESTADOS_CONTRATO = {
  BORRADOR: 'BORRADOR',
  ACTIVO: 'ACTIVO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
};

// ============================================
// 💼 VACANTES (S009.1)
// ============================================
export const ESTADOS_VACANTE = {
  BORRADOR: 'borrador',
  ABIERTA: 'abierta',
  PAUSADA: 'pausada',
  CERRADA: 'cerrada',
};

export const MODALIDADES_TRABAJO = {
  REMOTO: 'remoto',
  PRESENCIAL: 'presencial',
  HIBRIDO: 'hibrido',
};

export const TIPOS_CONTRATO = {
  INDEFINIDO: 'indefinido',
  TEMPORAL: 'temporal',
  POR_PROYECTO: 'por_proyecto',
  PRACTICAS: 'practicas',
};

export const JORNADAS_LABORALES = {
  COMPLETA: 'completa',
  MEDIA_JORNADA: 'media_jornada', 
  POR_HORAS: 'por_horas',
  FLEXIBLE: 'flexible'  
};

export const NIVELES_EDUCATIVOS = {
  SECUNDARIA: 'secundaria',
  TECNICO: 'tecnico',
  LICENCIATURA: 'licenciatura',
  MAESTRIA: 'maestria',
  DOCTORADO: 'doctorado'
};

// ============================================
// 📬 POSTULACIONES (S009.3) - FSM Estados
// ============================================
export const ESTADOS_POSTULACION = {
  POSTULADO: 'postulado',
  REVISADO: 'revisado',
  PRESELECCIONADO: 'preseleccionado',
  ENTREVISTA: 'entrevista',
  CONTRATADO: 'contratado',
  RECHAZADO: 'rechazado',
  RETIRADO: 'retirado',
};

// Colores para badges de estado (Tailwind classes)
export const COLORES_ESTADO_POSTULACION = {
  postulado: 'bg-blue-100 text-blue-800',
  revisado: 'bg-yellow-100 text-yellow-800',
  preseleccionado: 'bg-purple-100 text-purple-800',
  entrevista: 'bg-indigo-100 text-indigo-800',
  contratado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
  retirado: 'bg-gray-100 text-gray-800',
};

// Labels amigables para estados
export const LABELS_ESTADO_POSTULACION = {
  postulado: 'Postulado',
  revisado: 'En Revisión',
  preseleccionado: 'Preseleccionado',
  entrevista: 'En Entrevista',
  contratado: 'Contratado',
  rechazado: 'Rechazado',
  retirado: 'Retirado',
};

// ============================================
// 📊 RANGOS DE SCORING (S009.4)
// ============================================
export const RANGOS_SCORE = [
  { min: 90, max: 100, label: 'Excelente', color: 'green' },
  { min: 80, max: 89, label: 'Muy Bueno', color: 'blue' },
  { min: 70, max: 79, label: 'Bueno', color: 'yellow' },
  { min: 60, max: 69, label: 'Aceptable', color: 'orange' },
  { min: 0, max: 59, label: 'Bajo', color: 'red' },
];

// Obtener rango de score (función helper)
export const obtenerRangoScore = (score) => {
  return RANGOS_SCORE.find(r => score >= r.min && score <= r.max) || RANGOS_SCORE[4];
};

// ============================================
// 🔍 BÚSQUEDA AVANZADA (S009.9)
// ============================================
export const NIVELES_HABILIDAD = {
  BASICO: 'basico',
  INTERMEDIO: 'intermedio',
  AVANZADO: 'avanzado',
  EXPERTO: 'experto',
};

export const DISPONIBILIDADES = {
  INMEDIATA: 'inmediata',
  UNA_SEMANA: '1_semana',
  DOS_SEMANAS: '2_semanas',
  UN_MES: '1_mes',
};

export const OPCIONES_ORDENAR = {
  EXPERIENCIA: 'experiencia',
  SALARIO: 'salario',
  FECHA_REGISTRO: 'fecha_registro',
  NOMBRE: 'nombre',
};