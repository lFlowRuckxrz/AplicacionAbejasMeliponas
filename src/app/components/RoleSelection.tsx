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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">¿Cómo deseas usar la plataforma?</CardTitle>
          <CardDescription className="text-base mt-2">
            Selecciona tu rol para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleRoleSelection('apicultor')}
              disabled={isSelecting}
              className="group relative p-8 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 text-left disabled:opacity-50"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-amber-500 p-6 rounded-full group-hover:scale-110 transition-transform">
                  <Bug className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Apicultor</h3>
                  <p className="text-gray-600 mt-2">
                    Registra tu negocio apícola y muestra tus productos en el mapa
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelection('cliente')}
              disabled={isSelecting}
              className="group relative p-8 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 text-left disabled:opacity-50"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-orange-500 p-6 rounded-full group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Cliente</h3>
                  <p className="text-gray-600 mt-2">
                    Explora el mapa y descubre productores de miel en tu región
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