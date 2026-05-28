# Guía de Despliegue con Docker

Esta carpeta contiene archivos de ejemplo y configuraciones necesarias para desplegar la aplicación "Abejas Meliponas" en un servidor de producción o en la nube (como AWS, DigitalOcean, Linode, etc.) usando **Docker** y **Docker Compose**.

## Estructura de Despliegue

La aplicación se compone de 3 contenedores principales:
1.  **Frontend**: Construido con Vite y servido mediante Nginx (puerto 80).
2.  **Backend**: API en Node.js/Express (puerto 3001).
3.  **Base de Datos**: MySQL 8.0 (puerto interno 3306).

## Pasos para el Despliegue

1.  **Clonar el repositorio** en tu servidor.
2.  **Preparar variables de entorno**:
    *   Copia el archivo `.env.example` de esta carpeta a `.env`:
        ```bash
        cp deploy/.env.example deploy/.env
        ```
    *   Edita el nuevo archivo `.env` y cambia las contraseñas (`DB_ROOT_PASSWORD`, `DB_PASSWORD`, etc.) por contraseñas seguras y reales.
3.  **Ejecutar Docker Compose**:
    *   Navega a la carpeta `deploy/` y ejecuta el entorno en modo "detached":
        ```bash
        cd deploy
        docker-compose -f docker-compose.example.yml up --build -d
        ```
4.  **Verificar el estado**:
    *   Asegúrate de que los contenedores están funcionando correctamente:
        ```bash
        docker ps
        ```

## Consideraciones Adicionales
*   **Migraciones/Semillas (Seeders)**: Una vez que el entorno esté corriendo, es posible que necesites ejecutar tu script de `seed.js` en el backend para poblar la base de datos inicial:
    ```bash
    docker exec -it abejas-backend node database/seed.js
    ```
*   **Proxy Inverso**: En producción, probablemente querrás tener un Nginx o Traefik principal manejando certificados SSL (HTTPS) que redirija el tráfico al puerto 80 del contenedor del `frontend` o al puerto `3001` del `backend`.
