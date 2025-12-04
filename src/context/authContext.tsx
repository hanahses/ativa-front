// src/contexts/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import authService, { UserProfile } from '../services/authService';

// ✅ Interface do contexto
interface AuthContextData {
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

// ✅ Criação do contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ✅ Provider do contexto
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Carrega os dados do usuário ao iniciar o app
  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      setIsLoading(true);
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const profile = await authService.getUserProfile();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ Função de login
  async function login(email: string, password: string) {
    try {
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        const profile = await authService.getUserProfile();
        setUserProfile(profile);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Erro ao fazer login' 
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: 'Erro de conexão com o servidor' 
      };
    }
  }

  // ✅ Função de logout
  async function logout() {
    try {
      await authService.logout();
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // ✅ Função para atualizar o perfil do usuário
  async function refreshUserProfile() {
    try {
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        userProfile,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}