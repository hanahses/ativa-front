// src/services/authService.ts
import * as SecureStore from 'expo-secure-store';

// ✅ Interface para a resposta de login
interface LoginResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    user: UserData;
  };
  message?: string;
}

// ✅ Interface completa dos dados do usuário
export interface UserData {
  gre: string | null;
  _id: string;
  email: string;
  name: string;
  role: number;
  school: string;
  birthdate: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Interface dos dados do estudante
export interface StudentData {
  _id: string;
  userId: string;
  weightInGrams: number;
  heightInCm: number;
  gender: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Interface completa do perfil
export interface UserProfile {
  user: UserData;
  studentData: StudentData;
}

// ✅ Constantes para as chaves de armazenamento
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_PROFILE_KEY = 'user_profile';

// ✅ URL base da API
export const API_BASE_URL = 'http://10.64.27.208:8080';

class AuthService {
  
  // ✅ Função para fazer login
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔍 URL completa:', `${API_BASE_URL}/auth/login`);
      console.log('📧 Email:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      console.log('📡 Status:', response.status);
      const data = await response.json();
      console.log('📦 Resposta:', data);

      if (response.ok && data.access_token && data.refresh_token) {
        // ✅ Salva os tokens de forma segura
        await this.saveTokens(data.access_token, data.refresh_token);

        // ✅ Busca os dados completos do usuário
        const userProfile = await this.fetchUserProfile(email.trim(), data.access_token);

        if (userProfile) {
          // ✅ Salva o perfil completo
          await this.saveUserProfile(userProfile);

          return {
            success: true,
            data: {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              user: userProfile.user,
            },
          };
        } else {
          return {
            success: false,
            message: 'Erro ao buscar dados do usuário',
          };
        }
      } else {
        return {
          success: false,
          message: data.message || 'Erro ao fazer login',
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  }

  // ✅ Busca os dados completos do usuário
  async fetchUserProfile(email: string, access_token: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 Buscando perfil do usuário:', email);
      
      const response = await fetch(`${API_BASE_URL}/users/info/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log('✅ Perfil recebido:', profileData);
        return profileData;
      } else {
        console.error('❌ Erro ao buscar perfil:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }

  // ✅ Salva os tokens de forma segura usando SecureStore
  async saveTokens(access_token: string, refresh_token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);
    } catch (error) {
      console.error('Erro ao salvar tokens:', error);
      throw new Error('Falha ao salvar credenciais');
    }
  }

  // ✅ Recupera o access token
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao recuperar access token:', error);
      return null;
    }
  }

  // ✅ Recupera o refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao recuperar refresh token:', error);
      return null;
    }
  }

  // ✅ Salva o perfil completo do usuário
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(profile));
      console.log('✅ Perfil salvo com sucesso');
    } catch (error) {
      console.error('Erro ao salvar perfil do usuário:', error);
    }
  }

  // ✅ Recupera o perfil completo do usuário
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await SecureStore.getItemAsync(USER_PROFILE_KEY);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Erro ao recuperar perfil do usuário:', error);
      return null;
    }
  }

  // ✅ Renova o access token usando o refresh token
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refresh_token = await this.getRefreshToken();
      
      if (!refresh_token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refresh_token,
        }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
        return data.access_token;
      }

      return null;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return null;
    }
  }

  // ✅ Faz requisição autenticada com refresh automático
  async authenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let access_token = await this.getAccessToken();

    if (!access_token) {
      throw new Error('Usuário não autenticado');
    }

    // Primeira tentativa com o access token atual
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    // Se retornar 401 (não autorizado), tenta renovar o token
    if (response.status === 401) {
      const newAccessToken = await this.refreshAccessToken();

      if (newAccessToken) {
        // Tenta novamente com o novo token
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        // Se não conseguiu renovar, usuário precisa fazer login novamente
        await this.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    return response;
  }

  // ✅ Verifica se o usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    const access_token = await this.getAccessToken();
    return access_token !== null;
  }

  // ✅ Faz logout (remove todos os dados)
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
}

// ✅ Exporta instância única do serviço (Singleton)
export default new AuthService();