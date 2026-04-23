import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
const resources = {
  es: {
    translation: {
      "app": {
        "title": "Ajustes Avanzados",
        "logout": "Salir",
        "profile": "Perfil"
      },
      "map": {
        "title": "Directorio Melipona",
        "subtitle_cliente": "Explora los productores de miel estelares en México, especialmente en la Península de Yucatán",
        "subtitle_apicultor": "Haz clic en \"Agregar Negocio\" para registrar tu apiario",
        "add_business": "Agregar Negocio",
        "stats": {
          "total": "Total Apiarios",
          "peninsula": "Península",
          "types": "Tipos Miel",
          "states": "Estados" //
        },
        "search_ph": "Buscar por nombre, producto o flor originaria...",
        "state_any": "Cualquier estado",
        "type_any": "Repertorio completo"
      },
      "nav": {
        "map": "Mapa",
        "blog": "Mundo Melipona",
        "language": "Idioma"
      }
    }
  },
  en: {
    translation: {
      "app": {
        "title": "Advanced Settings",
        "logout": "Logout",
        "profile": "Profile"
      },
      "map": {
        "title": "Melipona Directory",
        "subtitle_cliente": "Explore stellar honey producers in Mexico, especially in the Yucatan Peninsula",
        "subtitle_apicultor": "Click on \"Add Business\" to register your apiary",
        "add_business": "Add Business",
        "stats": {
          "total": "Total Apiaries",
          "peninsula": "Peninsula",
          "types": "Honey Types",
          "states": "States"
        },
        "search_ph": "Search by name, product or origin flower...",
        "state_any": "Any state",
        "type_any": "Full repertoire"
      },
      "nav": {
        "map": "Map",
        "blog": "Melipona World",
        "language": "Language"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // default language
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
