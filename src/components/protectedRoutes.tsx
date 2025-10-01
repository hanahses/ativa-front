// src/components/ProtectedRoute.tsx
import authService from '@/src/services/authService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors, globalStyles } from '../styles/styles';

// ✅ Interface para props
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas, verificando se o usuário está autenticado
 * Se não estiver, redireciona para a tela de login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      
      if (!authenticated) {
        // Usuário não autenticado, redireciona para login
        router.replace('/');
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.replace('/');
    } finally {
      setIsChecking(false);
    }
  };

  // Mostra loading enquanto verifica autenticação
  if (isChecking) {
    return (
      <View style={[globalStyles.container, globalStyles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Se autenticado, renderiza o conteúdo
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;