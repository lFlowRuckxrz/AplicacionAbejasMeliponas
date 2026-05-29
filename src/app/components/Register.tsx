import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bug } from 'lucide-react';
import { toast } from 'sonner';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      setLoading(false);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/role-selection');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error de conexión con el servidor');
      toast.error(err.message || 'Error de conexión');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/login_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <Card className="w-full max-w-md relative z-10 bg-black/40 backdrop-blur-xl border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.15)] text-slate-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="MeliHub Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          </div>
          <CardTitle className="text-4xl font-bold text-amber-500 tracking-tight">Crear Cuenta</CardTitle>
          <CardDescription className="text-slate-300 text-base">
            Regístrate para comenzar en MeliHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-black/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-black/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-black/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 h-12"
              />
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-950/50 border border-red-500/20 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-300">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 hover:underline font-medium transition-colors">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}