// app/rankingActivities.tsx
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

interface Activity {
  _id: string;
  userId: string;
  rankingId: string;
  createdBy: string;
  isConfirmed: boolean;
  ocurredAt: string;
  type: string;
  description: string;
  timeSpentInSeconds: number;
  intesity: number;
  createdAt: string;
  updatedAt: string;
  points: number;
}

interface Student {
  userId: string;
  userName: string;
}

const RankingActivities: React.FC = () => {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { rankingId, rankingName } = useLocalSearchParams();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [studentFilter, setStudentFilter] = useState<string>('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const isTeacher = userProfile?.user?.role === 1;

  useEffect(() => {
    if (rankingId) {
      if (isTeacher) {
        fetchAllActivitiesAndStudents();
      } else {
        fetchUserActivities();
      }
    }
  }, [rankingId]);

  const fetchAllActivitiesAndStudents = async () => {
    setIsLoading(true);
    
    try {
      // Busca atividades do ranking
      const activitiesResponse = await fetch(
        `${API_BASE_URL}/activities/all/ranking/${rankingId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!activitiesResponse.ok) {
        console.error('Erro ao carregar atividades');
        setIsLoading(false);
        return;
      }

      const activitiesData = await activitiesResponse.json();
      
      // Ordena por data de ocorrência (mais recente primeiro)
      const sortedActivities = activitiesData.sort(
        (a: Activity, b: Activity) => 
          new Date(b.ocurredAt).getTime() - new Date(a.ocurredAt).getTime()
      );
      
      setActivities(sortedActivities);

      // Busca informações dos participantes (leaderboard)
      const leaderboardResponse = await fetch(
        `${API_BASE_URL}/ranking/${rankingId}/leaderboard`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setStudents(leaderboardData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    setIsLoading(true);
    
    try {
      const userId = userProfile?.studentData?.userId;

      if (!userId) {
        console.error('ID do usuário não encontrado');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/activities/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filtra apenas as atividades do ranking atual
        const filteredActivities = data.filter(
          (activity: Activity) => activity.rankingId === rankingId
        );
        
        // Ordena por data de ocorrência (mais recente primeiro)
        const sortedActivities = filteredActivities.sort(
          (a: Activity, b: Activity) => 
            new Date(b.ocurredAt).getTime() - new Date(a.ocurredAt).getTime()
        );
        
        setActivities(sortedActivities);
      } else {
        console.error('Erro ao carregar atividades');
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentName = (userId: string): string => {
    const student = students.find(s => s.userId === userId);
    return student?.userName || 'Aluno não encontrado';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  };

  const getIntensityLabel = (intensity: number) => {
    return `Nível ${intensity + 1}`;
  };

  const getStatusColor = (isConfirmed: boolean) => {
    return isConfirmed ? '#4CAF50' : '#FF9800';
  };

  const getStatusLabel = (isConfirmed: boolean) => {
    return isConfirmed ? 'Aprovada' : 'Pendente';
  };

  const getFilteredActivities = () => {
    let filtered = activities;
    
    // Filtro por status
    if (statusFilter === 'confirmed') {
      filtered = filtered.filter(activity => activity.isConfirmed === true);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(activity => activity.isConfirmed === false);
    }
    
    // Filtro por aluno (apenas para professores)
    if (isTeacher && studentFilter.trim() !== '') {
      filtered = filtered.filter(activity => {
        const studentName = getStudentName(activity.userId).toLowerCase();
        return studentName.includes(studentFilter.toLowerCase());
      });
    }
    
    // Filtro por data
    if (startDate) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.ocurredAt);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        return activityDate >= start;
      });
    }
    
    if (endDate) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.ocurredAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return activityDate <= end;
      });
    }
    
    return filtered;
  };

  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case 'all':
        return 'Todas';
      case 'confirmed':
        return 'Aprovadas';
      case 'pending':
        return 'Pendentes';
      default:
        return 'Todas';
    }
  };

  const handleActivityPress = (activity: Activity) => {
    // Apenas professores podem clicar em atividades pendentes
    if (isTeacher && !activity.isConfirmed) {
      setSelectedActivity(activity);
      setConfirmModalVisible(true);
    }
  };

  const handleConfirmActivity = async () => {
    if (!selectedActivity) return;

    const teacherId = userProfile?.user?._id;

    if (!teacherId) {
      Alert.alert('Erro', 'ID do professor não encontrado.');
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/activities/confirm/${selectedActivity._id}/${teacherId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Atualiza o status da atividade localmente
        setActivities(prevActivities =>
          prevActivities.map(activity =>
            activity._id === selectedActivity._id
              ? { ...activity, isConfirmed: true }
              : activity
          )
        );

        Alert.alert('Sucesso', 'Atividade confirmada com sucesso!');
        setConfirmModalVisible(false);
        setSelectedActivity(null);
      } else {
        const error = await response.json();
        const errorMessage =
          typeof error.message === 'string'
            ? error.message
            : 'Não foi possível confirmar a atividade.';

        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao confirmar atividade:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
    setSelectedActivity(null);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
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
            <Text style={styles.loadingText}>Carregando atividades...</Text>
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

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Atividades</Text>
          <Text style={styles.subtitle}>{rankingName}</Text>
        </View>

        {/* Filtros */}
        <View style={styles.filtersSection}>
          <View style={styles.filterRow}>
            {/* Filtro por Aluno - apenas para professores */}
            {isTeacher && (
              <View style={styles.studentFilterWrapper}>
                <TextInput
                  style={styles.studentFilterInput}
                  value={studentFilter}
                  onChangeText={setStudentFilter}
                  placeholder="Buscar por aluno..."
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {/* Filtro por Status - Dropdown */}
            <View style={[
              styles.statusFilterWrapper,
              !isTeacher && styles.statusFilterWrapperFull
            ]}>
              <TouchableOpacity
                style={styles.statusDropdownButton}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.statusDropdownText}>
                  {getStatusFilterLabel()}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {showStatusDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showStatusDropdown && (
                <View style={styles.dropdownList}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setStatusFilter('all');
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Todas</Text>
                    {statusFilter === 'all' && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setStatusFilter('confirmed');
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Aprovadas</Text>
                    {statusFilter === 'confirmed' && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setStatusFilter('pending');
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Pendentes</Text>
                    {statusFilter === 'pending' && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Filtros de Data */}
          <View style={styles.dateFilterRow}>
            <View style={styles.dateFilterGroup}>
              <TouchableOpacity
                style={styles.dateFilterButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={[
                  styles.dateFilterText,
                  !startDate && styles.dateFilterPlaceholder
                ]}>
                  {startDate ? formatDate(startDate.toISOString()) : 'Data Inicial'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateFilterGroup}>
              <TouchableOpacity
                style={styles.dateFilterButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={[
                  styles.dateFilterText,
                  !endDate && styles.dateFilterPlaceholder
                ]}>
                  {endDate ? formatDate(endDate.toISOString()) : 'Data Final'}
                </Text>
              </TouchableOpacity>
            </View>

            {(startDate || endDate) && (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={clearDateFilters}
              >
                <Text style={styles.clearDateText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* DatePickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              maximumDate={endDate || new Date()}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              minimumDate={startDate || undefined}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Lista de Atividades */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {activities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhuma atividade encontrada neste ranking.
              </Text>
            </View>
          ) : getFilteredActivities().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhuma atividade encontrada com o filtro selecionado.
              </Text>
            </View>
          ) : (
            getFilteredActivities().map((activity) => (
              <TouchableOpacity
                key={activity._id}
                activeOpacity={isTeacher && !activity.isConfirmed ? 0.7 : 1}
                onPress={() => handleActivityPress(activity)}
                disabled={!isTeacher || activity.isConfirmed}
              >
                <View style={styles.activityCard}>
                  {/* Nome do Aluno - apenas para professores */}
                  {isTeacher && (
                    <Text style={styles.studentName}>
                      Aluno: {getStudentName(activity.userId)}
                    </Text>
                  )}

                  {/* Header do Card */}
                  <View style={styles.cardHeader}>
                    <View style={styles.typeContainer}>
                      <Text style={styles.typeText}>{activity.type}</Text>
                    </View>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusColor(activity.isConfirmed) }
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(activity.isConfirmed)}
                      </Text>
                    </View>
                  </View>

                  {/* Descrição */}
                  <Text style={styles.description}>{activity.description}</Text>

                  {/* Informações da Atividade */}
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Data</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(activity.ocurredAt)}
                      </Text>
                    </View>

                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Duração</Text>
                      <Text style={styles.infoValue}>
                        {formatTime(activity.timeSpentInSeconds)}
                      </Text>
                    </View>

                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Intensidade</Text>
                      <Text style={styles.infoValue}>
                        {getIntensityLabel(activity.intesity)}
                      </Text>
                    </View>

                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Pontos</Text>
                      <Text style={styles.pointsValue}>{activity.points}</Text>
                    </View>
                  </View>

                  {/* Indicador de ação para atividades pendentes */}
                  {isTeacher && !activity.isConfirmed && (
                    <View style={styles.pendingActionHint}>
                      <Text style={styles.pendingActionText}>
                        Toque para confirmar ›
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Espaçamento final */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Modal de Confirmação */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmModalVisible}
          onRequestClose={handleCancelConfirm}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirmar Atividade</Text>
              <Text style={styles.modalMessage}>
                Deseja confirmar a atividade?
              </Text>

              {selectedActivity && (
                <View style={styles.activitySummary}>
                  <Text style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Aluno: </Text>
                    {getStudentName(selectedActivity.userId)}
                  </Text>
                  <Text style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Tipo: </Text>
                    {selectedActivity.type}
                  </Text>
                  <Text style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Descrição: </Text>
                    {selectedActivity.description}
                  </Text>
                </View>
              )}

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancelConfirm}
                  disabled={isConfirming}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirmActivity}
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  )}
                </TouchableOpacity>
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
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pointsValue: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  studentFilterWrapper: {
    flex: 1,
  },
  studentFilterInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  statusFilterWrapper: {
    position: 'relative',
    minWidth: 140,
    zIndex: 1000,
  },
  statusFilterWrapperFull: {
    flex: 1,
    minWidth: 'auto',
  },
  statusDropdownButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  statusDropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  dateFilterGroup: {
    flex: 1,
  },
  dateFilterButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  dateFilterText: {
    fontSize: 14,
    color: '#000',
  },
  dateFilterPlaceholder: {
    color: '#999',
  },
  clearDateButton: {
    backgroundColor: '#FF5252',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  clearDateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingActionHint: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  pendingActionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  activitySummary: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#2E7D32',
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
});

export default RankingActivities;