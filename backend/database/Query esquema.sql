-- file: /database/schema.sql

-- =====================================================
-- SISTEMA RRHH EN BLOCKCHAIN - DATABASE SCHEMA
-- Versión: 1.0.0
-- Fecha: 2025-10-16
-- MySQL 8.0.35
-- =====================================================

USE rrhh_blockchain;

-- =====================================================
-- TABLA 1: usuarios (Autenticación Multi-Método)
-- =====================================================

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) DEFAULT NULL COMMENT 'bcrypt hash, NULL si solo OAuth',
  google_id VARCHAR(255) DEFAULT NULL UNIQUE COMMENT 'Google OAuth ID',
  
  rol ENUM('ADMIN', 'EMPRESA', 'CANDIDATO', 'CONTRATISTA') NOT NULL,
  
  verificado BOOLEAN DEFAULT FALSE COMMENT 'Email verificado',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Cuenta activa',
  
  ultimo_acceso DATETIME DEFAULT NULL,
  intentos_login_fallidos TINYINT UNSIGNED DEFAULT 0,
  bloqueado_hasta DATETIME DEFAULT NULL COMMENT 'Bloqueo temporal por intentos fallidos',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_google_id (google_id),
  INDEX idx_rol (rol),
  INDEX idx_activo (activo)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla central de autenticación multi-método y roles';

-- =====================================================
-- TABLA 2: empresas (Información Corporativa)
-- =====================================================

CREATE TABLE empresas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL UNIQUE,
  
  nit VARCHAR(20) NOT NULL UNIQUE COMMENT 'NIT Bolivia',
  razon_social VARCHAR(255) NOT NULL,
  nombre_comercial VARCHAR(255),
  
  sector VARCHAR(100) NOT NULL COMMENT 'Ej: Tecnología, Manufactura, Servicios',
  tamanio ENUM('micro', 'pequeña', 'mediana', 'grande') DEFAULT 'pequeña',
  
  telefono VARCHAR(20),
  sitio_web VARCHAR(255),
  
  -- Ubicación
  pais VARCHAR(100) DEFAULT 'Bolivia',
  departamento VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  direccion TEXT,
  
  -- Información adicional
  descripcion TEXT COMMENT 'Descripción de la empresa',
  logo_url VARCHAR(500),
  
  verificada BOOLEAN DEFAULT FALSE COMMENT 'Empresa verificada por admin',
  fecha_verificacion DATE DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_nit (nit),
  INDEX idx_sector (sector),
  INDEX idx_ubicacion (departamento, ciudad),
  INDEX idx_verificada (verificada)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Perfiles de empresas empleadoras';

-- =====================================================
-- TABLA 3: candidatos (Perfiles Profesionales)
-- =====================================================

CREATE TABLE candidatos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL UNIQUE,
  
  -- Información personal
  ci VARCHAR(20) NOT NULL UNIQUE COMMENT 'Cédula de Identidad Bolivia',
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  
  fecha_nacimiento DATE NOT NULL,
  genero ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir') DEFAULT 'prefiero_no_decir',
  
  telefono VARCHAR(20),
  telefono_alternativo VARCHAR(20),
  
  -- Ubicación
  pais_residencia VARCHAR(100) DEFAULT 'Bolivia',
  departamento VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  direccion TEXT,
  
  -- Información profesional
  profesion VARCHAR(150) COMMENT 'Ej: Ingeniero de Sistemas, Contador, Diseñador Gráfico',
  titulo_profesional VARCHAR(200),
  nivel_educativo ENUM('secundaria', 'tecnico', 'licenciatura', 'maestria', 'doctorado') DEFAULT NULL,
  
  anios_experiencia TINYINT UNSIGNED DEFAULT 0,
  
  -- Preferencias laborales
  estado_laboral ENUM('empleado', 'desempleado', 'busqueda_activa', 'busqueda_pasiva') DEFAULT 'busqueda_pasiva',
  disponibilidad ENUM('inmediata', '2_semanas', '1_mes', 'mas_1_mes') DEFAULT 'inmediata',
  modalidad_preferida ENUM('presencial', 'remoto', 'hibrido', 'cualquiera') DEFAULT 'cualquiera',
  
  salario_esperado_min DECIMAL(10,2) DEFAULT NULL COMMENT 'En Bs.',
  salario_esperado_max DECIMAL(10,2) DEFAULT NULL,
  
  -- Perfil
  resumen_profesional TEXT COMMENT 'Breve descripción profesional',
  cv_path VARCHAR(500) COMMENT 'Ruta a CV principal cifrado',
  
  foto_perfil_url VARCHAR(500),
  
  -- Control de privacidad
  perfil_publico BOOLEAN DEFAULT TRUE COMMENT 'Visible para empresas en búsqueda',
  mostrar_telefono BOOLEAN DEFAULT FALSE,
  mostrar_direccion BOOLEAN DEFAULT FALSE,
  
  -- Completitud de perfil (calculado)
  completitud_perfil TINYINT UNSIGNED DEFAULT 0 COMMENT 'Porcentaje 0-100',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_ci (ci),
  INDEX idx_profesion (profesion),
  INDEX idx_ubicacion (departamento, ciudad),
  INDEX idx_estado_laboral (estado_laboral),
  INDEX idx_anios_experiencia (anios_experiencia),
  INDEX idx_perfil_publico (perfil_publico)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Perfiles de candidatos y empleados';

