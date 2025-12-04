// app/home.tsx
import AppHeader from '@/src/components/header';
import InteractiveMap from '@/src/components/interactiveMap';
import StatsPanel from '@/src/components/statsPanel';
import { FILTER_PANEL_HEIGHT, homeStyles } from '@/src/styles/styles';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importar o GeoJSON
import geoJsonData from '@/assets/data/regioes.json';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATS_PANEL_WIDTH = SCREEN_WIDTH * 0.85;
// Calcular altura máxima do painel: tela completa menos espaço para o botão de filtros e header
const STATS_PANEL_MAX_HEIGHT = SCREEN_HEIGHT * 0.72; // 70% da altura da tela

// Interface para os filtros (apenas uma seleção por categoria)
interface Filters {
  sexo: string | null;
  anoPesquisa: string | null;
  idade: string | null;
  serie: string | null;
}

const HomeScreen: React.FC = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [slideUpAnim] = useState(new Animated.Value(FILTER_PANEL_HEIGHT));
  const [slideRightAnim] = useState(new Animated.Value(STATS_PANEL_WIDTH));
  const [selectedMapRegion, setSelectedMapRegion] = useState<string | null>(null);

  // Estado dos filtros (todos desmarcados por padrão)
  const [filters, setFilters] = useState<Filters>({
    sexo: null,
    anoPesquisa: null,
    idade: null,
    serie: null,
  });

  // Estado para filtros aplicados (enviados ao StatsPanel) - também começam desmarcados
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    sexo: null,
    anoPesquisa: null,
    idade: null,
    serie: null,
  });

  // Função para selecionar filtro (apenas um por categoria)
  const selectFilter = (category: keyof Filters, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [category]: prevFilters[category] === value ? null : value,
    }));
  };

  // Verifica se um filtro está marcado
  const isFilterChecked = (category: keyof Filters, value: string): boolean => {
    return filters[category] === value;
  };

  // Handler quando uma região do mapa é clicada
  const handleMapRegionPress = (regionName: string) => {
    console.log('🗺️ Região clicada no Home:', regionName);
    setSelectedMapRegion(regionName);
    // Se o painel de stats estiver aberto, atualiza imediatamente
    if (statsVisible) {
      setAppliedFilters({...filters});
    }
  };

  // Abre o painel de estatísticas
  const openStats = () => {
    // Atualiza os filtros aplicados antes de abrir o painel
    setAppliedFilters({...filters});
    setStatsVisible(true);
    Animated.spring(slideRightAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  // Fecha o painel de estatísticas
  const closeStats = () => {
    Animated.timing(slideRightAnim, {
      toValue: STATS_PANEL_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStatsVisible(false);
    });
  };

  // Abre o painel de filtros
  const openFilters = () => {
    setFilterVisible(true);
    Animated.spring(slideUpAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  // Fecha o painel de filtros
  const closeFilters = () => {
    Animated.timing(slideUpAnim, {
      toValue: FILTER_PANEL_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setFilterVisible(false);
    });
  };

  // Aplicar filtros
  const applyFilters = () => {
    console.log('Filtros aplicados:', filters);
    setAppliedFilters(filters); // Atualiza os filtros aplicados
    closeFilters();
  };

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={homeStyles.container} edges={['bottom']}>
          {/* Header com menu lateral */}
          <AppHeader showMenuButton={true} showStatsButton={true} />

          {/* Conteúdo da tela */}
          <View style={homeStyles.content}>
            {/* Botão de estatísticas flutuante (canto superior direito) */}
              <TouchableOpacity 
                style={homeStyles.floatingStatsButton}
                onPress={openStats}
                activeOpacity={0.8}
              >
                <Image
                  source={require('@/assets/images/dashboard_btn.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>


            {/* Área do Mapa com ScrollView */}
            <ScrollView 
              style={homeStyles.mapContainer}
              contentContainerStyle={{ paddingVertical: 20 }}
            >
              <InteractiveMap 
                geoJsonData={geoJsonData}
                onRegionPress={handleMapRegionPress}
              />
            </ScrollView>
            
            {/* Botão Filtros */}
            <TouchableOpacity
              style={homeStyles.filterButton}
              onPress={openFilters}
              activeOpacity={0.8}
            >
              <View style={homeStyles.filterButtonContent}>
                <Text style={homeStyles.filterButtonIcon}>^</Text>
                <Text style={homeStyles.filterButtonText}>FILTROS</Text>
                <Text style={homeStyles.filterButtonIcon}>^</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal de Estatísticas */}
          <Modal
            visible={statsVisible}
            transparent
            animationType="none"
            onRequestClose={closeStats}
          >
            <TouchableOpacity
              style={homeStyles.statsOverlay}
              activeOpacity={1}
              onPress={closeStats}
            >
              <Animated.View
                style={[
                  homeStyles.statsPanel,
                  {
                    transform: [{ translateX: slideRightAnim }],
                    maxHeight: STATS_PANEL_MAX_HEIGHT,
                  },
                ]}
                onStartShouldSetResponder={() => true}
              > 
                <StatsPanel 
                  selectedRegion={selectedMapRegion} 
                  filters={appliedFilters}
                />
              </Animated.View>

              <Animated.View style = {[{transform: [{ translateX: slideRightAnim }]}]} >
                <Image
                    source={require('@/assets/images/dashboard_btn.png')}
                    resizeMode="contain"
                    style = {[homeStyles.statsPanelButton]}
                />
              </Animated.View>
            </TouchableOpacity>
          </Modal>

          {/* Modal de Filtros */}
          <Modal
            visible={filterVisible}
            transparent
            animationType="none"
            onRequestClose={closeFilters}
          >
            {/* Overlay escuro */}
            <TouchableOpacity
              style={homeStyles.modalOverlay}
              activeOpacity={1}
              onPress={closeFilters}
            >
              {/* Painel de Filtros */}
              <Animated.View
                style={[
                  homeStyles.filterPanel,
                  {
                    transform: [{ translateY: slideUpAnim }],
                  },
                ]}
                onStartShouldSetResponder={() => true}
              >
                {/* Header do Filtro */}
                <TouchableOpacity onPress={closeFilters}>
                  <View style={homeStyles.filterHeader}>
                    <Text style={homeStyles.filterHeaderIcon}>ˇ</Text>
                    <Text style={homeStyles.filterTitle}>FILTROS</Text>
                    <Text style={homeStyles.filterHeaderIcon}>ˇ</Text>
                  </View>
                </TouchableOpacity>

                {/* Conteúdo dos Filtros */}
                <ScrollView style={homeStyles.filterContent}>
                  {/* Container de duas colunas */}
                  <View style={homeStyles.filterColumnsContainer}>
                    {/* COLUNA ESQUERDA */}
                    <View style={homeStyles.filterColumn}>
                      {/* Sexo */}
                      <View style={homeStyles.filterSection}>
                        <Text style={homeStyles.filterSectionTitle}>Sexo</Text>
                        <View style={homeStyles.checkboxGroup}>
                          {[
                            { value: 'Masculino', label: 'Masculino ♂' },
                            { value: 'Feminino', label: 'Feminino ♀' }
                          ].map(({ value, label }) => (
                            <TouchableOpacity
                              key={value}
                              style={homeStyles.checkboxItem}
                              onPress={() => selectFilter('sexo', value)}
                              activeOpacity={0.7}
                            >
                              <View style={[
                                homeStyles.checkbox,
                                isFilterChecked('sexo', value) && homeStyles.checkboxChecked
                              ]}>
                                {isFilterChecked('sexo', value) && (
                                  <Text style={homeStyles.checkboxCheck}>✓</Text>
                                )}
                              </View>
                              <Text style={homeStyles.checkboxLabel}>{label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Idade */}
                      <View style={homeStyles.filterSection}>
                        <Text style={homeStyles.filterSectionTitle}>Idade</Text>
                        <View style={homeStyles.checkboxGroup}>
                          {[
                            { value: '14-15', label: '14 aos 15 anos 👦' },
                            { value: '16-17', label: '16 aos 17 anos 👨' },
                            { value: '18-19', label: '18 aos 19 anos 🧑' }
                          ].map(({ value, label }) => (
                            <TouchableOpacity
                              key={value}
                              style={homeStyles.checkboxItem}
                              onPress={() => selectFilter('idade', value)}
                              activeOpacity={0.7}
                            >
                              <View style={[
                                homeStyles.checkbox,
                                isFilterChecked('idade', value) && homeStyles.checkboxChecked
                              ]}>
                                {isFilterChecked('idade', value) && (
                                  <Text style={homeStyles.checkboxCheck}>✓</Text>
                                )}
                              </View>
                              <Text style={homeStyles.checkboxLabel}>{label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* COLUNA DIREITA */}
                    <View style={homeStyles.filterColumn}>
                      {/* Ano da pesquisa */}
                      <View style={homeStyles.filterSection}>
                        <Text style={homeStyles.filterSectionTitle}>Ano da pesquisa</Text>
                        <View style={homeStyles.checkboxGroup}>
                          {['2016', '2022'].map((ano) => (
                            <TouchableOpacity
                              key={ano}
                              style={homeStyles.checkboxItem}
                              onPress={() => selectFilter('anoPesquisa', ano)}
                              activeOpacity={0.7}
                            >
                              <View style={[
                                homeStyles.checkbox,
                                isFilterChecked('anoPesquisa', ano) && homeStyles.checkboxChecked
                              ]}>
                                {isFilterChecked('anoPesquisa', ano) && (
                                  <Text style={homeStyles.checkboxCheck}>✓</Text>
                                )}
                              </View>
                              <Text style={homeStyles.checkboxLabel}>{ano} 📋</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Série */}
                      <View style={homeStyles.filterSection}>
                        <Text style={homeStyles.filterSectionTitle}>Série</Text>
                        <View style={homeStyles.checkboxGroup}>
                          {['1', '2', '3'].map((serie) => (
                            <TouchableOpacity
                              key={serie}
                              style={homeStyles.checkboxItem}
                              onPress={() => selectFilter('serie', serie)}
                              activeOpacity={0.7}
                            >
                              <View style={[
                                homeStyles.checkbox,
                                isFilterChecked('serie', serie) && homeStyles.checkboxChecked
                              ]}>
                                {isFilterChecked('serie', serie) && (
                                  <Text style={homeStyles.checkboxCheck}>✓</Text>
                                )}
                              </View>
                              <Text style={homeStyles.checkboxLabel}>{serie}ª Série 📋</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Espaçamento final */}
                  <View style={{ height: 100 }} />
                </ScrollView>

                {/* Botão Aplicar Filtros */}
                <View style={homeStyles.filterFooter}>
                  <TouchableOpacity
                    style={homeStyles.applyButton}
                    onPress={applyFilters}
                    activeOpacity={0.8}
                  >
                    <Text style={homeStyles.applyButtonText}>Aplicar filtros</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Modal>
        </SafeAreaView>
      </GestureHandlerRootView>
  );
};

export default HomeScreen;