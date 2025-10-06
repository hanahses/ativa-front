// app/home.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { colors } from '@/src/styles/styles';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Header com menu lateral */}
        <AppHeader 
          showMenuButton={true} 
          showStatsButton={true} 
        />
        
        {/* Conteúdo da tela */}
        <View style={styles.content}>
          <Text style={styles.testText}>Tela Home - Teste do Header</Text>
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testText: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default HomeScreen;