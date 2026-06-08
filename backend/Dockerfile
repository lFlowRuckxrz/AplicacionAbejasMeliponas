FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm ci

# Copiar el resto del código del backend
COPY . .

# Asegurar directorios de subidas de imágenes y permisos para el usuario 'node'
RUN mkdir -p uploads/profiles uploads/negocios && chown -R node:node /usr/src/app

# Ejecutar como usuario sin privilegios
USER node

# Exponer el puerto (ajustado a 5001 por defecto en tu app)
EXPOSE 5001

# Comando para iniciar la aplicación
CMD ["npm", "start"]
