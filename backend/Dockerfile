FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código del backend
COPY . .

# Exponer el puerto (ajustado a 5001 por defecto en tu app)
EXPOSE 5001

# Comando para iniciar la aplicación
CMD ["npm", "start"]
