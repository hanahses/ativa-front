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
interface ForgotPasswordScreenProps {}

// ✅ Tipos para os estados
type LoadingState = boolean;
type ErrorState = string;
type EmailState = string;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = () => {
  // ✅ Estados tipados
  const [email, setEmail] = useState<EmailState>('');
  const [loading, setLoading] = useState<LoadingState>(false);
  const [emailError, setEmailError] = useState<ErrorState>('');

  // ✅ Função para limpar erros - tipada
  const clearErrors = (): void => {
    setEmailError('');
  };

  // ✅ Função de validação tipada
  const validateForm = (): boolean => {
    clearErrors();

    // Validação do email usando o validator tipado
    const emailValidation: ValidationResult = validators.email(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      return false;
    }

    return true;
  };

  // ✅ Função para enviar email de recuperação
  const handleSendResetEmail = async (): Promise<void> => {
    // Primeiro valida os dados
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // ✅ Tipagem explícita para a resposta da API
      const response: Response = await fetch('https://seu-backend.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      // ✅ Tipagem para os dados da resposta
      const data: any = await response.json();

      if (response.ok) {
        // ✅ Sucesso no envio
        Alert.alert(
          'Email Enviado!', 
          'Enviamos um email de recuperação para que você possa redefinir sua senha. Verifique sua caixa de entrada.', 
          [
            {
              text: 'OK',
              onPress: (): void => {
                // Volta para a tela de login após enviar o email
                router.back();
              }
            }
          ]
        );
      } else {
        // ✅ Tratamento de erros do servidor
        const errorMessage: string = data.message || ERROR_MESSAGES.NETWORK_ERROR;
        
        // Verifica se o erro é de email não encontrado
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('não encontrado')) {
          setEmailError('Email não encontrado em nosso sistema');
        } else {
          Alert.alert('Erro', errorMessage);
        }
      }
    } catch (error: unknown) {
      console.error('Erro ao enviar email de recuperação:', error);
      // ✅ Usando constante tipada
      Alert.alert('Erro de Conexão', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Função para mudança de texto tipada
  const handleEmailChange = (text: string): void => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  return (
    <AuthLayout 
      showBackButton={true} 
      isLoading={loading}
    >
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

      {/* Botão Enviar */}
      <TouchableOpacity 
        style={[loginStyles.loginButton, loading && loginStyles.disabledButton]} 
        onPress={handleSendResetEmail}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.text.white} />
        ) : (
          <Text style={loginStyles.loginButtonText}>Enviar</Text>
        )}
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;