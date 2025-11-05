// app/activities.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { colors } from '@/src/styles/styles';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface para os dados de cada dispositivo
interface DeviceTime {
  hours: string;
  minutes: string;
}

// Interface para todos os dispositivos
interface ActivitiesData {
  tv: DeviceTime;
  phone: DeviceTime;
  computer: DeviceTime;
  videogame: DeviceTime;
}

// Interface para exercícios
interface ExercisesData {
  sport: DeviceTime;
  running: DeviceTime;
  walking: DeviceTime;
  general: DeviceTime;
}

const ActivitiesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tela' | 'exercicios'>('tela');
  
  // Estado para armazenar os tempos de cada dispositivo
  const [activities, setActivities] = useState<ActivitiesData>({
    tv: { hours: '0', minutes: '0' },
    phone: { hours: '0', minutes: '0' },
    computer: { hours: '0', minutes: '0' },
    videogame: { hours: '0', minutes: '0' },
  });

  // Estado para armazenar os tempos de exercícios
  const [exercises, setExercises] = useState<ExercisesData>({
    sport: { hours: '0', minutes: '0' },
    running: { hours: '0', minutes: '0' },
    walking: { hours: '0', minutes: '0' },
    general: { hours: '0', minutes: '0' },
  });

  // Função para calcular o tempo total em minutos (tempo de tela)
  const getTotalMinutes = (excludeDevice?: keyof ActivitiesData) => {
    let total = 0;
    (Object.keys(activities) as Array<keyof ActivitiesData>).forEach((device) => {
      if (device !== excludeDevice) {
        const hours = parseInt(activities[device].hours) || 0;
        const minutes = parseInt(activities[device].minutes) || 0;
        total += hours * 60 + minutes;
      }
    });
    return total;
  };

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

  // Função para verificar se pode incrementar (tempo de tela)
  const canIncrement = (
    device: keyof ActivitiesData,
    type: 'hours' | 'minutes'
  ): boolean => {
    const totalMinutes = getTotalMinutes();
    const maxMinutes = 24 * 60; // 24 horas em minutos

    if (type === 'hours') {
      return totalMinutes + 60 <= maxMinutes;
    } else {
      return totalMinutes + 1 <= maxMinutes;
    }
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

  // Função para verificar se um campo está bloqueado (tempo de tela)
  const isFieldLocked = (device: keyof ActivitiesData): boolean => {
    const currentDeviceMinutes = 
      (parseInt(activities[device].hours) || 0) * 60 + 
      (parseInt(activities[device].minutes) || 0);
    
    const totalOthersMinutes = getTotalMinutes(device);
    const maxMinutes = 24 * 60;
    
    return currentDeviceMinutes === 0 && totalOthersMinutes >= maxMinutes;
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

  // Função para incrementar/decrementar valores
  const updateTime = (
    device: keyof ActivitiesData,
    type: 'hours' | 'minutes',
    operation: 'increment' | 'decrement'
  ) => {
    // Bloqueia incremento se atingiu o limite total
    if (operation === 'increment' && !canIncrement(device, type)) {
      Alert.alert(
        'Limite atingido',
        'O tempo total de tela não pode ultrapassar 24 horas por dia.'
      );
      return;
    }

    setActivities(prev => {
      const currentValue = parseInt(prev[device][type]) || 0;
      const currentHours = parseInt(prev[device].hours) || 0;
      let newValue = currentValue;

      if (operation === 'increment') {
        if (type === 'hours') {
          newValue = Math.min(currentValue + 1, 24);
          // Se atingir 24h no dispositivo, zera os minutos
          if (newValue === 24) {
            return {
              ...prev,
              [device]: {
                hours: '24',
                minutes: '0',
              },
            };
          }
        } else {
          // Não permite incrementar minutos se horas = 24
          if (currentHours === 24) {
            return prev;
          }
          newValue = Math.min(currentValue + 1, 59);
        }
      } else {
        newValue = Math.max(currentValue - 1, 0);
        // Se estava em 24h e decrementou, permite editar minutos novamente
        if (type === 'hours' && currentHours === 24 && newValue === 23) {
          return {
            ...prev,
            [device]: {
              hours: '23',
              minutes: prev[device].minutes,
            },
          };
        }
      }

      return {
        ...prev,
        [device]: {
          ...prev[device],
          [type]: newValue.toString(),
        },
      };
    });
  };

  // Função para atualizar valor via input (exercícios)
  const handleExerciseInputChange = (
    exercise: keyof ExercisesData,
    type: 'hours' | 'minutes',
    value: string
  ) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    let finalValue = parseInt(numericValue) || 0;
    
    if (type === 'hours') {
      finalValue = Math.min(finalValue, 24);
      
      const currentExerciseMinutes = 
        (parseInt(exercises[exercise].hours) || 0) * 60 + 
        (parseInt(exercises[exercise].minutes) || 0);
      const newExerciseMinutes = finalValue * 60 + (parseInt(exercises[exercise].minutes) || 0);
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
        setExercises(prev => ({
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
      const newExerciseMinutes = (parseInt(exercises[exercise].hours) || 0) * 60 + finalValue;
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

    setExercises(prev => ({
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

    setExercises(prev => {
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
  const handleInputChange = (
    device: keyof ActivitiesData,
    type: 'hours' | 'minutes',
    value: string
  ) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Valida limites
    let finalValue = parseInt(numericValue) || 0;
    
    if (type === 'hours') {
      finalValue = Math.min(finalValue, 24);
      
      // Verifica se o novo valor não ultrapassa o limite total
      const currentDeviceMinutes = 
        (parseInt(activities[device].hours) || 0) * 60 + 
        (parseInt(activities[device].minutes) || 0);
      const newDeviceMinutes = finalValue * 60 + (parseInt(activities[device].minutes) || 0);
      const totalOthersMinutes = getTotalMinutes(device);
      const maxMinutes = 24 * 60;
      
      if (totalOthersMinutes + newDeviceMinutes > maxMinutes) {
        Alert.alert(
          'Limite atingido',
          'O tempo total de tela não pode ultrapassar 24 horas por dia.'
        );
        return;
      }
      
      // Se horas = 24, minutos deve ser 0
      if (finalValue === 24) {
        setActivities(prev => ({
          ...prev,
          [device]: {
            hours: '24',
            minutes: '0',
          },
        }));
        return;
      }
    } else {
      // Se horas = 24, não permite alterar minutos
      const currentHours = parseInt(activities[device].hours);
      if (currentHours === 24) {
        return;
      }
      
      finalValue = Math.min(finalValue, 59);
      
      // Verifica se o novo valor não ultrapassa o limite total
      const currentDeviceMinutes = 
        (parseInt(activities[device].hours) || 0) * 60 + 
        (parseInt(activities[device].minutes) || 0);
      const newDeviceMinutes = (parseInt(activities[device].hours) || 0) * 60 + finalValue;
      const totalOthersMinutes = getTotalMinutes(device);
      const maxMinutes = 24 * 60;
      
      if (totalOthersMinutes + newDeviceMinutes > maxMinutes) {
        Alert.alert(
          'Limite atingido',
          'O tempo total de tela não pode ultrapassar 24 horas por dia.'
        );
        return;
      }
    }

    setActivities(prev => ({
      ...prev,
      [device]: {
        ...prev[device],
        [type]: finalValue.toString(),
      },
    }));
  };

  // Função para salvar os dados
  const handleSave = async () => {
    try {
      // Calcular total de minutos para cada dispositivo
      const screenTimeData = {
        tv: parseInt(activities.tv.hours) * 60 + parseInt(activities.tv.minutes),
        phone: parseInt(activities.phone.hours) * 60 + parseInt(activities.phone.minutes),
        computer: parseInt(activities.computer.hours) * 60 + parseInt(activities.computer.minutes),
        videogame: parseInt(activities.videogame.hours) * 60 + parseInt(activities.videogame.minutes),
        timestamp: new Date().toISOString(),
      };

      // Calcular total de minutos para cada exercício
      const exerciseData = {
        sport: parseInt(exercises.sport.hours) * 60 + parseInt(exercises.sport.minutes),
        running: parseInt(exercises.running.hours) * 60 + parseInt(exercises.running.minutes),
        walking: parseInt(exercises.walking.hours) * 60 + parseInt(exercises.walking.minutes),
        general: parseInt(exercises.general.hours) * 60 + parseInt(exercises.general.minutes),
        timestamp: new Date().toISOString(),
      };

      console.log('Dados de tempo de tela salvos:', screenTimeData);
      console.log('Dados de exercícios salvos:', exerciseData);
      
      // Aqui você pode:
      // 1. Salvar no AsyncStorage separadamente
      // await AsyncStorage.setItem('screen_time_data', JSON.stringify(screenTimeData));
      // await AsyncStorage.setItem('exercise_data', JSON.stringify(exerciseData));
      // 2. Enviar para uma API
      // 3. Salvar em Context/Redux
      
      Alert.alert('Sucesso', 'Atividades registradas com sucesso!');
      
      // Resetar valores após salvar
      setActivities({
        tv: { hours: '0', minutes: '0' },
        phone: { hours: '0', minutes: '0' },
        computer: { hours: '0', minutes: '0' },
        videogame: { hours: '0', minutes: '0' },
      });
      
      setExercises({
        sport: { hours: '0', minutes: '0' },
        running: { hours: '0', minutes: '0' },
        walking: { hours: '0', minutes: '0' },
        general: { hours: '0', minutes: '0' },
      });
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  // Componente para renderizar cada linha de dispositivo
  const DeviceRow = ({
    device,
    icon,
  }: {
    device: keyof ActivitiesData;
    icon: any;
  }) => (
    <View style={styles.deviceRow}>
      {/* Ícone do dispositivo */}
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.deviceIcon} resizeMode="contain" />
      </View>

      {/* Controles de Horas */}
      <View style={styles.timeControl}>
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.controlButtonLeft}
            onPress={() => updateTime(device, 'hours', 'decrement')}
          >
            <Text style={styles.controlButtonText}>−</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            style={[
              styles.timeInput,
              isFieldLocked(device) && styles.timeInputDisabled
            ]}
            value={activities[device].hours}
            onChangeText={(value) => handleInputChange(device, 'hours', value)}
            keyboardType="numeric"
            maxLength={2}
            placeholder="H"
            placeholderTextColor="#999"
            editable={!isFieldLocked(device)}
          />

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.controlButtonRight}
            onPress={() => updateTime(device, 'hours', 'increment')}
            disabled={!canIncrement(device, 'hours') || isFieldLocked(device)}
          >
            <Text style={[
              styles.controlButtonText,
              (!canIncrement(device, 'hours') || isFieldLocked(device)) && styles.controlButtonDisabled
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Controles de Minutos */}
      <View style={styles.timeControl}>
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.controlButtonLeft}
            onPress={() => updateTime(device, 'minutes', 'decrement')}
            disabled={parseInt(activities[device].hours) === 24}
          >
            <Text style={[
              styles.controlButtonText,
              parseInt(activities[device].hours) === 24 && styles.controlButtonDisabled
            ]}>−</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            style={[
              styles.timeInput,
              (parseInt(activities[device].hours) === 24 || isFieldLocked(device)) && styles.timeInputDisabled
            ]}
            value={activities[device].minutes}
            onChangeText={(value) => handleInputChange(device, 'minutes', value)}
            keyboardType="numeric"
            maxLength={2}
            placeholder="mm"
            placeholderTextColor="#999"
            editable={parseInt(activities[device].hours) !== 24 && !isFieldLocked(device)}
          />

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.controlButtonRight}
            onPress={() => updateTime(device, 'minutes', 'increment')}
            disabled={
              parseInt(activities[device].hours) === 24 || 
              !canIncrement(device, 'minutes') || 
              isFieldLocked(device)
            }
          >
            <Text style={[
              styles.controlButtonText,
              (parseInt(activities[device].hours) === 24 || 
               !canIncrement(device, 'minutes') || 
               isFieldLocked(device)) && styles.controlButtonDisabled
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
              isExerciseFieldLocked(exercise) && styles.timeInputDisabled
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
            disabled={!canIncrementExercise(exercise, 'hours') || isExerciseFieldLocked(exercise)}
          >
            <Text style={[
              styles.controlButtonText,
              (!canIncrementExercise(exercise, 'hours') || isExerciseFieldLocked(exercise)) && styles.controlButtonDisabled
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Controles de Minutos */}
      <View style={styles.timeControl}>
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.controlButtonLeft}
            onPress={() => updateExerciseTime(exercise, 'minutes', 'decrement')}
            disabled={parseInt(exercises[exercise].hours) === 24}
          >
            <Text style={[
              styles.controlButtonText,
              parseInt(exercises[exercise].hours) === 24 && styles.controlButtonDisabled
            ]}>−</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            style={[
              styles.timeInput,
              (parseInt(exercises[exercise].hours) === 24 || isExerciseFieldLocked(exercise)) && styles.timeInputDisabled
            ]}
            value={exercises[exercise].minutes}
            onChangeText={(value) => handleExerciseInputChange(exercise, 'minutes', value)}
            keyboardType="numeric"
            maxLength={2}
            placeholder="mm"
            placeholderTextColor="#999"
            editable={parseInt(exercises[exercise].hours) !== 24 && !isExerciseFieldLocked(exercise)}
          />

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.controlButtonRight}
            onPress={() => updateExerciseTime(exercise, 'minutes', 'increment')}
            disabled={
              parseInt(exercises[exercise].hours) === 24 || 
              !canIncrementExercise(exercise, 'minutes') || 
              isExerciseFieldLocked(exercise)
            }
          >
            <Text style={[
              styles.controlButtonText,
              (parseInt(exercises[exercise].hours) === 24 || 
               !canIncrementExercise(exercise, 'minutes') || 
               isExerciseFieldLocked(exercise)) && styles.controlButtonDisabled
            ]}>+</Text>
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
              style={[styles.tabButton, activeTab === 'tela' && styles.tabButtonActive]}
              onPress={() => setActiveTab('tela')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'tela' && styles.tabButtonTextActive]}>
                Tela
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'exercicios' && styles.tabButtonActive]}
              onPress={() => setActiveTab('exercicios')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'exercicios' && styles.tabButtonTextActive]}>
                Exercícios
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo baseado na tab ativa */}
          {activeTab === 'tela' ? (
            <View style={styles.devicesContainer}>
              {/* TV */}
              <DeviceRow
                device="tv"
                icon={require('@/assets/images/tv_icon.png')}
              />

              {/* Celular */}
              <DeviceRow
                device="phone"
                icon={require('@/assets/images/phone_icon.png')}
              />

              {/* Computador */}
              <DeviceRow
                device="computer"
                icon={require('@/assets/images/computer_icon.png')}
              />

              {/* Videogame */}
              <DeviceRow
                device="videogame"
                icon={require('@/assets/images/videogame_icon.png')}
              />
            </View>
          ) : (
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
          )}

          {/* Botão Salvar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.white,
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

  // Estado vazio (tab Exercícios)
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ActivitiesScreen;