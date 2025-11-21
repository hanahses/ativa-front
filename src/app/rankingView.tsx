// app/rankingView.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { useAuth } from '@/src/context/authContext';
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
  startDate: string;
  endDate: string;
}

const RankingView: React.FC = () => {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { id, name, startDate, endDate } = useLocalSearchParams();
  
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivitiesMenu, setShowActivitiesMenu] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRankingData();
    }
  }, [id]);

  const fetchRankingData = async () => {
    setIsLoading(true);
    
    try {
      // Busca apenas o leaderboard, os dados básicos já vêm dos parâmetros
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
          name: typeof name === 'string' ? name : '',
          participants: participantsWithPosition,
          startDate: typeof startDate === 'string' ? startDate : '',
          endDate: typeof endDate === 'string' ? endDate : '',
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
        return '👑';
      case 2:
        return '⭐';
      case 3:
        return '⭐';
      default:
        return position <= 5 ? '∙' : position <= 10 ? '↑' : '↓';
    }
  };

  const handleBack = () => {
    if (showActivitiesMenu) {
      // Se estiver no menu de atividades, volta para o leaderboard
      setShowActivitiesMenu(false);
    } else {
      // Se estiver no leaderboard, volta para a tela anterior
      router.back();
    }
  };

  const handleActivitiesPress = () => {
    const isTeacher = userProfile?.user?.role === 1;
    
    if (isTeacher) {
      // Professor: mostra menu de opções
      setShowActivitiesMenu(true);
    } else {
      // Aluno: vai direto para rankingActivities
      router.push({
        pathname: '/rankingActivities',
        params: {
          rankingId: id,
          rankingName: name,
        }
      });
    }
  };

  const handleCreateActivity = () => {
    router.push({
      pathname: '/createActivitie',
      params: {
        rankingId: id,
        rankingName: name,
      }
    });
  };

  const handleViewActivities = () => {
    router.push({
      pathname: '/rankingActivities',
      params: {
        rankingId: id,
        rankingName: name,
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
          <Text style={styles.title}>{rankingData.name}</Text>
        </View>

        {/* Datas do Ranking */}
        <View style={styles.datesContainer}>
          <Text style={styles.dateText}>
            Início: {formatDate(rankingData.startDate)}
          </Text>
          <Text style={styles.dateText}>
            Fim: {formatDate(rankingData.endDate)}
          </Text>
        </View>

        {/* Conteúdo condicional: Leaderboard ou Menu de Atividades */}
        {!showActivitiesMenu ? (
          // Leaderboard
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
        ) : (
          // Menu de Atividades (apenas para professores)
          <View style={styles.activitiesMenuContainer}>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={handleCreateActivity}
              activeOpacity={0.8}
            >
              <Text style={styles.menuButtonText}>Criar Atividade</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={handleViewActivities}
              activeOpacity={0.8}
            >
              <Text style={styles.menuButtonText}>Ver Atividades</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botão Atividades fixo na parte inferior - apenas quando não está no menu */}
        {!showActivitiesMenu && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity 
              style={styles.activitiesButton} 
              onPress={handleActivitiesPress}
              activeOpacity={0.8}
            >
              <Text style={styles.activitiesButtonText}>Atividades</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
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
  bottomButtonContainer: {
    paddingHorizontal: 50,
    paddingVertical: 16,
    paddingBottom: 50,
    backgroundColor: colors.background,
  },
  activitiesButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  activitiesButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  activitiesMenuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  menuButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  menuButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RankingView;