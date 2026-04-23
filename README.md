# 🐝 Apiario México

Una aplicación web completa para conectar productores apícolas con clientes en la República Mexicana.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- Registro de nuevos usuarios con validación
- Inicio de sesión seguro con contraseñas encriptadas (bcrypt)
- Backend en Node.js/Express con base de datos MySQL
- Persistencia de sesión en cliente con localStorage

### 👥 Sistema de Roles
- **Apicultor**: Puede registrar y gestionar negocios apícolas
- **Cliente**: Puede explorar y descubrir productores de miel

### 🗺️ Mapa Interactivo
- Visualización del mapa de México con enfoque en estados del sur
- Marcadores interactivos con iconos de abejas 🐝
- Tooltips al pasar el mouse sobre los marcadores
- Estados disponibles: Chiapas, Oaxaca, Tabasco, Campeche, Yucatán, Quintana Roo, Veracruz, Guerrero

### 📝 Gestión de Negocios (Apicultores)
- Registro completo de negocios apícolas con:
  - Nombre del negocio
  - Productos derivados de la miel (predefinidos + personalizados)
  - Tipo de miel (Multifloral, Monofloral, Orgánica, Convencional)
  - Flor de origen
  - Ubicación por estado
  - Información de contacto completa
  - Descripción del negocio
- Edición de negocios propios
- Eliminación de negocios propios
- Vista de tarjetas con información resumida

### 🔍 Búsqueda y Filtros
- Búsqueda por nombre, producto o tipo de flor
- Filtrado por estado
- Resultados en tiempo real

### 📱 Diseño Responsivo
- Totalmente adaptable a móviles, tablets y escritorio
- Interfaz optimizada para diferentes tamaños de pantalla

### 🎨 Experiencia de Usuario
- Notificaciones toast para todas las acciones
- Animaciones suaves y transiciones
- Colores temáticos (ámbar/amarillo/naranja)
- Iconos intuitivos con Lucide React

## 🛠️ Arquitectura y Tecnologías

### Frontend
- **React 18** con TypeScript
- **React Router** para navegación
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **Lucide React** para iconos
- **Sonner** para notificaciones toast

### Backend
- **Node.js** con **Express** para la API REST
- **MySQL** como base de datos relacional
- **Bcryptjs** para el hash seguro de contraseñas
- **Multer** para la subida de imágenes

## 🚀 Instalación y Ejecución Local

El proyecto está compuesto por una aplicación web con frontend y un servicio backend para su ejecución local. Para ejecutarlo:

### 1. Base de Datos (MySQL)
Asegúrate de tener un servidor MySQL corriendo.

### 2. Ejecutar el Backend
```bash
cd backend
npm install
# Crea un archivo .env basándote en .env.example
node server.js # o npm run dev si usas nodemon
```

### 3. Ejecutar el Frontend
Abre otra terminal en la raíz del proyecto:
```bash
npm install
npm run dev
```

## 📋 Guía de Uso

### Para Apicultores:
1. Regístrate con tu correo electrónico
2. Selecciona el rol "Apicultor"
3. Haz clic en "Agregar Negocio"
4. Completa el formulario con la información de tu apiario
5. Tu negocio aparecerá en el mapa para que los clientes lo descubran
6. Puedes editar o eliminar tus negocios en cualquier momento

### Para Clientes:
1. Regístrate con tu correo electrónico
2. Selecciona el rol "Cliente"
3. Explora el mapa interactivo
4. Haz clic en los marcadores de abejas para ver detalles
5. Contacta directamente a los productores

## 📊 Estructura de Datos

### Usuario
- ID único
- Correo electrónico
- Rol (apicultor/cliente)

### Negocio
- ID único
- Usuario propietario
- Nombre
- Productos (array)
- Tipo de miel
- Flor de origen
- Ubicación (estado, coordenadas)
- Contacto (correo, teléfono, dirección, sitio web)
- Descripción
- Fecha de creación

## 🎯 Casos de Uso

1. **Productor Local**: Un apicultor en Yucatán puede mostrar su miel de azahar orgánica y productos derivados
2. **Cliente Buscador**: Alguien en Oaxaca puede encontrar productores locales y contactarlos directamente
3. **Transparencia**: Los clientes pueden conocer el origen y tipo de miel antes de comprar
4. **Red de Apicultores**: Visualización de la distribución de productores en el sur de México

## 🔒 Seguridad

- Validación de formularios en frontend y backend
- Contraseñas protegidas mediante Hash (Bcrypt) en la base de datos
- Los usuarios solo pueden editar/eliminar sus propios negocios
- Persistencia de estado en cliente con validación contra la API

## 🌟 Próximas Mejoras Sugeridas

- Implementación de JSON Web Tokens (JWT) para sesiones más seguras
- Geolocalización precisa con coordenadas GPS
- Fotos de productos
- Sistema de calificaciones y reseñas
- Chat directo entre clientes y productores
- Marketplace integrado
- Certificaciones orgánicas
- Blog sobre apicultura

---

Desarrollado con 🐝 para apoyar a los productores de miel mexicanos
