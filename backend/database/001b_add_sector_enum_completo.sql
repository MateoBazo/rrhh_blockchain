-- file: backend/database/migrations/001b_add_sector_enum_completo.sql

-- =====================================================
-- APLICAR ENUM A TODAS LAS TABLAS
-- Versión: 1.0.0
-- =====================================================

USE rrhh_blockchain;

-- =====================================================
-- 1. MODIFICAR TABLA EMPRESAS (cambiar VARCHAR a ENUM)
-- =====================================================

ALTER TABLE empresas 
MODIFY COLUMN sector ENUM(
  'Tecnología de la Información',
  'Banca y Finanzas',
  'Manufactura',
  'Construcción',
  'Salud y Farmacéutica',
  'Educación',
  'Comercio y Retail',
  'Turismo y Hotelería',
  'Agricultura y Ganadería',
  'Transporte y Logística',
  'Energía y Minería',
  'Telecomunicaciones',
  'Alimentos y Bebidas',
  'Consultoría y Servicios Profesionales',
  'Arte y Entretenimiento',
  'Gobierno y Administración Pública',
  'Medios de Comunicación',
  'Inmobiliaria',
  'Seguros',
  'Textil y Confección',
  'Automotriz',
  'Química y Petroquímica',
  'Deportes y Recreación',
  'Investigación y Desarrollo',
  'Otro'
) DEFAULT NULL COMMENT 'Sector industrial de la empresa';

SELECT '✅ EMPRESAS: Columna sector convertida a ENUM' as Progreso;

-- =====================================================
-- 2. AGREGAR COLUMNA SECTOR A TABLA CANDIDATOS
-- =====================================================

ALTER TABLE candidatos 
ADD COLUMN sector ENUM(
  'Tecnología de la Información',
  'Banca y Finanzas',
  'Manufactura',
  'Construcción',
  'Salud y Farmacéutica',
  'Educación',
  'Comercio y Retail',
  'Turismo y Hotelería',
  'Agricultura y Ganadería',
  'Transporte y Logística',
  'Energía y Minería',
  'Telecomunicaciones',
  'Alimentos y Bebidas',
  'Consultoría y Servicios Profesionales',
  'Arte y Entretenimiento',
  'Gobierno y Administración Pública',
  'Medios de Comunicación',
  'Inmobiliaria',
  'Seguros',
  'Textil y Confección',
  'Automotriz',
  'Química y Petroquímica',
  'Deportes y Recreación',
  'Investigación y Desarrollo',
  'Otro'
) DEFAULT NULL COMMENT 'Sector de interés laboral del candidato'
AFTER profesion;

SELECT '✅ CANDIDATOS: Columna sector agregada como ENUM' as Progreso;

-- =====================================================
-- 3. MODIFICAR TABLA VACANTES (cambiar VARCHAR a ENUM o agregarlo)
-- =====================================================

-- Verificar si la columna existe
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'rrhh_blockchain' 
    AND TABLE_NAME = 'vacantes' 
    AND COLUMN_NAME = 'sector'
);

-- Si existe, modificar; si no existe, agregar
SET @sql_vacantes = IF(
  @column_exists > 0,
  'ALTER TABLE vacantes MODIFY COLUMN sector ENUM(
    "Tecnología de la Información",
    "Banca y Finanzas",
    "Manufactura",
    "Construcción",
    "Salud y Farmacéutica",
    "Educación",
    "Comercio y Retail",
    "Turismo y Hotelería",
    "Agricultura y Ganadería",
    "Transporte y Logística",
    "Energía y Minería",
    "Telecomunicaciones",
    "Alimentos y Bebidas",
    "Consultoría y Servicios Profesionales",
    "Arte y Entretenimiento",
    "Gobierno y Administración Pública",
    "Medios de Comunicación",
    "Inmobiliaria",
    "Seguros",
    "Textil y Confección",
    "Automotriz",
    "Química y Petroquímica",
    "Deportes y Recreación",
    "Investigación y Desarrollo",
    "Otro"
  ) DEFAULT NULL COMMENT "Sector de la vacante (heredado de empresa)"',
  'ALTER TABLE vacantes ADD COLUMN sector ENUM(
    "Tecnología de la Información",
    "Banca y Finanzas",
    "Manufactura",
    "Construcción",
    "Salud y Farmacéutica",
    "Educación",
    "Comercio y Retail",
    "Turismo y Hotelería",
    "Agricultura y Ganadería",
    "Transporte y Logística",
    "Energía y Minería",
    "Telecomunicaciones",
    "Alimentos y Bebidas",
    "Consultoría y Servicios Profesionales",
    "Arte y Entretenimiento",
    "Gobierno y Administración Pública",
    "Medios de Comunicación",
    "Inmobiliaria",
    "Seguros",
    "Textil y Confección",
    "Automotriz",
    "Química y Petroquímica",
    "Deportes y Recreación",
    "Investigación y Desarrollo",
    "Otro"
  ) DEFAULT NULL COMMENT "Sector de la vacante (heredado de empresa)"
  AFTER empresa_id'
);

