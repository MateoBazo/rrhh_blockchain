# file: README.md

# 🚀 RRHH en Blockchain

Sistema integral de gestión de Recursos Humanos con verificación de historiales laborales mediante blockchain, análisis automatizado de antecedentes judiciales con IA, y matching inteligente candidato-vacante.

## 📋 Descripción

Plataforma web que revoluciona los procesos de contratación en Bolivia mediante:

- **KARDEX Laboral Digital** - Registro completo e inmutable de experiencias laborales
- **Verificación Blockchain** - Certificación descentralizada de historiales (próxima fase)
- **Matching Inteligente** - Algoritmo que calcula compatibilidad candidato-vacante (score 0-100%)
- **Análisis de Antecedentes IA** - Screening automatizado en fuentes públicas (próxima fase)
- **Multi-Rol** - Sistema para Empresas, Candidatos, Contratistas y Administradores

## 🎯 Problema que Resuelve

- ❌ **Fraude en CVs**: 40-60% de candidatos exageran o falsifican información
- ❌ **Verificación Lenta**: 2-4 semanas para verificar referencias manualmente
- ❌ **Antecedentes Ocultos**: Ocultamiento de información judicial relevante
- ❌ **Proceso Ineficiente**: Preselección manual costosa y sesgada

## ✨ Características Principales

### MVP (Este Semestre)
- ✅ Autenticación segura (Email + Google OAuth)
- ✅ Sistema multi-rol (RBAC)
- ✅ KARDEX laboral completo en MySQL
- ✅ Gestión de vacantes y postulaciones
- ✅ Algoritmo de matching (Exp 40% + Skills 30% + Edu 20% + Otros 10%)
- ✅ Dashboards analíticos por rol
- ✅ Cifrado AES-256 de datos sensibles

### Próxima Fase (Siguiente Semestre)
- 🔜 Integración blockchain (Ethereum)
- 🔜 Smart contracts en Solidity
- 🔜 IA para análisis de antecedentes judiciales
- 🔜 Sistema de comunicación empresarial

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + Vite
- **Tailwind CSS** para estilos
- **Context API** para estado global
- **Axios** para HTTP requests
- **Chart.js** para visualizaciones

### Backend
- **Node.js 20 LTS** + Express.js
- **Sequelize ORM** para MySQL
- **JWT** para autenticación
- **bcrypt** para hashing de contraseñas
- **Passport.js** para OAuth

### Base de Datos
- **MySQL 8.0** (14 tablas relacionales)
- Triggers automáticos para auditoría
- Stored procedures para queries complejas
- Full-text search

### Blockchain (Próxima Fase)
- **Ethereum** (Sepolia testnet)
- **Solidity** para smart contracts
- **Hardhat** para desarrollo
- **Ethers.js** para integración

### Testing
- **Jest** (backend unit tests)
- **Supertest** (integration tests)
- **Cypress** (E2E tests)
- Coverage objetivo: >75%

## 📁 Estructura del Proyecto
```
hr-blockchain/
├── frontend/          # Aplicación React (próxima sesión)
├── backend/           # API REST Node.js/Express (próxima sesión)
├── contracts/         # Smart contracts Solidity (siguiente semestre)
├── database/          # Scripts SQL y documentación
│   ├── schema.sql              # DDL completo (14 tablas)
│   ├── seed_data.sql           # Datos de prueba
│   ├── test_schema.sql         # Tests de verificación
│   ├── ER_diagram.png          # Diagrama entidad-relación
│   └── README.md               # Documentación diseño DB
├── scripts/           # Scripts de utilidad
├── docs/              # Documentación del proyecto
│   ├── Sesion01.json           # Configuración entorno
│   ├── Sesion02-documento.json # Informe académico adaptado
│   └── Sesion03-planificacion.json
├── .gitignore
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js 20.x LTS** - [Descargar](https://nodejs.org/)
- **MySQL 8.0** - [Descargar](https://dev.mysql.com/downloads/mysql/)
- **Git 2.x** - [Descargar](https://git-scm.com/)

### Base de Datos
```bash
# 1. Conectar a MySQL
mysql -u root -p

# 2. Crear base de datos y ejecutar schema
mysql> SOURCE database/00_create_database.sql;
mysql> SOURCE database/schema.sql;
mysql> SOURCE database/seed_data.sql;

