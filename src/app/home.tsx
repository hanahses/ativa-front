// app/home.tsx
import AppHeader from '@/src/components/header';
import InteractiveMap from '@/src/components/interactiveMap';
import ProtectedRoute from '@/src/components/protectedRoutes';
import { FILTER_PANEL_HEIGHT, homeStyles } from '@/src/styles/styles';
import React, { useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // ADICIONE ESTA LINHA
import { SafeAreaView } from 'react-native-safe-area-context';

// Importar o GeoJSON
import geoJsonData from '@/assets/data/regioes.json';

// Interface para os filtros
interface Filters {
  mesorregiao: string[];
  sexo: string[];
  idade: string[];
  anoPesquisa: string[];
  serie: string[];
}

const HomeScreen: React.FC = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [slideUpAnim] = useState(new Animated.Value(FILTER_PANEL_HEIGHT));
  const [selectedMapRegion, setSelectedMapRegion] = useState<string | null>(null);

  // Estado dos filtros
  const [filters, setFilters] = useState<Filters>({
    mesorregiao: ['Sertão', 'São Francisco', 'Agreste', 'Mata', 'Metropolitana'],
    sexo: ['Masculino', 'Feminino'],
    idade: ['14-15', '16-17', '18-19'],
    anoPesquisa: ['2016', '2022'],
    serie: ['1', '2', '3'],
  });

  // Função para toggle de filtro
  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prevFilters,
        [category]: newValues,
      };
    });
  };

  // Verifica se um filtro está marcado
  const isFilterChecked = (category: keyof Filters, value: string): boolean => {
    return filters[category].includes(value);
  };

  // Handler quando uma região do mapa é clicada
  const handleMapRegionPress = (regionName: string) => {
    console.log('Região clicada:', regionName);
    setSelectedMapRegion(regionName);
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
    fetchDashboardData(filters);
    closeFilters();
  };

  // Função exemplo para buscar dados com filtros
  const fetchDashboardData = async (appliedFilters: Filters) => {
    try {
      const queryParams = new URLSearchParams();
      
      appliedFilters.mesorregiao.forEach(m => queryParams.append('mesorregiao', m));
      appliedFilters.sexo.forEach(s => queryParams.append('sexo', s));
      appliedFilters.idade.forEach(i => queryParams.append('idade', i));
      appliedFilters.anoPesquisa.forEach(a => queryParams.append('ano', a));
      appliedFilters.serie.forEach(s => queryParams.append('serie', s));

      console.log('Query params:', queryParams.toString());
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  return (
    <ProtectedRoute>
      {/* ENVOLVA TODO O CONTEÚDO COM GestureHandlerRootView */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={homeStyles.container} edges={['bottom']}>
          {/* Header com menu lateral */}
          <AppHeader showMenuButton={true} showStatsButton={true} />

          {/* Conteúdo da tela */}
          <View style={homeStyles.content}>
            {/* Botão de estatísticas flutuante (canto superior direito) */}
            <TouchableOpacity style={homeStyles.floatingStatsButton}>
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
                      {/* Mesorregião */}
                      <View style={homeStyles.filterSection}>
                        <Text style={homeStyles.filterSectionTitle}>Mesorregião</Text>
                        <View style={homeStyles.checkboxGroup}>
                          {['Sertão', 'São Francisco', 'Agreste', 'Mata', 'Metropolitana'].map((regiao) => (
                            <TouchableOpacity
                              key={regiao}
                              style={homeStyles.checkboxItem}
                              onPress={() => toggleFilter('mesorregiao', regiao)}
                              activeOpacity={0.7}
                            >
                              <View style={[
                                homeStyles.checkbox,
                                isFilterChecked('mesorregiao', regiao) && homeStyles.checkboxChecked
                              ]}>
                                {isFilterChecked('mesorregiao', regiao) && (
                                  <Text style={homeStyles.checkboxCheck}>✓</Text>
                                )}
                              </View>
                              <Text style={homeStyles.checkboxLabel}>{regiao} 📋</Text>
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
                              onPress={() => toggleFilter('idade', value)}
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
                              onPress={() => toggleFilter('sexo', value)}
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

                      {/* Ano da pesquisa */}
                      <View style={homeStyles.filterSection}>
                        <Text style={homeStyles.filterSectionTitle}>Ano da pesquisa</Text>
                        <View style={homeStyles.checkboxGroup}>
                          {['2016', '2022'].map((ano) => (
                            <TouchableOpacity
                              key={ano}
                              style={homeStyles.checkboxItem}
                              onPress={() => toggleFilter('anoPesquisa', ano)}
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
                              onPress={() => toggleFilter('serie', serie)}
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
    </ProtectedRoute>
  );
};

export default HomeScreen;