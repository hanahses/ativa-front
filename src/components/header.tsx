// src/components/AppHeader.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import authService from '../services/authService';
import { colors } from '../styles/styles';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = 150;
const HEADER_HEIGHT = 110;

interface AppHeaderProps {
  showMenuButton?: boolean;
  showStatsButton?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showMenuButton = true,
  showStatsButton = true,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [topMenuVisible, setTopMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [slideDownAnim] = useState(new Animated.Value(-60));

  // Abre o drawer lateral
  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Fecha o drawer lateral
  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  // Abre o menu superior
  const openTopMenu = () => {
    setTopMenuVisible(true);
    Animated.timing(slideDownAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Abre ou fecha o menu superior (toggle)
  const toggleTopMenu = () => {
    if (topMenuVisible) {
      closeTopMenu();
    } else {
      openTopMenu();
    }
  };

  // Fecha o menu superior
  const closeTopMenu = () => {
    Animated.timing(slideDownAnim, {
      toValue: -60,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTopMenuVisible(false);
    });
  };

  // Navega para uma tela e fecha o drawer
  const navigateTo = (screen: string) => {
    closeDrawer();
    setTimeout(() => {
      if (screen === 'logout') {
        handleLogout();
      } else {
        router.push(screen as any);
      }
    }, 250);
  };

  // Navega para uma tela do menu superior e fecha
  const navigateFromTopMenu = (screen: string) => {
    closeTopMenu();
    setTimeout(() => {
      router.push(screen as any);
    }, 250);
  };

  // Função de logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Container que engloba menu e header */}
      <View style={styles.headerContainer}>
        {/* Menu Superior (renderizado diretamente, não em Modal) */}
        {topMenuVisible && (
          <>
            {/* Overlay escuro */}
            <TouchableOpacity
              style={styles.overlayDirect}
              activeOpacity={1}
              onPress={closeTopMenu}
            />
            
            {/* Menu Superior */}
            <Animated.View
              style={[
                styles.topMenu,
                {
                  transform: [{ translateY: slideDownAnim }],
                },
              ]}
            >
              <View style={styles.topMenuItems}>
                <TouchableOpacity
                  style={styles.topMenuItem}
                  onPress={() => navigateFromTopMenu('/cards')}
                >
                  <Text style={styles.topMenuText}>Cards informativos</Text>
                </TouchableOpacity>

                <View style={styles.topMenuDivider} />

                <TouchableOpacity
                  style={styles.topMenuItem}
                  onPress={() => navigateFromTopMenu('/home')}
                >
                  <Text style={styles.topMenuText}>Mapa interativo</Text>
                </TouchableOpacity>

                <View style={styles.topMenuDivider} />

                <TouchableOpacity
                  style={styles.topMenuItem}
                  onPress={() => navigateFromTopMenu('/studentsRanking')}
                >
                  <Text style={styles.topMenuText}>Ranking</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        )}

        {/* Header */}
        <View style={styles.header}>
          {/* Botão Menu (esquerda) */}
          {showMenuButton && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={openDrawer}
              activeOpacity={0.7}
            >
              <Image
                source={require('@/assets/images/header_user.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          {/* Logo Central */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/Projeto_Atitude_Logotipo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Botão Estatísticas (direita) */}
          {showStatsButton && (
            <TouchableOpacity
              style={styles.statsButton}
              onPress={toggleTopMenu}
              activeOpacity={0.7}
            >
              <Image
                source={require('@/assets/images/header_menu.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Drawer Menu (Modal - mantido porque é lateral) */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        {/* Overlay escuro */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeDrawer}
        >
          {/* Drawer */}
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Menu Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('/profile')}
              >
                <Text style={styles.menuText}>Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('/activities')}
              >
                <Text style={styles.menuText}>Atividades</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('/settings')}
              >
                <Text style={styles.menuText}>Configurações</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => navigateTo('logout')}
              >
                <Text style={styles.menuText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Container do header e menu
  headerContainer: {
    position: 'relative',
  },

  // Header principal
  header: {
    backgroundColor: '#2B5D36',
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    zIndex: 100, // Header fica na frente
    elevation: 100, // Para Android
    position: 'relative',
  },

  // Botão menu (esquerda)
  menuButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logo central
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 120,
    height: 45,
  },

  menuIcon: {
    width: 48,
    height: 48,
  },

  // Botão estatísticas (direita)
  statsButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },

  // Overlay direto (sem modal)
  overlayDirect: {
    position: 'absolute',
    top: HEADER_HEIGHT, // Começa abaixo do header
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    zIndex: 50,
  },

  // Drawer (menu lateral)
  drawer: {
    position: 'absolute',
    left: 0,
    top: HEADER_HEIGHT,
    width: DRAWER_WIDTH,
    backgroundColor: '#234A2C',
    borderBottomRightRadius: 8,
  },

  // Items do menu
  menuItems: {
    paddingTop: 0,
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },

  menuItemLast: {
    borderBottomWidth: 0,
  },

  menuText: {
    color: colors.white,
    fontSize: 15.5,
    fontWeight: '600',
  },

  // Menu superior (top menu)
  topMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: HEADER_HEIGHT,
    backgroundColor: '#234A2C',
    paddingVertical: 8,
    zIndex: 50, // Menu superior atrás do header
    elevation: 50, // Para Android
  },

  topMenuItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },

  topMenuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },

  topMenuDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  topMenuText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AppHeader;