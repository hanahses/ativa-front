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

// Estilos da tela de login
export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
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
    width: 55.620506286621094,
    height: 24.772159576416016,
    opacity: 1,
  },
  atitudeLogo: {
    width: 116.74110412597656,
    height: 42.62668228149414,
    opacity: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
});

// Estilos globais que podem ser reutilizados
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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