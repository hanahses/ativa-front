// app/rankingView.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { useAuth } from '@/src/context/authContext';
import { API_BASE_URL } from '@/src/services/authService';
import { colors } from '@/src/styles/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  const [createActivityModalVisible, setCreateActivityModalVisible] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityDate, setActivityDate] = useState<Date>(new Date());
  const [displayActivityDate, setDisplayActivityDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activityHours, setActivityHours] = useState('');
  const [activityMinutes, setActivityMinutes] = useState('');
  const [activityIntensity, setActivityIntensity] = useState('');
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showIntensityDropdown, setShowIntensityDropdown] = useState(false);
  const [isSelectingParticipants, setIsSelectingParticipants] = useState(false);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [tempModalData, setTempModalData] = useState({
    type: '',
    description: '',
    date: new Date(),
    displayDate: '',
    hours: '',
    minutes: '',
    intensity: '',
  });

  const activityTypes = ['Esporte', 'Corrida', 'Caminhada', 'Geral'];
  const intensityLevels = ['1', '2', '3'];
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
          return '';
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
      // Aluno: mostra menu de opções também
      setShowActivitiesMenu(true);
    }
  };

  const handleCreateActivity = () => {
    if (!userProfile?.user?._id) {
      Alert.alert('Erro', 'ID do professor não encontrado.');
      return;
    }
    setCreateActivityModalVisible(true);
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

  const handleToggleParticipant = (userId: string) => {
    setSelectedParticipantIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleOpenParticipantSelection = () => {
    // Salva dados temporários do modal
    setTempModalData({
      type: activityType,
      description: activityDescription,
      date: activityDate,
      displayDate: displayActivityDate,
      hours: activityHours,
      minutes: activityMinutes,
      intensity: activityIntensity,
    });
    
    // Fecha modal e ativa modo de seleção
    setCreateActivityModalVisible(false);
    setIsSelectingParticipants(true);
    setShowActivitiesMenu(false);
  };

  const handleConfirmParticipantSelection = () => {
    if (selectedParticipantIds.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um participante.');
      return;
    }
    
    // Restaura dados do modal
    setActivityType(tempModalData.type);
    setActivityDescription(tempModalData.description);
    setActivityDate(tempModalData.date);
    setDisplayActivityDate(tempModalData.displayDate);
    setActivityHours(tempModalData.hours);
    setActivityMinutes(tempModalData.minutes);
    setActivityIntensity(tempModalData.intensity);
    
    // Volta para o modal
    setIsSelectingParticipants(false);
    setCreateActivityModalVisible(true);
  };

  const handleCancelParticipantSelection = () => {
    setSelectedParticipantIds([]);
    setIsSelectingParticipants(false);
    setCreateActivityModalVisible(true);
  };

  const handleSelectAllParticipants = () => {
  if (!rankingData) return;
  
  const allIds = rankingData.participants.map(p => p.userId);
  setSelectedParticipantIds(allIds);
  };

  // Handlers para modal de criar atividade (aluno)
  const openCreateActivityModal = () => {
    const isTeacher = userProfile?.user?.role === 1;
    
    if (isTeacher && !userProfile?.user?._id) {
      Alert.alert('Erro', 'ID do professor não encontrado.');
      return;
    }
    
    if (!isTeacher && !userProfile?.studentData?.userId) {
      Alert.alert('Erro', 'ID do estudante não encontrado.');
      return;
    }
    
    setCreateActivityModalVisible(true);
  };

  const closeCreateActivityModal = () => {
    setCreateActivityModalVisible(false);
    setActivityType('');
    setActivityDescription('');
    setDisplayActivityDate('');
    setActivityDate(new Date());
    setActivityHours('');
    setActivityMinutes('');
    setActivityIntensity('');
    setSelectedParticipantIds([]);
    setIsSelectingParticipants(false);
  };

  const onActivityDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setActivityDate(selectedDate);
      const formatted = selectedDate.toLocaleDateString('pt-BR');
      setDisplayActivityDate(formatted);
    }
  };

  const handleCreateStudentActivity = async () => {
    // Validações
    if (!activityType) {
      Alert.alert('Atenção', 'Por favor, selecione o tipo de atividade.');
      return;
    }

    if (!activityDescription.trim()) {
      Alert.alert('Atenção', 'Por favor, insira uma descrição da atividade.');
      return;
    }

    if (!displayActivityDate) {
      Alert.alert('Atenção', 'Por favor, selecione a data de realização.');
      return;
    }

    if (!activityHours && !activityMinutes) {
      Alert.alert('Atenção', 'Por favor, informe o tempo de atividade.');
      return;
    }

    const hours = parseInt(activityHours || '0');
    const minutes = parseInt(activityMinutes || '0');

    if (hours > 24 || (hours === 24 && minutes > 0)) {
      Alert.alert('Atenção', 'A duração máxima é de 24 horas.');
      return;
    }

    if (minutes > 59) {
      Alert.alert('Atenção', 'Os minutos devem ser entre 0 e 59.');
      return;
    }

    if (!activityIntensity) {
      Alert.alert('Atenção', 'Por favor, selecione a intensidade da atividade.');
      return;
    }

    if (!userProfile?.studentData?.userId) {
      Alert.alert('Erro', 'ID do estudante não encontrado.');
      return;
    }

    if (!id) {
      Alert.alert('Erro', 'ID do ranking não encontrado.');
      return;
    }

    setIsCreatingActivity(true);

    try {
      const timeSpentInSeconds = (hours * 3600) + (minutes * 60);
      
      // Converte a intensidade selecionada (1-3) para o valor esperado pelo backend (0-2)
      const intensityValue = parseInt(activityIntensity) - 1;

      const payload = {
        ocurredAt: activityDate.toISOString(),
        type: activityType,
        description: activityDescription.trim(),
        timeSpentInSeconds: timeSpentInSeconds,
        intesity: intensityValue,
      };

      console.log('Payload sendo enviado:', payload);

      const response = await fetch(
        `${API_BASE_URL}/activities/student/ranking/${id}/student/${userProfile.studentData.userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        Alert.alert('Sucesso', 'Atividade criada com sucesso!');
        closeCreateActivityModal();
      } else {
        const error = await response.json();
        const errorMessage =
          typeof error.message === 'string'
            ? error.message
            : Array.isArray(error.message)
              ? error.message.join(', ')
              : 'Não foi possível criar a atividade.';

        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsCreatingActivity(false);
    }
  };

  const handleCreateTeacherActivity = async () => {
  // Validações
  if (!activityType) {
    Alert.alert('Atenção', 'Por favor, selecione o tipo de atividade.');
    return;
  }

  if (!activityDescription.trim()) {
    Alert.alert('Atenção', 'Por favor, insira uma descrição da atividade.');
    return;
  }

  if (!displayActivityDate) {
    Alert.alert('Atenção', 'Por favor, selecione a data de realização.');
    return;
  }

  if (!activityHours && !activityMinutes) {
    Alert.alert('Atenção', 'Por favor, informe o tempo de atividade.');
    return;
  }

  const hours = parseInt(activityHours || '0');
  const minutes = parseInt(activityMinutes || '0');

  if (hours > 24 || (hours === 24 && minutes > 0)) {
    Alert.alert('Atenção', 'A duração máxima é de 24 horas.');
    return;
  }

  if (minutes > 59) {
    Alert.alert('Atenção', 'Os minutos devem ser entre 0 e 59.');
    return;
  }

  if (!activityIntensity) {
    Alert.alert('Atenção', 'Por favor, selecione a intensidade da atividade.');
    return;
  }

  if (selectedParticipantIds.length === 0) {
    Alert.alert('Atenção', 'Por favor, selecione pelo menos um participante.');
    return;
  }

  if (!id) {
    Alert.alert('Erro', 'ID do ranking não encontrado.');
    return;
  }

  setIsCreatingActivity(true);

  try {
    const timeSpentInSeconds = (hours * 3600) + (minutes * 60);
    const intensityValue = parseInt(activityIntensity) - 1;

    const payload = {
      ocurredAt: activityDate.toISOString(),
      type: activityType,
      description: activityDescription.trim(),
      timeSpentInSeconds: timeSpentInSeconds,
      intesity: intensityValue,
      participantIds: selectedParticipantIds,
    };

    console.log('Payload professor sendo enviado:', payload);

    const teacherId = userProfile?.user?._id;

    if (!teacherId) {
      Alert.alert('Erro', 'ID do professor não encontrado.');
      setIsCreatingActivity(false);
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/activities/group/ranking/${id}/teacher/${teacherId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      Alert.alert('Sucesso', 'Atividade criada com sucesso!');
      closeCreateActivityModal();
      setSelectedParticipantIds([]);
    } else {
      const error = await response.json();
      const errorMessage =
        typeof error.message === 'string'
          ? error.message
          : Array.isArray(error.message)
            ? error.message.join(', ')
            : 'Não foi possível criar a atividade.';

      Alert.alert('Erro', errorMessage);
    }
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsCreatingActivity(false);
    }
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
              <TouchableOpacity
                key={participant.userId}
                onPress={() => isSelectingParticipants && handleToggleParticipant(participant.userId)}
                disabled={!isSelectingParticipants}
                activeOpacity={isSelectingParticipants ? 0.6 : 1}
              >
                <View
                  style={[
                    styles.participantPill,
                    { backgroundColor: getPositionColor(participant.position) },
                  ]}
                >
                  <View style={styles.positionContainer}>
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

                  {isSelectingParticipants ? (
                    <View style={styles.checkboxContainer}>
                      <View style={[
                        styles.checkbox,
                        selectedParticipantIds.includes(participant.userId) && styles.checkboxChecked
                      ]}>
                        {selectedParticipantIds.includes(participant.userId) && (
                          <Text style={styles.checkboxText}>✓</Text>
                        )}
                      </View>
                    </View>
                  ) : (
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
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Botão Selecionar Todos - apenas durante seleção */}
            {isSelectingParticipants && (
              <TouchableOpacity 
                style={styles.selectAllButton}
                onPress={handleSelectAllParticipants}
                activeOpacity={0.6}
              >
                <Text style={styles.selectAllText}>
                  Selecionar Todos
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        ) : (        

          // Menu de Atividades
          <View style={styles.activitiesMenuContainer}>

            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={openCreateActivityModal}
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
            {isSelectingParticipants ? (
            <View style={styles.selectionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.selectionButton, styles.cancelSelectionButton]} 
                onPress={handleCancelParticipantSelection}
                activeOpacity={0.8}
              >
                <Text style={styles.activitiesButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
              style={[styles.selectionButton, styles.confirmSelectionButton]} 
              onPress={handleConfirmParticipantSelection}
              activeOpacity={0.8}
              >
              <View style={styles.selectionButtonContent}>
                <Text style={styles.activitiesButtonText}>Selecionar</Text>
                <Text style={styles.selectionCountBadge}>{selectedParticipantIds.length}</Text>
              </View>
              </TouchableOpacity>
            </View>
            ) : (
              <TouchableOpacity 
                style={styles.activitiesButton} 
                onPress={handleActivitiesPress}
                activeOpacity={0.8}
              >
                <Text style={styles.activitiesButtonText}>Atividades</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Modal para criar atividade (aluno) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={createActivityModalVisible}
          onRequestClose={closeCreateActivityModal}
        >
          <View style={styles.modalOverlay}>
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Criar Atividade</Text>
                <Text style={styles.modalSubtitle}>
                  Preencha as informações da atividade realizada
                </Text>

                {/* Tipo de Atividade */}
                <Text style={styles.inputLabel}>Tipo de Atividade</Text>
                <TouchableOpacity 
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  disabled={isCreatingActivity}
                >
                  <View style={styles.dropdownContainer}>
                    <Text style={[styles.dropdownText, !activityType && styles.dropdownPlaceholder]}>
                      {activityType || 'Selecione o tipo'}
                    </Text>
                    <Text style={styles.dropdownArrow}>{showTypeDropdown ? '▲' : '▼'}</Text>
                  </View>
                </TouchableOpacity>

                {showTypeDropdown && (
                  <View style={styles.dropdownList}>
                    {activityTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setActivityType(type);
                          setShowTypeDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Descrição */}
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={activityDescription}
                onChangeText={setActivityDescription}
                placeholder="Descreva brevemente a atividade realizada"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                editable={!isCreatingActivity}
                textAlignVertical="top"
                blurOnSubmit={false}
                returnKeyType="done"
                scrollEnabled={false}
              />

                {/* Data de Realização */}
                <Text style={styles.inputLabel}>Data de Realização</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  disabled={isCreatingActivity}
                >
                  <View style={styles.dateInputContainer}>
                    <Text style={[styles.dateInputText, !displayActivityDate && styles.dateInputPlaceholder]}>
                      {displayActivityDate || 'Selecione a data'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={activityDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onActivityDateChange}
                    maximumDate={new Date()}
                  />
                )}

                {/* Tempo de Atividade */}
                <Text style={styles.inputLabel}>Tempo de Atividade</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={styles.timeInput}
                      value={activityHours}
                      onChangeText={(text) => {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num === '' || parseInt(num) <= 24) {
                          setActivityHours(num);
                        }
                      }}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!isCreatingActivity}
                    />
                    <Text style={styles.timeLabel}>horas</Text>
                  </View>

                  <Text style={styles.timeSeparator}>:</Text>

                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={styles.timeInput}
                      value={activityMinutes}
                      onChangeText={(text) => {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num === '' || parseInt(num) <= 59) {
                          setActivityMinutes(num);
                        }
                      }}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!isCreatingActivity}
                    />
                    <Text style={styles.timeLabel}>minutos</Text>
                  </View>
                </View>

                {/* Intensidade */}
                <Text style={styles.inputLabel}>Intensidade</Text>
                <TouchableOpacity 
                  onPress={() => setShowIntensityDropdown(!showIntensityDropdown)}
                  disabled={isCreatingActivity}
                >
                  <View style={styles.dropdownContainer}>
                    <Text style={[styles.dropdownText, !activityIntensity && styles.dropdownPlaceholder]}>
                      {activityIntensity ? `Nível ${activityIntensity}` : 'Selecione a intensidade'}
                    </Text>
                    <Text style={styles.dropdownArrow}>{showIntensityDropdown ? '▲' : '▼'}</Text>
                  </View>
                </TouchableOpacity>

                {showIntensityDropdown && (
                  <View style={styles.dropdownList}>
                    {intensityLevels.map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setActivityIntensity(level);
                          setShowIntensityDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>Nível {level}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Participantes Selecionados - apenas para professor */}
                {userProfile?.user?.role === 1 && (
                  <>
                    <Text style={styles.inputLabel}>Participantes</Text>
                    <TouchableOpacity 
                      onPress={handleOpenParticipantSelection}
                      disabled={isCreatingActivity}
                      style={styles.selectParticipantsButton}
                    >
                      <Text style={styles.selectParticipantsButtonText}>
                        {selectedParticipantIds.length > 0 
                          ? `${selectedParticipantIds.length} participante(s) selecionado(s)` 
                          : 'Selecionar Participantes'}
                      </Text>
                      <Text style={styles.selectParticipantsArrow}>›</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Botões */}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeCreateActivityModal}
                    disabled={isCreatingActivity}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={userProfile?.user?.role === 1 ? handleCreateTeacherActivity : handleCreateStudentActivity}
                  disabled={isCreatingActivity}
                  >
                  {isCreatingActivity ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Criar</Text>
                  )}
                  </TouchableOpacity>

                </View>
              </View>
            </ScrollView>
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
    minWidth: 30,
    justifyContent: 'center',
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
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    backgroundColor: 'transparent',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'transparent',
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
  bottomButtonContainer: {
  paddingHorizontal: 20,
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
  selectionButton: {
  backgroundColor: '#2E7D32',
  paddingVertical: 8,
  paddingHorizontal: 50,
  borderRadius: 8,
  alignItems: 'center',
  flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  dropdownContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 12,
    marginTop: -8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    borderWidth: 1,
    borderColor: '#DDD',
    textAlign: 'center',
    width: 80,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 12,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  checkboxContainer: {
  marginLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFF',
  },
  checkboxText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectionButtonsContainer: {
  flexDirection: 'row',
  gap: 16,
  width: '100%',
  },
  cancelSelectionButton: {
    flex: 1,
    backgroundColor: '#757575',
  },
  confirmSelectionButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  selectParticipantsButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectParticipantsButtonText: {
    fontSize: 16,
    color: '#000',
  },
  selectParticipantsArrow: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },

  selectAllButton: {
  alignSelf: 'center',
  marginTop: 16,
  marginBottom: 8,
  paddingVertical: 8,
  },
  selectAllText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  selectionButtonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  },
  selectionCountBadge: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },

});

export default RankingView;