// app/screens/CardsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AppHeader from '../../src/components/header';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20px de padding em cada lado

const CardsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader showMenuButton={true} showStatsButton={true} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Card 1 - Tempo de atividade física */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              QUANTO TEMPO DE ATIVIDADE FÍSICA VOCÊ DEVE FAZER?
            </Text>
            <Text style={styles.cardText}>
              Você deve praticar 60 minutos ou mais de atividade física por dia. Dê preferência para aquelas que façam a sua respiração e os batimentos do seu coração aumentarem. Nessas atividades você vai conseguir conversar com certa dificuldade enquanto se movimenta e não vai conseguir cantar. Como parte desses 60 minutos ou mais por dia, inclua, em pelo menos 3 dias na semana, atividades de fortalecimento dos músculos e ossos, que envolvam movimentos como: saltar (como você faz ao pular corda), puxar ou empurrar (como você faz para movimentar algum objeto ou peso ou brincar de cabo de guerra). Você pode dividir a sua prática de atividade física em pequenos blocos de tempo ou fazer os 60 minutos por dia de uma só vez. Faça como preferir e como puder! Para benefícios adicionais à saúde, busque praticar atividade física de forma regular e aumentar progressivamente o tempo por semana. Já nos dias em que você não conseguir praticar os 60 minutos, procure fazer a maior quantidade de minutos que puder – cada minuto conta!
            </Text>
          </View>

          {/* Card 2 - Educação Física */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              PARTICIPAÇÃO DOS ESTUDANTES NAS AULAS DE EDUCAÇÃO FÍSICA
            </Text>
            <Text style={styles.cardText}>
              A educação física pode contribuir de forma significativa para a saúde e para o desenvolvimento pessoal dos estudantes. Participar das aulas de educação física vai além da prática de atividade física e do desenvolvimento de habilidades motoras, como correr e saltar, contribuindo para uma vida ativa e saudável. As aulas de educação física contribuem para a saúde física, motora, psicológica e social dos estudantes.
            </Text>
          </View>

          {/* Card 3 - Alimentação Saudável */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ALIMENTAÇÃO SAUDÁVEL</Text>
            <Text style={styles.cardText}>
              Na adolescência, o corpo está em crescimento e precisa de uma alimentação equilibrada para garantir saúde e desenvolvimento. O Guia Alimentar para a População Brasileira recomenda que os adolescentes tenham como base da dieta alimentos naturais ou minimamente processados, como frutas, verduras, arroz, feijão, carnes, ovos e leite. É importante reduzir o consumo de sal, açúcar e gorduras e evitar alimentos ultraprocessados, como refrigerantes, salgadinhos e biscoitos recheados. As refeições devem ser variadas, coloridas, feitas em horários regulares e, sempre que possível, compartilhadas em família. A água deve ser a principal bebida, em vez de sucos artificiais ou refrigerantes.
            </Text>
          </View>

          {/* Card 4 - Comportamento Sedentário */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              COMO VOCÊ PODE REDUZIR O COMPORTAMENTO SEDENTÁRIO?
            </Text>
            <Text style={styles.cardText}>
              Evite ficar muito tempo em comportamento sedentário. Sempre que possível, reduza o tempo em que você permanece sentado ou deitado assistindo à televisão ou usando o celular, computador, tablet ou videogame. Por exemplo, a cada uma hora, movimente-se por pelo menos 5 minutos e aproveite para mudar de posição e ficar em pé, ir ao banheiro, beber água e alongar o corpo. São pequenas atitudes que podem ajudar a diminuir o seu comportamento sedentário e melhorar sua qualidade de vida. Crie uma rotina para as suas atividades diárias, organizando seu tempo com momentos para estudar, praticar atividade física, relaxar, comer e dormir.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2B5D36',
  },
  container: {
    flex: 1,
    backgroundColor: '#2B5D36',
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'Mada',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    fontFamily: 'Mada',
    textAlign: 'justify',
  },
});

export default CardsScreen;