import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Mail, Key, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

export function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { requestPasswordReset, resetPasswordWithCode } = useAuth();
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setStep(2);
      setLoading(false);
      toast.success('Código de seguridad enviado a tu correo.');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al procesar la solicitud');
      toast.error(err.message || 'Error al procesar la solicitud');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithCode(email, code, newPassword);
      setLoading(false);
      toast.success('¡Contraseña restablecida con éxito!');
      navigate('/login');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al restablecer la contraseña');
      toast.error(err.message || 'Código incorrecto o expirado');
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
          <CardTitle className="text-3xl font-bold text-amber-500 tracking-tight">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-slate-300 text-sm">
            {step === 1 
              ? 'Ingresa tu correo para generar un código de recuperación' 
              : 'Ingresa el código generado y tu nueva contraseña'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 h-12 pl-10"
                  />
                </div>
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
                {loading ? 'Verificando...' : 'Obtener Código'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Alerta de confirmación de envío */}
              <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-lg space-y-2 text-amber-200">
                <div className="flex items-center gap-2 font-semibold text-amber-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>Código de Seguridad Enviado</span>
                </div>
                <p className="text-xs text-slate-300">
                  Hemos enviado un código de verificación de 6 dígitos a <strong className="text-white">{email}</strong>. Por favor, revisa tu bandeja de entrada y spam para continuar.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-200">Código de Verificación</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="Escribe el código de 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                    disabled={loading}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 h-12 pl-10 font-mono tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-200">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Nueva contraseña (mínimo 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 h-12 pl-10"
                  />
                </div>
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
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-300 flex items-center justify-center gap-2">
            <Link to="/login" className="text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors font-medium">
              <ArrowLeft className="h-4 w-4" /> Volver al Inicio de Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
