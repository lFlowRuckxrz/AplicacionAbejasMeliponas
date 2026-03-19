# 🐝 Apiario México

Una aplicación web completa para conectar productores apícolas con clientes en la República Mexicana.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- Registro de nuevos usuarios con validación
- Inicio de sesión seguro
- Persistencia de sesión con localStorage

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

## 🛠️ Tecnologías Utilizadas

- **React 18** con TypeScript
- **React Router** para navegación
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **Lucide React** para iconos
- **Sonner** para notificaciones toast
- **LocalStorage** para persistencia de datos

## 🚀 Cómo Usar

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

- Validación de formularios
- Autenticación basada en sesión
- Los usuarios solo pueden editar/eliminar sus propios negocios
- Almacenamiento seguro en localStorage (para prototipo)

## 🌟 Próximas Mejoras Sugeridas

- Integración con base de datos real (Supabase)
- Geolocalización precisa con coordenadas GPS
- Fotos de productos
- Sistema de calificaciones y reseñas
- Chat directo entre clientes y productores
- Marketplace integrado
- Certificaciones orgánicas
- Blog sobre apicultura

---

Desarrollado con 🐝 para apoyar a los productores de miel mexicanos
