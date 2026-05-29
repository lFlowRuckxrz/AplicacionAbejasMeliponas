# Guía de Despliegue con Docker

Esta carpeta contiene archivos de ejemplo y configuraciones secundarias para el despliegue. **Nota: Se recomienda utilizar el archivo `docker-compose.yml` en la raíz del proyecto**, el cual ya está configurado con todas las mejoras de saneamiento y centralización.

## Estructura de Despliegue

La aplicación se compone de 3 contenedores principales:
1.  **Frontend**: Construido con Vite y servido mediante Nginx (puerto 80).
2.  **Backend**: API en Node.js/Express (puerto 5001).
3.  **Base de Datos**: MySQL 8.0 (puerto interno 3306).

## Pasos para el Despliegue (Alternativa usando la carpeta /deploy)

1.  **Clonar el repositorio** en tu servidor.
2.  **Preparar variables de entorno**:
    *   Copia el archivo `.env.example` de esta carpeta a `.env`:
        ```bash
        cp deploy/.env.example deploy/.env
        ```
    *   Edita el nuevo archivo `.env` y cambia las contraseñas por contraseñas seguras y reales.
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
*   **Migraciones/Semillas (Seeders)**: Una vez que el entorno esté corriendo, es posible que necesites ejecutar las migraciones y tu script de `seed.js` en el backend para poblar la base de datos inicial:
    ```bash
    docker exec -it melihub-backend npm run db:migrate
    docker exec -it melihub-backend npm run db:seed
    ```
*   **Proxy Inverso**: En producción, probablemente querrás tener un Nginx o Traefik principal manejando certificados SSL (HTTPS) que redirija el tráfico al puerto 80 del contenedor del `frontend` o al puerto `5001` del `backend`.

