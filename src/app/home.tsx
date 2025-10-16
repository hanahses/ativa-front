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
    
    // Aqui você pode:
    // 1. Filtrar dados baseado na região
    // 2. Mostrar estatísticas da região
    // 3. Abrir um modal com detalhes
    // 4. Atualizar gráficos
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
    
    // Aqui você pode:
    // 1. Fazer requisição à API com os filtros
    // 2. Atualizar o estado global (Context/Redux)
    // 3. Filtrar dados locais
    
    // Exemplo de como usar os filtros em uma requisição:
    fetchDashboardData(filters);
    
    closeFilters();
  };

  // Função exemplo para buscar dados com filtros
  const fetchDashboardData = async (appliedFilters: Filters) => {
    try {
      // Construir query string com os filtros
      const queryParams = new URLSearchParams();
      
      // Adicionar cada categoria de filtro
      appliedFilters.mesorregiao.forEach(m => queryParams.append('mesorregiao', m));
      appliedFilters.sexo.forEach(s => queryParams.append('sexo', s));
      appliedFilters.idade.forEach(i => queryParams.append('idade', i));
      appliedFilters.anoPesquisa.forEach(a => queryParams.append('ano', a));
      appliedFilters.serie.forEach(s => queryParams.append('serie', s));

      console.log('Query params:', queryParams.toString());
      
      // Exemplo de requisição à API
      // const response = await fetch(`http://10.0.2.2:8080/api/dashboard?${queryParams}`);
      // const data = await response.json();
      // setDashboardData(data);
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={homeStyles.container} edges={['bottom']}>
        {/* Header com menu lateral */}
        <AppHeader showMenuButton={true} showStatsButton={true} />

        {/* Conteúdo da tela */}
        <View style={homeStyles.content}>
          {/* Botão de estatísticas flutuante (canto superior direito) */}
          <TouchableOpacity style={homeStyles.floatingStatsButton}>
            <Image
                source={require('@/assets/images/dashboard_btn.png')}
                //style={styles.menuIcon}
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


              {/* <View style={homeStyles.filterHeader}>
                <TouchableOpacity onPress={closeFilters}>
                  <Text style={homeStyles.filterHeaderIcon}>ˇ</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeFilters}>
                  <Text style={homeStyles.filterTitle}>FILTROS</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeFilters}>
                  <Text style={homeStyles.filterHeaderIcon}>ˇ</Text>
                </TouchableOpacity>
              </View> */}

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
                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('mesorregiao', 'Sertão')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('mesorregiao', 'Sertão') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('mesorregiao', 'Sertão') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>Sertão 📋</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('mesorregiao', 'São Francisco')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('mesorregiao', 'São Francisco') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('mesorregiao', 'São Francisco') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>São Francisco 📋</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('mesorregiao', 'Agreste')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('mesorregiao', 'Agreste') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('mesorregiao', 'Agreste') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>Agreste 📋</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('mesorregiao', 'Mata')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('mesorregiao', 'Mata') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('mesorregiao', 'Mata') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>Mata 📋</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('mesorregiao', 'Metropolitana')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('mesorregiao', 'Metropolitana') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('mesorregiao', 'Metropolitana') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>Metropolitana 📋</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Idade */}
                    <View style={homeStyles.filterSection}>
                      <Text style={homeStyles.filterSectionTitle}>Idade</Text>
                      <View style={homeStyles.checkboxGroup}>
                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('idade', '14-15')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('idade', '14-15') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('idade', '14-15') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>14 aos 15 anos 👦</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('idade', '16-17')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('idade', '16-17') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('idade', '16-17') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>16 aos 17 anos 👨</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('idade', '18-19')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('idade', '18-19') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('idade', '18-19') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>18 aos 19 anos 🧑</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* COLUNA DIREITA */}
                  <View style={homeStyles.filterColumn}>
                    {/* Sexo */}
                    <View style={homeStyles.filterSection}>
                      <Text style={homeStyles.filterSectionTitle}>Sexo</Text>
                      <View style={homeStyles.checkboxGroup}>
                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('sexo', 'Masculino')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('sexo', 'Masculino') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('sexo', 'Masculino') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>Masculino ♂</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('sexo', 'Feminino')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('sexo', 'Feminino') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('sexo', 'Feminino') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>Feminino ♀</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Ano da pesquisa */}
                    <View style={homeStyles.filterSection}>
                      <Text style={homeStyles.filterSectionTitle}>Ano da pesquisa</Text>
                      <View style={homeStyles.checkboxGroup}>
                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('anoPesquisa', '2016')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('anoPesquisa', '2016') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('anoPesquisa', '2016') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>2016 📋</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('anoPesquisa', '2022')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('anoPesquisa', '2022') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('anoPesquisa', '2022') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>2022 📋</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Série */}
                    <View style={homeStyles.filterSection}>
                      <Text style={homeStyles.filterSectionTitle}>Série</Text>
                      <View style={homeStyles.checkboxGroup}>
                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('serie', '1')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('serie', '1') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('serie', '1') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>1ª Série 📋</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('serie', '2')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('serie', '2') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('serie', '2') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>2ª Série 📋</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={homeStyles.checkboxItem}
                          onPress={() => toggleFilter('serie', '3')}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            homeStyles.checkbox,
                            isFilterChecked('serie', '3') && homeStyles.checkboxChecked
                          ]}>
                            {isFilterChecked('serie', '3') && (
                              <Text style={homeStyles.checkboxCheck}>✓</Text>
                            )}
                          </View>
                          <Text style={homeStyles.checkboxLabel}>3ª Série 📋</Text>
                        </TouchableOpacity>
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
    </ProtectedRoute>
  );
};

export default HomeScreen;