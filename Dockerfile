# ---- Etapa 1: Construcción (Build) ----
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# ---- Etapa 2: Producción (Nginx) ----
FROM nginx:alpine as production-stage

# Copiar la build generada a la carpeta pública de nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
