import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'apicultor' | 'cliente' | null;
  foto_perfil?: string;
  nombre?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserRole: (role: 'apicultor' | 'cliente') => void;
  updateProfileImage: (url: string) => void;
  updateSettings: (nombre: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password })
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con el servidor');
      }
      
      const userWithoutPassword = { id: data.user.id.toString(), email: data.user.correo, role: data.user.rol, nombre: data.user.nombre };
      
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (e: any) {
      console.error(e);
      const isNetworkError = e.message === 'Failed to fetch' || e.message === 'Load failed' || e.message.includes('Network');
      throw new Error(isNetworkError ? 'El servidor Backend se encuentra apagado. Por favor inicia node server.js' : e.message);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password })
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Autenticación fallida');
      }
      
      const authUser = { 
        id: data.user.id.toString(), 
        email: data.user.correo,
        role: data.user.rol,
        foto_perfil: data.user.foto_perfil
      };
      
      setUser(authUser);
      localStorage.setItem('currentUser', JSON.stringify(authUser));
    } catch (e: any) {
      console.error(e);
      const isNetworkError = e.message === 'Failed to fetch' || e.message === 'Load failed' || e.message.includes('Network');
      throw new Error(isNetworkError ? 'El servidor Backend se encuentra apagado. Por favor inicia node server.js' : e.message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const setUserRole = async (role: 'apicultor' | 'cliente') => {
    if (user) {
      try {
        const response = await fetch('http://localhost:5001/api/auth/role', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, rol: role })
        });

        if (response.ok) {
          const updatedUser = { ...user, role };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      } catch (e) {
        console.error('Error setting role:', e);
      }
    }
  };

  const updateProfileImage = (url: string) => {
    if (user) {
      const updatedUser = { ...user, foto_perfil: url };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const updateSettings = async (nombre: string): Promise<void> => {
    if (!user) return;
    try {
      const response = await fetch('http://localhost:5001/api/auth/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, nombre })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'No se pudieron guardar los ajustes');
      
      const updatedUser = { ...user, nombre };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (e: any) {
      throw new Error(e.message || 'Error de red');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) return;
    try {
      const response = await fetch('http://localhost:5001/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, currentPassword, newPassword })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Error al cambiar contraseña');
    } catch (e: any) {
      throw new Error(e.message || 'Error de red');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUserRole, updateProfileImage, updateSettings, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
