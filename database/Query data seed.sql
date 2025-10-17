-- file: /database/seed_data.sql

-- =====================================================
-- DATOS DE PRUEBA - SISTEMA RRHH BLOCKCHAIN
-- =====================================================

USE rrhh_blockchain;

-- Deshabilitar checks temporalmente para inserción rápida
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. USUARIOS
-- =====================================================

-- Password para todos: "Password123!" 
-- Hash bcrypt (12 rounds): $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u

INSERT INTO usuarios (id, email, password_hash, google_id, rol, verificado, activo) VALUES
-- Admin
(1, 'admin@rrhh.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'ADMIN', TRUE, TRUE),

-- Empresas
(2, 'rrhh@techbolivia.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'EMPRESA', TRUE, TRUE),
(3, 'contacto@innovasoft.bo', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'EMPRESA', TRUE, TRUE),
(4, 'rrhh@minera-andina.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'EMPRESA', TRUE, TRUE),
(5, 'talento@consultora-abc.bo', NULL, 'google_12345', 'EMPRESA', TRUE, TRUE),

-- Candidatos
(6, 'juan.perez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'CANDIDATO', TRUE, TRUE),
(7, 'maria.rodriguez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'CANDIDATO', TRUE, TRUE),
(8, 'carlos.mamani@email.com', NULL, 'google_67890', 'CANDIDATO', TRUE, TRUE),
(9, 'ana.lopez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'CANDIDATO', TRUE, TRUE),
(10, 'pedro.quispe@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'CANDIDATO', TRUE, TRUE),

-- Contratistas
(11, 'freelance@designer.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU6e.W3u', NULL, 'CONTRATISTA', TRUE, TRUE),
(12, 'dev@freelancer.bo', NULL, 'google_11111', 'CONTRATISTA', TRUE, TRUE);

-- =====================================================
-- 2. EMPRESAS
-- =====================================================

INSERT INTO empresas (usuario_id, nit, razon_social, nombre_comercial, sector, tamanio, telefono, sitio_web, departamento, ciudad, direccion, descripcion, verificada) VALUES
(2, '1234567890', 'Tech Bolivia SRL', 'Tech Bolivia', 'Tecnología', 'mediana', '70123456', 'https://techbolivia.com', 'La Paz', 'La Paz', 'Av. Arce 2055', 'Empresa líder en desarrollo de software y consultoría tecnológica en Bolivia', TRUE),
(3, '9876543210', 'InnovaSoft SA', 'InnovaSoft', 'Tecnología', 'pequeña', '75987654', 'https://innovasoft.bo', 'Santa Cruz', 'Santa Cruz de la Sierra', 'Av. Cristo Redentor 100', 'Startup especializada en soluciones móviles y web', TRUE),
(4, '5555666677', 'Minera Andina Corp', 'Minera Andina', 'Minería', 'grande', '68555666', 'https://mineraandina.com', 'Potosí', 'Potosí', 'Zona Industrial', 'Empresa minera con 50 años de experiencia', TRUE),
(5, '3333444455', 'Consultora ABC', 'ABC Consulting', 'Consultoría', 'pequeña', '77333444', 'https://consultoraabc.bo', 'La Paz', 'El Alto', 'Av. Juan Pablo II', 'Consultoría en gestión empresarial', FALSE);

-- =====================================================
-- 3. CANDIDATOS
-- =====================================================

INSERT INTO candidatos (usuario_id, ci, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, departamento, ciudad, profesion, titulo_profesional, nivel_educativo, anios_experiencia, estado_laboral, disponibilidad, modalidad_preferida, salario_esperado_min, salario_esperado_max, resumen_profesional, perfil_publico) VALUES
(6, '7123456LP', 'Juan Carlos', 'Pérez', 'García', '1990-05-15', 'masculino', '70111222', 'La Paz', 'La Paz', 'Ingeniero de Sistemas', 'Ingeniero de Sistemas', 'licenciatura', 5, 'busqueda_activa', 'inmediata', 'hibrido', 8000, 12000, 'Desarrollador Full Stack con 5 años de experiencia en React y Node.js. Apasionado por crear soluciones escalables.', TRUE),

(7, '8234567SC', 'María Fernanda', 'Rodríguez', 'Silva', '1995-08-22', 'femenino', '75222333', 'Santa Cruz', 'Santa Cruz de la Sierra', 'Contadora Pública', 'Licenciada en Contaduría Pública', 'licenciatura', 3, 'empleado', 'mas_1_mes', 'presencial', 6000, 9000, 'Contadora con experiencia en auditoría y gestión financiera. CPA certificada.', TRUE),

(8, '9345678CB', 'Carlos Alberto', 'Mamani', 'Condori', '1988-03-10', 'masculino', '68333444', 'Cochabamba', 'Cochabamba', 'Ingeniero Industrial', 'Ingeniero Industrial', 'maestria', 8, 'busqueda_pasiva', '1_mes', 'cualquiera', 10000, 15000, 'Gerente de Operaciones con maestría en Administración. Especializado en optimización de procesos.', TRUE),

(9, '6456789LP', 'Ana Lucía', 'López', 'Morales', '1998-11-30', 'femenino', '77444555', 'La Paz', 'El Alto', 'Diseñadora Gráfica', 'Técnico Superior en Diseño Gráfico', 'tecnico', 2, 'busqueda_activa', 'inmediata', 'remoto', 4000, 6000, 'Diseñadora UX/UI apasionada por crear experiencias digitales memorables. Experta en Figma y Adobe Suite.', TRUE),

(10, '5567890PT', 'Pedro Antonio', 'Quispe', 'Flores', '1992-07-18', 'masculino', '69555666', 'Potosí', 'Potosí', 'Ingeniero de Minas', 'Ingeniero de Minas', 'licenciatura', 6, 'empleado', '2_semanas', 'presencial', 7000, 10000, 'Ingeniero de Minas con experiencia en supervisión de operaciones subterráneas y seguridad minera.', TRUE);

-- =====================================================
-- 4. CONTRATISTAS
-- =====================================================

INSERT INTO contratistas (usuario_id, especialidad, anios_experiencia, tarifa_hora, tarifa_proyecto_min, disponibilidad, portafolio_url, github_url, descripcion_servicios, proyectos_completados, calificacion_promedio, verificado) VALUES
(11, 'Diseño UX/UI', 4, 150, 5000, 'por_proyecto', 'https://behance.net/designer123', NULL, 'Diseño de interfaces modernas y funcionales para web y móvil. Especializado en sistemas de diseño.', 23, 4.85, TRUE),

(12, 'Desarrollo Full Stack', 6, 200, 8000, 'medio_tiempo', 'https://portfolio.dev', 'https://github.com/devfreelancer', 'Desarrollo de aplicaciones web con React, Node.js, Python. APIs REST, bases de datos, deploy en AWS.', 35, 4.92, TRUE);

-- =====================================================
-- 5. HISTORIAL LABORAL (KARDEX)
-- =====================================================

INSERT INTO historial_laboral (candidato_id, empresa_id, empresa_nombre, empresa_nit, cargo, departamento, fecha_inicio, fecha_fin, actualmente_trabajando, descripcion_responsabilidades, logros_principales, razon_salida, tipo_contrato, verificado, fecha_verificacion, hash_documento) VALUES

-- Juan Pérez (id=1 en candidatos)
(1, 1, 'Tech Bolivia SRL', '1234567890', 'Desarrollador Full Stack Senior', 'Desarrollo', '2020-03-01', '2024-10-15', FALSE, 
'Desarrollo de aplicaciones web con React y Node.js. Implementación de APIs REST. Mentoring a developers junior. Code reviews. Participación en arquitectura de soluciones.',
'Lideró migración de monolito a microservicios reduciendo latencia 40%. Implementó CI/CD automatizado. Capacitó a 5 developers junior.',
'renuncia_voluntaria', 'indefinido', TRUE, '2024-10-16 10:30:00', SHA2('1_1_Desarrollador Full Stack Senior_2020-03-01_2024-10-15', 256)),

(1, 2, 'InnovaSoft SA', '9876543210', 'Desarrollador Backend', 'IT', '2018-01-15', '2020-02-28', FALSE,
'Desarrollo de APIs REST con Node.js y Express. Diseño de base de datos MySQL. Integración con servicios externos. Testing automatizado.',
'Optimizó queries SQL reduciendo tiempo de respuesta 60%. Implementó sistema de caché con Redis.',
'renuncia_voluntaria', 'indefinido', FALSE, NULL, SHA2('1_2_Desarrollador Backend_2018-01-15_2020-02-28', 256)),

-- María Rodríguez (id=2)
(2, NULL, 'Estudio Contable Rodríguez & Asociados', NULL, 'Contadora Senior', 'Contabilidad', '2021-06-01', NULL, TRUE,
'Gestión contable integral de clientes corporativos. Preparación de estados financieros. Auditoría interna. Cumplimiento tributario.',
'Implementó sistema digital de facturación reduciendo errores 90%. Certificación CPA obtenida.',
NULL, 'indefinido', FALSE, NULL, SHA2('2_NULL_Contadora Senior_2021-06-01_NULL', 256)),

-- Carlos Mamani (id=3)
(3, 3, 'Minera Andina Corp', '5555666677', 'Gerente de Operaciones', 'Operaciones', '2017-09-01', NULL, TRUE,
'Supervisión de operaciones mineras subterráneas. Gestión de equipos de 50+ trabajadores. Optimización de procesos productivos. Cumplimiento de normas de seguridad.',
'Redujo accidentes laborales 75% en 3 años. Incrementó productividad 30% optimizando turnos y mantenimiento.',
NULL, 'indefinido', TRUE, '2024-01-15 14:00:00', SHA2('3_3_Gerente de Operaciones_2017-09-01_NULL', 256)),

-- Ana López (id=4)
(4, 2, 'InnovaSoft SA', '9876543210', 'Diseñadora UX/UI', 'Diseño', '2022-08-01', '2024-09-30', FALSE,
'Diseño de interfaces para aplicaciones móviles y web. Research con usuarios. Creación de prototipos en Figma. Colaboración con developers.',
'Diseñó sistema de diseño usado en 5 productos. Incrementó satisfacción de usuario 40% según métricas.',
'finalizacion_contrato', 'plazo_fijo', TRUE, '2024-10-01 09:00:00', SHA2('4_2_Diseñadora UX/UI_2022-08-01_2024-09-30', 256)),

-- Pedro Quispe (id=5)
(5, 3, 'Minera Andina Corp', '5555666677', 'Supervisor de Mina', 'Operaciones Subterráneas', '2018-04-01', NULL, TRUE,
'Supervisión directa de operaciones de extracción. Coordinación de equipos de perforación y voladura. Control de calidad del mineral. Reporte de producción diaria.',
'Implementó nuevas técnicas de perforación aumentando extracción 20%. Cero accidentes fatales en su turno durante 6 años.',
NULL, 'indefinido', TRUE, '2024-02-20 11:00:00', SHA2('5_3_Supervisor de Mina_2018-04-01_NULL', 256));

-- =====================================================
-- 6. HISTORIAL ACADÉMICO
-- =====================================================

INSERT INTO historial_academico (candidato_id, institucion, titulo, nivel_educativo, carrera, fecha_inicio, fecha_graduacion, en_curso, pais, ciudad, verificado) VALUES
(1, 'Universidad Mayor de San Andrés (UMSA)', 'Ingeniero de Sistemas', 'licenciatura', 'Ingeniería de Sistemas', '2008-03-01', '2013-12-15', FALSE, 'Bolivia', 'La Paz', TRUE),
(2, 'Universidad Autónoma Gabriel René Moreno (UAGRM)', 'Licenciada en Contaduría Pública', 'licenciatura', 'Contaduría Pública', '2013-02-01', '2018-11-20', FALSE, 'Bolivia', 'Santa Cruz de la Sierra', TRUE),
(3, 'Universidad Mayor de San Simón (UMSS)', 'Ingeniero Industrial', 'licenciatura', 'Ingeniería Industrial', '2006-03-01', '2011-12-10', FALSE, 'Bolivia', 'Cochabamba', TRUE),
(3, 'Universidad Católica Boliviana', 'MBA - Maestría en Administración de Empresas', 'maestria', 'Administración de Empresas', '2015-03-01', '2017-07-30', FALSE, 'Bolivia', 'La Paz', TRUE),
(4, 'Instituto Tecnológico Boliviano', 'Técnico Superior en Diseño Gráfico', 'tecnico_superior', 'Diseño Gráfico', '2016-02-01', '2018-12-15', FALSE, 'Bolivia', 'La Paz', TRUE),
(5, 'Universidad Técnica de Oruro (UTO)', 'Ingeniero de Minas', 'licenciatura', 'Ingeniería de Minas', '2010-03-01', '2016-07-20', FALSE, 'Bolivia', 'Oruro', TRUE);

-- =====================================================
-- 7. HABILIDADES (Catálogo General)
-- =====================================================

INSERT INTO habilidades (nombre, categoria, descripcion, demanda_mercado, activa) VALUES
-- Habilidades técnicas (Desarrollo)
('JavaScript', 'tecnica', 'Lenguaje de programación para desarrollo web', 'muy_alta', TRUE),
('React', 'tecnica', 'Biblioteca JavaScript para construir interfaces de usuario', 'muy_alta', TRUE),
('Node.js', 'tecnica', 'Entorno de ejecución JavaScript del lado del servidor', 'muy_alta', TRUE),
('Python', 'tecnica', 'Lenguaje de programación versátil', 'muy_alta', TRUE),
('MySQL', 'tecnica', 'Sistema de gestión de bases de datos relacional', 'alta', TRUE),
('MongoDB', 'tecnica', 'Base de datos NoSQL orientada a documentos', 'alta', TRUE),
('Git', 'herramienta', 'Sistema de control de versiones', 'muy_alta', TRUE),
('Docker', 'herramienta', 'Plataforma de contenedorización', 'alta', TRUE),
('AWS', 'herramienta', 'Servicios cloud de Amazon', 'muy_alta', TRUE),
('TypeScript', 'tecnica', 'Superset tipado de JavaScript', 'alta', TRUE),

-- Habilidades técnicas (Diseño)
('Figma', 'herramienta', 'Herramienta de diseño de interfaces colaborativa', 'muy_alta', TRUE),
('Adobe Photoshop', 'herramienta', 'Editor de imágenes profesional', 'alta', TRUE),
('Adobe Illustrator', 'herramienta', 'Editor de gráficos vectoriales', 'alta', TRUE),
('UI/UX Design', 'tecnica', 'Diseño de experiencia e interfaz de usuario', 'muy_alta', TRUE),
('Prototipado', 'tecnica', 'Creación de prototipos interactivos', 'alta', TRUE),

-- Habilidades técnicas (Otras)
('Contabilidad', 'tecnica', 'Gestión de registros financieros', 'alta', TRUE),
('Auditoría', 'tecnica', 'Revisión y verificación de registros financieros', 'media', TRUE),
('Excel Avanzado', 'herramienta', 'Uso avanzado de Microsoft Excel', 'muy_alta', TRUE),
('SAP', 'herramienta', 'Sistema integrado de gestión empresarial', 'alta', TRUE),
('Ingeniería de Minas', 'tecnica', 'Conocimientos técnicos de minería', 'media', TRUE),

-- Habilidades blandas
('Liderazgo', 'blanda', 'Capacidad de dirigir y motivar equipos', 'muy_alta', TRUE),
('Trabajo en Equipo', 'blanda', 'Colaboración efectiva con otros', 'muy_alta', TRUE),
('Comunicación Efectiva', 'blanda', 'Transmisión clara de ideas', 'muy_alta', TRUE),
('Resolución de Problemas', 'blanda', 'Análisis y solución de problemas complejos', 'muy_alta', TRUE),
('Gestión del Tiempo', 'blanda', 'Organización y priorización de tareas', 'alta', TRUE),
('Pensamiento Crítico', 'blanda', 'Análisis objetivo y razonamiento lógico', 'alta', TRUE),
('Adaptabilidad', 'blanda', 'Flexibilidad ante cambios', 'alta', TRUE),
('Creatividad', 'blanda', 'Generación de ideas innovadoras', 'alta', TRUE),

-- Idiomas
('Inglés', 'idioma', 'Idioma inglés', 'muy_alta', TRUE),
('Portugués', 'idioma', 'Idioma portugués', 'media', TRUE),
('Francés', 'idioma', 'Idioma francés', 'baja', TRUE),

-- Certificaciones
('PMP', 'certificacion', 'Project Management Professional', 'alta', TRUE),
('CPA', 'certificacion', 'Certified Public Accountant', 'alta', TRUE),
('AWS Certified', 'certificacion', 'Certificación Amazon Web Services', 'muy_alta', TRUE),
('Scrum Master', 'certificacion', 'Certificación Scrum Master', 'alta', TRUE);

-- =====================================================
-- 8. CANDIDATO_HABILIDADES (con niveles)
-- =====================================================

INSERT INTO candidato_habilidades (candidato_id, habilidad_id, nivel_dominio, anios_experiencia, ultima_vez_usado, certificado) VALUES
-- Juan Pérez (Full Stack Developer)
(1, 1, 'experto', 5.0, '2024-10-15', FALSE),      -- JavaScript
(1, 2, 'experto', 4.0, '2024-10-15', FALSE),      -- React
(1, 3, 'experto', 4.5, '2024-10-15', FALSE),      -- Node.js
(1, 5, 'avanzado', 5.0, '2024-10-15', FALSE),     -- MySQL
(1, 6, 'intermedio', 2.0, '2024-08-01', FALSE),   -- MongoDB
(1, 7, 'experto', 5.0, '2024-10-15', FALSE),      -- Git
(1, 8, 'intermedio', 2.0, '2024-10-15', FALSE),   -- Docker
(1, 10, 'avanzado', 3.0, '2024-10-15', FALSE),    -- TypeScript
(1, 21, 'experto', 5.0, '2024-10-15', FALSE),     -- Liderazgo
(1, 22, 'experto', 5.0, '2024-10-15', FALSE),     -- Trabajo en Equipo
(1, 29, 'avanzado', 5.0, '2024-10-15', FALSE),    -- Inglés

-- María Rodríguez (Contadora)
(2, 16, 'experto', 6.0, '2024-10-16', FALSE),     -- Contabilidad
(2, 17, 'avanzado', 4.0, '2024-09-30', FALSE),    -- Auditoría
(2, 18, 'experto', 6.0, '2024-10-16', FALSE),     -- Excel Avanzado
(2, 19, 'intermedio', 2.0, '2023-12-15', FALSE),  -- SAP
(2, 23, 'experto', 6.0, '2024-10-16', FALSE),     -- Comunicación Efectiva
(2, 25, 'experto', 6.0, '2024-10-16', FALSE),     -- Gestión del Tiempo
(2, 29, 'intermedio', 3.0, '2024-10-16', FALSE),  -- Inglés
(2, 33, 'experto', 3.0, '2024-10-16', TRUE),      -- CPA (certificado)

-- Carlos Mamani (Gerente Operaciones)
(3, 20, 'experto', 8.0, '2024-10-16', FALSE),     -- Ingeniería de Minas
(3, 18, 'avanzado', 8.0, '2024-10-16', FALSE),    -- Excel Avanzado
(3, 19, 'experto', 6.0, '2024-10-16', FALSE),     -- SAP
(3, 21, 'experto', 8.0, '2024-10-16', FALSE),     -- Liderazgo
(3, 22, 'experto', 8.0, '2024-10-16', FALSE),     -- Trabajo en Equipo
(3, 23, 'experto', 8.0, '2024-10-16', FALSE),     -- Comunicación Efectiva
(3, 24, 'experto', 8.0, '2024-10-16', FALSE),     -- Resolución de Problemas
(3, 29, 'avanzado', 5.0, '2024-10-16', FALSE),    -- Inglés
(3, 32, 'experto', 4.0, '2024-10-16', TRUE),      -- PMP (certificado)

-- Ana López (Diseñadora UX/UI)
(4, 11, 'experto', 2.5, '2024-10-15', FALSE),     -- Figma
(4, 12, 'avanzado', 3.0, '2024-09-15', FALSE),    -- Photoshop
(4, 13, 'avanzado', 3.0, '2024-09-15', FALSE),    -- Illustrator
(4, 14, 'experto', 2.5, '2024-10-15', FALSE),     -- UI/UX Design
(4, 15, 'avanzado', 2.0, '2024-10-15', FALSE),    -- Prototipado
(4, 1, 'basico', 0.5, '2024-05-10', FALSE),       -- JavaScript
(4, 22, 'avanzado', 2.0, '2024-09-30', FALSE),    -- Trabajo en Equipo
(4, 28, 'experto', 3.0, '2024-10-15', FALSE),     -- Creatividad
(4, 29, 'intermedio', 2.0, '2024-10-15', FALSE),  -- Inglés

-- Pedro Quispe (Ingeniero Minas)
(5, 20, 'experto', 6.0, '2024-10-16', FALSE),     -- Ingeniería de Minas
(5, 18, 'avanzado', 6.0, '2024-10-16', FALSE),    -- Excel Avanzado
(5, 21, 'experto', 6.0, '2024-10-16', FALSE),     -- Liderazgo
(5, 22, 'experto', 6.0, '2024-10-16', FALSE),     -- Trabajo en Equipo
(5, 24, 'experto', 6.0, '2024-10-16', FALSE),     -- Resolución de Problemas
(5, 25, 'avanzado', 6.0, '2024-10-16', FALSE),    -- Gestión del Tiempo
(5, 29, 'basico', 1.0, '2024-01-10', FALSE);      -- Inglés

-- =====================================================
-- 9. VACANTES
-- =====================================================

INSERT INTO vacantes (empresa_id, titulo, descripcion, departamento, ciudad, modalidad, experiencia_requerida_anios, nivel_educativo_minimo, salario_min, salario_max, mostrar_salario, tipo_contrato, jornada, estado, fecha_publicacion, fecha_cierre, vacantes_disponibles, contacto_email) VALUES

(1, 'Desarrollador Full Stack Senior', 
'Buscamos un Desarrollador Full Stack Senior con experiencia en React y Node.js para unirse a nuestro equipo de desarrollo. El candidato ideal tendrá experiencia construyendo aplicaciones web escalables, conocimiento sólido de bases de datos y familiaridad con Docker y AWS.\n\nResponsabilidades:\n- Diseñar y desarrollar aplicaciones web completas\n- Colaborar con equipos de diseño y producto\n- Realizar code reviews\n- Mentoría a developers junior\n- Participar en decisiones de arquitectura', 
'La Paz', 'La Paz', 'hibrido', 3, 'licenciatura', 8000, 12000, TRUE, 'indefinido', 'tiempo_completo', 'abierta', '2024-10-01 09:00:00', '2024-11-30', 2, 'rrhh@techbolivia.com'),

(1, 'Diseñador UX/UI', 
'Tech Bolivia busca un Diseñador UX/UI talentoso para crear experiencias digitales excepcionales. Buscamos alguien con ojo para el detalle, pasión por el diseño centrado en el usuario y habilidades de prototipado.\n\nResponsabilidades:\n- Diseñar interfaces web y móviles\n- Realizar research de usuarios\n- Crear wireframes y prototipos en Figma\n- Colaborar con developers\n- Mantener sistema de diseño', 
'La Paz', 'La Paz', 'remoto', 2, 'tecnico', 5000, 8000, TRUE, 'indefinido', 'tiempo_completo', 'abierta', '2024-10-05 10:00:00', '2024-11-15', 1, 'rrhh@techbolivia.com'),

(2, 'Desarrollador Backend Node.js', 
'InnovaSoft SA está creciendo y necesitamos un Desarrollador Backend con experiencia en Node.js y bases de datos. Trabajarás en proyectos de startups emocionantes y tendrás oportunidad de aprender tecnologías emergentes.\n\nRequisitos:\n- 2+ años con Node.js/Express\n- Experiencia con MySQL o MongoDB\n- Conocimiento de APIs REST\n- Git y metodologías ágiles', 
'Santa Cruz', 'Santa Cruz de la Sierra', 'presencial', 2, 'licenciatura', 6000, 9000, TRUE, 'plazo_fijo', 'tiempo_completo', 'abierta', '2024-09-20 14:00:00', '2024-10-31', 1, 'contacto@innovasoft.bo'),

(3, 'Supervisor de Mina', 
'Minera Andina Corp busca Supervisor de Mina experimentado para operaciones subterráneas. Buscamos profesional con liderazgo comprobado, conocimiento de seguridad minera y capacidad de gestión de equipos grandes.\n\nResponsabilidades:\n- Supervisar operaciones de extracción\n- Gestionar equipo de 30+ trabajadores\n- Asegurar cumplimiento normas de seguridad\n- Reportar producción diaria\n- Optimizar procesos operativos', 
'Potosí', 'Potosí', 'presencial', 5, 'licenciatura', 9000, 13000, FALSE, 'indefinido', 'tiempo_completo', 'abierta', '2024-10-10 11:00:00', '2024-11-20', 1, 'rrhh@minera-andina.com'),

(2, 'Pasante de Desarrollo Web', 
'Oportunidad de pasantía en InnovaSoft para estudiantes de últimos semestres de Ingeniería de Sistemas o carreras afines. Aprenderás desarrollo web moderno trabajando en proyectos reales.\n\nBuscamos:\n- Conocimientos básicos de JavaScript\n- Ganas de aprender React y Node.js\n- Disponibilidad tiempo completo (6 meses)\n- Actitud proactiva', 
'Santa Cruz', 'Santa Cruz de la Sierra', 'hibrido', 0, 'secundaria', 2000, 3000, TRUE, 'pasantia', 'tiempo_completo', 'abierta', '2024-10-12 15:00:00', '2024-10-25', 2, 'contacto@innovasoft.bo');

-- =====================================================
-- 10. VACANTE_HABILIDADES
-- =====================================================

-- Vacante 1: Desarrollador Full Stack Senior
INSERT INTO vacante_habilidades (vacante_id, habilidad_id, nivel_minimo_requerido, obligatoria, peso_ponderacion) VALUES
(1, 1, 'experto', TRUE, 20),      -- JavaScript (obligatorio)
(1, 2, 'avanzado', TRUE, 20),     -- React (obligatorio)
(1, 3, 'avanzado', TRUE, 20),     -- Node.js (obligatorio)
(1, 5, 'avanzado', TRUE, 15),     -- MySQL (obligatorio)
(1, 7, 'avanzado', TRUE, 10),     -- Git (obligatorio)
(1, 8, 'intermedio', FALSE, 5),   -- Docker (deseable)
(1, 9, 'intermedio', FALSE, 5),   -- AWS (deseable)
(1, 21, 'avanzado', FALSE, 5);    -- Liderazgo (deseable)

-- Vacante 2: Diseñador UX/UI
INSERT INTO vacante_habilidades (vacante_id, habilidad_id, nivel_minimo_requerido, obligatoria, peso_ponderacion) VALUES
(2, 11, 'avanzado', TRUE, 25),    -- Figma (obligatorio)
(2, 14, 'avanzado', TRUE, 25),    -- UI/UX Design (obligatorio)
(2, 15, 'avanzado', TRUE, 20),    -- Prototipado (obligatorio)
(2, 12, 'intermedio', FALSE, 10), -- Photoshop (deseable)
(2, 13, 'intermedio', FALSE, 10), -- Illustrator (deseable)
(2, 28, 'avanzado', FALSE, 10);   -- Creatividad (deseable)

-- Vacante 3: Desarrollador Backend Node.js
INSERT INTO vacante_habilidades (vacante_id, habilidad_id, nivel_minimo_requerido, obligatoria, peso_ponderacion) VALUES
(3, 1, 'avanzado', TRUE, 20),     -- JavaScript
(3, 3, 'avanzado', TRUE, 30),     -- Node.js
(3, 5, 'intermedio', TRUE, 20),   -- MySQL
(3, 7, 'intermedio', TRUE, 15),   -- Git
(3, 22, 'intermedio', FALSE, 10), -- Trabajo en Equipo
(3, 24, 'intermedio', FALSE, 5);  -- Resolución de Problemas

-- Vacante 4: Supervisor de Mina
INSERT INTO vacante_habilidades (vacante_id, habilidad_id, nivel_minimo_requerido, obligatoria, peso_ponderacion) VALUES
(4, 20, 'experto', TRUE, 30),     -- Ingeniería de Minas
(4, 21, 'experto', TRUE, 25),     -- Liderazgo
(4, 22, 'experto', TRUE, 20),     -- Trabajo en Equipo
(4, 23, 'avanzado', TRUE, 15),    -- Comunicación Efectiva
(4, 24, 'avanzado', FALSE, 10);   -- Resolución de Problemas

-- Vacante 5: Pasante Desarrollo Web
INSERT INTO vacante_habilidades (vacante_id, habilidad_id, nivel_minimo_requerido, obligatoria, peso_ponderacion) VALUES
(5, 1, 'basico', TRUE, 30),       -- JavaScript
(5, 7, 'basico', TRUE, 20),       -- Git
(5, 27, 'intermedio', FALSE, 20), -- Adaptabilidad
(5, 22, 'basico', FALSE, 15),     -- Trabajo en Equipo
(5, 2, 'basico', FALSE, 15);      -- React (deseable)

-- =====================================================
-- 11. POSTULACIONES (con scores de matching simulados)
-- =====================================================

INSERT INTO postulaciones (vacante_id, candidato_id, estado, fecha_postulacion, score_compatibilidad, desglose_scoring, carta_presentacion, visto_por_empresa, fecha_visto) VALUES

-- Juan Pérez postula a Desarrollador Full Stack Senior (Vacante 1)
(1, 1, 'preseleccionado', '2024-10-02 10:30:00', 92.50, 
JSON_OBJECT(
  'experiencia', 95,
  'habilidades', 92,
  'educacion', 90,
  'otros', 93,
  'explicacion', 'Candidato altamente compatible. 5 años de experiencia Full Stack. Domina 8/10 habilidades requeridas (JavaScript, React, Node.js, MySQL, Git experto). Ubicación: mismo departamento. Disponibilidad: inmediata.',
  'fortalezas', JSON_ARRAY('Experiencia comprobada en Tech Bolivia', 'Experto en stack tecnológico requerido', 'Liderazgo demostrado'),
  'debilidades', JSON_ARRAY('Falta experiencia avanzada en AWS', 'Docker nivel intermedio')
),
'Estimado equipo de Tech Bolivia,\n\nMe entusiasma postular a la posición de Desarrollador Full Stack Senior. Con 5 años de experiencia desarrollando aplicaciones web escalables con React y Node.js, creo que puedo aportar valor inmediato a su equipo.\n\nDurante mi tiempo en Tech Bolivia, lideré la migración de un monolito a microservicios y mentoré a 5 developers junior. Estoy ansioso por regresar y contribuir con nuevas perspectivas.\n\nSaludos cordiales,\nJuan Pérez',
TRUE, '2024-10-02 14:00:00'),

-- Ana López postula a Diseñador UX/UI (Vacante 2)
(2, 4, 'entrevista_agendada', '2024-10-06 09:15:00', 88.75,
JSON_OBJECT(
  'experiencia', 80,
  'habilidades', 95,
  'educacion', 85,
  'otros', 95,
  'explicacion', 'Candidata muy compatible. 2.5 años de experiencia UX/UI. Experta en Figma y UI/UX Design. Portfolio impresionante en InnovaSoft. Modalidad remota coincide con preferencia.',
  'fortalezas', JSON_ARRAY('Experta en Figma y UI/UX Design', 'Portfolio con casos de éxito comprobados', 'Disponibilidad inmediata'),
  'debilidades', JSON_ARRAY('Experiencia menor a 3 años ideales', 'Photoshop/Illustrator nivel avanzado pero no experto')
),
'Hola equipo de Tech Bolivia,\n\nSoy Ana López, Diseñadora UX/UI con pasión por crear experiencias memorables. He trabajado en InnovaSoft diseñando interfaces para 5 productos exitosos.\n\nMi enfoque centrado en el usuario incrementó la satisfacción 40% en métricas. Me encantaría aportar esa mentalidad a sus proyectos.\n\nAdjunto mi portfolio: [link]\n\nSaludos,\nAna',
TRUE, '2024-10-06 16:00:00'),

-- María Rodríguez postula a Supervisor de Mina (Vacante 4) - NO compatible
(4, 2, 'rechazado', '2024-10-11 11:00:00', 15.25,
JSON_OBJECT(
  'experiencia', 5,
  'habilidades', 10,
  'educacion', 30,
  'otros', 20,
  'explicacion', 'Candidata no compatible. Perfil de Contadora no match con requisitos de Ingeniería de Minas. Sin experiencia en sector minero ni habilidades técnicas requeridas.',
  'fortalezas', JSON_ARRAY('Profesional con licenciatura', 'Experiencia en gestión'),
  'debilidades', JSON_ARRAY('Sin formación en Ingeniería de Minas', 'Sin experiencia en sector minero', 'Perfil completamente diferente')
),
'Estimados,\n\nAunque mi experiencia es en contabilidad, estoy interesada en expandir a nuevos sectores. Creo que mis habilidades de gestión podrían aportar...\n\nSaludos,\nMaría',
TRUE, '2024-10-11 15:30:00'),

-- Carlos Mamani postula a Supervisor de Mina (Vacante 4)
(4, 3, 'revisado', '2024-10-12 14:20:00', 96.80,
JSON_OBJECT(
  'experiencia', 100,
  'habilidades', 98,
  'educacion', 95,
  'otros', 93,
  'explicacion', 'Candidato EXCEPCIONAL. 8 años de experiencia en Minera Andina como Gerente de Operaciones. Perfil ideal. Experto en Ingeniería de Minas, liderazgo comprobado, PMP certificado. Ubicación: Cochabamba (relocación necesaria).',
  'fortalezas', JSON_ARRAY('8 años experiencia sector minero', 'Gerente actual en Minera Andina', 'Liderazgo de 50+ personas', 'MBA + PMP certificado', 'Redujo accidentes 75%'),
  'debilidades', JSON_ARRAY('Ubicación diferente requiere relocación', 'Disponibilidad en 1 mes')
),
'Estimado equipo de Minera Andina,\n\nComo actual Gerente de Operaciones con 8 años en la empresa, estoy interesado en esta posición de Supervisor que me permitiría enfocarme en operaciones de campo.\n\nMi track record incluye reducción de accidentes 75% e incremento de productividad 30%. Referencias disponibles internamente.\n\nSaludos,\nCarlos Mamani',
TRUE, '2024-10-13 09:00:00'),

-- Pedro Quispe postula a Supervisor de Mina (Vacante 4)
(4, 5, 'postulado', '2024-10-14 16:45:00', 91.30,
JSON_OBJECT(
  'experiencia', 92,
  'habilidades', 93,
  'educacion', 90,
  'otros', 90,
  'explicacion', 'Candidato altamente compatible. 6 años como Supervisor de Mina en Minera Andina. Experiencia directa en el puesto. Cero accidentes fatales en 6 años. Ubicación: mismo departamento (Potosí).',
  'fortalezas', JSON_ARRAY('Experiencia directa como Supervisor', '6 años en Minera Andina', 'Cero accidentes fatales', 'Ubicación ideal'),
  'debilidades', JSON_ARRAY('Inglés básico', 'Sin certificaciones formales')
),
'Estimados,\n\nActualmente me desempeño como Supervisor de Mina en Minera Andina con excelentes resultados de seguridad (cero accidentes fatales en 6 años).\n\nBusco nuevos desafíos manteniendo mi compromiso con la seguridad y productividad.\n\nSaludos,\nPedro Quispe',
FALSE, NULL);

-- =====================================================
-- 12. EVALUACIONES DE DESEMPEÑO
-- =====================================================

INSERT INTO evaluaciones_desempeno (historial_laboral_id, fecha_evaluacion, periodo_evaluado, puntuacion, comentarios, evaluador_nombre, evaluador_cargo, areas_fortaleza, areas_mejora, metas_cumplidas) VALUES

-- Evaluaciones de Juan Pérez en Tech Bolivia (historial_laboral id=1)
(1, '2020-12-15', 'Q4 2020', 4.20, 
'Juan demostró excelente adaptación al equipo. Rápido aprendizaje de stack tecnológico. Código limpio y bien documentado.',
'Roberto Sánchez', 'Tech Lead',
'Aprendizaje rápido, proactividad, calidad de código',
'Necesita mejorar estimación de tiempos',
TRUE),

(1, '2021-12-20', 'Anual 2021', 4.50,
'Año excepcional. Lideró migración a microservicios exitosamente. Comenzó a mentorar developers junior con excelentes resultados.',
'Roberto Sánchez', 'Tech Lead',
'Liderazgo técnico, arquitectura de soluciones, mentoring',
'Mejorar habilidades de presentación a stakeholders',
TRUE),

(1, '2023-06-30', 'Semestre 1-2023', 4.80,
'Performance sobresaliente. Capacitó a 5 developers junior. Implementó CI/CD que redujo bugs en producción 60%.',
'Roberto Sánchez', 'Tech Lead',
'Liderazgo, innovación técnica, impacto en calidad',
'Ninguna significativa',
TRUE),

-- Evaluación de Carlos Mamani en Minera Andina (historial_laboral id=4)
(4, '2023-12-31', 'Anual 2023', 4.95,
'Carlos es un líder excepcional. Redujo accidentes laborales a niveles históricos manteniendo alta productividad. Gestión de equipo ejemplar.',
'Luis Fernández', 'Gerente General',
'Liderazgo, seguridad, productividad, gestión de equipos',
'Mejorar reportes escritos (actualmente muy buenos pero pueden ser más concisos)',
TRUE);

-- =====================================================
-- 13. DOCUMENTOS
-- =====================================================

INSERT INTO documentos (usuario_id, tipo, nombre_original, nombre_archivo_cifrado, path_cifrado, hash_sha256, tamano_bytes, mime_type, descripcion, publico) VALUES
(6, 'cv', 'CV_JuanPerez_2024.pdf', 'a1b2c3d4e5f6.enc', '/uploads/2024/10/6/a1b2c3d4e5f6.pdf.enc', SHA2('CV Juan Perez content', 256), 245678, 'application/pdf', 'CV actualizado octubre 2024', TRUE),
(7, 'cv', 'MariaRodriguez_CV.pdf', 'f6e5d4c3b2a1.enc', '/uploads/2024/10/7/f6e5d4c3b2a1.pdf.enc', SHA2('CV Maria Rodriguez content', 256), 198432, 'application/pdf', 'Curriculum Vitae con experiencia contable', TRUE),
(8, 'certificado_laboral', 'Certificado_MineraAndina.pdf', '1a2b3c4d5e6f.enc', '/uploads/2024/02/8/1a2b3c4d5e6f.pdf.enc', SHA2('Certificado Laboral Carlos', 256), 156789, 'application/pdf', 'Certificado laboral Minera Andina Corp', FALSE),
(9, 'titulo_academico', 'Titulo_DiseñoGrafico_AnaLopez.pdf', '9z8y7x6w5v4u.enc', '/uploads/2024/10/9/9z8y7x6w5v4u.pdf.enc', SHA2('Titulo Ana Lopez', 256), 523456, 'application/pdf', 'Título Técnico Superior en Diseño Gráfico', FALSE),
(10, 'certificacion', 'CertificadoSeguridad_Minera.pdf', '5t4r3e2w1q0p.enc', '/uploads/2024/03/10/5t4r3e2w1q0p.pdf.enc', SHA2('Certificado Seguridad Pedro', 256), 345678, 'application/pdf', 'Certificación en Seguridad Minera', FALSE);

-- =====================================================
-- 14. LOGS DE AUDITORÍA (Ejemplos)
-- =====================================================

INSERT INTO logs_auditoria (usuario_id, accion, tabla_afectada, registro_id, cambios_json, ip_address, user_agent, timestamp) VALUES
(6, 'LOGIN', NULL, NULL, NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-10-16 08:30:15.123456'),
(2, 'INSERT', 'vacantes', 1, JSON_OBJECT('titulo', 'Desarrollador Full Stack Senior'), '192.168.1.50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-10-01 09:00:00.000000'),
(6, 'INSERT', 'postulaciones', 1, JSON_OBJECT('vacante_id', 1, 'candidato_id', 1), '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-10-02 10:30:00.000000'),
(2, 'UPDATE', 'postulaciones', 1, JSON_OBJECT('antes', JSON_OBJECT('estado', 'postulado'), 'despues', JSON_OBJECT('estado', 'preseleccionado')), '192.168.1.50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-10-03 14:15:00.000000'),
(1, 'INSERT', 'historial_laboral', 1, JSON_OBJECT('empresa', 'Tech Bolivia SRL', 'cargo', 'Desarrollador Full Stack Senior'), '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-10-16 10:30:00.000000');

-- =====================================================
-- DATOS ADICIONALES (Completar catálogo de habilidades)
-- =====================================================

INSERT INTO habilidades (nombre, categoria, descripcion, demanda_mercado, activa) VALUES
('Angular', 'tecnica', 'Framework JavaScript para aplicaciones web', 'alta', TRUE),
('Vue.js', 'tecnica', 'Framework JavaScript progresivo', 'alta', TRUE),
('.NET', 'tecnica', 'Framework de Microsoft para desarrollo', 'alta', TRUE),
('Java', 'tecnica', 'Lenguaje de programación orientado a objetos', 'alta', TRUE),
('PHP', 'tecnica', 'Lenguaje de programación para desarrollo web', 'media', TRUE),
('PostgreSQL', 'tecnica', 'Sistema de gestión de bases de datos avanzado', 'alta', TRUE),
('Redis', 'herramienta', 'Base de datos en memoria para caching', 'alta', TRUE),
('Kubernetes', 'herramienta', 'Orquestación de contenedores', 'alta', TRUE),
('CI/CD', 'tecnica', 'Integración y despliegue continuos', 'muy_alta', TRUE),
('Testing', 'tecnica', 'Pruebas de software automatizadas', 'muy_alta', TRUE),
('REST API', 'tecnica', 'Diseño de APIs REST', 'muy_alta', TRUE),
('GraphQL', 'tecnica', 'Lenguaje de consulta para APIs', 'media', TRUE),
('Microservicios', 'tecnica', 'Arquitectura de microservicios', 'alta', TRUE),
('Blockchain', 'tecnica', 'Tecnología de cadena de bloques', 'media', TRUE),
('Machine Learning', 'tecnica', 'Aprendizaje automático', 'alta', TRUE),
('Data Science', 'tecnica', 'Ciencia de datos', 'alta', TRUE),
('Power BI', 'herramienta', 'Herramienta de Business Intelligence', 'muy_alta', TRUE),
('Tableau', 'herramienta', 'Plataforma de visualización de datos', 'alta', TRUE),
('Sketch', 'herramienta', 'Herramienta de diseño de interfaces', 'media', TRUE),
('InVision', 'herramienta', 'Herramienta de prototipado', 'media', TRUE),
('Agile/Scrum', 'tecnica', 'Metodologías ágiles de desarrollo', 'muy_alta', TRUE),
('Kanban', 'tecnica', 'Metodología de gestión visual', 'alta', TRUE),
('Jira', 'herramienta', 'Herramienta de gestión de proyectos', 'muy_alta', TRUE),
('Confluence', 'herramienta', 'Herramienta de documentación colaborativa', 'alta', TRUE),
('Slack', 'herramienta', 'Plataforma de comunicación empresarial', 'muy_alta', TRUE),
('Trello', 'herramienta', 'Herramienta de organización de tareas', 'alta', TRUE),
('Negociación', 'blanda', 'Habilidad de negociación efectiva', 'muy_alta', TRUE),
('Presentación', 'blanda', 'Habilidades de presentación pública', 'alta', TRUE),
('Empatía', 'blanda', 'Capacidad de comprender emociones ajenas', 'muy_alta', TRUE),
('Inteligencia Emocional', 'blanda', 'Gestión de emociones propias y ajenas', 'muy_alta', TRUE),
('Toma de Decisiones', 'blanda', 'Capacidad de decidir bajo presión', 'muy_alta', TRUE),
('Orientación a Resultados', 'blanda', 'Enfoque en cumplimiento de objetivos', 'muy_alta', TRUE),
('Alemán', 'idioma', 'Idioma alemán', 'baja', TRUE),
('Italiano', 'idioma', 'Idioma italiano', 'baja', TRUE),
('Chino Mandarín', 'idioma', 'Idioma chino mandarín', 'media', TRUE);

-- Habilitar checks nuevamente
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICACIONES FINALES
-- =====================================================

-- Verificar datos insertados
SELECT 'Usuarios insertados:' AS info, COUNT(*) AS total FROM usuarios;
SELECT 'Empresas insertadas:' AS info, COUNT(*) AS total FROM empresas;
SELECT 'Candidatos insertados:' AS info, COUNT(*) AS total FROM candidatos;
SELECT 'Contratistas insertados:' AS info, COUNT(*) AS total FROM contratistas;
SELECT 'Registros KARDEX:' AS info, COUNT(*) AS total FROM historial_laboral;
SELECT 'Títulos académicos:' AS info, COUNT(*) AS total FROM historial_academico;
SELECT 'Habilidades en catálogo:' AS info, COUNT(*) AS total FROM habilidades;
SELECT 'Vacantes abiertas:' AS info, COUNT(*) AS total FROM vacantes WHERE estado = 'abierta';
SELECT 'Postulaciones registradas:' AS info, COUNT(*) AS total FROM postulaciones;
SELECT 'Evaluaciones de desempeño:' AS info, COUNT(*) AS total FROM evaluaciones_desempeno;
SELECT 'Documentos almacenados:' AS info, COUNT(*) AS total FROM documentos;
SELECT 'Logs de auditoría:' AS info, COUNT(*) AS total FROM logs_auditoria;

-- Verificar integridad referencial
SELECT 
  'Candidatos con usuario válido:' AS check_name,
  COUNT(*) AS total 
FROM candidatos c 
INNER JOIN usuarios u ON c.usuario_id = u.id;

SELECT 
  'Postulaciones con candidato y vacante válidos:' AS check_name,
  COUNT(*) AS total 
FROM postulaciones p 
INNER JOIN candidatos c ON p.candidato_id = c.id 
INNER JOIN vacantes v ON p.vacante_id = v.id;

-- =====================================================
-- FIN DEL SEED DATA
-- =====================================================