-- Script para crear la base de datos y sus tablas
CREATE DATABASE IF NOT EXISTS abejas_meliponas;
USE abejas_meliponas;

DROP TABLE IF EXISTS negocios;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  correo VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NULL DEFAULT NULL,
  nombre VARCHAR(100) NULL DEFAULT NULL,
  rol ENUM('apicultor', 'cliente') NULL DEFAULT NULL,
  foto_perfil VARCHAR(255) NULL DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE negocios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(150),
  logo_url VARCHAR(255) NULL DEFAULT NULL,
  productos JSON,
  tipo_miel VARCHAR(100),
  flor_origen VARCHAR(100),
  estado VARCHAR(50),
  coordenadas JSON,
  contacto JSON,
  descripcion TEXT,
  vistas INT DEFAULT 0,
  contactos INT DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
