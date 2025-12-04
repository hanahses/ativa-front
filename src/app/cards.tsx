// app/screens/CardsScreen.tsx
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import AppHeader from '../../src/components/header';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - 20;
const CARD_WIDTH = width - 65;

const CardsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <AppHeader showMenuButton={true} showStatsButton={true} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Card 1 - Escala Borg */}
        <View style={styles.cardWrapper}>
          <View style={styles.card} />
          <Image 
            source={require('@/assets/images/guia-esforco.png')}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </View>

        {/* Card 2 - Guia Atividades Físicas */}
        <View style={styles.cardWrapper}>
          <View style={styles.card} />
          <Image 
            source={require('@/assets/images/guia-atividades-fisicas.png')}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </View>

        {/* Card 3 - Guia Esforço */}
        <View style={styles.cardWrapper}>
          <View style={styles.card} />
          <Image 
            source={require('@/assets/images/escala-borg.png')}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
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
  cardWrapper: {
    width: IMAGE_WIDTH,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: '103%',
    backgroundColor: '#3A7248',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: IMAGE_WIDTH,
    height: undefined,
    aspectRatio: 1,
  },
});

export default CardsScreen;