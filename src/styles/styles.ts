// src/styles/styles.ts
import { StyleSheet } from 'react-native';

// Cores do projeto
export const colors = {
  primary: '#27ae60',
  primaryDisabled: '#95a5a6',
  secondary: '#d4af37',
  secondaryBorder: '#b8941f',
  secondaryText: '#8b4513',
  background: '#f5f5f5',
  white: '#ffffff',
  error: '#e74c3c',
  text: {
    primary: '#333',
    secondary: '#666',
    white: '#ffffff',
  },
  border: {
    default: '#ddd',
    error: '#e74c3c',
  },
} as const;

// Estilos compartilhados entre as telas de autenticação (login e recuperação de senha)
export const loginStyles = StyleSheet.create({
  // Layout principal
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header com logos
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    position: 'relative',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoItem: {
    flex: 1,
    alignItems: 'center',
  },
  univasfLogo: {
    width: 122.15,
    height: 37.93,
  },
  upeLogo: {
    width: 55.62,
    height: 24.77,
    opacity: 1,
  },
  atitudeLogo: {
    width: 116.74,
    height: 42.63,
    opacity: 1,
  },
  
  // Botão voltar (usado na tela de recuperação)
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },

  // Conteúdo principal
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Texto explicativo (usado na tela de recuperação)
  explanationContainer: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  explanationText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Inputs e formulário
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.border.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },

  // Links (usado apenas na tela de login)
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  registerLinkContainer: {
    alignItems: 'center',
  },
  linkText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  underline: {
    textDecorationLine: 'underline',
  },

  // Botões
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    minHeight: 50,
  },
  disabledButton: {
    backgroundColor: colors.primaryDisabled,
  },
  loginButtonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondaryBorder,
  },
  guestButtonText: {
    color: colors.secondaryText,
    fontSize: 16,
    fontWeight: '600',
  },

  // Divisor "Ou" (usado apenas na tela de login)
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    marginHorizontal: 15,
    color: colors.text.secondary,
    fontSize: 16,
  },
});

// Estilos globais reutilizáveis (para outras telas do app)
export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Botões genéricos
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.secondaryBorder,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  buttonTextPrimary: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: colors.secondaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Inputs genéricos
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.border.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
});