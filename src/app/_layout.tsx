// app/_layout.tsx
import { AuthProvider } from '@/src/context/authContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    // ✅ AuthProvider envolve toda a aplicação
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false, // Remove header padrão
          contentStyle: { backgroundColor: '#1a1a2e' }, // Fundo escuro
        }}
      >
        {/* Tela de Login */}
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        {/* Tela de Registro */}
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        {/* Tela de Recuperação de Senha */}
        <Stack.Screen 
          name="forgotPass" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        {/* Tela Home */}
        <Stack.Screen 
          name="home" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        {/* Tela de Cards (modo convidado) */}
        <Stack.Screen 
          name="cards" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        {/* Tela de Perfil */}
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: false 
          }} 
        />

        {/* Tela de atividades */}
        <Stack.Screen 
          name="activities" 
          options={{ 
            headerShown: false 
          }} 
        />

        {/* Tela de gerenciamento de ranking */}
        <Stack.Screen 
          name="studentsRanking" 
          options={{ 
            headerShown: false 
          }} 
        />

        {/* Tela de visualização de rankings */}
        <Stack.Screen 
          name="rankingView" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        {/* Adicionar outras telas aqui */}
      </Stack>
    </AuthProvider>
  );
}