-- =====================================================
-- TABLA 4: contratistas (Perfiles Freelance)
-- =====================================================

CREATE TABLE contratistas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL UNIQUE,
  
  -- Información profesional
  especialidad VARCHAR(200) NOT NULL COMMENT 'Ej: Desarrollo Web, Diseño UX/UI, Marketing Digital',
  subespecialidades TEXT COMMENT 'JSON array con subespecialidades',
  
  anios_experiencia TINYINT UNSIGNED DEFAULT 0,
  
  -- Tarifas
  tarifa_hora DECIMAL(8,2) DEFAULT NULL COMMENT 'Tarifa por hora en Bs.',
  tarifa_proyecto_min DECIMAL(10,2) DEFAULT NULL COMMENT 'Tarifa mínima proyecto',
  
  disponibilidad ENUM('tiempo_completo', 'medio_tiempo', 'por_proyecto', 'no_disponible') DEFAULT 'por_proyecto',
  
  -- Portafolio
  portafolio_url VARCHAR(500),
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  behance_url VARCHAR(255),
  
  descripcion_servicios TEXT COMMENT 'Descripción de servicios ofrecidos',
  
  -- Estadísticas
  proyectos_completados INT UNSIGNED DEFAULT 0,
  calificacion_promedio DECIMAL(3,2) DEFAULT NULL COMMENT 'Rating 1.00 - 5.00',
  
  verificado BOOLEAN DEFAULT FALSE COMMENT 'Contratista verificado',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_especialidad (especialidad),
  INDEX idx_disponibilidad (disponibilidad),
  INDEX idx_verificado (verificado)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Perfiles de contratistas freelance';

-- =====================================================
-- TABLA 5: historial_laboral (KARDEX Digital) ⭐
-- =====================================================

