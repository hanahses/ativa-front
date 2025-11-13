// app/rankingView.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { API_BASE_URL } from '@/src/services/authService';
import { colors } from '@/src/styles/styles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Participant {
  userId: string;
  userName: string;
  points: number;
  position: number;
}

interface RankingData {
  name: string;
  participants: Participant[];
}

const RankingView: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [rankingName, setRankingName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRankingData();
    }
  }, [id]);

  const fetchRankingData = async () => {
    setIsLoading(true);
    
    try {
      // Primeiro busca informações básicas do ranking
      const rankingResponse = await fetch(`${API_BASE_URL}/ranking/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (rankingResponse.ok) {
        const rankingInfo = await rankingResponse.json();
        setRankingName(rankingInfo.name);
      }

      // Depois busca o leaderboard
      const leaderboardResponse = await fetch(`${API_BASE_URL}/ranking/${id}/leaderboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        
        // Ordena os participantes por pontuação decrescente
        const sortedParticipants = [...leaderboardData].sort((a, b) => b.points - a.points);
        
        // Adiciona a posição a cada participante
        const participantsWithPosition = sortedParticipants.map((p, index) => ({
          ...p,
          position: index + 1,
        }));
        
        setRankingData({
          name: rankingName,
          participants: participantsWithPosition,
        });
      } else {
        console.error('Erro ao carregar leaderboard');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return '#28783AF2'; // Verde escuro - 1º lugar
      case 2:
        return '#D1CD8AB2'; // Amarelo/Bege - 2º lugar
      case 3:
        return '#568B47'; // Verde médio - 3º lugar
      default:
        return '#E8F5E9'; // Bege claro - demais posições
    }
  };

  const getPositionTextColor = (position: number) => {
    return position <= 3 ? '#FFFFFF' : '#333333';
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return '↑';
      case 2:
        return '↓';
      case 3:
        return '↓';
      default:
        return position <= 5 ? '−' : position <= 10 ? '↓' : '↑';
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <View style={styles.container}>
          <AppHeader showMenuButton={true} showStatsButton={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Carregando ranking...</Text>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  if (!rankingData) {
    return (
      <ProtectedRoute>
        <View style={styles.container}>
          <AppHeader showMenuButton={true} showStatsButton={true} />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Ranking não encontrado</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <AppHeader showMenuButton={true} showStatsButton={true} />
        
        {/* Header com botão voltar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButtonTop}>
            <Text style={styles.backButtonTopText}>← Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Título do Ranking */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{rankingName || rankingData.name}</Text>
        </View>

        {/* Lista de Participantes */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {rankingData.participants.map((participant) => (
            <View
              key={participant.userId}
              style={[
                styles.participantPill,
                { backgroundColor: getPositionColor(participant.position) },
              ]}
            >
              <View style={styles.positionContainer}>
                <Text
                  style={[
                    styles.positionIcon,
                    { color: getPositionTextColor(participant.position) },
                  ]}
                >
                  {getPositionIcon(participant.position)}
                </Text>
                <Text
                  style={[
                    styles.positionNumber,
                    { color: getPositionTextColor(participant.position) },
                  ]}
                >
                  {participant.position}
                </Text>
              </View>

              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {participant.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.participantInfo}>
                <Text
                  style={[
                    styles.participantName,
                    { color: getPositionTextColor(participant.position) },
                  ]}
                >
                  {participant.userName}
                </Text>
              </View>

              <View style={styles.pointsContainer}>
                <Text
                  style={[
                    styles.pointsValue,
                    { color: getPositionTextColor(participant.position) },
                  ]}
                >
                  {participant.points}
                </Text>
                <Text
                  style={[
                    styles.pointsLabel,
                    { color: getPositionTextColor(participant.position) },
                  ]}
                >
                  pts.
                </Text>
              </View>
            </View>
          ))}

          {/* Botão "Ver todos" */}
          {rankingData.participants.length > 10 && (
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver todos ›</Text>
            </TouchableOpacity>
          )}

          {/* Espaçamento final */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButtonTop: {
    alignSelf: 'flex-start',
  },
  backButtonTopText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  participantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    minWidth: 40,
  },
  positionIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  seeAllButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 8,
  },
  seeAllText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
});

export default RankingView;