PREPARE stmt FROM @sql_vacantes;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ VACANTES: Columna sector procesada correctamente' as Progreso;

-- =====================================================
-- 4. CREAR ÍNDICES PARA OPTIMIZAR BÚSQUEDAS
-- =====================================================

-- Índice en empresas (si no existe ya)
SET @index_empresas = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'rrhh_blockchain' 
    AND TABLE_NAME = 'empresas' 
    AND INDEX_NAME = 'idx_empresas_sector'
);

SET @sql_idx_empresas = IF(
  @index_empresas = 0,
  'CREATE INDEX idx_empresas_sector ON empresas(sector)',
  'SELECT "Índice idx_empresas_sector ya existe" as Info'
);

PREPARE stmt FROM @sql_idx_empresas;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en candidatos
SET @index_candidatos = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'rrhh_blockchain' 
    AND TABLE_NAME = 'candidatos' 
    AND INDEX_NAME = 'idx_candidatos_sector'
);

SET @sql_idx_candidatos = IF(
  @index_candidatos = 0,
  'CREATE INDEX idx_candidatos_sector ON candidatos(sector)',
  'SELECT "Índice idx_candidatos_sector ya existe" as Info'
);

PREPARE stmt FROM @sql_idx_candidatos;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice compuesto en vacantes (sector + estado)
SET @index_vacantes = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'rrhh_blockchain' 
    AND TABLE_NAME = 'vacantes' 
    AND INDEX_NAME = 'idx_sector_estado'
);

SET @sql_idx_vacantes = IF(
  @index_vacantes = 0,
  'CREATE INDEX idx_sector_estado ON vacantes(sector, estado)',
  'SELECT "Índice idx_sector_estado ya existe" as Info'
);

PREPARE stmt FROM @sql_idx_vacantes;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ ÍNDICES: Todos los índices creados o verificados' as Progreso;

-- =====================================================
-- 5. VERIFICACIÓN FINAL COMPLETA
-- =====================================================

SELECT '===========================================' as Separador;
SELECT 'VERIFICACIÓN FINAL - PASO 1 COMPLETADO' as Titulo;
SELECT '===========================================' as Separador;

-- Verificar estructura empresas
SELECT 'TABLA EMPRESAS - Columna sector:' as Verificacion;
SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rrhh_blockchain' 
  AND TABLE_NAME = 'empresas' 
  AND COLUMN_NAME = 'sector';

-- Verificar estructura candidatos
SELECT 'TABLA CANDIDATOS - Columna sector:' as Verificacion;
SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rrhh_blockchain' 
  AND TABLE_NAME = 'candidatos' 
  AND COLUMN_NAME = 'sector';

-- Verificar estructura vacantes
SELECT 'TABLA VACANTES - Columna sector:' as Verificacion;
SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rrhh_blockchain' 
  AND TABLE_NAME = 'vacantes' 
  AND COLUMN_NAME = 'sector';

-- Verificar índices
SELECT 'ÍNDICES CREADOS:' as Verificacion;
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'rrhh_blockchain'
  AND INDEX_NAME IN ('idx_empresas_sector', 'idx_candidatos_sector', 'idx_sector_estado')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Verificar datos en empresas
SELECT 'DATOS ACTUALES EN EMPRESAS:' as Verificacion;
SELECT sector, COUNT(*) as cantidad
FROM empresas
GROUP BY sector
ORDER BY cantidad DESC;

SELECT '===========================================' as Separador;
SELECT '✅ PASO 1 - BASE DE DATOS COMPLETADO' as Estado;
SELECT 'Siguiente: PASO 2 - Modificar Backend' as ProximoPaso;
SELECT '===========================================' as Separador;