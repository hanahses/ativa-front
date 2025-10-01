// app/home.tsx
import ProtectedRoute from '@/src/components/protectedRoutes';
import authService from '@/src/services/authService';
import { colors } from '@/src/styles/styles';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface User {
  id: string;
  name: string;
  email: string;
}

const HomeScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  // ✅ Carrega dados do usuário
  const loadUserData = async () => {
    try {
      const userData = await authService.getUserData();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Exemplo de requisição autenticada
  const fetchProtectedData = async () => {
    try {
      const response = await authService.authenticatedRequest('/user/profile', {
        method: 'GET',
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Dados carregados com sucesso!');
        console.log('Dados protegidos:', data);
      } else {
        Alert.alert('Erro', 'Falha ao carregar dados');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao buscar dados');
    }
  };

  // ✅ Função de logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirmar Logout',
      'Deseja realmente sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              router.replace('/');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Bem-vindo ao App!</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : user ? (
            <View style={styles.userInfo}>
              <Text style={styles.label}>Nome:</Text>
              <Text style={styles.value}>{user.name}</Text>
              
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
          ) : (
            <Text style={styles.noUser}>Nenhum dado de usuário encontrado</Text>
          )}

          {/* Botão para fazer requisição autenticada */}
          <TouchableOpacity
            style={styles.button}
            onPress={fetchProtectedData}
          >
            <Text style={styles.buttonText}>Buscar Dados Protegidos</Text>
          </TouchableOpacity>

          {/* Botão de Logout */}
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 10,
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '600',
  },
  noUser: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;