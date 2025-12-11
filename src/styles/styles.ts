// src/styles/styles.ts
import { Dimensions, StyleSheet } from 'react-native';

const { height, width } = Dimensions.get('window');
const HEADER_HEIGHT = 110; // Altura do header
const STATS_PANEL_HEIGHT = height * 0.75; // 75% da altura da tela

// Cores do projeto
export const colors = {
  primary: '#28783A',
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

// Constantes para Home
export const FILTER_PANEL_HEIGHT = height * 0.55;

// Estilos da tela Home
export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    position: 'relative',
  },

  // Botão flutuante de estatísticas
  floatingStatsButton: {
    position: 'absolute',
    top: 15,
    right: 0,
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Retângulo do Mapa
  mapContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },

  // Botão Filtros
  filterButton: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },

  filterButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtonIcon: {
    fontSize: 20,
    color: colors.text.primary,
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  filterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 1,
  },

  // Modal de Filtros
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  // Painel de Filtros
  filterPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: FILTER_PANEL_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Header do Filtro
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  filterHeaderIcon: {
    fontSize: 28,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 1,
  },

  // Conteúdo dos Filtros
  filterContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Container de duas colunas
  filterColumnsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },

  filterColumn: {
    flex: 1,
  },

  // Seção de Filtro
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },

  // Grupo de Checkboxes
  checkboxGroup: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxCheck: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: colors.text.primary,
    flexShrink: 1,
  },

  // Footer com Botão Aplicar
  filterFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.white,
  },
  applyButton: {
    marginHorizontal: 80,
    marginBottom: 10,
    paddingVertical: 15,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal de Estatísticas - CORRIGIDO
  statsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'flex-end', // Alinha à direita
  },

  statsPanel: {
    width: width * 0.85,
    height: height * 0.72, // 72% da altura da tela
    backgroundColor: colors.primary,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  statsPanelButton: {
    width: 56,
    height: 56,
  },
});