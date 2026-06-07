# Pautas de Desarrollo para MeliHub

Este documento establece las directrices de desarrollo para el proyecto MeliHub (Aplicación de Abejas Meliponas).

## Estructura del Proyecto

- **Frontend:** Aplicación desacoplada en la raíz construida con React, TypeScript y Tailwind CSS. Utiliza Vite como servidor de desarrollo y empaquetador.
- **Backend:** API REST construida con Node.js, Express y MySQL (mediante `mysql2`). Las rutas se encuentran estructuradas bajo la carpeta `backend/routes/`.
- **Base de Datos:** El esquema inicial se define en `backend/database/schema.sql`. Las migraciones locales y scripts de datos de prueba se manejan en `backend/database/`.

## Variables de Entorno y Configuración

- **Desarrollo Local:** 
  - Backend: Se configura mediante `backend/.env` (copiado desde `backend/.env.example`).
  - Frontend: Se puede configurar localmente mediante variables `.env` en la raíz (ej: `VITE_API_URL`).
- **Desarrollo/Despliegue Contenerizado:**
  - Se debe utilizar el archivo `.env` en la raíz del proyecto (copiado desde `.env.example`).
  - Las contraseñas, hosts y puertos de Docker se centralizan en este archivo.

## Buenas Prácticas de Codificación

1. **Seguridad en la Base de Datos:**
   - Evitar usar el usuario `root` sin contraseña en entornos locales o de desarrollo.
   - Utilizar siempre consultas parametrizadas para evitar inyección SQL (mediante placeholders `?`).
2. **Control de CORS:**
   - El backend debe validar los orígenes a través de la variable `FRONTEND_URL` definida en el entorno.
   - Mantener el origen `http://localhost` habilitado para el correcto funcionamiento del frontend contenerizado en entornos de desarrollo local.
3. **Instalación de Dependencias:**
   - En entornos automatizados y Dockerfiles, utilizar siempre `npm ci` en lugar de `npm install` para garantizar la reproducibilidad.
