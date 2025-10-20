-- file: backend/database/fix-candidatos-seed.sql
-- =====================================================
-- FIX: Crear registros faltantes en tabla candidatos
-- Sesión S006.2 - Resolver BLOCKER #2
-- =====================================================

USE rrhh_blockchain;

-- Verificación ANTES del fix
SELECT 'ANTES DEL FIX - Usuarios CANDIDATO sin registro en candidatos:' as Estado;
SELECT 
  u.id,
  u.email,
  u.rol,
  c.id as tiene_candidato
FROM usuarios u
LEFT JOIN candidatos c ON u.id = c.usuario_id
WHERE u.rol = 'CANDIDATO' AND c.id IS NULL;

-- =====================================================
-- INSERT de registros faltantes
-- =====================================================

-- Primero agregamos el usuario candidato@test.com si no existe
INSERT IGNORE INTO usuarios (email, password_hash, rol, verificado, activo, created_at, updated_at) VALUES
('candidato@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', 'CANDIDATO', TRUE, TRUE, NOW(), NOW());

-- Ahora creamos candidatos para TODOS los usuarios CANDIDATO que no tienen registro
INSERT INTO candidatos (
  usuario_id,
  ci,
  nombres,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  genero,
  telefono,
  departamento,
  ciudad,
  profesion,
  titulo_profesional,
  nivel_educativo,
  anios_experiencia,
  estado_laboral,
  disponibilidad,
  modalidad_preferida,
  salario_esperado_min,
  salario_esperado_max,
  resumen_profesional,
  perfil_publico,
  created_at,
  updated_at
)
SELECT 
  u.id as usuario_id,
  CONCAT('TEST', LPAD(u.id, 7, '0'), 'LP') as ci,
  CASE 
    WHEN u.email = 'candidato@test.com' THEN 'Test'
    ELSE 'Candidato'
  END as nombres,
  CASE 
    WHEN u.email = 'candidato@test.com' THEN 'Prueba'
    ELSE 'Sistema'
  END as apellido_paterno,
  'Seed' as apellido_materno,
  '1995-01-01' as fecha_nacimiento,
  'masculino' as genero,
  '70000000' as telefono,
  'La Paz' as departamento,
  'La Paz' as ciudad,
  'Ingeniero de Sistemas' as profesion,
  'Licenciado en Sistemas' as titulo_profesional,
  'licenciatura' as nivel_educativo,
  2 as anios_experiencia,
  'busqueda_activa' as estado_laboral,
  'inmediata' as disponibilidad,
  'hibrido' as modalidad_preferida,
  5000 as salario_esperado_min,
  8000 as salario_esperado_max,
  CONCAT('Candidato de prueba: ', u.email) as resumen_profesional,
  TRUE as perfil_publico,
  NOW() as created_at,
  NOW() as updated_at
FROM usuarios u
LEFT JOIN candidatos c ON u.id = c.usuario_id
WHERE u.rol = 'CANDIDATO' AND c.id IS NULL;

-- =====================================================
-- Verificación DESPUÉS del fix
-- =====================================================

SELECT 'DESPUÉS DEL FIX - Todos los candidatos creados:' as Estado;
SELECT 
  u.id,
  u.email,
  u.rol,
  c.id as candidato_id,
  c.nombres,
  c.apellido_paterno
FROM usuarios u
LEFT JOIN candidatos c ON u.id = c.usuario_id
WHERE u.rol = 'CANDIDATO'
ORDER BY u.id;

-- Estadísticas
SELECT 
  'Total usuarios CANDIDATO:' as Metrica,
  COUNT(*) as Total
FROM usuarios WHERE rol = 'CANDIDATO'
UNION ALL
SELECT 
  'Total registros en candidatos:' as Metrica,
  COUNT(*) as Total
FROM candidatos
UNION ALL
SELECT
  'Candidatos faltantes:' as Metrica,
  COUNT(*) as Total
FROM usuarios u
LEFT JOIN candidatos c ON u.id = c.usuario_id
WHERE u.rol = 'CANDIDATO' AND c.id IS NULL;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================