export interface Product {
  nombre: string;
  precio: string;
  descripcion?: string;
  imagenUrl?: string; // Optativo para el futuro si suben imagen
}

export interface Business {
  id: string;
  userId: string;
  nombre: string;
  logoUrl?: string;
  productos: Product[];
  tipoMiel: string;
  florMiel: string;
  ubicacion: {
    lat: number;
    lng: number;
    estado: string;
  };
  contacto: {
    correo: string;
    telefono?: string;
    direccion?: string;
    sitioWeb?: string;
    facebook?: string;
    instagram?: string;
  };
  descripcion?: string;
  fechaCreacion: string;
  vistas?: number;
  contactos?: number;
}
