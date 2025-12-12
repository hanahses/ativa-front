// app/home.tsx
import AppHeader from '@/src/components/header';
import InteractiveMap from '@/src/components/interactiveMap';
import StatsPanel from '@/src/components/statsPanel';
import { FILTER_PANEL_HEIGHT, homeStyles } from '@/src/styles/styles';
import React, { useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import geoJsonData from '@/assets/data/regioes.json';

interface Filters {
  sexo: string | null;
  anoPesquisa: string | null;
  idade: string | null;
  serie: string | null;
}

const HomeScreen: React.FC = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [slideUpAnim] = useState(new Animated.Value(FILTER_PANEL_HEIGHT));
  const [selectedMapRegion, setSelectedMapRegion] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    sexo: null,
    anoPesquisa: null,
    idade: null,
    serie: null,
  });

  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    sexo: null,
    anoPesquisa: null,
    idade: null,
    serie: null,
  });

  const selectFilter = (category: keyof Filters, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [category]: prevFilters[category] === value ? null : value,
    }));
  };

  const isFilterChecked = (category: keyof Filters, value: string): boolean => {
    return filters[category] === value;
  };

  const handleMapRegionPress = (regionName: string) => {
    console.log('🗺️ Região clicada no Home:', regionName);
    setSelectedMapRegion(regionName);
  };

  const openFilters = () => {
    setFilterVisible(true);
    Animated.spring(slideUpAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeFilters = () => {
    Animated.timing(slideUpAnim, {
      toValue: FILTER_PANEL_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setFilterVisible(false);
    });
  };

  const applyFilters = () => {
    console.log('Filtros aplicados:', filters);
    setAppliedFilters(filters);
    closeFilters();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={homeStyles.container} edges={['bottom']}>
        <AppHeader showMenuButton={true} showStatsButton={true} />

        <View style={homeStyles.content}>
          {/* Painel de estatísticas independente */}
          <StatsPanel 
            selectedRegion={selectedMapRegion}
            filters={appliedFilters}
          />

          {/* Área do Mapa */}
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
          <TouchableOpacity
            style={homeStyles.modalOverlay}
            activeOpacity={1}
            onPress={closeFilters}
          >
            <Animated.View
              style={[
                homeStyles.filterPanel,
                {
                  transform: [{ translateY: slideUpAnim }],
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <TouchableOpacity onPress={closeFilters}>
                <View style={homeStyles.filterHeader}>
                  <Text style={homeStyles.filterHeaderIcon}>ˇ</Text>
                  <Text style={homeStyles.filterTitle}>FILTROS</Text>
                  <Text style={homeStyles.filterHeaderIcon}>ˇ</Text>
                </View>
              </TouchableOpacity>

              <ScrollView style={homeStyles.filterContent}>
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

                <View style={{ height: 100 }} />
              </ScrollView>

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