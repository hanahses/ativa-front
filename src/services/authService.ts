// src/services/authService.ts
import * as SecureStore from 'expo-secure-store';

// ✅ Interface para a resposta de login
interface LoginResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  message?: string;
}

// ✅ Interface para armazenamento de tokens
interface TokenData {
  access_token: string;
  refresh_token: string;
}

// ✅ Constantes para as chaves de armazenamento
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// ✅ URL base da API (ALTERE PARA SEU IP LOCAL)
// Exemplo: 'http://192.168.1.100:3000' ou 'http://localhost:3000'
const API_BASE_URL = 'http://10.0.2.2:8080';




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
        
        // ✅ Salva os dados do usuário
        if (data.user) {
          await this.saveUserData(data.user);
        }

        return {
          success: true,
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: data.user,
          },
        };
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
  async getaccess_token(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao recuperar access token:', error);
      return null;
    }
  }

  // ✅ Recupera o refresh token
  async getrefresh_token(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao recuperar refresh token:', error);
      return null;
    }
  }

  // ✅ Salva dados do usuário
  async saveUserData(user: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
    }
  }

  // ✅ Recupera dados do usuário
  async getUserData(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      return null;
    }
  }

  // ✅ Renova o access token usando o refresh token
  async refreshaccess_token(): Promise<string | null> {
    try {
      const refresh_token = await this.getrefresh_token();
      
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
    let access_token = await this.getaccess_token();

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
      const newaccess_token = await this.refreshaccess_token();

      if (newaccess_token) {
        // Tenta novamente com o novo token
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newaccess_token}`,
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
    const access_token = await this.getaccess_token();
    return access_token !== null;
  }

  // ✅ Faz logout (remove todos os dados)
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
}

// ✅ Exporta instância única do serviço (Singleton)
export default new AuthService();