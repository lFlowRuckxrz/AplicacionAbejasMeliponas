export interface Business {
  id: string;
  userId: string;
  nombre: string;
  productos: string[];
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
  };
  descripcion?: string;
  fechaCreacion: string;
}
