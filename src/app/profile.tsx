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
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

// Opções de GRE
const GRE_OPTIONS = [
  'Recife Norte',
  'Recife Sul',
  'Metropolitana Norte',
  'Metropolitana Sul',
  'Mata Norte',
  'Mata Centro',
  'Mata Sul',
  'Vale do Capibaribe',
  'Agreste Centro Norte',
  'Agreste Meridional',
  'Sertão do Moxotó Ipanema',
  'Sertão do Alto Pajeú',
  'Sertão do Submédio São Francisco',
  'Sertão do Médio São Francisco',
  'Sertão Central',
  'Sertão do Araripe',
];

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

// Funções de validação
const removeNumbers = (text: string) => {
  return text.replace(/[0-9]/g, '');
};

const removeNonNumeric = (text: string) => {
  return text.replace(/[^0-9.]/g, '');
};

const ProfileScreen: React.FC = () => {
  const { userProfile, isLoading, refreshUserProfile } = useAuth();

  // Verifica se o usuário é aluno (role diferente de 1 = não é professor)
  const isStudent = userProfile?.user?.role !== 1;

  // Estado para controlar o modo de edição
  const [isEditing, setIsEditing] = useState(false);

  // Estados para informações pessoais
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [displayDate, setDisplayDate] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);
  const [school, setSchool] = useState('');
  const [city, setCity] = useState('');
  const [gre, setGre] = useState('');
  const [showGrePicker, setShowGrePicker] = useState(false);

  // Estados para dados do estudante
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');

  // Estados para armazenar valores originais (para cancelar edição)
  const [originalValues, setOriginalValues] = useState({
    name: '',
    birthDate: new Date(),
    displayDate: '',
    school: '',
    city: '',
    gre: '',
    weight: '',
    height: '',
    gender: '',
  });

  // Estado de loading para salvar
  const [isSaving, setIsSaving] = useState(false);

  // Carrega os dados do usuário quando o perfil estiver disponível
  useEffect(() => {
    if (userProfile) {
      // Dados pessoais
      const userName = userProfile.user.name || '';
      const userSchool = userProfile.user.school || '';
      const userCity = userProfile.user.city || '';
      const userGre = userProfile.user.gre || '';

      setName(userName);
      setSchool(userSchool);
      setCity(userCity);
      setGre(userGre);

      // Data de nascimento
      let userBirthDate = new Date();
      let userDisplayDate = '';
      
      if (userProfile.user.birthdate) {
        const date = new Date(userProfile.user.birthdate);
        userBirthDate = date;
        userDisplayDate = date.toLocaleDateString('pt-BR');
        setBirthDate(date);
        setDisplayDate(userDisplayDate);
      }

      // Dados do estudante - apenas se for aluno
      let userWeight = '';
      let userHeight = '';
      let userGender = '';

      if (isStudent && userProfile.studentData) {
        if (userProfile.studentData.weightInGrams != null) {
          userWeight = (userProfile.studentData.weightInGrams / 1000).toString();
          setWeight(userWeight);
        }
        
        if (userProfile.studentData.heightInCm != null) {
          userHeight = userProfile.studentData.heightInCm.toString();
          setHeight(userHeight);
        }
        
        if (userProfile.studentData.gender) {
          const genderPt = userProfile.studentData.gender === 'Male' ? 'Masculino' : 'Feminino';
          userGender = genderPt;
          setGender(genderPt);
        }
      }

      // Armazena os valores originais para poder cancelar
      setOriginalValues({
        name: userName,
        birthDate: userBirthDate,
        displayDate: userDisplayDate,
        school: userSchool,
        city: userCity,
        gre: userGre,
        weight: userWeight,
        height: userHeight,
        gender: userGender,
      });
    }
  }, [userProfile, isStudent]);

  // Função para cancelar a edição e restaurar valores originais
  const cancelEdit = () => {
    setName(originalValues.name);
    setBirthDate(originalValues.birthDate);
    setDisplayDate(originalValues.displayDate);
    setSchool(originalValues.school);
    setCity(originalValues.city);
    setGre(originalValues.gre);
    setWeight(originalValues.weight);
    setHeight(originalValues.height);
    setGender(originalValues.gender);
    setIsEditing(false);
  };

  // Função para salvar todas as informações (apenas campos alterados)
  const saveAllData = async () => {
    if (!userProfile?.user.email) {
      Alert.alert('Erro', 'Email do usuário não encontrado.');
      return;
    }

    setIsSaving(true);

    try {
      let successCount = 0;
      let errorMessages: string[] = [];

      // Verifica se algum campo de informações pessoais foi alterado
      const personalDataChanged = 
        name !== originalValues.name ||
        displayDate !== originalValues.displayDate ||
        school !== originalValues.school ||
        city !== originalValues.city ||
        gre !== originalValues.gre;

      if (personalDataChanged) {
        // Validações para informações pessoais
        if (!name.trim()) {
          Alert.alert('Atenção', 'Por favor, preencha o nome.');
          setIsSaving(false);
          return;
        }

        if (!displayDate) {
          Alert.alert('Atenção', 'Por favor, selecione a data de nascimento.');
          setIsSaving(false);
          return;
        }

        const isoDate = birthDate.toISOString();

        // Monta objeto apenas com campos que foram preenchidos
        const personalData: any = {
          name: name.trim(),
          birthdate: isoDate,
        };

        // Adiciona campos opcionais apenas se tiverem valor
        if (school.trim()) {
          personalData.school = school.trim();
        }
        if (city.trim()) {
          personalData.city = city.trim();
        }
        if (gre.trim()) {
          personalData.gre = gre.trim();
        }

        const personalResponse = await fetch(`${API_BASE_URL}/users/personal-info/${userProfile.user.email}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(personalData),
        });

        if (personalResponse.ok) {
          successCount++;
        } else {
          const error = await personalResponse.json();
          const errorMessage =
            typeof error.message === 'string'
              ? error.message
              : Array.isArray(error.message)
                ? error.message.join(', ')
                : JSON.stringify(error.message);
          errorMessages.push(`Informações pessoais: ${errorMessage}`);
        }
      }

      // Verifica se algum campo de dados do estudante foi alterado - apenas para alunos
      const studentDataChanged = 
        isStudent && (
          weight !== originalValues.weight ||
          height !== originalValues.height ||
          gender !== originalValues.gender
        );

      if (studentDataChanged) {
        // Validações para dados do estudante apenas se houver alteração
        if (weight.trim() && height.trim() && gender.trim()) {
          const weightNum = parseFloat(weight);
          const heightNum = parseFloat(height);

          if (isNaN(weightNum) || isNaN(heightNum)) {
            Alert.alert('Atenção', 'Por favor, insira valores numéricos válidos para peso e altura.');
            setIsSaving(false);
            return;
          }

          const weightInGrams = Math.round(weightNum * 1000);
          const heightInCm = Math.round(heightNum);
          const genderInEnglish = gender === 'Masculino' ? 'Male' : 'Female';

          const studentData: StudentData = {
            weightInGrams: weightInGrams,
            heightInCm: heightInCm,
            gender: genderInEnglish,
          };

          const studentResponse = await fetch(`${API_BASE_URL}/users/students/data/${userProfile.user.email}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
          });

          if (studentResponse.ok) {
            successCount++;
          } else {
            const error = await studentResponse.json();
            const errorMessage =
              typeof error.message === 'string'
                ? error.message
                : Array.isArray(error.message)
                  ? error.message.join(', ')
                  : JSON.stringify(error.message);
            errorMessages.push(`Dados do estudante: ${errorMessage}`);
          }
        } else if (weight.trim() || height.trim() || gender.trim()) {
          // Se algum campo foi preenchido mas não todos
          Alert.alert('Atenção', 'Por favor, preencha todos os campos físicos (peso, altura e sexo) ou deixe todos em branco.');
          setIsSaving(false);
          return;
        }
      }

      // Verifica se houve alguma alteração
      if (!personalDataChanged && !studentDataChanged) {
        Alert.alert('Informação', 'Nenhuma alteração foi feita.');
        setIsEditing(false);
        setIsSaving(false);
        return;
      }

      // Exibe resultado
      if (errorMessages.length > 0) {
        Alert.alert('Erro', errorMessages.join('\n\n'));
      } else if (successCount > 0) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        await refreshUserProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsSaving(false);
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

  // Handler para seleção de GRE
  const selectGre = (selectedGre: string) => {
    setGre(selectedGre);
    setShowGrePicker(false);
  };

  // Exibe loading enquanto carrega os dados
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

  // Verifica se o perfil foi carregado
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
          {/* Botão de Voltar (visível apenas em modo de edição) */}
          {isEditing && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={cancelEdit}
              disabled={isSaving}
            >
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
          )}

          {/* Título */}
          <Text style={styles.mainTitle}>MEU PERFIL</Text>

          {/* Card Único com todas as informações */}
          <View style={styles.card}>
            {/* Avatar */}
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
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => setName(removeNumbers(text))}
                placeholder="Digite seu nome"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            ) : (
              <Text style={styles.valueText}>{name || 'Não informado'}</Text>
            )}
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
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={school}
                onChangeText={(text) => setSchool(removeNumbers(text))}
                placeholder="Digite o nome da escola"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            ) : (
              <Text style={styles.valueText}>{school || 'Não informado'}</Text>
            )}
            <View style={styles.divider} />

            {/* Cidade */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>CIDADE</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={(text) => setCity(removeNumbers(text))}
                placeholder="Digite sua cidade"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            ) : (
              <Text style={styles.valueText}>{city || 'Não informado'}</Text>
            )}
            <View style={styles.divider} />

            {/* Data de Nascimento */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>DATA DE NASCIMENTO</Text>
            </View>
            {isEditing ? (
              <>
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
              </>
            ) : (
              <Text style={styles.valueText}>{displayDate || 'Não informado'}</Text>
            )}
            <View style={styles.divider} />

            {/* GRE */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>GRE</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity 
                onPress={() => setShowGrePicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.dateInputContainer}>
                  <Text style={[styles.dateInput, !gre && styles.dateInputPlaceholder]}>
                    {gre || 'Selecione a GRE'}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <Text style={styles.valueText}>{gre || 'Não informado'}</Text>
            )}
            {!isStudent && <View style={styles.divider} />}

            {/* Campos de Peso, Altura e Sexo - apenas para alunos */}
            {isStudent && (
              <>
                <View style={styles.divider} />

                {/* Peso */}
                <View style={styles.infoRowWithIcon}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>⚖️</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.label}>PESO (KG)</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.inputInline}
                        value={weight}
                        onChangeText={(text) => setWeight(removeNonNumeric(text))}
                        placeholder="Ex: 65"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={styles.valueText}>{weight ? `${weight} kg` : 'Não informado'}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.divider} />

                {/* Altura */}
                <View style={styles.infoRowWithIcon}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>📏</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.label}>ALTURA (CM)</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.inputInline}
                        value={height}
                        onChangeText={(text) => setHeight(removeNonNumeric(text))}
                        placeholder="Ex: 170"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={styles.valueText}>{height ? `${height} cm` : 'Não informado'}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.divider} />

                {/* Sexo */}
                <View style={styles.infoRow}>
                  <Text style={styles.label}>SEXO</Text>
                </View>
                {isEditing ? (
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
                ) : (
                  <Text style={styles.valueText}>{gender || 'Não informado'}</Text>
                )}
              </>
            )}
          </View>
          
          {/* Botão de Editar/Salvar */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (isEditing) {
                saveAllData();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isSaving}
          >
            <Text style={styles.actionButtonText}>
              {isSaving ? 'Salvando...' : isEditing ? 'Salvar' : 'Editar Perfil'}
            </Text>
          </TouchableOpacity>

          {/* Espaçamento final */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Modal de seleção de GRE */}
        <Modal
          visible={showGrePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGrePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione a GRE</Text>
                <TouchableOpacity onPress={() => setShowGrePicker(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {GRE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.greOption,
                      gre === option && styles.greOptionSelected
                    ]}
                    onPress={() => selectGre(option)}
                  >
                    <Text style={[
                      styles.greOptionText,
                      gre === option && styles.greOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                    {gre === option && (
                      <Text style={styles.greCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
    backgroundColor: '#EFEFEF',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#2B5D36',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    alignSelf: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#3A7248',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  valueText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 15,
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
  actionButton: {
    width: CARD_WIDTH,
    backgroundColor: '#3A7248',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A7248',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    paddingHorizontal: 20,
  },
  greOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  greOptionText: {
    fontSize: 16,
    color: '#333',
  },
  greOptionTextSelected: {
    color: '#3A7248',
    fontWeight: '600',
  },
  greCheckmark: {
    fontSize: 20,
    color: '#3A7248',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;