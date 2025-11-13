// app/profile.tsx
import AppHeader from '@/src/components/header';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { useAuth } from '@/src/context/authContext';
import { API_BASE_URL } from '@/src/services/authService';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface PersonalInfoData {
  name: string;
  birthdate: string;
  school: string;
  city: string;
  gre?: string;
}

interface StudentData {
  weightInGrams: number;
  heightInCm: number;
  gender: string;
}

const ProfileScreen: React.FC = () => {
  // ✅ Usando o contexto de autenticação
  const { userProfile, isLoading, refreshUserProfile } = useAuth();

  // Estados para informações pessoais
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [displayDate, setDisplayDate] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);
  const [school, setSchool] = useState('');
  const [city, setCity] = useState('');
  const [gre, setGre] = useState('');

  // Estados para dados do estudante
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');

  // Estados de loading
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  // ✅ Carrega os dados do usuário quando o perfil estiver disponível
  useEffect(() => {
    if (userProfile) {
      // Dados pessoais
      setName(userProfile.user.name || '');
      setSchool(userProfile.user.school || '');
      setCity(userProfile.user.city || '');
      setGre(userProfile.user.gre || '');

      // Data de nascimento
      if (userProfile.user.birthdate) {
        const date = new Date(userProfile.user.birthdate);
        setBirthDate(date);
        setDisplayDate(date.toLocaleDateString('pt-BR'));
      }

      // Dados do estudante - com verificação de null
      if (userProfile.studentData) {
        // Verifica se weightInGrams não é null antes de converter
        if (userProfile.studentData.weightInGrams != null) {
          setWeight((userProfile.studentData.weightInGrams / 1000).toString());
        }
        
        // Verifica se heightInCm não é null antes de converter
        if (userProfile.studentData.heightInCm != null) {
          setHeight(userProfile.studentData.heightInCm.toString());
        }
        
        // Converte gender de inglês para português se não for null
        if (userProfile.studentData.gender) {
          const genderPt = userProfile.studentData.gender === 'Male' ? 'Masculino' : 'Feminino';
          setGender(genderPt);
        }
      }
    }
  }, [userProfile]);

  // Função para salvar informações pessoais
  const savePersonalInfo = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o nome.');
      return;
    }

    if (!displayDate) {
      Alert.alert('Atenção', 'Por favor, selecione a data de nascimento.');
      return;
    }

    if (!userProfile?.user.email) {
      Alert.alert('Erro', 'Email do usuário não encontrado.');
      return;
    }

    setIsSavingPersonal(true);

    try {
      const isoDate = birthDate.toISOString();

      const data: PersonalInfoData = {
        name: name.trim(),
        birthdate: isoDate,
        school: school.trim(),
        city: city.trim(),
        gre: gre.trim() || undefined, // ✅ Inclui GRE se preenchido
      };

      const response = await fetch(`${API_BASE_URL}/users/personal-info/${userProfile.user.email}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Informações pessoais atualizadas!');
        // ✅ Atualiza o perfil no contexto
        await refreshUserProfile();
      } else {
        const error = await response.json();
        const errorMessage =
          typeof error.message === 'string'
            ? error.message
            : Array.isArray(error.message)
              ? error.message.join(', ')
              : JSON.stringify(error.message);

        Alert.alert('Erro', errorMessage || 'Não foi possível atualizar os dados.');
      }
    } catch (error) {
      console.error('Erro ao salvar informações pessoais:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Função para salvar dados do estudante
  const saveStudentData = async () => {
    if (!weight.trim() || !height.trim() || !gender.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos (peso, altura e sexo).');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum)) {
      Alert.alert('Atenção', 'Por favor, insira valores numéricos válidos.');
      return;
    }

    if (!userProfile?.user.email) {
      Alert.alert('Erro', 'Email do usuário não encontrado.');
      return;
    }

    setIsSavingStudent(true);

    try {
      const weightInGrams = Math.round(weightNum * 1000);
      const heightInCm = Math.round(heightNum);
      const genderInEnglish = gender === 'Masculino' ? 'Male' : 'Female';

      const data: StudentData = {
        weightInGrams: weightInGrams,
        heightInCm: heightInCm,
        gender: genderInEnglish,
      };

      const response = await fetch(`${API_BASE_URL}/users/students/data/${userProfile.user.email}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Dados de peso e altura atualizados!');
        // ✅ Atualiza o perfil no contexto
        await refreshUserProfile();
      } else {
        const error = await response.json();
        const errorMessage =
          typeof error.message === 'string'
            ? error.message
            : Array.isArray(error.message)
              ? error.message.join(', ')
              : JSON.stringify(error.message);

        Alert.alert('Erro', errorMessage || 'Não foi possível atualizar os dados.');
      }
    } catch (error) {
      console.error('Erro ao salvar dados do estudante:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsSavingStudent(false);
    }
  };

  // Handler para mudança de data
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setBirthDate(selectedDate);
      const formatted = selectedDate.toLocaleDateString('pt-BR');
      setDisplayDate(formatted);
    }
  };

  // ✅ Exibe loading enquanto carrega os dados
  if (isLoading) {
    return (
      <ProtectedRoute>
        <View style={styles.container}>
          <AppHeader showMenuButton={true} showStatsButton={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D9FF" />
            <Text style={styles.loadingText}>Carregando perfil...</Text>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  // ✅ Verifica se o perfil foi carregado
  if (!userProfile) {
    return (
      <ProtectedRoute>
        <View style={styles.container}>
          <AppHeader showMenuButton={true} showStatsButton={true} />
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Erro ao carregar perfil</Text>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <AppHeader showMenuButton={true} showStatsButton={true} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Título */}
          <Text style={styles.mainTitle}>MEU PERFIL</Text>

          {/* Card 1 - Informações Pessoais */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarIcon}>👤</Text>
                </View>
              </View>
            </View>

            {/* Nome */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>NOME</Text>
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <View style={styles.divider} />

            {/* Email (não editável) */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>E-MAIL</Text>
            </View>
            <Text style={styles.valueNonEditable}>{userProfile.user.email}</Text>
            <View style={styles.divider} />

            {/* Escola */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>ESCOLA</Text>
            </View>
            <TextInput
              style={styles.input}
              value={school}
              onChangeText={setSchool}
              placeholder="Digite o nome da escola"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <View style={styles.divider} />

            {/* Cidade */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>CIDADE</Text>
            </View>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Digite sua cidade"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <View style={styles.divider} />

            {/* Data de Nascimento */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>DATA DE NASCIMENTO</Text>
            </View>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <View style={styles.dateInputContainer}>
                <Text style={[styles.dateInput, !displayDate && styles.dateInputPlaceholder]}>
                  {displayDate || 'Selecione a data'}
                </Text>
              </View>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onDateChange}
              />
            )}
            <View style={styles.divider} />

            {/* GRE */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>GRE</Text>
            </View>
            <TextInput
              style={styles.input}
              value={gre}
              onChangeText={setGre}
              placeholder="Digite sua GRE"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <View style={styles.divider} />

            {/* Botão Salvar Informações Pessoais */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={savePersonalInfo}
              disabled={isSavingPersonal}
            >
              <Text style={styles.saveButtonText}>
                {isSavingPersonal ? 'Salvando...' : 'Salvar Informações'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Seção - Informações sobre Peso e Altura */}
          <Text style={styles.sectionTitle}>INFORMAÇÕES SOBRE PESO E ALTURA</Text>

          {/* Card 2 - Peso e Altura */}
          <View style={styles.card}>
            <View style={styles.infoRowWithIcon}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>⚖️</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>PESO (KG)</Text>
                <TextInput
                  style={styles.inputInline}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Ex: 65"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRowWithIcon}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📏</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>ALTURA (CM)</Text>
                <TextInput
                  style={styles.inputInline}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Ex: 170"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.divider} />

            {/* Sexo */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>SEXO</Text>
            </View>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'Masculino' && styles.genderButtonActive
                ]}
                onPress={() => setGender('Masculino')}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'Masculino' && styles.genderButtonTextActive
                ]}>Masculino ♂</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'Feminino' && styles.genderButtonActive
                ]}
                onPress={() => setGender('Feminino')}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'Feminino' && styles.genderButtonTextActive
                ]}>Feminino ♀</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            {/* Botão Salvar Dados do Estudante */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveStudentData}
              disabled={isSavingStudent}
            >
              <Text style={styles.saveButtonText}>
                {isSavingStudent ? 'Salvando...' : 'Salvar Dados'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Espaçamento final */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2B5D36',
  },
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
    width: CARD_WIDTH,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#3A7248',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputInline: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateInput: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  dateInputPlaceholder: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  valueNonEditable: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 15,
    opacity: 0.7,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#3A7248',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  saveButtonText: {
    color: '#3A7248',
    fontSize: 14,
    fontWeight: 'bold',
  },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
});

export default ProfileScreen;