# Guía de Despliegue con Docker

El proyecto está completamente contenerizado y listo para ejecutarse. **Se recomienda utilizar el archivo `docker-compose.yml` en la raíz del proyecto**, el cual está configurado con todas las mejoras de seguridad, unificación de credenciales de la base de datos y centralización.

## Estructura de Despliegue

La aplicación se compone de 3 contenedores principales:
1.  **Frontend**: Construido con Vite y servido mediante Nginx (puerto 80).
2.  **Backend**: API en Node.js/Express (puerto interno 5001, expuesto en localhost para desarrollo).
3.  **Base de Datos**: MySQL 8.0 (puerto interno 3306, expuesto en localhost para desarrollo).

## Pasos para el Despliegue

1.  **Clonar el repositorio** en tu servidor.
2.  **Preparar las variables de entorno en la raíz del proyecto**:
    *   Copia el archivo `.env.example` de la raíz del proyecto a `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Edita el nuevo archivo `.env` en la raíz y cambia las contraseñas por contraseñas seguras y reales, además de ajustar la URL pública de tu API (`VITE_API_URL`) y del frontend (`FRONTEND_URL`).
3.  **Ejecutar Docker Compose**:
    *   Ejecuta el entorno desde la raíz en modo "detached":
        ```bash
        docker compose up --build -d
        ```
4.  **Verificar el estado**:
    *   Asegúrate de que los contenedores están funcionando correctamente:
        ```bash
        docker compose ps
        ```

## Consideraciones Adicionales
*   **Migraciones/Semillas (Seeders)**: Una vez que el entorno esté corriendo, ejecuta las migraciones y el seed de demostración para poblar la base de datos:
    ```bash
    docker exec -it melihub-backend npm run db:migrate
    docker exec -it melihub-backend npm run db:seed
    ```
*   **Proxy Inverso**: En producción, deberías tener un Nginx o Traefik principal manejando certificados SSL (HTTPS) que redirija el tráfico público al contenedor del `frontend` (puerto 80). No expongas los puertos del backend (`5001`) o la base de datos (`3306`) a la red pública (el archivo `docker-compose.yml` los limita a `127.0.0.1` de forma segura).