# 3. Verificar
mysql> USE rrhh_blockchain;
mysql> SHOW TABLES;  # Debe mostrar 14 tablas
```

### Backend (Próxima Sesión)
```bash
cd backend
npm install
cp .env.example .env  # Configurar variables de  entorno
npm run dev
```

### Frontend (Próxima Sesión)
```bash
cd frontend
npm install
npm run dev  # Abre http://localhost:5173
```

## 📊 Base de Datos

### Tablas Principales

1. **usuarios** - Autenticación multi-método
2. **empresas** - Perfiles corporativos
3. **candidatos** - Perfiles profesionales
4. **contratistas** - Perfiles freelance
5. **historial_laboral** ⭐ - KARDEX digital
6. **historial_academico** - Títulos y educación
7. **habilidades** - Catálogo de skills
8. **candidato_habilidades** - Skills con niveles
9. **vacantes** - Ofertas laborales
10. **vacante_habilidades** - Skills requeridas
11. **postulaciones** - Candidato-Vacante + scoring
12. **evaluaciones_desempeno** - Evaluaciones formales
13. **documentos** - Archivos cifrados
14. **logs_auditoria** - Auditoría inmutable

Ver documentación completa: [database/README.md](database/README.md)

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con **bcrypt** (12 rounds)
- ✅ JWT con expiración (15 min access, 7 días refresh)
- ✅ Cifrado AES-256 para datos sensibles
- ✅ Rate limiting (100 req/min)
- ✅ Sanitización de inputs (XSS, SQL injection)
- ✅ HTTPS obligatorio en producción
- ✅ Auditoría completa de accesos

## 📈 Roadmap

### ✅ Fase 1 - MVP Base (Actual)
- [x] Configuración de entorno
- [x] Diseño base de datos MySQL
- [x] Documentación académica
- [ ] Backend API REST (S004-S006)
- [ ] Frontend React (S007-S009)
- [ ] Algoritmo matching (S010-S011)
- [ ] Testing y deployment (S012-S013)

### 🔜 Fase 2 - Blockchain (Próximo Semestre)
- [ ] Smart contracts Solidity
- [ ] Integración Ethereum testnet
- [ ] Migración de hashes a blockchain
- [ ] Verificación pública inmutable

### 🔜 Fase 3 - IA Avanzada (Próximo Semestre)
- [ ] Análisis de antecedentes con NLP
- [ ] Web scraping ético fuentes públicas
- [ ] Sistema de clasificación de riesgo
- [ ] Reportes automatizados

### 🔜 Fase 4 - Comunicación (Post PI-IV)
- [ ] Chat empresa-candidato
- [ ] Sistema de notificaciones
- [ ] Verificaciones inter-empresariales
- [ ] Centro de mensajería unificado

## 👨‍💻 Autor

**Max** - Proyecto Integrador II  
Universidad Privada Franz Tamayo - Ingeniería de Sistemas

## 📄 Licencia

Este proyecto es académico y está en desarrollo como parte del Proyecto Integrador II.

## 🙏 Agradecimientos

- Docente: Ahmed Alejandro Centellas Alvarado
- Universidad Privada Franz Tamayo
- Comunidad de desarrolladores Bolivia

## 📞 Contacto

Para consultas sobre el proyecto: [Tu Email]

---

**Estado**: 🟢 En Desarrollo Activo  
**Última actualización**: Octubre 2024  
**Versión**: 0.3.0 (Database Schema Complete)
```

---

### **PASO 3: Crear Repositorio en GitHub**

#### **Opción A: Repositorio Público (Recomendado para portafolio)**

**En el navegador:**

1. Ir a [https://github.com](https://github.com)
2. Login con tu cuenta GitHub (crear cuenta si no tienes)
3. Click en **"+"** (arriba derecha) → **"New repository"**

**Configuración del repositorio:**
```
Repository name: hr-blockchain-sistema-rrhh
Description: Sistema de gestión de RRHH con blockchain, IA y matching inteligente - Proyecto Integrador II
✅ Public (para portafolio visible)
❌ NO marcar "Add a README" (ya tenemos uno)
❌ NO agregar .gitignore (ya tenemos uno)
❌ NO agregar licencia por ahora