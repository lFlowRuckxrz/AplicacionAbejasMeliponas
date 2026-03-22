import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../types/business';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Bug, MapPin, LogOut, Plus, Mail, Phone, Globe, X, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Coordenadas de estados con enfoque en la Península de Yucatán
const mexicoStates = [
  // Península de Yucatán (región principal)
  { name: 'Yucatán', lat: 20.7099, lng: -89.0943, region: 'peninsula' },
  { name: 'Quintana Roo', lat: 19.1817, lng: -88.4791, region: 'peninsula' },
  { name: 'Campeche', lat: 19.8301, lng: -90.5349, region: 'peninsula' },
  
  // Estados del sureste
  { name: 'Chiapas', lat: 16.7569, lng: -93.1292, region: 'sur' },
  { name: 'Oaxaca', lat: 17.0732, lng: -96.7266, region: 'sur' },
  { name: 'Tabasco', lat: 17.8409, lng: -92.6189, region: 'sur' },
  { name: 'Veracruz', lat: 19.1738, lng: -96.1342, region: 'sur' },
  { name: 'Guerrero', lat: 17.4392, lng: -99.5451, region: 'sur' },
];

// Crear iconos personalizados para los marcadores
const createBeeIcon = (isPeninsula: boolean = false) => {
  return L.divIcon({
    html: `<div class="bee-marker ${isPeninsula ? 'peninsula' : ''}">🐝</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

export function MapView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipoMiel, setFilterTipoMiel] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.role) {
      navigate('/role-selection');
      return;
    }

    // Cargar negocios desde localStorage
    const storedBusinesses = localStorage.getItem('businesses');
    if (storedBusinesses) {
      setBusinesses(JSON.parse(storedBusinesses));
    } else {
      // Agregar negocios de ejemplo si no hay ninguno guardado
      const sampleBusinesses: Business[] = [
        {
          id: 'sample-1',
          userId: 'demo-user-1',
          nombre: 'Miel Melipona Maya',
          productos: ['Miel pura', 'Polen', 'Propóleo', 'Cremas naturales'],
          tipoMiel: 'Monofloral',
          florMiel: 'Melipona (Abeja Maya)',
          ubicacion: {
            lat: 20.7099,
            lng: -89.0943,
            estado: 'Yucatán',
          },
          contacto: {
            correo: 'contacto@meliponamaya.com',
            telefono: '(999) 123-4567',
            direccion: 'Calle 60 #450, Centro, Mérida, Yucatán',
            sitioWeb: 'https://www.meliponamaya.com',
          },
          descripcion: 'Productores artesanales de miel de abeja melipona, una tradición maya de más de 3,000 años. Nuestra miel es 100% orgánica y certificada, producida por las abejas nativas sin aguijón de la Península de Yucatán.',
          fechaCreacion: new Date('2024-01-15').toISOString(),
        },
        {
          id: 'sample-2',
          userId: 'demo-user-2',
          nombre: 'Apiarios Don José',
          productos: ['Miel pura', 'Jalea real', 'Cera de abeja', 'Velas de cera', 'Jabones naturales'],
          tipoMiel: 'Multifloral',
          florMiel: 'Multifloral de la Península',
          ubicacion: {
            lat: 19.8301,
            lng: -90.5349,
            estado: 'Campeche',
          },
          contacto: {
            correo: 'ventas@apiariosdonjose.mx',
            telefono: '(981) 234-5678',
            direccion: 'Km 5 Carretera Campeche-Mérida, Campeche',
          },
          descripcion: 'Empresa familiar con más de 30 años de experiencia en la producción de miel y derivados. Trabajamos con abejas europeas y meliponas, ofreciendo productos de la más alta calidad con certificación orgánica.',
          fechaCreacion: new Date('2024-02-20').toISOString(),
        },
        {
          id: 'sample-3',
          userId: 'demo-user-3',
          nombre: 'Cooperativa Kabah',
          productos: ['Miel pura', 'Polen', 'Propóleo', 'Shampoo de miel'],
          tipoMiel: 'Orgánica',
          florMiel: 'Tajonal y Dzidzilché',
          ubicacion: {
            lat: 20.5,
            lng: -89.5,
            estado: 'Yucatán',
          },
          contacto: {
            correo: 'cooperativa@kabah.org',
            telefono: '(999) 987-6543',
            direccion: 'Comunidad Maya, Interior de Yucatán',
            sitioWeb: 'https://www.cooperativakabah.org',
          },
          descripcion: 'Cooperativa de productores mayas especializados en miel de melipona. Preservamos las técnicas ancestrales de manejo de abejas nativas y promovemos el desarrollo sustentable de nuestras comunidades.',
          fechaCreacion: new Date('2024-03-10').toISOString(),
        },
      ];
      setBusinesses(sampleBusinesses);
      localStorage.setItem('businesses', JSON.stringify(sampleBusinesses));
    }
  }, [user, navigate]);

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Crear el mapa
    const map = L.map(mapContainerRef.current).setView([23.6345, -102.5528], 5);
    
    // Añadir capa de tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Cleanup al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Filtrar negocios
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      const matchesSearch = business.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.productos.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           business.florMiel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = !filterEstado || business.ubicacion.estado === filterEstado;
      const matchesTipoMiel = !filterTipoMiel || business.tipoMiel === filterTipoMiel;
      return matchesSearch && matchesFilter && matchesTipoMiel;
    });
  }, [businesses, searchTerm, filterEstado, filterTipoMiel]);

  // Estadísticas para clientes
  const stats = useMemo(() => {
    const peninsulaBusinesses = businesses.filter(b => 
      ['Yucatán', 'Quintana Roo', 'Campeche'].includes(b.ubicacion.estado)
    );
    
    const tiposMielUnicos = new Set(businesses.map(b => b.tipoMiel));
    const estadosUnicos = new Set(businesses.map(b => b.ubicacion.estado));
    
    return {
      total: businesses.length,
      peninsula: peninsulaBusinesses.length,
      tiposMiel: tiposMielUnicos.size,
      estados: estadosUnicos.size,
    };
  }, [businesses]);

  // Actualizar marcadores cuando cambien los negocios filtrados
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Añadir nuevos marcadores
    filteredBusinesses.forEach((business) => {
      const isPeninsula = ['Yucatán', 'Quintana Roo', 'Campeche'].includes(business.ubicacion.estado);
      
      const marker = L.marker([business.ubicacion.lat, business.ubicacion.lng], {
        icon: createBeeIcon(isPeninsula)
      });

      // Crear contenido del popup
      const popupContent = `
        <div class="p-2">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-bold text-gray-900 text-base">${business.nombre}</h3>
            <span class="text-amber-500 ml-2 text-xl">🐝</span>
          </div>
          <div class="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <span>📍</span>
            ${business.ubicacion.estado}
          </div>
          <p class="text-sm text-gray-700 mb-2">
            🍯 ${business.tipoMiel}
          </p>
          <p class="text-sm text-gray-700 mb-3">
            🌸 ${business.florMiel}
          </p>
          <button 
            class="w-full px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium transition-colors"
            onclick="window.dispatchEvent(new CustomEvent('selectBusiness', { detail: '${business.id}' }))"
          >
            Ver Detalles
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      });

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // Ajustar vista si hay negocios
    if (filteredBusinesses.length > 0) {
      // Pequeño timeout para asegurar que el mapa esté completamente inicializado
      setTimeout(() => {
        if (mapRef.current) {
          try {
            const bounds = L.latLngBounds(
              filteredBusinesses.map(b => [b.ubicacion.lat, b.ubicacion.lng] as [number, number])
            );
            mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
          } catch (error) {
            console.error('Error ajustando bounds del mapa:', error);
          }
        }
      }, 100);
    } else {
      // Volver a la vista de México
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setView([23.6345, -102.5528], 5);
        }
      }, 100);
    }
  }, [filteredBusinesses]);

  // Escuchar evento personalizado para seleccionar negocio desde el popup
  useEffect(() => {
    const handleSelectBusiness = (event: CustomEvent) => {
      const businessId = event.detail;
      const business = businesses.find(b => b.id === businessId);
      if (business) {
        setSelectedBusiness(business);
      }
    };

    window.addEventListener('selectBusiness' as any, handleSelectBusiness as any);
    return () => {
      window.removeEventListener('selectBusiness' as any, handleSelectBusiness as any);
    };
  }, [businesses]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Sesión cerrada exitosamente');
  };

  const handleAddBusiness = () => {
    setShowAddForm(true);
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setShowEditForm(true);
  };

  const handleDeleteBusiness = (businessId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este negocio?')) {
      const updatedBusinesses = businesses.filter(b => b.id !== businessId);
      setBusinesses(updatedBusinesses);
      localStorage.setItem('businesses', JSON.stringify(updatedBusinesses));
      setSelectedBusiness(null);
      toast.success('Negocio eliminado exitosamente');
    }
  };

  // Verificar si el usuario actual es dueño del negocio
  const isOwner = (business: Business) => business.userId === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Bug className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Apiario México</h1>
                <p className="text-xs sm:text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'apicultor' && (
                <Button 
                  onClick={handleAddBusiness}
                  className="bg-amber-500 hover:bg-amber-600"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Agregar Negocio</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-amber-300"
                size="sm"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Mapa de Productores de Miel de México
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {user?.role === 'apicultor' 
                ? 'Haz clic en "Agregar Negocio" para registrar tu apiario'
                : 'Explora los productores de miel en México, especialmente en la Península de Yucatán'
              }
            </p>
          </div>

          {/* Estadísticas - Solo para clientes */}
          {user?.role === 'cliente' && businesses.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border-2 border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <Bug className="w-5 h-5 text-amber-600" />
                  <p className="text-xs sm:text-sm font-medium text-amber-800">Total Apiarios</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-900">{stats.total}</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-yellow-600" />
                  <p className="text-xs sm:text-sm font-medium text-yellow-800">Península</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-900">{stats.peninsula}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🍯</span>
                  <p className="text-xs sm:text-sm font-medium text-orange-800">Tipos Miel</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-orange-900">{stats.tiposMiel}</p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-4 rounded-lg border-2 border-amber-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📍</span>
                  <p className="text-xs sm:text-sm font-medium text-amber-800">Estados</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-900">{stats.estados}</p>
              </div>
            </div>
          )}

          {/* Filtros y Búsqueda */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nombre, producto o tipo de flor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                {mexicoStates.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={filterTipoMiel}
                onChange={(e) => setFilterTipoMiel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Todos los tipos de miel</option>
                <option value="Multifloral">Multifloral</option>
                <option value="Monofloral">Monofloral</option>
                <option value="Orgánica">Orgánica</option>
                <option value="Convencional">Convencional</option>
              </select>
            </div>
          </div>

          {/* Mapa de Leaflet */}
          <div className="relative w-full h-[500px] sm:h-[600px] rounded-xl overflow-hidden border-2 border-amber-300 shadow-lg mb-6">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Leyenda */}
            <div className="absolute bottom-4 left-4 bg-white p-3 sm:p-4 rounded-lg shadow-lg border-2 border-amber-200 z-[1000]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐝</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Productor de Miel
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-400 rounded-full border-2 border-amber-600"></div>
                  <span className="text-xs text-gray-600">
                    Península de Yucatán
                  </span>
                </div>
                <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                  {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'negocio' : 'negocios'}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de negocios */}
          {filteredBusinesses.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Negocios Registrados
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBusinesses.map((business) => {
                  const isPeninsula = ['Yucatán', 'Quintana Roo', 'Campeche'].includes(business.ubicacion.estado);
                  
                  return (
                    <div
                      key={business.id}
                      className={`relative p-4 border-2 rounded-lg hover:bg-amber-50 transition-all group ${
                        isPeninsula ? 'border-amber-400 bg-amber-50/50' : 'border-amber-200'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedBusiness(business)}
                        className="text-left w-full"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-gray-900 flex-1 pr-16">{business.nombre}</h4>
                          <span className="text-2xl flex-shrink-0">🐝</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          {business.ubicacion.estado}
                          {isPeninsula && (
                            <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-900 text-xs rounded-full font-medium">
                              Península
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {business.descripcion || `Miel de ${business.florMiel}`}
                        </p>
                      </button>
                      
                      {/* Botones de edición/eliminación para el dueño */}
                      {isOwner(business) && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBusiness(business);
                            }}
                            className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBusiness(business.id);
                            }}
                            className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {filteredBusinesses.length === 0 && businesses.length > 0 && (
            <div className="mt-8 text-center py-12">
              <Bug className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600">
                Intenta con otros términos de búsqueda o filtros
              </p>
            </div>
          )}

          {/* Mensaje cuando no hay negocios */}
          {businesses.length === 0 && (
            <div className="mt-8 text-center py-12">
              <Bug className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aún no hay negocios registrados
              </h3>
              <p className="text-gray-600">
                {user?.role === 'apicultor' 
                  ? 'Sé el primero en registrar tu apiario'
                  : 'Pronto habrá productores de miel en el mapa'
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalles del Negocio */}
      <Dialog open={!!selectedBusiness && !showEditForm} onOpenChange={() => setSelectedBusiness(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBusiness && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2 flex-1">
                    <Bug className="w-7 h-7 text-amber-500" />
                    {selectedBusiness.nombre}
                  </DialogTitle>
                  {isOwner(selectedBusiness) && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEditBusiness(selectedBusiness)}
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteBusiness(selectedBusiness.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Ubicación */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    Ubicación
                  </h4>
                  <p className="text-gray-700">{selectedBusiness.ubicacion.estado}</p>
                </div>

                {/* Descripción */}
                {selectedBusiness.descripcion && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-700">{selectedBusiness.descripcion}</p>
                  </div>
                )}

                {/* Productos */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Productos</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBusiness.productos.map((producto, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                      >
                        {producto}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tipo de Miel */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tipo de Miel</h4>
                  <p className="text-gray-700">{selectedBusiness.tipoMiel}</p>
                </div>

                {/* Flor de Origen */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Flor de Origen</h4>
                  <p className="text-gray-700">{selectedBusiness.florMiel}</p>
                </div>

                {/* Contacto */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Información de Contacto</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-5 h-5 text-amber-500" />
                      <a href={`mailto:${selectedBusiness.contacto.correo}`} className="hover:underline">
                        {selectedBusiness.contacto.correo}
                      </a>
                    </div>
                    {selectedBusiness.contacto.telefono && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-5 h-5 text-amber-500" />
                        <a href={`tel:${selectedBusiness.contacto.telefono}`} className="hover:underline">
                          {selectedBusiness.contacto.telefono}
                        </a>
                      </div>
                    )}
                    {selectedBusiness.contacto.sitioWeb && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-5 h-5 text-amber-500" />
                        <a
                          href={selectedBusiness.contacto.sitioWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {selectedBusiness.contacto.sitioWeb}
                        </a>
                      </div>
                    )}
                    {selectedBusiness.contacto.direccion && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                        <span>{selectedBusiness.contacto.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Formulario para Agregar */}
      {showAddForm && (
        <ApicultorFormModal
          onClose={() => setShowAddForm(false)}
          onSave={(newBusiness) => {
            const updatedBusinesses = [...businesses, newBusiness];
            setBusinesses(updatedBusinesses);
            localStorage.setItem('businesses', JSON.stringify(updatedBusinesses));
            setShowAddForm(false);
            toast.success('¡Negocio registrado exitosamente!');
          }}
          userId={user?.id || ''}
        />
      )}

      {/* Modal de Formulario para Editar */}
      {showEditForm && selectedBusiness && (
        <ApicultorFormModal
          onClose={() => {
            setShowEditForm(false);
            setSelectedBusiness(null);
          }}
          onSave={(updatedBusiness) => {
            const updatedBusinesses = businesses.map(b => 
              b.id === updatedBusiness.id ? updatedBusiness : b
            );
            setBusinesses(updatedBusinesses);
            localStorage.setItem('businesses', JSON.stringify(updatedBusinesses));
            setShowEditForm(false);
            setSelectedBusiness(null);
            toast.success('¡Negocio actualizado exitosamente!');
          }}
          userId={user?.id || ''}
          existingBusiness={selectedBusiness}
        />
      )}
    </div>
  );
}

// Componente del formulario para apicultores
interface ApicultorFormModalProps {
  onClose: () => void;
  onSave: (business: Business) => void;
  userId: string;
  existingBusiness?: Business;
}

function ApicultorFormModal({ onClose, onSave, userId, existingBusiness }: ApicultorFormModalProps) {
  const [formData, setFormData] = useState({
    nombre: existingBusiness?.nombre || '',
    productos: existingBusiness?.productos || [] as string[],
    tipoMiel: existingBusiness?.tipoMiel || '',
    florMiel: existingBusiness?.florMiel || '',
    estado: existingBusiness?.ubicacion.estado || '',
    correo: existingBusiness?.contacto.correo || '',
    telefono: existingBusiness?.contacto.telefono || '',
    direccion: existingBusiness?.contacto.direccion || '',
    sitioWeb: existingBusiness?.contacto.sitioWeb || '',
    descripcion: existingBusiness?.descripcion || '',
  });

  const [newProducto, setNewProducto] = useState('');

  const productosComunes = [
    'Miel pura',
    'Polen',
    'Propóleo',
    'Jalea real',
    'Cera de abeja',
    'Velas de cera',
    'Jabones naturales',
    'Cremas naturales',
    'Shampoo de miel',
  ];

  const tiposMiel = [
    'Multifloral',
    'Monofloral',
    'Orgánica',
    'Convencional',
  ];

  const handleAddProducto = (producto: string) => {
    if (producto && !formData.productos.includes(producto)) {
      setFormData({ ...formData, productos: [...formData.productos, producto] });
    }
    setNewProducto('');
  };

  const handleRemoveProducto = (producto: string) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter(p => p !== producto),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.productos.length === 0) {
      toast.error('Debes agregar al menos un producto');
      return;
    }

    // Obtener coordenadas del estado seleccionado
    const estadoData = mexicoStates.find(s => s.name === formData.estado);
    if (!estadoData) {
      toast.error('Por favor selecciona un estado válido');
      return;
    }

    const businessData: Business = {
      id: existingBusiness?.id || Date.now().toString(),
      userId,
      nombre: formData.nombre,
      productos: formData.productos,
      tipoMiel: formData.tipoMiel,
      florMiel: formData.florMiel,
      ubicacion: {
        lat: estadoData.lat,
        lng: estadoData.lng,
        estado: formData.estado,
      },
      contacto: {
        correo: formData.correo,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        sitioWeb: formData.sitioWeb || undefined,
      },
      descripcion: formData.descripcion || undefined,
      fechaCreacion: existingBusiness?.fechaCreacion || new Date().toISOString(),
    };

    onSave(businessData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Bug className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {existingBusiness ? 'Editar Apiario' : 'Registrar Nuevo Apiario'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {existingBusiness ? 'Actualiza la información de tu apiario' : 'Completa los campos para registrar tu apiario'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Nombre del negocio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Ej: Apiario Los Naranjos"
            />
          </div>

          {/* Productos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Productos Derivados de la Miel *
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProducto}
                  onChange={(e) => setNewProducto(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProducto(newProducto);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Escribe un producto..."
                />
                <Button
                  type="button"
                  onClick={() => handleAddProducto(newProducto)}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {productosComunes.map((producto) => (
                  <button
                    key={producto}
                    type="button"
                    onClick={() => handleAddProducto(producto)}
                    disabled={formData.productos.includes(producto)}
                    className="px-3 py-1 text-sm border border-amber-300 rounded-full hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + {producto}
                  </button>
                ))}
              </div>

              {formData.productos.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-amber-50 rounded-lg">
                  {formData.productos.map((producto) => (
                    <span
                      key={producto}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm"
                    >
                      {producto}
                      <button
                        type="button"
                        onClick={() => handleRemoveProducto(producto)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tipo de Miel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Miel *
            </label>
            <select
              required
              value={formData.tipoMiel}
              onChange={(e) => setFormData({ ...formData, tipoMiel: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Selecciona un tipo</option>
              {tiposMiel.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Flor de la Miel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flor de Origen de la Miel *
            </label>
            <input
              type="text"
              required
              value={formData.florMiel}
              onChange={(e) => setFormData({ ...formData, florMiel: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Ej: Azahar, Mezquite, Multifloral"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación (Estado) *
            </label>
            <select
              required
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Selecciona un estado</option>
              {mexicoStates.map((state) => (
                <option key={state.name} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* Información de Contacto */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="contacto@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="(999) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={2}
                  placeholder="Calle, número, colonia, ciudad..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.sitioWeb}
                  onChange={(e) => setFormData({ ...formData, sitioWeb: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="https://www.ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                  placeholder="Cuéntanos sobre tu apiario, métodos de producción, certificaciones, etc."
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600"
              disabled={formData.productos.length === 0}
            >
              {existingBusiness ? 'Actualizar Apiario' : 'Registrar Apiario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}