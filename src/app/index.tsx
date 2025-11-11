import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ✅ Imports tipados dos módulos criados
import AuthLayout from '@/src/components/authLayout';
import { useAuth } from '@/src/context/authContext';
import { colors, loginStyles } from '../../src/styles/styles';
import { ERROR_MESSAGES } from '../../src/utils/constants';
import { ValidationResult, validators } from '../../src/utils/validation';

// ✅ Interface para tipagem do componente
interface LoginScreenProps {}

// ✅ Tipos para os estados
type LoadingState = boolean;
type ErrorState = string;
type EmailState = string;
type PasswordState = string;

const LoginScreen: React.FC<LoginScreenProps> = () => {
  // ✅ Hook do Context de Autenticação
  const { login } = useAuth();

  // ✅ Estados tipados
  const [email, setEmail] = useState<EmailState>('');
  const [password, setPassword] = useState<PasswordState>('');
  const [loading, setLoading] = useState<LoadingState>(false);
  const [emailError, setEmailError] = useState<ErrorState>('');
  const [passwordError, setPasswordError] = useState<ErrorState>('');

  // ✅ Função para limpar erros - tipada
  const clearErrors = (): void => {
    setEmailError('');
    setPasswordError('');
  };

  // ✅ Função de validação tipada
  const validateForm = (): boolean => {
    let isValid = true;
    clearErrors();

    // Validação do email usando o validator tipado
    const emailValidation: ValidationResult = validators.email(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      isValid = false;
    }

    // Validação da senha usando o validator tipado
    const passwordValidation: ValidationResult = validators.password(password, 6);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      isValid = false;
    }

    return isValid;
  };

  // ✅ Função de login tipada - ATUALIZADA para usar o Context
  const handleLogin = async (): Promise<void> => {
    // Primeiro valida os dados
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Iniciando login via Context...');
      
      // ✅ Usa o login do Context (não mais o authService direto)
      const response = await login(email, password);

      if (response.success) {
        // ✅ Login bem-sucedido
        console.log('✅ Login bem-sucedido! Perfil carregado no Context.');
        
        // ✅ Navega para a tela home (usando replace para não permitir voltar ao login)
        router.replace('/home');
      } else {
        // ✅ Tratamento de erro do servidor
        const errorMessage = response.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
        Alert.alert('Erro no Login', errorMessage);
      }
    } catch (error: unknown) {
      console.error('❌ Erro no login:', error);
      Alert.alert('Erro de Conexão', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Funções para mudança de texto tipadas
  const handleEmailChange = (text: string): void => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string): void => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  // ✅ Funções de navegação
  const handleForgotPassword = (): void => {
    router.push('/forgotPass');
  };

  const handleRegister = (): void => {
    router.push('/register');
  };

  const handleGuestAccess = (): void => {
    // Navega para home sem autenticação (modo convidado)
    router.replace('/cards');
  };

 return (
    <AuthLayout isLoading={loading}>
      {/* Campo Email */}
      <View style={loginStyles.inputContainer}>
        <Text style={loginStyles.label}>Email:</Text>
        <TextInput
          style={[loginStyles.input, emailError ? loginStyles.inputError : null]}
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          placeholder="Digite seu email"
          placeholderTextColor={colors.text.secondary}
        />
        {emailError ? <Text style={loginStyles.errorText}>{emailError}</Text> : null}
      </View>

      {/* Campo Senha */}
      <View style={loginStyles.inputContainer}>
        <Text style={loginStyles.label}>Senha:</Text>
        <TextInput
          style={[loginStyles.input, passwordError ? loginStyles.inputError : null]}
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          editable={!loading}
          placeholder="Digite sua senha"
          placeholderTextColor={colors.text.secondary}
        />
        {passwordError ? <Text style={loginStyles.errorText}>{passwordError}</Text> : null}
      </View>

      {/* Links auxiliares */}
      <View style={loginStyles.linksContainer}>
        <TouchableOpacity 
          style={loginStyles.registerLinkContainer}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={loginStyles.linkText}>Não possui uma conta?</Text>
          <Text style={[loginStyles.linkText, loginStyles.underline]}>Cadastre-se aqui</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={[loginStyles.linkText, loginStyles.underline]}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </View>

      {/* Botão Entrar */}
      <TouchableOpacity 
        style={[loginStyles.loginButton, loading && loginStyles.disabledButton]} 
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.text.white} />
        ) : (
          <Text style={loginStyles.loginButtonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Divisor "Ou" */}
      <View style={loginStyles.dividerContainer}>
        <View style={loginStyles.dividerLine} />
        <Text style={loginStyles.dividerText}>Ou</Text>
        <View style={loginStyles.dividerLine} />
      </View>

      {/* Botão Acesse como convidado */}
      <TouchableOpacity 
        style={loginStyles.guestButton} 
        onPress={handleGuestAccess}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={loginStyles.guestButtonText}>Acesse como convidado</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default LoginScreen;