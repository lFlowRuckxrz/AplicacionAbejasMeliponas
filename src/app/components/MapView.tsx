import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../types/business';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Bug, MapPin, LogOut, Plus, Mail, Phone, Globe, X, Search, Edit, Trash2, User } from 'lucide-react';
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

    // Fetch desde el backend
    const fetchBusinesses = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/negocios');
        const data = await res.json();
        
        // Mapear los datos de MySQL al tipo Business del Frontend
        const mapped = data.map((b: any) => ({
          id: b.id.toString(),
          userId: b.usuario_id.toString(),
          nombre: b.nombre,
          logoUrl: b.logo_url || undefined,
          productos: typeof b.productos === 'string' ? JSON.parse(b.productos) : b.productos,
          tipoMiel: b.tipo_miel || 'Multifloral', // Default fallback
          florMiel: b.flor_origen || 'Variada',
          ubicacion: {
            ...(typeof b.coordenadas === 'string' ? JSON.parse(b.coordenadas) : (b.coordenadas || {})),
            estado: b.estado || (typeof b.coordenadas === 'string' ? JSON.parse(b.coordenadas)?.estado : b.coordenadas?.estado)
          },
          contacto: typeof b.contacto === 'string' ? JSON.parse(b.contacto) : (b.contacto || {}),
          descripcion: b.descripcion,
          fechaCreacion: b.creado_en
        }));
        
        setBusinesses(mapped);
      } catch (err) {
        console.error('Error cargando negocios:', err);
      }
    };
    
    fetchBusinesses();
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
                           business.productos.some((p: any) => {
                             const nombre = typeof p === 'string' ? p : p.nombre;
                             return nombre.toLowerCase().includes(searchTerm.toLowerCase());
                           }) ||
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
          <div class="flex items-center gap-3 mb-2">
            ${business.logoUrl ? 
              `<img src="${business.logoUrl}" class="w-10 h-10 rounded-full object-cover border border-amber-200" />` : 
              `<div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg">🐝</div>`
            }
            <h3 class="font-bold text-gray-900 text-base leading-tight">${business.nombre}</h3>
          </div>
          <div class="flex items-center gap-1 text-sm text-gray-600 mb-2 mt-1">
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
    const handleSelectBusinessInteract = async (business: Business) => {
      setSelectedBusiness(business);
      if (user?.id !== business.userId) {
        try {
          await fetch(`http://localhost:5001/api/negocios/${business.id}/interact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'view' })
          });
        } catch(e) {}
      }
    };

    const handleSelectBusiness = (event: CustomEvent) => {
      const businessId = event.detail;
      const business = businesses.find(b => b.id === businessId);
      if (business) {
        handleSelectBusinessInteract(business);
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

  const handleContactWhatsapp = async (phone: string, businessId: string) => {
    if (user?.id !== businesses.find(b => b.id === businessId)?.userId) {
      try {
        await fetch(`http://localhost:5001/api/negocios/${businessId}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'contact' })
        });
      } catch (e) {}
    }
    const waPhone = phone.replace(/[^0-9]/g, '');
    let text = '¡Hola! Vi tu apiario en MeliHub y me interesa.';
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddBusiness = () => {
    setShowAddForm(true);
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setShowEditForm(true);
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este negocio?')) {
      try {
        await fetch(`http://localhost:5001/api/negocios/${businessId}`, { method: 'DELETE' });
        const updatedBusinesses = businesses.filter(b => b.id !== businessId);
        setBusinesses(updatedBusinesses);
        setSelectedBusiness(null);
        toast.success('Negocio eliminado exitosamente');
      } catch (err) {
        toast.error('Error al eliminar negocio');
      }
    }
  };

  // Verificar si el usuario actual es dueño del negocio
  const isOwner = (business: Business) => business.userId === user?.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-amber-500/30">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MeliHub" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-amber-500 tracking-tight">MeliHub</h1>
                <p className="text-xs sm:text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'apicultor' && (
                <Button 
                  onClick={handleAddBusiness}
                  className="bg-amber-500 hover:bg-amber-600 shadow-sm transition-all"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Agregar Negocio</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              )}
              
              <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700 shadow-inner">
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  className="text-amber-400 hover:text-amber-300 hover:bg-slate-700/50 rounded-md h-8 px-3 transition-colors"
                  size="sm"
                >
                  {user?.foto_perfil ? (
                    <img src={user.foto_perfil} alt="Perfil" className="w-5 h-5 rounded-full object-cover mr-0 sm:mr-2 border border-amber-500" />
                  ) : (
                    <User className="w-4 h-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline font-medium">Perfil</span>
                </Button>
                
                <div className="w-px h-5 bg-slate-700 my-auto mx-1"></div>
                
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md h-8 px-3 transition-colors"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline font-medium">Salir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/50 p-4 sm:p-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2 tracking-tight">
              Directorio Melipona
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              {user?.role === 'apicultor' 
                ? 'Haz clic en "Agregar Negocio" para registrar tu apiario'
                : 'Explora los productores de miel estelares en México, especialmente en la Península de Yucatán'
              }
            </p>
          </div>

          {/* Estadísticas - Solo para clientes */}
          {user?.role === 'cliente' && businesses.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl backdrop-blur-sm shadow-inner hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-5 h-5 text-amber-500" />
                  <p className="text-xs sm:text-sm font-medium text-slate-400">Total Apiarios</p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-slate-100">{stats.total}</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl backdrop-blur-sm shadow-inner hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-yellow-500" />
                  <p className="text-xs sm:text-sm font-medium text-slate-400">Península</p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-slate-100">{stats.peninsula}</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl backdrop-blur-sm shadow-inner hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-5 h-5 text-orange-400" />
                  <p className="text-xs sm:text-sm font-medium text-slate-400">Tipos Miel</p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-slate-100">{stats.tiposMiel}</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl backdrop-blur-sm shadow-inner hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <p className="text-xs sm:text-sm font-medium text-slate-400">Estados</p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-slate-100">{stats.estados}</p>
              </div>
            </div>
          )}

          {/* Filtros y Búsqueda */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por nombre, producto o flor originaria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-slate-800/80 border-slate-700/50 text-slate-200 placeholder-slate-500 focus-visible:ring-amber-500 focus-visible:border-amber-500 shadow-inner rounded-xl h-12 backdrop-blur-sm"
              />
            </div>
            <div className="sm:w-56">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 appearance-none hover:bg-slate-700 bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none shadow-inner backdrop-blur-sm transition-colors cursor-pointer"
              >
                <option value="">Cualquier estado</option>
                {mexicoStates.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-56">
              <select
                value={filterTipoMiel}
                onChange={(e) => setFilterTipoMiel(e.target.value)}
                className="w-full px-4 appearance-none hover:bg-slate-700 bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none shadow-inner backdrop-blur-sm transition-colors cursor-pointer"
              >
                <option value="">Repertorio completo</option>
                <option value="Multifloral">Multifloral</option>
                <option value="Monofloral">Monofloral</option>
                <option value="Orgánica">Orgánica</option>
                <option value="Convencional">Convencional</option>
              </select>
            </div>
          </div>

          {/* Mapa de Leaflet */}
          <div className="relative w-full h-[500px] sm:h-[600px] rounded-3xl overflow-hidden border border-slate-700 shadow-2xl shadow-black/50 mb-10 bg-slate-950 isolate">
            <div ref={mapContainerRef} className="w-full h-full -z-10" style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(85%)', mixBlendMode: 'screen' }} />

            {/* Leyenda */}
            <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-700 z-[1000]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Bug className="w-6 h-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <span className="text-sm font-semibold text-slate-200">
                    Santuario Apícola
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-2 border-slate-900 shadow-[0_0_12px_rgba(245,158,11,0.6)]"></div>
                  <span className="text-sm font-medium text-slate-400">
                    Región Peninsular
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-500 pt-4 border-t border-slate-800 uppercase tracking-widest text-center">
                  {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'NEGOCIO' : 'NEGOCIOS'} EN LA RED
                </div>
              </div>
            </div>
          </div>

          {/* Lista de negocios */}
          {filteredBusinesses.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 tracking-tight">
                Negocios Registrados
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((business) => {
                  const isPeninsula = ['Yucatán', 'Quintana Roo', 'Campeche'].includes(business.ubicacion.estado);
                  
                  return (
                    <div
                      key={business.id}
                      className={`relative p-6 border rounded-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl cursor-default group backdrop-blur-md overflow-hidden ${
                        isPeninsula ? 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-700/50 bg-slate-800/40 shadow-lg'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <button
                        onClick={() => {
                          setSelectedBusiness(business);
                          if (user?.id !== business.userId) {
                            fetch(`http://localhost:5001/api/negocios/${business.id}/interact`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'view' })
                            }).catch(() => {});
                          }
                        }}
                        className="text-left w-full relative z-10"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          {business.logoUrl ? (
                            <img src={business.logoUrl} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-slate-600 shadow-md flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center shadow-inner border border-slate-600 flex-shrink-0">
                               <Bug className="w-6 h-6 text-amber-500 drop-shadow-sm" />
                            </div>
                          )}
                          <h4 className="font-bold text-slate-100 text-lg leading-tight flex-1 pr-12 group-hover:text-amber-400 transition-colors">{business.nombre}</h4>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-400 mb-3">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          {business.ubicacion.estado}
                          {isPeninsula && (
                            <span className="ml-3 px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs rounded-full font-semibold tracking-wide">
                              Península
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                          {business.descripcion || `Miel premium de ${business.florMiel}`}
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
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3 flex-1">
                    {selectedBusiness.logoUrl ? (
                      <img src={selectedBusiness.logoUrl} alt="Logo" className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-amber-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shadow-sm border border-amber-200">
                        <Bug className="w-6 h-6 text-amber-500" />
                      </div>
                    )}
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
                  <h4 className="font-semibold text-gray-900 mb-3">Catálogo de Productos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedBusiness.productos.map((producto: any, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl shadow-sm hover:border-amber-300 transition-colors">
                        <span className="font-medium text-gray-800 text-sm">
                          {typeof producto === 'string' ? producto : producto.nombre}
                        </span>
                        <span className="font-bold text-amber-600 text-sm">
                          {typeof producto === 'string' ? '' : producto.precio}
                        </span>
                      </div>
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
                      <div className="flex items-center gap-2 text-gray-700 mt-2">
                        <Button
                          onClick={() => handleContactWhatsapp(selectedBusiness.contacto.telefono!, selectedBusiness.id)}
                          className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white shadow-md flex items-center gap-2"
                        >
                          <Phone className="w-5 h-5" />
                          Contactar WhatsApp
                        </Button>
                      </div>
                    )}
                    {selectedBusiness.contacto.sitioWeb && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-5 h-5 text-amber-500" />
                        <a
                          href={selectedBusiness.contacto.sitioWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          Sitio Web Oficial
                        </a>
                      </div>
                    )}
                    {selectedBusiness.contacto.facebook && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <a
                          href={selectedBusiness.contacto.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          Facebook
                        </a>
                      </div>
                    )}
                    {selectedBusiness.contacto.instagram && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-5 h-5 text-pink-600" />
                        <a
                          href={selectedBusiness.contacto.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-pink-600"
                        >
                          Instagram
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
          onSave={async (businessData) => {
            try {
              const res = await fetch('http://localhost:5001/api/negocios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  usuario_id: user?.id,
                  nombre: businessData.nombre,
                  logo_url: businessData.logoUrl,
                  productos: businessData.productos,
                  tipoMiel: businessData.tipoMiel,
                  florOrigen: businessData.florMiel,
                  estado: businessData.ubicacion.estado,
                  coordenadas: businessData.ubicacion,
                  contacto: businessData.contacto,
                  descripcion: businessData.descripcion
                })
              });
              
              if (!res.ok) throw new Error('Error en API');
              const data = await res.json();
              
              const newBusiness: Business = {
                id: data.id.toString(),
                userId: data.usuario_id.toString(),
                nombre: data.nombre,
                logoUrl: data.logo_url || undefined,
                productos: typeof data.productos === 'string' ? JSON.parse(data.productos) : data.productos,
                tipoMiel: data.tipo_miel,
                florMiel: data.flor_origen,
                ubicacion: typeof data.coordenadas === 'string' ? JSON.parse(data.coordenadas) : data.coordenadas,
                contacto: typeof data.contacto === 'string' ? JSON.parse(data.contacto) : data.contacto,
                descripcion: data.descripcion,
                fechaCreacion: data.creado_en
              };

              setBusinesses([...businesses, newBusiness]);
              setShowAddForm(false);
              toast.success('¡Negocio registrado exitosamente!');
            } catch (err) {
              console.error(err);
              toast.error('Error al registrar negocio');
            }
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
          onSave={async (businessData) => {
            try {
              const res = await fetch(`http://localhost:5001/api/negocios/${businessData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  nombre: businessData.nombre,
                  logo_url: businessData.logoUrl,
                  productos: businessData.productos,
                  tipoMiel: businessData.tipoMiel,
                  florOrigen: businessData.florMiel,
                  estado: businessData.ubicacion.estado,
                  coordenadas: businessData.ubicacion,
                  contacto: businessData.contacto,
                  descripcion: businessData.descripcion
                })
              });
              
              if (!res.ok) throw new Error('Error en API');
              const data = await res.json();
              
              const updatedBusiness: Business = {
                id: data.id.toString(),
                userId: data.usuario_id.toString(),
                nombre: data.nombre,
                logoUrl: data.logo_url || undefined,
                productos: typeof data.productos === 'string' ? JSON.parse(data.productos) : data.productos,
                tipoMiel: data.tipo_miel,
                florMiel: data.flor_origen,
                ubicacion: typeof data.coordenadas === 'string' ? JSON.parse(data.coordenadas) : data.coordenadas,
                contacto: typeof data.contacto === 'string' ? JSON.parse(data.contacto) : data.contacto,
                descripcion: data.descripcion,
                fechaCreacion: data.creado_en
              };

              const updatedBusinesses = businesses.map(b => 
                b.id === updatedBusiness.id ? updatedBusiness : b
              );
              
              setBusinesses(updatedBusinesses);
              setShowEditForm(false);
              setSelectedBusiness(null);
              toast.success('¡Negocio actualizado exitosamente!');
            } catch (err) {
              console.error(err);
              toast.error('Error al actualizar negocio');
            }
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
    logoUrl: existingBusiness?.logoUrl || '',
    productos: existingBusiness?.productos || [],
    tipoMiel: existingBusiness?.tipoMiel || '',
    florMiel: existingBusiness?.florMiel || '',
    estado: existingBusiness?.ubicacion.estado || '',
    correo: existingBusiness?.contacto.correo || '',
    telefono: existingBusiness?.contacto.telefono || '',
    direccion: existingBusiness?.contacto.direccion || '',
    sitioWeb: existingBusiness?.contacto.sitioWeb || '',
    facebook: existingBusiness?.contacto.facebook || '',
    instagram: existingBusiness?.contacto.instagram || '',
    descripcion: existingBusiness?.descripcion || '',
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('imagen', file);
    data.append('type', 'negocios');

    try {
      const res = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        setFormData({ ...formData, logoUrl: result.url });
        toast.success('Logo subido exitosamente');
      } else {
        toast.error(result.error || 'Error al subir imagen');
      }
    } catch (err) {
      toast.error('Error de conexión al subir imagen');
    }
  };

  const [newProductoNombre, setNewProductoNombre] = useState('');
  const [newProductoPrecio, setNewProductoPrecio] = useState('');

  const tiposMiel = [
    'Multifloral',
    'Monofloral',
    'Orgánica',
    'Convencional',
  ];

  const handleAddProducto = () => {
    if (newProductoNombre && newProductoPrecio) {
      const exists = formData.productos.find((p: any) => 
        (typeof p === 'string' ? p : p.nombre) === newProductoNombre
      );
      if (!exists) {
        setFormData({ 
          ...formData, 
          // @ts-ignore
          productos: [...formData.productos, { nombre: newProductoNombre, precio: newProductoPrecio }] 
        });
        setNewProductoNombre('');
        setNewProductoPrecio('');
      } else {
        toast.error('Este producto ya existe en el catálogo');
      }
    }
  };

  const handleRemoveProducto = (productoNombre: string) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter((p: any) => 
        (typeof p === 'string' ? p : p.nombre) !== productoNombre
      ),
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
        facebook: formData.facebook || undefined,
        instagram: formData.instagram || undefined,
      },
      descripcion: formData.descripcion || undefined,
      logoUrl: formData.logoUrl || undefined,
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
          {/* Logo del Negocio */}
          <div className="flex items-center gap-4">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 border-amber-200" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
                <Bug className="w-8 h-8" />
              </div>
            )}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo o Foto del Apiario
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
            </div>
          </div>

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
              Catálogo de Productos y Precios *
            </label>
            <div className="space-y-3">
              <div className="flex gap-2 flex-col sm:flex-row">
                <input
                  type="text"
                  value={newProductoNombre}
                  onChange={(e) => setNewProductoNombre(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: Miel de 500ml"
                />
                <input
                  type="text"
                  value={newProductoPrecio}
                  onChange={(e) => setNewProductoPrecio(e.target.value)}
                  className="sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Precio Ej: $150 MXN"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProducto();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddProducto}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.productos.length > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-amber-50 rounded-lg max-h-48 overflow-y-auto">
                  {formData.productos.map((producto: any, i) => {
                    const isStr = typeof producto === 'string';
                    const nombre = isStr ? producto : producto.nombre;
                    const precio = isStr ? '' : producto.precio;

                    return (
                      <div key={i} className="flex items-center justify-between bg-white px-4 py-2 rounded shadow-sm border border-amber-100">
                        <div>
                          <span className="font-semibold text-gray-800 text-sm">{nombre}</span>
                          {precio && <span className="text-amber-600 font-bold ml-2 text-sm">{precio}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProducto(nombre)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://facebook.com/apiario..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="https://instagram.com/apiario..."
                  />
                </div>
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