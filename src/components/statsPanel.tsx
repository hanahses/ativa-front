// src/components/StatsPanel.tsx
import { API_BASE_URL } from '@/src/services/authService';
import { colors } from '@/src/styles/styles';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.85;
const CHART_WIDTH = PANEL_WIDTH - 50;
const CHART_HEIGHT = 200; // Reduzido ainda mais para caber melhor

// Mapeamento de GRE (baseado nos nomes reais do GeoJSON)
const GRE_MAP: { [key: string]: number } = {
  // Nomes completos (caso existam)
  'Recife Norte': 1,
  'Recife Sul': 2,
  'Metropolitana Norte': 3,
  'Metropolitana Sul': 4,
  'Mata Norte': 5,
  'Mata Centro': 6,
  'Mata Sul': 7,
  'Vale do Capibaribe': 8,
  'Agreste Centro Norte': 9,
  'Agreste Meridional': 10,
  'Sertão do Moxotó Ipanema': 11,
  'Sertão do Alto Pajeú': 12,
  'Sertão do Submédio São Francisco': 13,
  'Sertão do Médio São Francisco': 14,
  'Sertão Central': 15,
  'Sertão do Araripe': 16,
  
  // Nomes abreviados do GeoJSON (RD = Regional de Desenvolvimento)
  'RD Recife Norte': 1,
  'RD Recife Sul': 2,
  'RD Metropolitana Norte': 3,
  'RD Metropolitana Sul': 4,
  'RD Mata Norte': 5,
  'RD Mata Centro': 6,
  'RD Mata Sul': 7,
  'RD Vale do Capibaribe': 8,
  'RD Agreste Centro Norte': 9,
  'RD Agreste Meridional': 10,
  'RD Sertão Moxotó Ipanema': 11,
  'RD Sertão Alto Pajeú': 12,
  'RD Sertão Submédio São Francisco': 13,
  'RD Sertão Médio São Francisco': 14,
  'RD Sertão Central': 15,
  'RD Sertão Araripe': 16,
};

interface ResearchResult {
  gender: string;
  averageBmi: number;
}

interface AgeGroupData {
  results: ResearchResult[];
  ageGroup: string;
}

interface ScreenTimeResult {
  gender: string;
  averageTvTime: number;
  averagePcTime: number;
  averageVgTime: number;
  averageSptTime: number;
}

interface PhysicalActivityResult {
  gender: string;
  averageDailyActivity: number;
}

interface ChartData {
  bmi: AgeGroupData[];
  screenTime: ScreenTimeResult[];
  physicalActivity: PhysicalActivityResult[];
}

interface StatsPanelProps {
  selectedRegion: string | null;
  filters?: {
    sexo: string | null;
    anoPesquisa: string | null;
    idade: string | null;
    serie: string | null;
  };
}

