// src/components/InteractiveMap.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_CONTAINER_WIDTH = SCREEN_WIDTH - 20;
const MAP_CONTAINER_HEIGHT = SCREEN_HEIGHT * 0.62;
const PADDING = 20;
const MAP_WIDTH = MAP_CONTAINER_WIDTH - (PADDING * 0.1);
const MAP_HEIGHT = MAP_CONTAINER_HEIGHT - (PADDING * 2);

interface InteractiveMapProps {
  geoJsonData: any;
  onRegionPress?: (regionName: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ geoJsonData, onRegionPress }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedRecifeSubRegion, setSelectedRecifeSubRegion] = useState<string | null>(null);
  const [showRecifeDropdown, setShowRecifeDropdown] = useState(false);
  const [bounds, setBounds] = useState({ minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shared values para animação de zoom e pan
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    try {
      console.log('📊 Carregando GeoJSON...');
      if (!geoJsonData) {
        throw new Error('GeoJSON não fornecido');
      }
      if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
        throw new Error('GeoJSON inválido - features não encontrado');
      }
      console.log('✅ GeoJSON válido:', geoJsonData.features.length, 'regiões');
      calculateBounds();
      setIsReady(true);
    } catch (err: any) {
      console.error('❌ Erro ao carregar GeoJSON:', err);
      setError(err.message || 'Erro desconhecido');
    }
  }, [geoJsonData]);

  const calculateBounds = () => {
    try {
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLon = Infinity;
      let maxLon = -Infinity;

      geoJsonData.features.forEach((feature: any) => {
        try {
          const coords = feature.geometry.coordinates;
          const type = feature.geometry.type;
          
          const normalizedCoords = type === 'Polygon' ? [coords] : coords;

          normalizedCoords.forEach((polygon: any) => {
            polygon.forEach((ring: any) => {
              ring.forEach((coord: any) => {
                const [lon, lat] = coord;
                if (!isNaN(lon) && !isNaN(lat)) {
                  minLat = Math.min(minLat, lat);
                  maxLat = Math.max(maxLat, lat);
                  minLon = Math.min(minLon, lon);
                  maxLon = Math.max(maxLon, lon);
                }
              });
            });
          });
        } catch (err) {
          console.warn('⚠️ Erro ao processar feature:', err);
        }
      });

      const latPadding = (maxLat - minLat) * 0.01;
      const lonPadding = (maxLon - minLon) * 0.01;

      minLat -= latPadding;
      maxLat += latPadding;
      minLon -= lonPadding;
      maxLon += lonPadding;

      console.log('📍 Bounds calculados:', { minLat, maxLat, minLon, maxLon });
      setBounds({ minLat, maxLat, minLon, maxLon });
    } catch (err) {
      console.error('❌ Erro ao calcular bounds:', err);
      throw err;
    }
  };

  const projectCoordinate = (lon: number, lat: number): [number, number] => {
    const { minLat, maxLat, minLon, maxLon } = bounds;
    
    if (maxLon === minLon || maxLat === minLat) {
      return [0, 0];
    }
    
    const dataWidth = maxLon - minLon;
    const dataHeight = maxLat - minLat;
    const dataAspect = dataWidth / dataHeight;
    const containerAspect = MAP_WIDTH / MAP_HEIGHT;
    
    let offsetX = 5;
    let offsetY = -90;
    const enlargeFactor = 1.3;
    
    let scale;
    
    if (dataAspect > containerAspect) {
      scale = (MAP_WIDTH / dataWidth) * enlargeFactor;
      offsetY += (MAP_HEIGHT - (dataHeight * scale)) / 2;
    } else {
      scale = (MAP_HEIGHT / dataHeight) * enlargeFactor;
      offsetX += (MAP_WIDTH - (dataWidth * scale)) / 2;
    }
    
    const x = ((lon - minLon) * scale) + offsetX;
    const y = ((maxLat - lat) * scale) + offsetY;
    
    return [x, y];
  };

  const coordinatesToPath = (geometry: any): string => {
    try {
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

      return polygons.map((polygon: any) => {
        return polygon.map((ring: any) => {
          const pathCommands = ring.map((coord: any, index: number) => {
            const [x, y] = projectCoordinate(coord[0], coord[1]);
            return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
          }).join(' ');
          
          return pathCommands + ' Z';
        }).join(' ');
      }).join(' ');
    } catch (err) {
      console.error('❌ Erro ao converter coordenadas:', err);
      return '';
    }
  };

  const handleRegionPress = (regionName: string) => {
    console.log('🗺️ Região clicada:', regionName);
    
    // Normalizar nome (remover "RD " e transformar em apenas "Recife")
    let displayName = regionName.replace('RD ', '');
    if (displayName.includes('Recife')) {
      displayName = 'Recife';
    }
    
    // Toggle: se já está selecionada, desseleciona; senão, seleciona
    if (selectedRegion === displayName) {
      setSelectedRegion(null);
      setShowRecifeDropdown(false);
      setSelectedRecifeSubRegion(null);
      console.log('🗺️ Região desmarcada:', displayName);
    } else {
      setSelectedRegion(displayName);
      
      // Se for Recife, mostrar dropdown
      if (displayName === 'Recife') {
        setShowRecifeDropdown(true);
        // Definir Recife Sul como padrão
        setSelectedRecifeSubRegion('Recife Sul');
        if (onRegionPress) {
          onRegionPress('RD Recife Sul');
        }
      } else {
        setShowRecifeDropdown(false);
        setSelectedRecifeSubRegion(null);
        if (onRegionPress) {
          onRegionPress(regionName);
        }
      }
      
      console.log('🗺️ Região marcada:', displayName);
    }
  };

  const handleRecifeSubRegionSelect = (subRegion: string) => {
    setSelectedRecifeSubRegion(subRegion);
    console.log('🗺️ Sub-região de Recife selecionada:', subRegion);
    
    if (onRegionPress) {
      // Mapear para o nome correto no backend
      const mappedName = subRegion === 'Recife Norte' ? 'RD Recife Norte' : 'RD Recife Sul';
      onRegionPress(mappedName);
    }
  };

  // Gesto de pinça para zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      scale.value = Math.max(1, Math.min(scale.value, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Gesto de pan (arrastar)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const maxTranslateX = (MAP_WIDTH * (scale.value - 1)) / 2;
      const maxTranslateY = (MAP_HEIGHT * (scale.value - 1)) / 2;

      translateX.value = Math.max(
        -maxTranslateX,
        Math.min(maxTranslateX, savedTranslateX.value + event.translationX)
      );
      translateY.value = Math.max(
        -maxTranslateY,
        Math.min(maxTranslateY, savedTranslateY.value + event.translationY)
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Gesto de toque duplo para resetar zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 300 });
      savedScale.value = 1;
      translateX.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  // Combinar os gestos
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  // Estilo animado para o SVG
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B5D36" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Erro ao carregar mapa</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  try {
    return (
      <View style={styles.container}>
        <View style={styles.mapBorder}>
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[{ width: MAP_WIDTH, height: MAP_HEIGHT }, animatedStyle]}>
              <Svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
                <G>
                  {geoJsonData.features.map((feature: any, index: number) => {
                    try {
                      let displayName = feature.properties.name.replace('RD ', '');
                      if (displayName.includes('Recife')) {
                        displayName = 'Recife';
                      }
                      
                      const isSelected = selectedRegion === displayName;
                      const pathData = coordinatesToPath(feature.geometry);
                      
                      if (!pathData) return null;
                      
                      return (
                        <Path
                          key={`region-${index}`}
                          d={pathData}
                          fill={isSelected ? '#2B5D36' : '#D3D3D3'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          onPress={() => handleRegionPress(feature.properties.name)}
                        />
                      );
                    } catch (err) {
                      console.warn('⚠️ Erro ao renderizar região:', err);
                      return null;
                    }
                  })}
                </G>
              </Svg>
            </Animated.View>
          </GestureDetector>

          {/* Dropdown de Recife (canto inferior esquerdo) */}
          {showRecifeDropdown && (
            <View style={styles.recifeDropdownContainer}>
              <TouchableOpacity
                style={[
                  styles.recifeDropdownOption,
                  selectedRecifeSubRegion === 'Recife Norte' && styles.recifeDropdownOptionSelected
                ]}
                onPress={() => handleRecifeSubRegionSelect('Recife Norte')}
              >
                <Text style={[
                  styles.recifeDropdownText,
                  selectedRecifeSubRegion === 'Recife Norte' && styles.recifeDropdownTextSelected
                ]}>
                  Recife Norte
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.recifeDropdownOption,
                  selectedRecifeSubRegion === 'Recife Sul' && styles.recifeDropdownOptionSelected
                ]}
                onPress={() => handleRecifeSubRegionSelect('Recife Sul')}
              >
                <Text style={[
                  styles.recifeDropdownText,
                  selectedRecifeSubRegion === 'Recife Sul' && styles.recifeDropdownTextSelected
                ]}>
                  Recife Sul
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Label da região selecionada */}
        {selectedRegion && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendText}>
              Região: {selectedRegion}
              {selectedRecifeSubRegion && ` - ${selectedRecifeSubRegion}`}
            </Text>
          </View>
        )}
      </View>
    );
  } catch (err) {
    console.error('❌ Erro ao renderizar mapa:', err);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Erro ao renderizar mapa</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mapBorder: {
    width: MAP_CONTAINER_WIDTH,
    top: 55,
    height: MAP_CONTAINER_HEIGHT,
    borderWidth: 3,
    borderColor: '#2B5D36',
    borderRadius: 0,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  loadingContainer: {
    width: MAP_CONTAINER_WIDTH,
    height: MAP_CONTAINER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2B5D36',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    width: MAP_CONTAINER_WIDTH,
    height: MAP_CONTAINER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#e74c3c',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  legendContainer: {
    marginTop: 0,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2B5D36',
    borderRadius: 8,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recifeDropdownContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2B5D36',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recifeDropdownOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginVertical: 2,
  },
  recifeDropdownOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  recifeDropdownText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  recifeDropdownTextSelected: {
    fontWeight: '700',
  },
});

export default InteractiveMap;