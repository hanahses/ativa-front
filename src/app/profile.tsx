// app/screens/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AppHeader from '../../src/components/header';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
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

            <View style={styles.infoRow}>
              <Text style={styles.label}>NOME</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.value}>Não informado</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>SEXO</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.value}>Não informado</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>IDADE</Text>
            </View>
            <Text style={styles.value}>Não informado</Text>
            <View style={styles.divider} />
          </View>

          {/* Seção - Informações sobre Peso e Altura */}
          <Text style={styles.sectionTitle}>INFORMAÇÕES SOBRE PESO E ALTURA</Text>

          {/* Card 2 - Peso e Altura */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>⚖️</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>PESO</Text>
                <Text style={styles.value}>Não informado</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📏</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>ALTURA</Text>
                <Text style={styles.value}>Não informado</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seção - Informações sobre Escola e Moradia */}
          <Text style={styles.sectionTitle}>INFORMAÇÕES SOBRE ESCOLA E MORADIA</Text>

          {/* Card 3 - Escola e Moradia */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>ESCOLA</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.value}>Não informado</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>CIDADE</Text>
            </View>
            <Text style={styles.value}>Não informado</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>GRE</Text>
            </View>
            <Text style={styles.value}>Não informado</Text>
            <View style={styles.divider} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFEFEF',
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
    fontFamily: 'Mada',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Mada',
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
    fontFamily: 'Mada',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Mada',
    marginBottom: 15,
  },
  editButton: {
    padding: 5,
  },
  editIcon: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 15,
  },
});

export default ProfileScreen;