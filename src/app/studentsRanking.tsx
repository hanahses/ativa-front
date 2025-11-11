// app/home.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { colors } from '@/src/styles/styles';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const StudentsRanking: React.FC = () => {
  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Cabeçalho padrão */}
        <AppHeader showMenuButton={true} showStatsButton={false} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Título abaixo do cabeçalho */}
          <Text style={styles.title}>Bem vindo!</Text>

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Meus Rankings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 20, // distância abaixo do cabeçalho
    marginBottom: 30,
    textDecorationLine: 'underline',
    textAlign: 'left',
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2E7D32', // verde escuro
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    width: '70%', // garante proporção em diferentes tamanhos de tela
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudentsRanking;
