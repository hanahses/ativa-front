// src/components/StatsPanel.tsx
import { colors } from '@/src/styles/styles';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.85;

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface ChartProps {
  title: string;
  subtitle?: string;
  data: BarData[];
  maxValue: number;
  message?: string;
}


const BarChart: React.FC<ChartProps> = ({ title, subtitle, data, maxValue, message }) => {
  return (
    <View style={styles.chartContainer}>
      {/* Título do gráfico */}
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      {/* Área do gráfico */}
      <View style={styles.chartArea}>
        {/* Eixo Y com valores */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{maxValue}</Text>
          <Text style={styles.yAxisLabel}>{maxValue * 0.75}</Text>
          <Text style={styles.yAxisLabel}>{maxValue * 0.5}</Text>
          <Text style={styles.yAxisLabel}>{maxValue * 0.25}</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>

        {/* Barras */}
        <View style={styles.barsContainer}>
          {/* Linhas de grade horizontais */}
          <View style={styles.gridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>

          {/* Barras do gráfico */}
          <View style={styles.bars}>
            {data.map((item, index) => {
              const heightPercentage = (item.value / maxValue) * 100;
              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${heightPercentage}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Mensagem informativa */}
      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      {/* Legenda (se houver múltiplas cores) */}
      {data.length > 1 && data.some((d, i) => data.findIndex(x => x.color === d.color) !== i) && (
        <View style={styles.legend}>
          {Array.from(new Set(data.map(d => d.color))).map((color, idx) => {
            const item = data.find(d => d.color === color);
            return (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: color }]} />
                <Text style={styles.legendText}>
                  {item?.label.includes('Feminino') ? 'Feminino' : 'Masculino'}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

interface StatsPanelProps {
  selectedRegion: string | null;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ selectedRegion }) => {
  // Dados mockados para o gráfico de filtros
  const filteredData: BarData[] = [
    { label: 'Agreste', value: 28, color: colors.primary },
    { label: 'São Francisco', value: 32, color: colors.primary },
    { label: 'Sertão', value: 18.5, color: colors.primary },
  ];

  // Dados mockados para o gráfico por idade/sexo
  const ageGenderData: BarData[] = [
    { label: '14 a 15 anos', value: 28, color: colors.primary },
    { label: '', value: 29, color: '#D4AF37' },
    { label: '16 a 17 anos', value: 32, color: colors.primary },
    { label: '', value: 27, color: '#D4AF37' },
    { label: '18 a 19 anos', value: 18.5, color: colors.primary },
    { label: '', value: 38, color: '#D4AF37' },
  ];

  return (
    <View style={styles.panel}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Gráfico Superior - Dados Filtrados */}
        <BarChart
          title="IMC médio(dados filtrados)"
          data={filteredData}
          maxValue={40}
          message="Seu IMC: 24.7. Você está abaixo da média para sua idade. Tenha cuidado, tente mudar os hábitos!"
        />

        {/* Gráfico Inferior - Por Idade e Sexo */}
        <BarChart
          title="IMC médio"
          data={ageGenderData}
          maxValue={40}
        />

        {/* Espaçamento final */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    width: PANEL_WIDTH,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 10,
    backgroundColor: colors.primary,
    height: '102%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingTop: 15, // Reduzido de 80 para 15
    paddingBottom: 10,
  },

  // Container do gráfico
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  
  },

  // Header do gráfico
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chartIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  chartIconBar1: {
    width: 4,
    height: 10,
    backgroundColor: colors.white,
    borderRadius: 1,
  },
  chartIconBar2: {
    width: 4,
    height: 16,
    backgroundColor: colors.white,
    borderRadius: 1,
  },
  chartIconBar3: {
    width: 4,
    height: 13,
    backgroundColor: colors.white,
    borderRadius: 1,
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Área do gráfico
  chartArea: {
    flexDirection: 'row',
    height: 150,
  },

  // Eixo Y
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: colors.text.secondary,
  },

  // Container das barras
  barsContainer: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: 35, // Limita a largura máxima de cada barra
  },
  barContainer: {
    width: '70%', // Reduzido de 80% para 70%
    height: '85%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 9,
    color: colors.text.secondary,
    marginTop: 5,
    textAlign: 'center',
  },

  // Mensagem informativa
  messageContainer: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  messageText: {
    fontSize: 11,
    color: colors.text.primary,
    lineHeight: 16,
  },

  // Legenda
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});

export default StatsPanel;