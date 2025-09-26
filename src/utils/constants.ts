// src/utils/constants.ts

// URLs da API - ALTERE AQUI para sua URL real
export const API_BASE_URL = 'https://seu-backend.com/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VALIDATE_TOKEN: '/auth/validate',
    LOGOUT: '/auth/logout',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    DELETE: '/user/delete',
  },
} as const;

// Configurações de validação
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  PHONE_REGEX: /^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Mensagens de erro
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  REQUIRED_FIELD: 'Este campo é obrigatório.',
  INVALID_EMAIL: 'Por favor, insira um email válido.',
  INVALID_PASSWORD: 'Senha deve ter pelo menos 6 caracteres.',
  INVALID_PHONE: 'Por favor, insira um telefone válido.',
  GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  REGISTER_SUCCESS: 'Conta criada com sucesso!',
  PASSWORD_RESET_SENT: 'Email de recuperação enviado!',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
} as const;

// Chaves para armazenamento local
export const STORAGE_KEYS = {
  TOKEN: '@ativa:token',
  USER: '@ativa:user',
  REMEMBER_EMAIL: '@ativa:remember_email',
} as const;

// Configurações da aplicação
export const APP_CONFIG = {
  VERSION: '1.0.0',
  NAME: 'ATIVA',
  TIMEOUT: 10000, // 10 segundos
} as const;