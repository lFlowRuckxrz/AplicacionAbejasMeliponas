-- SQL Script
-- =========================================================================
-- SISTEMA: MeliHub — Sistema web de geolocalización de vendedores de miel melipona en la Península de Yucatán.
-- VERSIÓN: 1.0.0
--
-- BASE DE DATOS: abejas_meliponas
-- MOTOR: MySQL 8.x
-- CHARSET: utf8mb4 | COLLATION: utf8mb4_spanish_ci
--
-- AUTORES:
-- Trejo Moo, Maria Isabel — No. Control 8879
-- Borges Damian, Herminio de Jesus — No. Control 8987
-- Jun Uicab, Roberto Carlos — No. Control 8884
-- Chin Canul, Jhohan Omar — No. Control 8871
-- Rucker Bautista, Jeffrey Lee — No. Control 8875
--
-- ASESOR(A): [Grado. Nombre Apellido]
-- INSTITUCIÓN: TecNM Campus Calkiní
-- CARRERA: Ingeniería en Informática
--
-- FECHA DE CREACIÓN: 20/02/2026
-- ÚLTIMA MODIFICACIÓN: 28/05/2026
--
-- DERECHOS DE AUTOR: Registro en trámite ante INDAUTOR
-- Todos los derechos reservados © 2026 — TecNM Campus Calkiní
-- =========================================================================

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
