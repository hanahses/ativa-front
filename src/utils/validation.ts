// src/utils/validation.ts

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  // Validação de email - baseada na sua função validateEmail
  email: (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      return { isValid: false, error: 'Email é obrigatório' };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Por favor, insira um email válido' };
    }
    
    return { isValid: true };
  },

  // Validação de senha - baseada na sua função validatePassword
  password: (password: string, minLength: number = 6): ValidationResult => {
    if (!password.trim()) {
      return { isValid: false, error: 'Senha é obrigatória' };
    }
    
    if (password.length < minLength) {
      return { isValid: false, error: `Senha deve ter pelo menos ${minLength} caracteres` };
    }
    
    return { isValid: true };
  },

  // Validação de nome completo
  name: (name: string, minLength: number = 2): ValidationResult => {
    if (!name.trim()) {
      return { isValid: false, error: 'Nome é obrigatório' };
    }
    
    if (name.trim().length < minLength) {
      return { isValid: false, error: `Nome deve ter pelo menos ${minLength} caracteres` };
    }
    
    return { isValid: true };
  },

  // Validação de confirmação de senha
  confirmPassword: (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword.trim()) {
      return { isValid: false, error: 'Confirmação de senha é obrigatória' };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, error: 'As senhas não coincidem' };
    }
    
    return { isValid: true };
  },

  // Validação de telefone brasileiro
  phone: (phone: string): ValidationResult => {
    const phoneRegex = /^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/;
    
    if (!phone.trim()) {
      return { isValid: false, error: 'Telefone é obrigatório' };
    }
    
    // Remove caracteres não numéricos para validação
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return { isValid: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
    }
    
    if (!phoneRegex.test(phone)) {
      return { isValid: false, error: 'Por favor, insira um telefone válido' };
    }
    
    return { isValid: true };
  },

  // Validação de CPF (opcional para cadastros)
  cpf: (cpf: string): ValidationResult => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (!cleanCpf) {
      return { isValid: false, error: 'CPF é obrigatório' };
    }
    
    if (cleanCpf.length !== 11) {
      return { isValid: false, error: 'CPF deve ter 11 dígitos' };
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf[i]) * (10 - i);
    }
    let digit1 = (sum * 10) % 11;
    if (digit1 === 10) digit1 = 0;
    
    if (digit1 !== parseInt(cleanCpf[9])) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf[i]) * (11 - i);
    }
    let digit2 = (sum * 10) % 11;
    if (digit2 === 10) digit2 = 0;
    
    if (digit2 !== parseInt(cleanCpf[10])) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    return { isValid: true };
  },

  // Validação de idade (para verificar se é maior de idade)
  age: (birthDate: string): ValidationResult => {
    if (!birthDate.trim()) {
      return { isValid: false, error: 'Data de nascimento é obrigatória' };
    }
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return { isValid: false, error: 'Deve ser maior de 18 anos' };
    }
    
    return { isValid: true };
  }
};

// ✅ Interface para configuração de campo
interface FieldConfig {
  value: string;
  validator: keyof typeof validators;
  options?: number | string; // Mais específico que 'any'
}

// ✅ Interface para resultado da validação de múltiplos campos
interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Função para validar múltiplos campos de uma vez - TIPADA
export const validateForm = (fields: Record<string, FieldConfig>): FormValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.entries(fields).forEach(([fieldName, { value, validator, options }]) => {
    let result: ValidationResult;
    
    // ✅ Tratamento tipado para diferentes validadores
    switch (validator) {
      case 'password':
        result = validators.password(value, options as number);
        break;
      case 'confirmPassword':
        result = validators.confirmPassword(options as string, value);
        break;
      case 'name':
        result = validators.name(value, options as number);
        break;
      default:
        result = validators[validator](value);
        break;
    }

    if (!result.isValid) {
      errors[fieldName] = result.error || 'Erro de validação';
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Funções utilitárias para formatação durante a validação
export const formatters = {
  // Formatar CPF: 000.000.000-00
  cpf: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  },

  // Formatar telefone: (00) 00000-0000
  phone: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  },

  // Remover apenas números
  onlyNumbers: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  // Remover apenas letras e espaços
  onlyLetters: (value: string): string => {
    return value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
  }
};