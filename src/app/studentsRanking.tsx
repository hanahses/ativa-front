// app/studentsRanking.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { useAuth } from '@/src/context/authContext';
import { API_BASE_URL } from '@/src/services/authService';
import { colors } from '@/src/styles/styles';
import Clipboard from '@react-native-clipboard/clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Ranking {
  _id: string;
  name: string;
  creatorId: string;
  joinCode: string;
  participants: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const StudentsRanking: React.FC = () => {
  const { userProfile } = useAuth();
  const router = useRouter();
  
  // Estados para modal de entrar
  const [modalVisible, setModalVisible] = useState(false);
  const [rankingCode, setRankingCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Estados para modal de criar
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [rankingName, setRankingName] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [displayStartDate, setDisplayStartDate] = useState<string>('');
  const [displayEndDate, setDisplayEndDate] = useState<string>('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Estado para exibir o código após criação
  const [createdRankingCode, setCreatedRankingCode] = useState<string>('');

  // Estados para tela "Meus Rankings"
  const [showMyRankings, setShowMyRankings] = useState(false);
  const [myRankings, setMyRankings] = useState<Ranking[]>([]);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);

  const handleJoinRanking = async () => {
    // Validações
    if (!rankingCode.trim()) {
      Alert.alert('Atenção', 'Por favor, insira o código do ranking.');
      return;
    }

    if (!userProfile?.studentData?.userId) {
      Alert.alert('Erro', 'ID do estudante não encontrado. Por favor, complete seu perfil.');
      return;
    }

    setIsJoining(true);

    try {
      const payload = {
        code: rankingCode.trim(),
        studentId: userProfile.studentData.userId,
      };

      const response = await fetch(`${API_BASE_URL}/ranking/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Você entrou no ranking com sucesso!');
        setModalVisible(false);
        setRankingCode('');
      } else {
        const error = await response.json();
        const errorMessage =
          typeof error.message === 'string'
            ? error.message
            : Array.isArray(error.message)
              ? error.message.join(', ')
              : 'Não foi possível entrar no ranking.';

        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao entrar no ranking:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsJoining(false);
    }
  };

  const openModal = () => {
    if (!userProfile?.studentData?.userId) {
      Alert.alert(
        'Perfil Incompleto',
        'Por favor, complete seu perfil antes de entrar em um ranking.'
      );
      return;
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setRankingCode('');
  };

  // Handlers para modal de criar ranking
  const openCreateModal = () => {
    if (!userProfile?.user?._id) {
      Alert.alert('Erro', 'ID do professor não encontrado.');
      return;
    }
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
    setRankingName('');
    setDisplayStartDate('');
    setDisplayEndDate('');
    setStartDate(new Date());
    setEndDate(new Date());
    setCreatedRankingCode('');
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setStartDate(selectedDate);
      const formatted = selectedDate.toLocaleDateString('pt-BR');
      setDisplayStartDate(formatted);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setEndDate(selectedDate);
      const formatted = selectedDate.toLocaleDateString('pt-BR');
      setDisplayEndDate(formatted);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(createdRankingCode);
    Alert.alert('Código Copiado', 'O código do ranking foi copiado para a área de transferência.');
  };

  const handleCreateRanking = async () => {
    // Validações
    if (!rankingName.trim()) {
      Alert.alert('Atenção', 'Por favor, insira o nome do ranking.');
      return;
    }

    if (!displayStartDate) {
      Alert.alert('Atenção', 'Por favor, selecione a data de início.');
      return;
    }

    if (!displayEndDate) {
      Alert.alert('Atenção', 'Por favor, selecione a data de fim.');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Atenção', 'A data de fim deve ser posterior à data de início.');
      return;
    }

    if (!userProfile?.user?._id) {
      Alert.alert('Erro', 'ID do professor não encontrado.');
      return;
    }

    setIsCreating(true);

    try {
      const payload = {
        name: rankingName.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/ranking/${userProfile.user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const rankingCode = data.joinCode || 'Código não encontrado';
        setCreatedRankingCode(rankingCode);
        // Não fecha o modal, apenas exibe o código
      } else {
        const error = await response.json();
        const errorMessage =
          typeof error.message === 'string'
            ? error.message
            : Array.isArray(error.message)
              ? error.message.join(', ')
              : 'Não foi possível criar o ranking.';

        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao criar ranking:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsCreating(false);
    }
  };

  // Função para buscar rankings do usuário
  const fetchMyRankings = async () => {
    const isTeacher = userProfile?.user?.role === 1;
    
    let endpoint = '';
    
    if (isTeacher) {
      if (!userProfile?.user?._id) {
        Alert.alert('Erro', 'ID do professor não encontrado.');
        return;
      }
      endpoint = `/ranking/all/${userProfile.user._id}`;
    } else {
      if (!userProfile?.studentData?.userId) {
        Alert.alert('Erro', 'ID do aluno não encontrado.');
        return;
      }
      endpoint = `/ranking/participant/${userProfile.studentData.userId}`;
    }

    setIsLoadingRankings(true);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyRankings(Array.isArray(data) ? data : []);
        setShowMyRankings(true);
      } else {
        const error = await response.json();
        const errorMessage =
          typeof error.message === 'string'
            ? error.message
            : 'Não foi possível carregar os rankings.';

        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao buscar rankings:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsLoadingRankings(false);
    }
  };

  const handleMyRankingsPress = () => {
    fetchMyRankings();
  };

  const handleBackFromRankings = () => {
    setShowMyRankings(false);
    setMyRankings([]);
  };

const handleRankingCardPress = (ranking: Ranking) => {
    // Navegar para tela de detalhes do ranking passando todos os dados necessários
    console.log('Ranking selecionado:', ranking);
    router.push({
      pathname: '/rankingView',
      params: {
        id: ranking._id,
        name: ranking.name,
        startDate: ranking.startDate,
        endDate: ranking.endDate,
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Cabeçalho padrão */}
        <AppHeader showMenuButton={true} showStatsButton={true} />

        {!showMyRankings ? (
          <>
            {/* Título alinhado à esquerda */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Painel de Rankings</Text>
            </View>

            {/* Botões centralizados */}
            <View style={styles.buttonContainer}>
              {/* Botão Criar - apenas para role === 1 */}
              {userProfile?.user?.role === 1 && (
                <TouchableOpacity style={styles.button} onPress={openCreateModal}>
                  <Text style={styles.buttonText}>Criar</Text>
                </TouchableOpacity>
              )}

              {/* Botão Entrar - apenas para role === 2 */}
              {userProfile?.user?.role === 2 && (
                <TouchableOpacity style={styles.button} onPress={openModal}>
                  <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.button} onPress={handleMyRankingsPress}>
                <Text style={styles.buttonText}>Meus Rankings</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Tela Meus Rankings */}
            <View style={styles.myRankingsHeader}>
              <TouchableOpacity onPress={handleBackFromRankings} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Voltar</Text>
              </TouchableOpacity>
              <Text style={styles.myRankingsTitle}>Meus Rankings</Text>
            </View>

            {isLoadingRankings ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Carregando rankings...</Text>
              </View>
            ) : myRankings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Você ainda não participa de nenhum ranking.</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.rankingsScrollView}
                contentContainerStyle={styles.rankingsScrollContent}
                showsVerticalScrollIndicator={true}
              >
                {myRankings.map((ranking) => (
                  <TouchableOpacity
                    key={ranking._id}
                    style={styles.rankingCard}
                    onPress={() => handleRankingCardPress(ranking)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rankingCardHeader}>
                      <Text style={styles.rankingCardName}>{ranking.name}</Text>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeBadgeText}>{ranking.joinCode}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.rankingCardDivider} />
                    
                    <View style={styles.rankingCardInfo}>
                      <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Início:</Text>
                        <Text style={styles.dateValue}>{formatDate(ranking.startDate)}</Text>
                      </View>
                      <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Fim:</Text>
                        <Text style={styles.dateValue}>{formatDate(ranking.endDate)}</Text>
                      </View>
                    </View>

                    <View style={styles.rankingCardFooter}>
                      <Text style={styles.participantsText}>
                        {ranking.participants.length} participante{ranking.participants.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {/* Espaçamento final */}
                <View style={{ height: 20 }} />
              </ScrollView>
            )}
          </>
        )}

        {/* Modal para inserir código do ranking */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Entrar no Ranking</Text>
              <Text style={styles.modalSubtitle}>
                Digite o código do ranking que você deseja entrar
              </Text>

              <TextInput
                style={styles.modalInput}
                value={rankingCode}
                onChangeText={setRankingCode}
                placeholder="Ex: A1B2c3"
                placeholderTextColor="#999"
                autoCapitalize="none"
                maxLength={10}
                editable={!isJoining}
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                  disabled={isJoining}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleJoinRanking}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para criar ranking */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={createModalVisible}
          onRequestClose={closeCreateModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Criar Ranking</Text>
              <Text style={styles.modalSubtitle}>
                Preencha as informações do novo ranking
              </Text>

              {/* Nome do Ranking */}
              <Text style={styles.inputLabel}>Nome do Ranking</Text>
              <TextInput
                style={styles.modalInput}
                value={rankingName}
                onChangeText={setRankingName}
                placeholder="Ex: Ranking Novembro 2025"
                placeholderTextColor="#999"
                editable={!isCreating}
              />

              {/* Data de Início */}
              <Text style={styles.inputLabel}>Data de Início</Text>
              <TouchableOpacity 
                onPress={() => setShowStartPicker(true)}
                disabled={isCreating}
              >
                <View style={styles.dateInputContainer}>
                  <Text style={[styles.dateInputText, !displayStartDate && styles.dateInputPlaceholder]}>
                    {displayStartDate || 'Selecione a data de início'}
                  </Text>
                </View>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onStartDateChange}
                  minimumDate={new Date()}
                />
              )}

              {/* Data de Fim */}
              <Text style={styles.inputLabel}>Data de Fim</Text>
              <TouchableOpacity 
                onPress={() => setShowEndPicker(true)}
                disabled={isCreating}
              >
                <View style={styles.dateInputContainer}>
                  <Text style={[styles.dateInputText, !displayEndDate && styles.dateInputPlaceholder]}>
                    {displayEndDate || 'Selecione a data de fim'}
                  </Text>
                </View>
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                />
              )}

              {/* Exibir código após criação */}
              {createdRankingCode && (
                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>Código do Ranking:</Text>
                  <TouchableOpacity 
                    onLongPress={handleCopyCode}
                    activeOpacity={0.7}
                  >
                    <View style={styles.codeBox}>
                      <Text style={styles.codeText}>{createdRankingCode}</Text>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.codeInstruction}>
                    Compartilhe este código com os alunos para que possam entrar no ranking.
                  </Text>
                </View>
              )}

              <View style={[styles.modalButtonContainer, createdRankingCode && { marginTop: 20 }]}>
                {!createdRankingCode ? (
                  <>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={closeCreateModal}
                      disabled={isCreating}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={handleCreateRanking}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.confirmButtonText}>Criar</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton, { flex: 1 }]}
                    onPress={closeCreateModal}
                  >
                    <Text style={styles.confirmButtonText}>Fechar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  dateInputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  dateInputText: {
    fontSize: 16,
    color: '#000',
  },
  dateInputPlaceholder: {
    color: '#999',
  },
  codeContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F8F0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2E7D32',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    letterSpacing: 2,
  },
  codeInstruction: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  myRankingsHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  myRankingsTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.text.primary,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  rankingsScrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rankingsScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  rankingCard: {
    backgroundColor: '#3A7248',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  rankingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankingCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  codeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  codeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  rankingCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  rankingCardInfo: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rankingCardFooter: {
    alignItems: 'flex-start',
  },
  participantsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
});

export default StudentsRanking;