const StatsPanel: React.FC<StatsPanelProps> = ({ selectedRegion, filters }) => {
  const [data, setData] = useState<ChartData>({
    bmi: [],
    screenTime: [],
    physicalActivity: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 StatsPanel detectou mudança - Região:', selectedRegion, 'Filtros:', filters);
    fetchData();
  }, [selectedRegion, filters]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Construir os parâmetros da query (SEM researchType, ele vai no path)
      const params = new URLSearchParams();
      
      // Ano da pesquisa (number)
      if (filters?.anoPesquisa) {
        params.append('year', filters.anoPesquisa);
      }

      // Série (number)
      if (filters?.serie) {
        params.append('serie', filters.serie);
      }

      // GRE (number de 1 a 16)
      if (selectedRegion && GRE_MAP[selectedRegion]) {
        params.append('gre', GRE_MAP[selectedRegion].toString());
        console.log('🗺️ GRE aplicado:', selectedRegion, '=', GRE_MAP[selectedRegion]);
      } else {
        console.log('⚠️ GRE não encontrado para região:', selectedRegion);
        console.log('📋 Regiões disponíveis no mapa:', Object.keys(GRE_MAP));
      }

      // Idade (number - extrair primeiro número do range)
      if (filters?.idade) {
        const idadeStr = String(filters.idade);
        const idadeNumber = idadeStr.split('-')[0];
        params.append('idade', idadeNumber);
      }

      // Sexo (number: 1 = Masculino, 2 = Feminino)
      if (filters?.sexo) {
        const sexoNumber = filters.sexo === 'Masculino' ? '1' : '2';
        params.append('sexo', sexoNumber);
      }

      const queryString = params.toString();
      console.log('📤 Parâmetros:', Object.fromEntries(params));

      // Buscar dados dos três tipos de pesquisa simultaneamente
      const [bmiResponse, screenTimeResponse, physicalActivityResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/research/query/bmi?${queryString}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/research/query/screen-time?${queryString}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/research/query/physical-activity?${queryString}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      ]);

      if (!bmiResponse.ok || !screenTimeResponse.ok || !physicalActivityResponse.ok) {
        throw new Error('Erro ao buscar dados da pesquisa');
      }

      const [bmiData, screenTimeData, physicalActivityData] = await Promise.all([
        bmiResponse.json(),
        screenTimeResponse.json(),
        physicalActivityResponse.json()
      ]);

      console.log('📥 Dados recebidos:', {
        bmi: bmiData,
        screenTime: screenTimeData,
        physicalActivity: physicalActivityData
      });

      setData({
        bmi: bmiData,
        screenTime: screenTimeData,
        physicalActivity: physicalActivityData
      });
    } catch (err: any) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBMIChart = (chartData: AgeGroupData[]) => {
    if (!chartData || chartData.length === 0) return null;

    // Configurações do gráfico
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const minGroupWidth = 80;
    const groupWidth = Math.max(minGroupWidth, (CHART_WIDTH - padding.left - padding.right) / chartData.length);
    
    const dynamicChartWidth = Math.max(CHART_WIDTH, padding.left + padding.right + (groupWidth * chartData.length));
    const chartAreaWidth = dynamicChartWidth - padding.left - padding.right;
    const chartAreaHeight = CHART_HEIGHT - padding.top - padding.bottom;

    // Encontrar valor máximo
    let maxValue = 0;
    chartData.forEach(ageGroup => {
      ageGroup.results.forEach(result => {
        maxValue = Math.max(maxValue, result.averageBmi);
      });
    });
    maxValue = Math.ceil(maxValue + 5);

    const barWidth = groupWidth / 3;

    return (
      <Svg width={dynamicChartWidth} height={CHART_HEIGHT}>
        {/* Linhas de grade */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, idx) => {
          const y = padding.top + chartAreaHeight * (1 - fraction);
          const value = (maxValue * fraction).toFixed(0);
          return (
            <G key={`grid-${idx}`}>
              <Line x1={padding.left} y1={y} x2={dynamicChartWidth - padding.right} y2={y} stroke="#e0e0e0" strokeWidth="1" />
              <SvgText x={padding.left - 10} y={y + 5} fontSize="10" fill="#666" textAnchor="end">{value}</SvgText>
            </G>
          );
        })}

        {/* Barras */}
        {chartData.map((ageGroup, groupIdx) => {
          const masculino = ageGroup.results.find(r => r.gender === 'Masculino');
          const feminino = ageGroup.results.find(r => r.gender === 'Feminino');
          const groupX = padding.left + (groupIdx * groupWidth) + (groupWidth / 2) - barWidth;

          return (
            <G key={`group-${groupIdx}`}>
              {masculino && (
                <>
                  <Rect x={groupX} y={padding.top + chartAreaHeight - (masculino.averageBmi / maxValue) * chartAreaHeight} width={barWidth - 2} height={(masculino.averageBmi / maxValue) * chartAreaHeight} fill={colors.primary} />
                  <SvgText x={groupX + barWidth / 2 - 1} y={padding.top + chartAreaHeight - (masculino.averageBmi / maxValue) * chartAreaHeight - 5} fontSize="10" fill={colors.primary} textAnchor="middle" fontWeight="bold">{masculino.averageBmi.toFixed(1)}</SvgText>
                </>
              )}
              {feminino && (
                <>
                  <Rect x={groupX + barWidth + 2} y={padding.top + chartAreaHeight - (feminino.averageBmi / maxValue) * chartAreaHeight} width={barWidth - 2} height={(feminino.averageBmi / maxValue) * chartAreaHeight} fill="#D4AF37" />
                  <SvgText x={groupX + barWidth + 2 + barWidth / 2 - 1} y={padding.top + chartAreaHeight - (feminino.averageBmi / maxValue) * chartAreaHeight - 5} fontSize="10" fill="#D4AF37" textAnchor="middle" fontWeight="bold">{feminino.averageBmi.toFixed(1)}</SvgText>
                </>
              )}
              <SvgText x={groupX + barWidth} y={CHART_HEIGHT - padding.bottom + 20} fontSize="11" fill="#333" textAnchor="middle">{ageGroup.ageGroup}</SvgText>
            </G>
          );
        })}

        <Line x1={padding.left} y1={padding.top + chartAreaHeight} x2={dynamicChartWidth - padding.right} y2={padding.top + chartAreaHeight} stroke="#333" strokeWidth="2" />
        <Line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartAreaHeight} stroke="#333" strokeWidth="2" />
      </Svg>
    );
  };

  const renderScreenTimeChart = (chartData: ScreenTimeResult[]) => {
    if (!chartData || chartData.length === 0) return null;

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const dynamicChartWidth = CHART_WIDTH;
    const chartAreaHeight = CHART_HEIGHT - padding.top - padding.bottom;

    // Encontrar valor máximo (usando tempo total de tela)
    let maxValue = 0;
    chartData.forEach(result => {
      maxValue = Math.max(maxValue, result.averageSptTime);
    });
    maxValue = Math.ceil(maxValue + 50);

    const groupWidth = (dynamicChartWidth - padding.left - padding.right) / chartData.length;
    const barWidth = groupWidth / 2;

    return (
      <Svg width={dynamicChartWidth} height={CHART_HEIGHT}>
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, idx) => {
          const y = padding.top + chartAreaHeight * (1 - fraction);
          const value = (maxValue * fraction).toFixed(0);
          return (
            <G key={`grid-${idx}`}>
              <Line x1={padding.left} y1={y} x2={dynamicChartWidth - padding.right} y2={y} stroke="#e0e0e0" strokeWidth="1" />
              <SvgText x={padding.left - 10} y={y + 5} fontSize="10" fill="#666" textAnchor="end">{value}</SvgText>
            </G>
          );
        })}

        {chartData.map((result, idx) => {
          const groupX = padding.left + (idx * groupWidth) + (groupWidth / 2) - barWidth / 2;
          const color = result.gender === 'Masculino' ? colors.primary : '#D4AF37';

          return (
            <G key={`bar-${idx}`}>
              <Rect x={groupX} y={padding.top + chartAreaHeight - (result.averageSptTime / maxValue) * chartAreaHeight} width={barWidth - 2} height={(result.averageSptTime / maxValue) * chartAreaHeight} fill={color} />
              <SvgText x={groupX + barWidth / 2 - 1} y={padding.top + chartAreaHeight - (result.averageSptTime / maxValue) * chartAreaHeight - 5} fontSize="10" fill={color} textAnchor="middle" fontWeight="bold">{result.averageSptTime.toFixed(0)}</SvgText>
              <SvgText x={groupX + barWidth / 2 - 1} y={CHART_HEIGHT - padding.bottom + 20} fontSize="11" fill="#333" textAnchor="middle">{result.gender}</SvgText>
            </G>
          );
        })}

        <Line x1={padding.left} y1={padding.top + chartAreaHeight} x2={dynamicChartWidth - padding.right} y2={padding.top + chartAreaHeight} stroke="#333" strokeWidth="2" />
        <Line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartAreaHeight} stroke="#333" strokeWidth="2" />
      </Svg>
    );
  };

  const renderPhysicalActivityChart = (chartData: PhysicalActivityResult[]) => {
    if (!chartData || chartData.length === 0) return null;

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const dynamicChartWidth = CHART_WIDTH;
    const chartAreaHeight = CHART_HEIGHT - padding.top - padding.bottom;

    let maxValue = 0;
    chartData.forEach(result => {
      maxValue = Math.max(maxValue, result.averageDailyActivity);
    });
    maxValue = Math.ceil(maxValue + 10);

    const groupWidth = (dynamicChartWidth - padding.left - padding.right) / chartData.length;
    const barWidth = groupWidth / 2;

    return (
      <Svg width={dynamicChartWidth} height={CHART_HEIGHT}>
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, idx) => {
          const y = padding.top + chartAreaHeight * (1 - fraction);
          const value = (maxValue * fraction).toFixed(0);
          return (
            <G key={`grid-${idx}`}>
              <Line x1={padding.left} y1={y} x2={dynamicChartWidth - padding.right} y2={y} stroke="#e0e0e0" strokeWidth="1" />
              <SvgText x={padding.left - 10} y={y + 5} fontSize="10" fill="#666" textAnchor="end">{value}</SvgText>
            </G>
          );
        })}

        {chartData.map((result, idx) => {
          const groupX = padding.left + (idx * groupWidth) + (groupWidth / 2) - barWidth / 2;
          const color = result.gender === 'Masculino' ? colors.primary : '#D4AF37';

          return (
            <G key={`bar-${idx}`}>
              <Rect x={groupX} y={padding.top + chartAreaHeight - (result.averageDailyActivity / maxValue) * chartAreaHeight} width={barWidth - 2} height={(result.averageDailyActivity / maxValue) * chartAreaHeight} fill={color} />
              <SvgText x={groupX + barWidth / 2 - 1} y={padding.top + chartAreaHeight - (result.averageDailyActivity / maxValue) * chartAreaHeight - 5} fontSize="10" fill={color} textAnchor="middle" fontWeight="bold">{result.averageDailyActivity.toFixed(1)}</SvgText>
              <SvgText x={groupX + barWidth / 2 - 1} y={CHART_HEIGHT - padding.bottom + 20} fontSize="11" fill="#333" textAnchor="middle">{result.gender}</SvgText>
            </G>
          );
        })}

        <Line x1={padding.left} y1={padding.top + chartAreaHeight} x2={dynamicChartWidth - padding.right} y2={padding.top + chartAreaHeight} stroke="#333" strokeWidth="2" />
        <Line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartAreaHeight} stroke="#333" strokeWidth="2" />
      </Svg>
    );
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorSubtext}>Tente aplicar filtros diferentes</Text>
        </View>
      );
    }

    if (!data.bmi.length && !data.screenTime.length && !data.physicalActivity.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📊 Nenhum dado disponível</Text>
          <Text style={styles.emptySubtext}>
            {selectedRegion 
              ? 'Selecione filtros para visualizar os dados'
              : 'Selecione uma região no mapa para visualizar os dados'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chartsContainer}>
        {/* Gráfico BMI */}
        {data.bmi.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>IMC Médio por Idade e Sexo</Text>
              {selectedRegion && (
                <Text style={styles.chartSubtitle}>Região: {selectedRegion}</Text>
              )}
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              style={styles.chartScrollView}
            >
              {renderBMIChart(data.bmi)}
            </ScrollView>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Masculino</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#D4AF37' }]} />
                <Text style={styles.legendText}>Feminino</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gráfico Screen Time */}
        {data.screenTime.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Tempo de Tela por Idade e Sexo</Text>
              {selectedRegion && (
                <Text style={styles.chartSubtitle}>Região: {selectedRegion}</Text>
              )}
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              style={styles.chartScrollView}
            >
              {renderScreenTimeChart(data.screenTime)}
            </ScrollView>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Masculino</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#D4AF37' }]} />
                <Text style={styles.legendText}>Feminino</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gráfico Physical Activity */}
        {data.physicalActivity.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Atividade Física por Idade e Sexo</Text>
              {selectedRegion && (
                <Text style={styles.chartSubtitle}>Região: {selectedRegion}</Text>
              )}
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              style={styles.chartScrollView}
            >
              {renderPhysicalActivityChart(data.physicalActivity)}
            </ScrollView>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Masculino</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#D4AF37' }]} />
                <Text style={styles.legendText}>Feminino</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.panel}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentInset={{ top: 0, bottom: 20 }} // Espaço extra no iOS
        contentInsetAdjustmentBehavior="never"
      >
        {renderChart()}
        
        {/* Espaço final garantido */}
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
    maxHeight: SCREEN_HEIGHT * 0.72, // 70% da altura da tela
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingTop: 20, // Aumentado para dar mais espaço no topo
    paddingBottom: 20, // Aumentado para dar mais espaço no final
  },
  chartsContainer: {
    gap: 20,
    paddingBottom: 10, // Espaço extra no final
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12, // Reduzido de 15 para 12
    marginBottom: 15, // Reduzido de 20 para 15
    borderWidth: 2,
    borderColor: colors.primary,
  },
  chartHeader: {
    marginBottom: 10, // Reduzido de 15 para 10
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chartScrollView: {
    marginVertical: 10,
  },
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // Reduzido de 15 para 10
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