CREATE TABLE historial_laboral (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT UNSIGNED NOT NULL,
  empresa_id INT UNSIGNED DEFAULT NULL COMMENT 'NULL si empresa no está registrada',
  
  -- Información básica del empleo
  empresa_nombre VARCHAR(255) NOT NULL COMMENT 'Nombre empresa (redundante para empresas no registradas)',
  empresa_nit VARCHAR(20) COMMENT 'NIT empresa',
  
  cargo VARCHAR(200) NOT NULL,
  departamento VARCHAR(100) COMMENT 'Ej: Desarrollo, Ventas, Administración',
  
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE DEFAULT NULL COMMENT 'NULL si trabaja actualmente',
  actualmente_trabajando BOOLEAN DEFAULT FALSE,
  
  -- Detalles
  descripcion_responsabilidades TEXT NOT NULL,
  logros_principales TEXT COMMENT 'Logros destacados durante el empleo',
  
  razon_salida ENUM(
    'renuncia_voluntaria',
    'finalizacion_contrato',
    'despido',
    'mutuo_acuerdo',
    'cierre_empresa',
    'otro'
  ) DEFAULT NULL,
  
  -- Información sensible (CIFRADA en aplicación)
  salario_mensual VARCHAR(500) DEFAULT NULL COMMENT 'Cifrado AES-256',
  
  tipo_contrato ENUM('indefinido', 'plazo_fijo', 'consultoria', 'pasantia', 'otro') DEFAULT 'indefinido',
  
  -- Verificación
  verificado BOOLEAN DEFAULT FALSE COMMENT 'Verificado por empresa',
  fecha_verificacion DATETIME DEFAULT NULL,
  verificado_por_usuario_id INT UNSIGNED DEFAULT NULL COMMENT 'Usuario empresa que verificó',
  
  -- Documentación
  archivo_certificado_path VARCHAR(500) DEFAULT NULL COMMENT 'Ruta a certificado laboral cifrado',
  
  -- Integridad y Blockchain (preparación)
  hash_documento CHAR(64) DEFAULT NULL UNIQUE COMMENT 'SHA-256 del registro completo',
  
  -- Campos futuros para blockchain (comentados por ahora)
  -- blockchain_tx_hash VARCHAR(66) DEFAULT NULL COMMENT 'Hash transacción Ethereum',
  -- blockchain_timestamp BIGINT DEFAULT NULL,
  -- blockchain_network VARCHAR(20) DEFAULT NULL COMMENT 'sepolia, goerli, mainnet',
  -- blockchain_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL,
  FOREIGN KEY (verificado_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_candidato (candidato_id),
  INDEX idx_empresa (empresa_id),
  INDEX idx_fechas (fecha_inicio, fecha_fin),
  INDEX idx_verificado (verificado),
  INDEX idx_hash (hash_documento),
  
  -- Validación: fecha_fin debe ser posterior a fecha_inicio
  CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='KARDEX laboral digital - registro completo experiencias laborales';

-- =====================================================
-- TABLA 6: historial_academico (Educación y Títulos)
-- =====================================================

CREATE TABLE historial_academico (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT UNSIGNED NOT NULL,
  
  institucion VARCHAR(255) NOT NULL,
  
  titulo VARCHAR(255) NOT NULL COMMENT 'Ej: Ingeniero de Sistemas, Licenciado en Administración',
  
  nivel_educativo ENUM(
    'secundaria',
    'tecnico_medio',
    'tecnico_superior',
    'licenciatura',
    'especialidad',
    'maestria',
    'doctorado'
  ) NOT NULL,
  
  carrera VARCHAR(200) COMMENT 'Nombre carrera/especialidad',
  
  fecha_inicio DATE,
  fecha_graduacion DATE,
  en_curso BOOLEAN DEFAULT FALSE,
  
  mencion_honor VARCHAR(100) COMMENT 'Ej: Cum Laude, Magna Cum Laude',
  
  pais VARCHAR(100) DEFAULT 'Bolivia',
  ciudad VARCHAR(100),
  
  archivo_titulo_path VARCHAR(500) COMMENT 'Ruta a título escaneado cifrado',
  
  verificado BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
  
  INDEX idx_candidato (candidato_id),
  INDEX idx_nivel (nivel_educativo),
  INDEX idx_institucion (institucion)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial académico - títulos y certificaciones';

-- =====================================================
-- TABLA 7: habilidades (Catálogo de Skills)
-- =====================================================

CREATE TABLE habilidades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  nombre VARCHAR(150) NOT NULL UNIQUE,
  
  categoria ENUM(
    'tecnica',
    'blanda',
    'idioma',
    'herramienta',
    'certificacion'
  ) NOT NULL DEFAULT 'tecnica',
  
  descripcion TEXT,
  
  demanda_mercado ENUM('baja', 'media', 'alta', 'muy_alta') DEFAULT 'media' COMMENT 'Actualizado periódicamente',
  
  activa BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_nombre (nombre),
  INDEX idx_categoria (categoria),
  INDEX idx_demanda (demanda_mercado)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo centralizado de habilidades y competencias';

-- =====================================================
-- TABLA 8: candidato_habilidades (N:M con Niveles)
-- =====================================================

CREATE TABLE candidato_habilidades (
  candidato_id INT UNSIGNED NOT NULL,
  habilidad_id INT UNSIGNED NOT NULL,
  
  nivel_dominio ENUM('basico', 'intermedio', 'avanzado', 'experto') NOT NULL DEFAULT 'intermedio',
  
  anios_experiencia DECIMAL(3,1) DEFAULT 0 COMMENT 'Años de experiencia con la habilidad',
  
  ultima_vez_usado DATE COMMENT 'Última vez que usó la habilidad',
  
  certificado BOOLEAN DEFAULT FALSE COMMENT 'Tiene certificación oficial',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (candidato_id, habilidad_id),
  
  FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE,
  
  INDEX idx_nivel (nivel_dominio),
  INDEX idx_anios (anios_experiencia)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Habilidades de candidatos con nivel de dominio';

-- =====================================================
-- TABLA 9: vacantes (Ofertas Laborales)
-- =====================================================

CREATE TABLE vacantes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT UNSIGNED NOT NULL,
  
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  
  -- Ubicación y modalidad
  pais VARCHAR(100) DEFAULT 'Bolivia',
  departamento VARCHAR(100),
  ciudad VARCHAR(100),
  
  modalidad ENUM('presencial', 'remoto', 'hibrido') NOT NULL DEFAULT 'presencial',
  
  -- Requisitos
  experiencia_requerida_anios TINYINT UNSIGNED DEFAULT 0,
  nivel_educativo_minimo ENUM('secundaria', 'tecnico', 'licenciatura', 'maestria', 'doctorado') DEFAULT NULL,
  
  -- Salario
  salario_min DECIMAL(10,2) DEFAULT NULL COMMENT 'Salario mínimo en Bs.',
  salario_max DECIMAL(10,2) DEFAULT NULL,
  mostrar_salario BOOLEAN DEFAULT FALSE COMMENT 'Mostrar rango salarial públicamente',
  
  -- Contrato
  tipo_contrato ENUM('indefinido', 'plazo_fijo', 'consultoria', 'pasantia', 'freelance') DEFAULT 'indefinido',
  jornada ENUM('tiempo_completo', 'medio_tiempo', 'por_horas') DEFAULT 'tiempo_completo',
  
  -- Estado
  estado ENUM('borrador', 'abierta', 'pausada', 'cerrada') DEFAULT 'abierta',
  
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre DATE DEFAULT NULL,
  
  vacantes_disponibles TINYINT UNSIGNED DEFAULT 1 COMMENT 'Número de posiciones abiertas',
  postulaciones_recibidas INT UNSIGNED DEFAULT 0,
  
  -- Contacto
  contacto_email VARCHAR(255),
  contacto_telefono VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  
  INDEX idx_empresa (empresa_id),
  INDEX idx_estado (estado),
  INDEX idx_publicacion (fecha_publicacion),
  INDEX idx_ubicacion (departamento, ciudad),
  INDEX idx_modalidad (modalidad),
  INDEX idx_busqueda (estado, fecha_publicacion, modalidad)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ofertas laborales publicadas por empresas';

-- =====================================================
-- TABLA 10: vacante_habilidades (Skills Requeridas)
-- =====================================================

CREATE TABLE vacante_habilidades (
  vacante_id INT UNSIGNED NOT NULL,
  habilidad_id INT UNSIGNED NOT NULL,
  
  nivel_minimo_requerido ENUM('basico', 'intermedio', 'avanzado', 'experto') NOT NULL DEFAULT 'intermedio',
  
  obligatoria BOOLEAN DEFAULT TRUE COMMENT 'Habilidad obligatoria vs deseable',
  
  peso_ponderacion TINYINT UNSIGNED DEFAULT 10 COMMENT 'Peso en algoritmo matching (1-100)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (vacante_id, habilidad_id),
  
  FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE,
  
  INDEX idx_obligatoria (obligatoria)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Habilidades requeridas por vacante con nivel mínimo';

-- =====================================================
-- TABLA 11: postulaciones (Candidato-Vacante + Matching)
-- =====================================================

CREATE TABLE postulaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vacante_id INT UNSIGNED NOT NULL,
  candidato_id INT UNSIGNED NOT NULL,
  
  -- Estado de la postulación
  estado ENUM(
    'postulado',
    'revisado',
    'preseleccionado',
    'entrevista_agendada',
    'entrevista_realizada',
    'rechazado',
    'contratado',
    'retirado'
  ) NOT NULL DEFAULT 'postulado',
  
  fecha_postulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Matching Score (calculado por algoritmo)
  score_compatibilidad DECIMAL(5,2) DEFAULT NULL COMMENT 'Score 0.00 - 100.00',
  
  desglose_scoring JSON DEFAULT NULL COMMENT 'Detalle del scoring por dimensión',
  /* Ejemplo JSON:
  {
    "experiencia": 92,
    "habilidades": 85,
    "educacion": 80,
    "otros": 90,
    "explicacion": "Candidato altamente compatible...",
    "fortalezas": ["5 años experiencia sector", "Domina 8/10 habilidades"],
    "debilidades": ["Falta AWS", "Ubicación diferente"]
  }
  */
  
  ranking_posicion INT UNSIGNED DEFAULT NULL COMMENT 'Posición en ranking de candidatos',
  
  -- Documentos de postulación
  carta_presentacion TEXT,
  cv_postulacion_path VARCHAR(500) COMMENT 'CV específico para esta vacante',
  
  -- Notas internas empresa
  notas_empresa TEXT COMMENT 'Notas privadas del reclutador',
  
  -- Entrevista
  fecha_entrevista DATETIME DEFAULT NULL,
  resultado_entrevista TEXT,
  
  visto_por_empresa BOOLEAN DEFAULT FALSE,
  fecha_visto DATETIME DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE,
  FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_postulacion (vacante_id, candidato_id),
  
  INDEX idx_vacante (vacante_id),
  INDEX idx_candidato (candidato_id),
  INDEX idx_estado (estado),
  INDEX idx_score (score_compatibilidad DESC),
  INDEX idx_ranking (vacante_id, ranking_posicion)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Postulaciones de candidatos a vacantes con scoring de matching';

-- =====================================================
-- TABLA 12: evaluaciones_desempeno (Evaluaciones Formales)
-- =====================================================

CREATE TABLE evaluaciones_desempeno (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  historial_laboral_id INT UNSIGNED NOT NULL,
  
  fecha_evaluacion DATE NOT NULL,
  periodo_evaluado VARCHAR(100) COMMENT 'Ej: Q1 2024, Semestre 2-2023',
  
  puntuacion DECIMAL(3,2) NOT NULL COMMENT 'Puntuación 1.00 - 5.00',
  
  comentarios TEXT COMMENT 'Comentarios evaluación (CIFRADOS)',
  
  evaluador_nombre VARCHAR(200),
  evaluador_cargo VARCHAR(150),
  
  areas_fortaleza TEXT,
  areas_mejora TEXT,
  
  metas_cumplidas BOOLEAN DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (historial_laboral_id) REFERENCES historial_laboral(id) ON DELETE CASCADE,
  
  INDEX idx_historial (historial_laboral_id),
  INDEX idx_fecha (fecha_evaluacion),
  INDEX idx_puntuacion (puntuacion)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Evaluaciones formales de desempeño de empleados';

-- =====================================================
-- TABLA 13: documentos (Archivos Cifrados)
-- =====================================================

CREATE TABLE documentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL COMMENT 'Dueño del documento',
  
  tipo ENUM(
    'cv',
    'certificado_laboral',
    'titulo_academico',
    'certificacion',
    'contrato',
    'carta_recomendacion',
    'otro'
  ) NOT NULL,
  
  nombre_original VARCHAR(255) NOT NULL,
  nombre_archivo_cifrado VARCHAR(255) NOT NULL UNIQUE COMMENT 'Nombre en filesystem cifrado',
  
  path_cifrado VARCHAR(500) NOT NULL COMMENT 'Ruta completa al archivo cifrado',
  
  hash_sha256 CHAR(64) NOT NULL UNIQUE COMMENT 'Hash del archivo para verificación integridad',
  
  tamano_bytes INT UNSIGNED NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  
  -- Metadata
  descripcion TEXT,
  
  -- Control de acceso
  publico BOOLEAN DEFAULT FALSE COMMENT 'Documento público o privado',
  
  -- Contadores
  descargas INT UNSIGNED DEFAULT 0,
  
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_usuario (usuario_id),
  INDEX idx_tipo (tipo),
  INDEX idx_hash (hash_sha256),
  INDEX idx_publico (publico)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Almacenamiento seguro de documentos cifrados';

-- =====================================================
-- TABLA 14: logs_auditoria (Auditoría Inmutable)
-- =====================================================

CREATE TABLE logs_auditoria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  usuario_id INT UNSIGNED DEFAULT NULL COMMENT 'NULL para acciones anónimas',
  
  accion VARCHAR(100) NOT NULL COMMENT 'INSERT, UPDATE, DELETE, LOGIN, LOGOUT, etc.',
  
  tabla_afectada VARCHAR(100) DEFAULT NULL,
  registro_id INT UNSIGNED DEFAULT NULL COMMENT 'ID del registro afectado',
  
  cambios_json JSON DEFAULT NULL COMMENT 'Detalle de cambios (antes/después)',
  /* Ejemplo JSON:
  {
    "antes": {"salario": "5000"},
    "despues": {"salario": "6000"}
  }
  */
  
  ip_address VARCHAR(45) COMMENT 'IPv4 o IPv6',
  user_agent TEXT,
  
  timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Alta precisión para orden',
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_usuario (usuario_id),
  INDEX idx_accion (accion),
  INDEX idx_tabla (tabla_afectada),
  INDEX idx_timestamp (timestamp),
  INDEX idx_busqueda (tabla_afectada, registro_id, timestamp)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs de auditoría inmutables para compliance';

-- =====================================================
-- TRIGGERS DE AUDITORÍA AUTOMÁTICA
-- =====================================================

-- Trigger: Auditar INSERT en historial_laboral
DELIMITER $$

CREATE TRIGGER audit_historial_laboral_insert
AFTER INSERT ON historial_laboral
FOR EACH ROW
BEGIN
  INSERT INTO logs_auditoria (
    usuario_id,
    accion,
    tabla_afectada,
    registro_id,
    cambios_json
  ) VALUES (
    NEW.candidato_id,
    'INSERT',
    'historial_laboral',
    NEW.id,
    JSON_OBJECT(
      'empresa_nombre', NEW.empresa_nombre,
      'cargo', NEW.cargo,
      'fecha_inicio', NEW.fecha_inicio,
      'fecha_fin', NEW.fecha_fin
    )
  );
END$$

-- Trigger: Auditar UPDATE en historial_laboral
CREATE TRIGGER audit_historial_laboral_update
AFTER UPDATE ON historial_laboral
FOR EACH ROW
BEGIN
  INSERT INTO logs_auditoria (
    usuario_id,
    accion,
    tabla_afectada,
    registro_id,
    cambios_json
  ) VALUES (
    NEW.candidato_id,
    'UPDATE',
    'historial_laboral',
    NEW.id,
    JSON_OBJECT(
      'antes', JSON_OBJECT(
        'cargo', OLD.cargo,
        'fecha_inicio', OLD.fecha_inicio,
        'fecha_fin', OLD.fecha_fin,
        'verificado', OLD.verificado
      ),
      'despues', JSON_OBJECT(
        'cargo', NEW.cargo,
        'fecha_inicio', NEW.fecha_inicio,
        'fecha_fin', NEW.fecha_fin,
        'verificado', NEW.verificado
      )
    )
  );
END$$

-- Trigger: Auditar DELETE en historial_laboral
CREATE TRIGGER audit_historial_laboral_delete
AFTER DELETE ON historial_laboral
FOR EACH ROW
BEGIN
  INSERT INTO logs_auditoria (
    usuario_id,
    accion,
    tabla_afectada,
    registro_id,
    cambios_json
  ) VALUES (
    OLD.candidato_id,
    'DELETE',
    'historial_laboral',
    OLD.id,
    JSON_OBJECT(
      'empresa_nombre', OLD.empresa_nombre,
      'cargo', OLD.cargo,
      'fecha_inicio', OLD.fecha_inicio,
      'fecha_fin', OLD.fecha_fin
    )
  );
END$$

-- Trigger: Actualizar contador postulaciones en vacantes
CREATE TRIGGER update_vacantes_postulaciones
AFTER INSERT ON postulaciones
FOR EACH ROW
BEGIN
  UPDATE vacantes
  SET postulaciones_recibidas = postulaciones_recibidas + 1
  WHERE id = NEW.vacante_id;
END$$

-- Trigger: Calcular completitud de perfil candidato
CREATE TRIGGER calculate_completitud_perfil
BEFORE UPDATE ON candidatos
FOR EACH ROW
BEGIN
  DECLARE completitud INT DEFAULT 0;
  
  -- Información básica (30%)
  IF NEW.ci IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  IF NEW.nombres IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  IF NEW.fecha_nacimiento IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  IF NEW.telefono IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  IF NEW.departamento IS NOT NULL AND NEW.ciudad IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  IF NEW.resumen_profesional IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  
  -- Información profesional (30%)
  IF NEW.profesion IS NOT NULL THEN SET completitud = completitud + 10; END IF;
  IF NEW.nivel_educativo IS NOT NULL THEN SET completitud = completitud + 10; END IF;
  IF NEW.anios_experiencia > 0 THEN SET completitud = completitud + 10; END IF;
  
  -- CV y foto (20%)
  IF NEW.cv_path IS NOT NULL THEN SET completitud = completitud + 10; END IF;
  IF NEW.foto_perfil_url IS NOT NULL THEN SET completitud = completitud + 10; END IF;
  
  -- Preferencias laborales (20%)
  IF NEW.estado_laboral IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  IF NEW.disponibilidad IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  IF NEW.modalidad_preferida IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  IF NEW.salario_esperado_min IS NOT NULL THEN SET completitud = completitud + 5; END IF;
  
  -- Nota: Habilidades y experiencia laboral se contarán en aplicación
  -- para no hacer el trigger demasiado complejo
  
  SET NEW.completitud_perfil = LEAST(completitud, 100);
END$$

DELIMITER ;

-- =====================================================
-- STORED PROCEDURES ÚTILES
-- =====================================================

-- Procedure: Obtener historial laboral completo de candidato con verificación
DELIMITER $$

CREATE PROCEDURE sp_get_historial_candidato(IN p_candidato_id INT)
BEGIN
  SELECT 
    hl.*,
    e.razon_social AS empresa_razon_social,
    e.logo_url AS empresa_logo,
    COUNT(ed.id) AS num_evaluaciones,
    AVG(ed.puntuacion) AS promedio_evaluaciones
  FROM historial_laboral hl
  LEFT JOIN empresas e ON hl.empresa_id = e.id
  LEFT JOIN evaluaciones_desempeno ed ON hl.id = ed.historial_laboral_id
  WHERE hl.candidato_id = p_candidato_id
  GROUP BY hl.id
  ORDER BY hl.fecha_inicio DESC;
END$$

-- Procedure: Buscar vacantes con filtros múltiples
CREATE PROCEDURE sp_buscar_vacantes(
  IN p_departamento VARCHAR(100),
  IN p_modalidad VARCHAR(20),
  IN p_salario_min DECIMAL(10,2),
  IN p_experiencia_max INT,
  IN p_limite INT
)
BEGIN
  SELECT 
    v.*,
    e.razon_social AS empresa_nombre,
    e.logo_url AS empresa_logo,
    COUNT(DISTINCT vh.habilidad_id) AS num_habilidades_requeridas
  FROM vacantes v
  JOIN empresas e ON v.empresa_id = e.id
  LEFT JOIN vacante_habilidades vh ON v.id = vh.vacante_id
  WHERE v.estado = 'abierta'
    AND (p_departamento IS NULL OR v.departamento = p_departamento)
    AND (p_modalidad IS NULL OR v.modalidad = p_modalidad)
    AND (p_salario_min IS NULL OR v.salario_max >= p_salario_min)
    AND (p_experiencia_max IS NULL OR v.experiencia_requerida_anios <= p_experiencia_max)
  GROUP BY v.id
  ORDER BY v.fecha_publicacion DESC
  LIMIT p_limite;
END$$

-- Procedure: Obtener top candidatos por vacante (con score)
CREATE PROCEDURE sp_get_top_candidatos_vacante(
  IN p_vacante_id INT,
  IN p_limite INT
)
BEGIN
  SELECT 
    p.id AS postulacion_id,
    p.score_compatibilidad,
    p.ranking_posicion,
    p.estado,
    p.fecha_postulacion,
    c.*,
    u.email,
    COUNT(DISTINCT ch.habilidad_id) AS num_habilidades,
    COUNT(DISTINCT hl.id) AS num_experiencias
  FROM postulaciones p
  JOIN candidatos c ON p.candidato_id = c.id
  JOIN usuarios u ON c.usuario_id = u.id
  LEFT JOIN candidato_habilidades ch ON c.id = ch.candidato_id
  LEFT JOIN historial_laboral hl ON c.id = hl.candidato_id
  WHERE p.vacante_id = p_vacante_id
  GROUP BY p.id, c.id
  ORDER BY p.score_compatibilidad DESC, p.fecha_postulacion ASC
  LIMIT p_limite;
END$$

-- Procedure: Estadísticas globales del sistema (Admin Dashboard)
CREATE PROCEDURE sp_get_estadisticas_globales()
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE) AS total_usuarios_activos,
    (SELECT COUNT(*) FROM usuarios WHERE rol = 'EMPRESA') AS total_empresas,
    (SELECT COUNT(*) FROM usuarios WHERE rol = 'CANDIDATO') AS total_candidatos,
    (SELECT COUNT(*) FROM usuarios WHERE rol = 'CONTRATISTA') AS total_contratistas,
    (SELECT COUNT(*) FROM vacantes WHERE estado = 'abierta') AS vacantes_abiertas,
    (SELECT COUNT(*) FROM vacantes WHERE estado = 'cerrada') AS vacantes_cerradas,
    (SELECT COUNT(*) FROM postulaciones) AS total_postulaciones,
    (SELECT COUNT(*) FROM postulaciones WHERE estado = 'contratado') AS total_contrataciones,
    (SELECT ROUND(AVG(score_compatibilidad), 2) FROM postulaciones WHERE score_compatibilidad IS NOT NULL) AS score_promedio_matching,
    (SELECT COUNT(*) FROM historial_laboral WHERE verificado = TRUE) AS kardex_verificados,
    (SELECT COUNT(*) FROM logs_auditoria WHERE DATE(timestamp) = CURDATE()) AS acciones_hoy;
END$$

DELIMITER ;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Candidatos con perfil completo y activos
CREATE VIEW v_candidatos_activos AS
SELECT 
  c.*,
  u.email,
  u.ultimo_acceso,
  COUNT(DISTINCT ch.habilidad_id) AS num_habilidades,
  COUNT(DISTINCT hl.id) AS num_experiencias,
  COUNT(DISTINCT ha.id) AS num_titulos
FROM candidatos c
JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN candidato_habilidades ch ON c.id = ch.candidato_id
LEFT JOIN historial_laboral hl ON c.id = hl.candidato_id
LEFT JOIN historial_academico ha ON c.id = ha.candidato_id
WHERE u.activo = TRUE 
  AND c.perfil_publico = TRUE
  AND c.completitud_perfil >= 60
GROUP BY c.id;

-- Vista: Vacantes abiertas con información empresa
CREATE VIEW v_vacantes_activas AS
SELECT 
  v.*,
  e.razon_social AS empresa_nombre,
  e.sector AS empresa_sector,
  e.logo_url AS empresa_logo,
  COUNT(DISTINCT p.id) AS num_postulaciones,
  COUNT(DISTINCT vh.habilidad_id) AS num_habilidades_requeridas
FROM vacantes v
JOIN empresas e ON v.empresa_id = e.id
LEFT JOIN postulaciones p ON v.id = p.vacante_id
LEFT JOIN vacante_habilidades vh ON v.id = vh.vacante_id
WHERE v.estado = 'abierta'
GROUP BY v.id;

-- =====================================================
-- ÍNDICES DE TEXTO COMPLETO (Full-Text Search)
-- =====================================================

-- Full-text index para búsqueda de candidatos
CREATE FULLTEXT INDEX ft_candidatos_busqueda 
ON candidatos(nombres, apellido_paterno, apellido_materno, profesion, resumen_profesional);

-- Full-text index para búsqueda de vacantes
CREATE FULLTEXT INDEX ft_vacantes_busqueda 
ON vacantes(titulo, descripcion);

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================