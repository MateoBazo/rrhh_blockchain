-- file: backend/database/migrations/001a_cleanup_sectores_simple.sql

-- =====================================================
-- LIMPIEZA SIMPLE: Solo 2 valores a normalizar
-- =====================================================

USE rrhh_blockchain;

-- PASO 1: Mostrar datos actuales
SELECT 'ANTES DE NORMALIZACIÓN:' as Estado;
SELECT sector, COUNT(*) as cantidad
FROM empresas
GROUP BY sector;

-- PASO 2: Normalizar "Tecnología" → "Tecnología de la Información"
UPDATE empresas 
SET sector = 'Tecnología de la Información'
WHERE sector = 'Tecnología';

-- PASO 3: Normalizar "Minería" → "Energía y Minería"
UPDATE empresas 
SET sector = 'Energía y Minería'
WHERE sector = 'Minería';

-- PASO 4: Verificar normalización
SELECT 'DESPUÉS DE NORMALIZACIÓN:' as Estado;
SELECT sector, COUNT(*) as cantidad
FROM empresas
GROUP BY sector;

-- PASO 5: Verificar vacantes (por si acaso)
SELECT 'VERIFICANDO VACANTES:' as Estado;
SELECT sector, COUNT(*) as cantidad
FROM vacantes
GROUP BY sector;

-- Si vacantes tiene datos, normalizarlos también
UPDATE vacantes 
SET sector = 'Tecnología de la Información'
WHERE sector = 'Tecnología';

UPDATE vacantes 
SET sector = 'Energía y Minería'
WHERE sector = 'Minería';

SELECT 'VACANTES NORMALIZADAS:' as Estado;
SELECT sector, COUNT(*) as cantidad
FROM vacantes
GROUP BY sector;