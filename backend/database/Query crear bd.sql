-- file: /database/00_create_database.sql

-- Eliminar base de datos si existe (solo desarrollo)
DROP DATABASE IF EXISTS rrhh_blockchain;

-- Crear base de datos con charset UTF-8
CREATE DATABASE rrhh_blockchain
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE rrhh_blockchain;

-- Verificar creación
SELECT DATABASE();