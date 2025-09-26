// src/components/AuthLayout.tsx
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, loginStyles } from '../styles/styles';

// ✅ Interface para props do componente
interface AuthLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  title?: string;
  isLoading?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showBackButton = false,
  onBackPress,
  title,
  isLoading = false,
}) => {
  // ✅ Função padrão para voltar
  const handleDefaultBack = (): void => {
    router.back();
  };

  // ✅ Determina a função a ser executada no botão voltar
  const handleBackPress = onBackPress || handleDefaultBack;

  return (
    <SafeAreaView style={loginStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header com logos */}
      <View style={loginStyles.header}>
        {/* Botão Voltar - só aparece se showBackButton for true */}
        {showBackButton && (
          <TouchableOpacity 
            style={loginStyles.backButton} 
            onPress={handleBackPress}
            disabled={isLoading}
          >
            <Text style={loginStyles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        )}

        <View style={loginStyles.logoContainer}>
          {/* Logo UNIVASF */}
          <View style={loginStyles.logoItem}>
            <Image 
              source={require('@/assets/images/logo_univasf.png')}
              style={loginStyles.univasfLogo}
              resizeMode="contain"
            />
          </View>
          
          {/* Logo UPE */}
          <View style={loginStyles.logoItem}>
            <Image 
              source={require('@/assets/images/Logo-upe-site.png')}
              style={loginStyles.upeLogo}
              resizeMode="contain"
            />
          </View>
          
          {/* Logo Projeto Atitude */}
          <View style={loginStyles.logoItem}>
            <Image 
              source={require('@/assets/images/Projeto_Atitude_Logotipo.png')}
              style={loginStyles.atitudeLogo}
              resizeMode="contain"
            />         
           </View>
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={loginStyles.content}>
        {/* Título opcional */}
        {title && (
          <View style={loginStyles.explanationContainer}>
            <Text style={loginStyles.explanationText}>{title}</Text>
          </View>
        )}
        
        {/* Conteúdo dinâmico passado como children */}
        {children}
      </View>
    </SafeAreaView>
  );
};

export default AuthLayout;