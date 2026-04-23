import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, ArrowLeft, Camera, Shield, UserCog, Mail, BarChart3, TrendingUp, Eye, Phone } from 'lucide-react';
import { Business } from '../types/business';
import { toast } from 'sonner';

export function Profile() {
  const { user, updateProfileImage, updateSettings, changePassword } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'stats'>('general');
  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (user.role === 'apicultor') {
      fetch('http://localhost:5001/api/negocios')
        .then(res => res.json())
        .then(data => {
          const mine = data.filter((b: any) => b.usuario_id === user.id);
          setMyBusinesses(mine);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('imagen', file);
    data.append('type', 'perfil');

    try {
      const uploadRes = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: data,
      });
      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadResult.error || 'Error al subir imagen');

      const profileRes = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, foto_perfil: uploadResult.url })
      });
      const profileResult = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileResult.error || 'Error al actualizar perfil');

      updateProfileImage(uploadResult.url);
      toast.success('Foto de perfil actualizada exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveName = async () => {
    setIsSavingName(true);
    try {
      await updateSettings(nombre);
      toast.success('Nombre actualizado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar nombre');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Contraseña actualizada de forma segura');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-md shadow-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/map')} className="text-slate-400 hover:text-amber-500 hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Ajustes Avanzados</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-lg border border-slate-800 p-4 space-y-2 sticky top-24">
            <Button 
              variant={activeTab === 'general' ? 'default' : 'ghost'} 
              className={`w-full justify-start ${activeTab === 'general' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}
              onClick={() => setActiveTab('general')}
            >
              <UserCog className="w-4 h-4 mr-3" /> Perfil y Cuenta
            </Button>
            <Button 
              variant={activeTab === 'security' ? 'default' : 'ghost'} 
              className={`w-full justify-start ${activeTab === 'security' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield className="w-4 h-4 mr-3" /> Seguridad Contraseña
            </Button>
            {user.role === 'apicultor' && (
              <Button 
                variant={activeTab === 'stats' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${activeTab === 'stats' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}
                onClick={() => setActiveTab('stats')}
              >
                <BarChart3 className="w-4 h-4 mr-3" /> Inteligencia de Negocio
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="text-center mb-8 relative">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-slate-700 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-slate-800 mx-auto flex items-center justify-center transition-transform group-hover:scale-105">
                    {user.foto_perfil ? (
                      <img src={user.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500" />
                    )}
                  </div>
                  <label className="absolute bottom-1 right-1 bg-amber-500 text-white p-3 rounded-full cursor-pointer shadow-xl hover:bg-amber-600 hover:scale-110 transition-all" title="Cambiar Foto">
                    <Camera className="w-5 h-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="space-y-6 max-w-lg mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-slate-300">Nombre Personal o Alias</Label>
                  <div className="flex gap-3">
                    <Input 
                      id="nombre" 
                      value={nombre} 
                      onChange={(e) => setNombre(e.target.value)} 
                      placeholder="Tu nombre (opcional)" 
                      className="bg-slate-800 border-slate-600 focus-visible:ring-amber-500 text-slate-100"
                    />
                    <Button onClick={handleSaveName} disabled={isSavingName} className="bg-amber-600 hover:bg-amber-500 text-white border-none shadow-md">
                      {isSavingName ? '...' : 'Guardar'}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">Este nombre será visible en la plataforma en lugar de tu correo.</p>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4 tracking-tight">Información de Sistema</h3>
                  <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 shadow-inner space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-500">Correo Electrónico</p>
                          <p className="text-slate-200 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-500">Rol de Cuenta</p>
                          <p className="inline-flex items-center px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold mt-1 tracking-wide">
                            {user.role === 'apicultor' ? 'Productor de Miel' : 'Cliente / Comprador'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/50 p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-full shadow-inner">
                  <Shield className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Seguridad</h2>
                  <p className="text-slate-400 text-sm">Actualiza tu contraseña para mantener tu cuenta blindada.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">Contraseña Actual</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="Deja vacío si nunca has puesto una"
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus-visible:ring-amber-500 h-11"
                  />
                  <p className="text-xs text-slate-500">Si creaste tu cuenta antes del parche de seguridad, este campo puede estar vacío.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800 mt-4">
                  <Label htmlFor="newPassword" className="text-slate-300">Nueva Contraseña</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus-visible:ring-amber-500 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar Nueva Contraseña</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Repite la nueva contraseña"
                    required
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus-visible:ring-amber-500 h-11"
                  />
                </div>

                <Button type="submit" disabled={isSavingPassword || !newPassword} className="w-full bg-amber-600 hover:bg-amber-500 text-white mt-6 shadow-lg shadow-amber-500/20 py-6 text-lg h-12">
                  {isSavingPassword ? 'Cambiando...' : 'Actualizar Contraseña'}
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'stats' && user.role === 'apicultor' && (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/50 p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-500/20 border border-amber-500/30 p-3 rounded-full shadow-inner">
                  <BarChart3 className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Inteligencia de Negocio</h2>
                  <p className="text-slate-400 text-sm">Monitorea el rendimiento de tus apiarios en el Directorio MeliHub.</p>
                </div>
              </div>

              {myBusinesses.length === 0 ? (
                <div className="text-center py-10 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400">Aún no has registrado ningún apiario.</p>
                  <Button onClick={() => navigate('/map')} className="mt-4 bg-amber-600 hover:bg-amber-500">
                    Ir al Mapa a Registrar
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Resumen Global */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl flex items-center gap-4 hover:border-amber-500/50 transition-colors">
                      <div className="bg-blue-500/20 p-4 rounded-xl">
                        <Eye className="w-8 h-8 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Visualizaciones Totales</p>
                        <p className="text-3xl font-black text-slate-100">
                          {myBusinesses.reduce((acc, b) => acc + (b.vistas || 0), 0)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl flex items-center gap-4 hover:border-green-500/50 transition-colors">
                      <div className="bg-green-500/20 p-4 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Clics de Contacto (WhatsApp)</p>
                        <p className="text-3xl font-black text-slate-100">
                          {myBusinesses.reduce((acc, b) => acc + (b.contactos || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desglose por Apiario */}
                  <h3 className="text-lg font-bold text-slate-200 mt-8 mb-4">Desglose por Apiario</h3>
                  <div className="space-y-3">
                    {myBusinesses.map(b => (
                      <div key={b.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {b.logoUrl ? (
                            <img src={b.logoUrl} className="w-10 h-10 rounded-full border border-amber-500" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-amber-500">M</div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-200">{b.nombre}</p>
                            <p className="text-xs text-slate-500">{b.ubicacion.estado}</p>
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-center">
                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Vistas</p>
                            <p className="font-bold text-slate-100 flex items-center gap-1 justify-center"><Eye className="w-3 h-3 text-blue-400"/> {b.vistas || 0}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Contactos</p>
                            <p className="font-bold text-slate-100 flex items-center gap-1 justify-center"><Phone className="w-3 h-3 text-green-400"/> {b.contactos || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
