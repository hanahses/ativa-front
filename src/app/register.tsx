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
import AuthLayout from '../../src/components/authLayout';
import { colors, loginStyles } from '../../src/styles/styles';
import { ERROR_MESSAGES } from '../../src/utils/constants';
import { ValidationResult, validators } from '../../src/utils/validation';

// ✅ Interface para tipagem do componente
interface RegisterScreenProps {}

// ✅ Tipos para os estados
type LoadingState = boolean;
type ErrorState = string;
type InputState = string;

const RegisterScreen: React.FC<RegisterScreenProps> = () => {
  // ✅ Estados tipados
  const [name, setName] = useState<InputState>('');
  const [email, setEmail] = useState<InputState>('');
  const [password, setPassword] = useState<InputState>('');
  const [confirmPassword, setConfirmPassword] = useState<InputState>('');
  const [loading, setLoading] = useState<LoadingState>(false);
  const [nameError, setNameError] = useState<ErrorState>('');
  const [emailError, setEmailError] = useState<ErrorState>('');
  const [passwordError, setPasswordError] = useState<ErrorState>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<ErrorState>('');

  // ✅ Função para limpar erros - tipada
  const clearErrors = (): void => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  // ✅ Função de validação tipada
  const validateForm = (): boolean => {
    let isValid = true;
    clearErrors();

    // Validação do nome
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      isValid = false;
    }

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

    // Validação da confirmação de senha
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirmação de senha é obrigatória');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem');
      isValid = false;
    }

    return isValid;
  };

  // ✅ Função de cadastro tipada
  const handleRegister = async (): Promise<void> => {
    // Primeiro valida os dados
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // ✅ Tipagem explícita para a resposta da API
      const response: Response = await fetch('https://seu-backend.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      // ✅ Tipagem para os dados da resposta
      const data: any = await response.json();

      if (response.ok) {
        // ✅ Sucesso no cadastro
        Alert.alert(
          'Cadastro Realizado!', 
          'Sua conta foi criada com sucesso. Você já pode fazer login.', 
          [
            {
              text: 'OK',
              onPress: (): void => {
                // Volta para a tela de login após cadastro bem-sucedido
                router.back();
              }
            }
          ]
        );
      } else {
        // ✅ Tratamento de erros do servidor
        const errorMessage: string = data.message || ERROR_MESSAGES.NETWORK_ERROR;
        
        // Verifica se o erro é de email já existente
        if (errorMessage.toLowerCase().includes('email')) {
          setEmailError('Este email já está cadastrado');
        } else {
          Alert.alert('Erro no Cadastro', errorMessage);
        }
      }
    } catch (error: unknown) {
      console.error('Erro no cadastro:', error);
      // ✅ Usando constante tipada
      Alert.alert('Erro de Conexão', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Funções para mudança de texto tipadas
  const handleNameChange = (text: string): void => {
    setName(text);
    if (nameError) setNameError('');
  };

  const handleEmailChange = (text: string): void => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string): void => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string): void => {
    setConfirmPassword(text);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  return (
    <AuthLayout 
      showBackButton={true} 
      isLoading={loading}
    >
      {/* Campo Nome */}
      <View style={loginStyles.inputContainer}>
        <Text style={loginStyles.label}>Nome:</Text>
        <TextInput
          style={[loginStyles.input, nameError ? loginStyles.inputError : null]}
          value={name}
          onChangeText={handleNameChange}
          autoCapitalize="words"
          editable={!loading}
          placeholder="Seu nome"
          placeholderTextColor={colors.text.secondary}
        />
        {nameError ? <Text style={loginStyles.errorText}>{nameError}</Text> : null}
      </View>

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
          placeholder="email@exemplo.com"
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
          placeholder="••••••••••"
          placeholderTextColor={colors.text.secondary}
        />
        {passwordError ? <Text style={loginStyles.errorText}>{passwordError}</Text> : null}
      </View>

      {/* Campo Confirme sua senha */}
      <View style={loginStyles.inputContainer}>
        <Text style={loginStyles.label}>Confirme sua senha:</Text>
        <TextInput
          style={[loginStyles.input, confirmPasswordError ? loginStyles.inputError : null]}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry
          editable={!loading}
          placeholder="••••••••••"
          placeholderTextColor={colors.text.secondary}
        />
        {confirmPasswordError ? <Text style={loginStyles.errorText}>{confirmPasswordError}</Text> : null}
      </View>

      {/* Botão Cadastrar */}
      <TouchableOpacity 
        style={[loginStyles.loginButton, loading && loginStyles.disabledButton]} 
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.text.white} />
        ) : (
          <Text style={loginStyles.loginButtonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default RegisterScreen;