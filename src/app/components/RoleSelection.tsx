import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bug, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export function RoleSelection() {
  const { user, setUserRole } = useAuth();
  const navigate = useNavigate();
  const [isSelecting, setIsSelecting] = useState(false);

  // Si el usuario ya tiene un rol, redirigir
  useEffect(() => {
    if (user?.role) {
      navigate('/map');
    }
  }, [user?.role, navigate]);

  const handleRoleSelection = (role: 'apicultor' | 'cliente') => {
    setIsSelecting(true);
    setUserRole(role);
    
    if (role === 'apicultor') {
      toast.success('¡Bienvenido como Apicultor! Ahora puedes registrar tus negocios.');
    } else {
      toast.success('¡Bienvenido como Cliente! Explora los productores de miel.');
    }
    
    setTimeout(() => {
      navigate('/map');
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/login_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <Card className="w-full max-w-2xl relative z-10 bg-black/40 backdrop-blur-xl border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="MeliHub Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          </div>
          <CardTitle className="text-4xl font-bold text-amber-500 tracking-tight">Elige tu Camino</CardTitle>
          <CardDescription className="text-lg text-slate-300 mt-2">
            ¿Cómo deseas participar en MeliHub?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleRoleSelection('apicultor')}
              disabled={isSelecting}
              className="group relative p-8 border border-slate-700 bg-black/40 rounded-2xl hover:border-amber-500/80 hover:bg-amber-950/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 text-left disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col items-center text-center space-y-4 z-10">
                <div className="bg-gradient-to-br from-amber-600 to-amber-500 p-6 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                  <Bug className="w-12 h-12 text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-500 group-hover:text-amber-400">Apicultor</h3>
                  <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                    Registra tu negocio apícola y expande tu alcance mostrando tus productos al mundo.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelection('cliente')}
              disabled={isSelecting}
              className="group relative p-8 border border-slate-700 bg-black/40 rounded-2xl hover:border-orange-500/80 hover:bg-orange-950/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-300 text-left disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col items-center text-center space-y-4 z-10">
                <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-6 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                  <ShoppingBag className="w-12 h-12 text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-orange-500 group-hover:text-orange-400">Cliente</h3>
                  <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                    Descubre exquisitos productores de miel y conecta con ellos desde cualquier lugar.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}