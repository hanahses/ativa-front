// app/activities.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { useAuth } from '@/src/context/authContext';
import { API_BASE_URL } from '@/src/services/authService';
import { colors } from '@/src/styles/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface para os dados de cada exercício
interface DeviceTime {
  hours: string;
  minutes: string;
}

// Interface para todos os exercícios
interface ExercisesData {
  sport: DeviceTime;
  running: DeviceTime;
  walking: DeviceTime;
  general: DeviceTime;
}

// Interface para atividades do histórico
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

const ActivitiesScreen: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'exercicios' | 'historico'>('exercicios');

  // Estado para armazenar os tempos de exercícios
  const [exercises, setExercises] = useState<ExercisesData>({
    sport: { hours: '', minutes: '' },
    running: { hours: '', minutes: '' },
    walking: { hours: '', minutes: '' },
    general: { hours: '', minutes: '' },
  });

  // Estados para o histórico
  const [historyActivities, setHistoryActivities] = useState<Activity[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyStartDate, setHistoryStartDate] = useState<Date | null>(null);
  const [historyEndDate, setHistoryEndDate] = useState<Date | null>(null);
  const [showHistoryStartDatePicker, setShowHistoryStartDatePicker] = useState(false);
  const [showHistoryEndDatePicker, setShowHistoryEndDatePicker] = useState(false);

  // Carregar histórico quando a aba for selecionada
  useEffect(() => {
    if (activeTab === 'historico') {
      fetchUserHistory();
    }
  }, [activeTab]);

  // Função para calcular o tempo total de exercícios em minutos
  const getTotalExerciseMinutes = (excludeExercise?: keyof ExercisesData) => {
    let total = 0;
    (Object.keys(exercises) as Array<keyof ExercisesData>).forEach((exercise) => {
      if (exercise !== excludeExercise) {
        const hours = parseInt(exercises[exercise].hours) || 0;
        const minutes = parseInt(exercises[exercise].minutes) || 0;
        total += hours * 60 + minutes;
      }
    });
    return total;
  };

  // Função para verificar se pode incrementar (exercícios)
  const canIncrementExercise = (
    exercise: keyof ExercisesData,
    type: 'hours' | 'minutes'
  ): boolean => {
    const totalMinutes = getTotalExerciseMinutes();
    const maxMinutes = 24 * 60; // 24 horas em minutos

    if (type === 'hours') {
      return totalMinutes + 60 <= maxMinutes;
    } else {
      return totalMinutes + 1 <= maxMinutes;
    }
  };

  // Função para verificar se um campo de exercício está bloqueado
  const isExerciseFieldLocked = (exercise: keyof ExercisesData): boolean => {
    const currentExerciseMinutes =
      (parseInt(exercises[exercise].hours) || 0) * 60 +
      (parseInt(exercises[exercise].minutes) || 0);

    const totalOthersMinutes = getTotalExerciseMinutes(exercise);
    const maxMinutes = 24 * 60;

    return currentExerciseMinutes === 0 && totalOthersMinutes >= maxMinutes;
  };

  // Função para atualizar valor via input (exercícios)
  const handleExerciseInputChange = (
    exercise: keyof ExercisesData,
    type: 'hours' | 'minutes',
    value: string
  ) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue === '') {
      setExercises((prev) => ({
        ...prev,
        [exercise]: {
          ...prev[exercise],
          [type]: '',
        },
      }));
      return;
    }

    let finalValue = parseInt(numericValue) || 0;

    if (type === 'hours') {
      finalValue = Math.min(finalValue, 24);

      const currentExerciseMinutes =
        (parseInt(exercises[exercise].hours) || 0) * 60 +
        (parseInt(exercises[exercise].minutes) || 0);
      const newExerciseMinutes =
        finalValue * 60 + (parseInt(exercises[exercise].minutes) || 0);
      const totalOthersMinutes = getTotalExerciseMinutes(exercise);
      const maxMinutes = 24 * 60;

      if (totalOthersMinutes + newExerciseMinutes > maxMinutes) {
        Alert.alert(
          'Limite atingido',
          'O tempo total de exercícios não pode ultrapassar 24 horas por dia.'
        );
        return;
      }

      if (finalValue === 24) {
        setExercises((prev) => ({
          ...prev,
          [exercise]: {
            hours: '24',
            minutes: '0',
          },
        }));
        return;
      }
    } else {
      const currentHours = parseInt(exercises[exercise].hours);
      if (currentHours === 24) {
        return;
      }

      finalValue = Math.min(finalValue, 59);

      const currentExerciseMinutes =
        (parseInt(exercises[exercise].hours) || 0) * 60 +
        (parseInt(exercises[exercise].minutes) || 0);
      const newExerciseMinutes =
        (parseInt(exercises[exercise].hours) || 0) * 60 + finalValue;
      const totalOthersMinutes = getTotalExerciseMinutes(exercise);
      const maxMinutes = 24 * 60;

      if (totalOthersMinutes + newExerciseMinutes > maxMinutes) {
        Alert.alert(
          'Limite atingido',
          'O tempo total de exercícios não pode ultrapassar 24 horas por dia.'
        );
        return;
      }
    }

    setExercises((prev) => ({
      ...prev,
      [exercise]: {
        ...prev[exercise],
        [type]: finalValue.toString(),
      },
    }));
  };

  // Função para incrementar/decrementar valores (exercícios)
  const updateExerciseTime = (
    exercise: keyof ExercisesData,
    type: 'hours' | 'minutes',
    operation: 'increment' | 'decrement'
  ) => {
    if (operation === 'increment' && !canIncrementExercise(exercise, type)) {
      Alert.alert(
        'Limite atingido',
        'O tempo total de exercícios não pode ultrapassar 24 horas por dia.'
      );
      return;
    }

    setExercises((prev) => {
      const currentValue = parseInt(prev[exercise][type]) || 0;
      const currentHours = parseInt(prev[exercise].hours) || 0;
      let newValue = currentValue;

      if (operation === 'increment') {
        if (type === 'hours') {
          newValue = Math.min(currentValue + 1, 24);
          if (newValue === 24) {
            return {
              ...prev,
              [exercise]: {
                hours: '24',
                minutes: '0',
              },
            };
          }
        } else {
          if (currentHours === 24) {
            return prev;
          }
          newValue = Math.min(currentValue + 1, 59);
        }
      } else {
        newValue = Math.max(currentValue - 1, 0);
        if (type === 'hours' && currentHours === 24 && newValue === 23) {
          return {
            ...prev,
            [exercise]: {
              hours: '23',
              minutes: prev[exercise].minutes,
            },
          };
        }
      }

      return {
        ...prev,
        [exercise]: {
          ...prev[exercise],
          [type]: newValue.toString(),
        },
      };
    });
  };

  // Mapeamento dos tipos de exercício para o backend
  const exerciseTypeMap = {
    sport: 'Esporte',
    running: 'Corrida',
    walking: 'Caminhada',
    general: 'Geral',
  };

  const exerciseDescriptionMap = {
    sport: 'Atividade esportiva registrada',
    running: 'Corrida registrada',
    walking: 'Caminhada registrada',
    general: 'Exercício geral registrado',
  };

  // Função para buscar histórico de atividades
  const fetchUserHistory = async () => {
    setIsLoadingHistory(true);

    try {
      const isTeacher = userProfile?.user?.role === 1;
      const userId = isTeacher
        ? userProfile?.user?._id
        : userProfile?.studentData?.userId;

      if (!userId) {
        console.error('ID do usuário não encontrado');
        setIsLoadingHistory(false);
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

        // Ordena por data de ocorrência (mais recente primeiro)
        const sortedActivities = data.sort(
          (a: Activity, b: Activity) =>
            new Date(b.ocurredAt).getTime() - new Date(a.ocurredAt).getTime()
        );

        setHistoryActivities(sortedActivities);
      } else {
        console.error('Erro ao carregar histórico');
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para filtrar atividades do histórico
  const getFilteredHistory = () => {
    let filtered = historyActivities;

    // Filtro por data inicial
    if (historyStartDate) {
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.ocurredAt);
        const start = new Date(historyStartDate);
        start.setHours(0, 0, 0, 0);
        return activityDate >= start;
      });
    }

    // Filtro por data final
    if (historyEndDate) {
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.ocurredAt);
        const end = new Date(historyEndDate);
        end.setHours(23, 59, 59, 999);
        return activityDate <= end;
      });
    }

    return filtered;
  };

  // Função para limpar filtros de data
  const clearHistoryDateFilters = () => {
    setHistoryStartDate(null);
    setHistoryEndDate(null);
  };

  // Handlers para os date pickers
  const handleHistoryStartDateChange = (event: any, selectedDate?: Date) => {
    setShowHistoryStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setHistoryStartDate(selectedDate);
    }
  };

  const handleHistoryEndDateChange = (event: any, selectedDate?: Date) => {
    setShowHistoryEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setHistoryEndDate(selectedDate);
    }
  };

  // Função para salvar os dados
  const handleSave = async () => {
    try {
      // Verificar o tipo de usuário e pegar o ID correto
      const isTeacher = userProfile?.user?.role === 1;
      const userId = isTeacher
        ? userProfile?.user?._id
        : userProfile?.studentData?.userId;

      if (!userId) {
        Alert.alert('Erro', 'ID do usuário não encontrado.');
        return;
      }

      // Verificar se pelo menos um exercício foi preenchido
      const hasExerciseData = Object.keys(exercises).some((key) => {
        const exercise = exercises[key as keyof ExercisesData];
        return exercise.hours !== '' || exercise.minutes !== '';
      });

      if (!hasExerciseData) {
        Alert.alert('Atenção', 'Preencha pelo menos um exercício antes de salvar.');
        return;
      }

      // Enviar cada exercício que tiver tempo preenchido
      const exercisePromises = Object.keys(exercises).map(async (key) => {
        const exerciseKey = key as keyof ExercisesData;
        const exercise = exercises[exerciseKey];
        const timeInSeconds =
          parseInt(exercise.hours || '0') * 3600 +
          parseInt(exercise.minutes || '0') * 60;

        // Só envia se tiver tempo maior que 0
        if (timeInSeconds > 0) {
          const payload = {
            ocurredAt: new Date().toISOString(),
            type: exerciseTypeMap[exerciseKey],
            description: exerciseDescriptionMap[exerciseKey],
            timeSpentInSeconds: timeInSeconds,
            intesity: 1,
          };

          const response = await fetch(
            `${API_BASE_URL}/activities/student/${userId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao salvar exercício');
          }

          return response.json();
        }
      });

      await Promise.all(exercisePromises.filter(Boolean));

      Alert.alert('Sucesso', 'Exercícios registrados com sucesso!');

      // Resetar valores após salvar
      setExercises({
        sport: { hours: '', minutes: '' },
        running: { hours: '', minutes: '' },
        walking: { hours: '', minutes: '' },
        general: { hours: '', minutes: '' },
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  // Componente para renderizar cada linha de exercício
  const ExerciseRow = ({
    exercise,
    icon,
  }: {
    exercise: keyof ExercisesData;
    icon: any;
  }) => (
    <View style={styles.deviceRow}>
      {/* Ícone do exercício */}
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.deviceIcon} resizeMode="contain" />
      </View>

      {/* Controles de Horas */}
      <View style={styles.timeControl}>
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.controlButtonLeft}
            onPress={() => updateExerciseTime(exercise, 'hours', 'decrement')}
          >
            <Text style={styles.controlButtonText}>−</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            style={[
              styles.timeInput,
              isExerciseFieldLocked(exercise) && styles.timeInputDisabled,
            ]}
            value={exercises[exercise].hours}
            onChangeText={(value) => handleExerciseInputChange(exercise, 'hours', value)}
            keyboardType="numeric"
            maxLength={2}
            placeholder="H"
            placeholderTextColor="#999"
            editable={!isExerciseFieldLocked(exercise)}
          />

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.controlButtonRight}
            onPress={() => updateExerciseTime(exercise, 'hours', 'increment')}
            disabled={
              !canIncrementExercise(exercise, 'hours') ||
              isExerciseFieldLocked(exercise)
            }
          >
            <Text
              style={[
                styles.controlButtonText,
                (!canIncrementExercise(exercise, 'hours') ||
                  isExerciseFieldLocked(exercise)) &&
                  styles.controlButtonDisabled,
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Controles de Minutos */}
      <View style={styles.timeControl}>
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.controlButtonLeft}
            onPress={() => updateExerciseTime(exercise, 'minutes', 'decrement')}
            disabled={parseInt(exercises[exercise].hours || '0') === 24}
          >
            <Text
              style={[
                styles.controlButtonText,
                parseInt(exercises[exercise].hours || '0') === 24 &&
                  styles.controlButtonDisabled,
              ]}
            >
              −
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            style={[
              styles.timeInput,
              (parseInt(exercises[exercise].hours || '0') === 24 ||
                isExerciseFieldLocked(exercise)) &&
                styles.timeInputDisabled,
            ]}
            value={exercises[exercise].minutes}
            onChangeText={(value) =>
              handleExerciseInputChange(exercise, 'minutes', value)
            }
            keyboardType="numeric"
            maxLength={2}
            placeholder="mm"
            placeholderTextColor="#999"
            editable={
              parseInt(exercises[exercise].hours || '0') !== 24 &&
              !isExerciseFieldLocked(exercise)
            }
          />

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.controlButtonRight}
            onPress={() => updateExerciseTime(exercise, 'minutes', 'increment')}
            disabled={
              parseInt(exercises[exercise].hours || '0') === 24 ||
              !canIncrementExercise(exercise, 'minutes') ||
              isExerciseFieldLocked(exercise)
            }
          >
            <Text
              style={[
                styles.controlButtonText,
                (parseInt(exercises[exercise].hours || '0') === 24 ||
                  !canIncrementExercise(exercise, 'minutes') ||
                  isExerciseFieldLocked(exercise)) &&
                  styles.controlButtonDisabled,
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <AppHeader showMenuButton={true} showStatsButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Título */}
          <Text style={styles.title}>Registro de atividades</Text>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'exercicios' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('exercicios')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'exercicios' && styles.tabButtonTextActive,
                ]}
              >
                Exercícios
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'historico' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('historico')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'historico' && styles.tabButtonTextActive,
                ]}
              >
                Histórico
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo baseado na tab ativa */}
          {activeTab === 'exercicios' ? (
            <View style={styles.devicesContainer}>
              {/* Sport */}
              <ExerciseRow
                exercise="sport"
                icon={require('@/assets/images/sport_icon.png')}
              />

              {/* Running */}
              <ExerciseRow
                exercise="running"
                icon={require('@/assets/images/running_icon.png')}
              />

              {/* Walking */}
              <ExerciseRow
                exercise="walking"
                icon={require('@/assets/images/walking_icon.png')}
              />

              {/* General */}
              <ExerciseRow
                exercise="general"
                icon={require('@/assets/images/general_icon.png')}
              />
            </View>
          ) : (
            <View style={styles.historyContainer}>
              {/* Filtros de Data */}
              <View style={styles.historyDateFilterRow}>
                <View style={styles.historyDateFilterGroup}>
                  <TouchableOpacity
                    style={styles.historyDateFilterButton}
                    onPress={() => setShowHistoryStartDatePicker(true)}
                  >
                    <Text
                      style={[
                        styles.historyDateFilterText,
                        !historyStartDate && styles.historyDateFilterPlaceholder,
                      ]}
                    >
                      {historyStartDate
                        ? formatDate(historyStartDate.toISOString())
                        : 'Data Inicial'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.historyDateFilterGroup}>
                  <TouchableOpacity
                    style={styles.historyDateFilterButton}
                    onPress={() => setShowHistoryEndDatePicker(true)}
                  >
                    <Text
                      style={[
                        styles.historyDateFilterText,
                        !historyEndDate && styles.historyDateFilterPlaceholder,
                      ]}
                    >
                      {historyEndDate
                        ? formatDate(historyEndDate.toISOString())
                        : 'Data Final'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {(historyStartDate || historyEndDate) && (
                  <TouchableOpacity
                    style={styles.historyClearDateButton}
                    onPress={clearHistoryDateFilters}
                  >
                    <Text style={styles.historyClearDateText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* DatePickers */}
              {showHistoryStartDatePicker && (
                <DateTimePicker
                  value={historyStartDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleHistoryStartDateChange}
                  maximumDate={historyEndDate || new Date()}
                />
              )}

              {showHistoryEndDatePicker && (
                <DateTimePicker
                  value={historyEndDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleHistoryEndDateChange}
                  minimumDate={historyStartDate || undefined}
                  maximumDate={new Date()}
                />
              )}

              {/* Lista de Atividades */}
              {isLoadingHistory ? (
                <View style={styles.historyLoadingContainer}>
                  <Text style={styles.historyLoadingText}>Carregando histórico...</Text>
                </View>
              ) : getFilteredHistory().length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {historyActivities.length === 0
                      ? 'Nenhuma atividade registrada ainda.'
                      : 'Nenhuma atividade encontrada no período selecionado.'}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.historyScrollView}
                  showsVerticalScrollIndicator={true}
                >
                  {getFilteredHistory().map((activity) => (
                    <View key={activity._id} style={styles.historyCard}>
                      <View style={styles.historyCardHeader}>
                        <Text style={styles.historyCardType}>{activity.type}</Text>
                      </View>
                      <Text style={styles.historyCardDate}>
                        Realizada em: {formatDate(activity.ocurredAt)}
                      </Text>
                    </View>
                  ))}
                  <View style={{ height: 20 }} />
                </ScrollView>
              )}
            </View>
          )}

          {/* Botão Salvar - apenas na aba exercícios */}
          {activeTab === 'exercicios' && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          )}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  // Container dos dispositivos
  devicesContainer: {
    gap: 45,
  },

  // Linha de cada dispositivo
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    gap: 10,
  },

  // Ícone
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 40,
    height: 40,
    tintColor: colors.white,
  },

  // Controles de tempo
  timeControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Grupo de input (botões + input juntos)
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 4,
    overflow: 'hidden',
    height: 38,
  },

  // Divisor vertical entre botões e input
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#ccc',
  },

  controlButtonLeft: {
    width: 40,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },

  controlButtonRight: {
    width: 40,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },

  controlButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },

  controlButtonDisabled: {
    opacity: 0.3,
  },

  timeInput: {
    width: 50,
    height: 38,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    paddingVertical: 0,
  },

  timeInputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },

  // Botão Salvar
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
    marginHorizontal: 90,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Estado vazio
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Histórico
  historyContainer: {
    flex: 1,
  },
  historyDateFilterRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  historyDateFilterGroup: {
    flex: 1,
  },
  historyDateFilterButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  historyDateFilterText: {
fontSize: 14,
color: '#000',
textAlign: 'center',
},
historyDateFilterPlaceholder: {
color: '#999',
},
historyClearDateButton: {
backgroundColor: '#FF5252',
borderRadius: 8,
width: 40,
height: 44,
justifyContent: 'center',
alignItems: 'center',
},
historyClearDateText: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: 'bold',
},
historyLoadingContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
paddingVertical: 60,
},
historyLoadingText: {
fontSize: 16,
color: '#666',
},
historyScrollView: {
flex: 1,
},
historyCard: {
backgroundColor: colors.primary,
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
historyCardHeader: {
marginBottom: 8,
},
historyCardType: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: 'bold',
},
historyCardDate: {
color: 'rgba(255, 255, 255, 0.9)',
fontSize: 14,
fontWeight: '500',
},
});
export default ActivitiesScreen;