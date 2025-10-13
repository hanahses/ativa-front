// src/components/InteractiveMap.tsx
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - 40; // 20px padding de cada lado
const MAP_HEIGHT = MAP_WIDTH * 0.8; // Proporção do mapa

interface GeoJSONFeature {
  type: string;
  properties: {
    name: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

interface InteractiveMapProps {
  geoJsonData: GeoJSONData;
  onRegionPress?: (regionName: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ geoJsonData, onRegionPress }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [bounds, setBounds] = useState({ minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 });

  useEffect(() => {
    // Calcular os limites do mapa (bounding box)
    calculateBounds();
  }, [geoJsonData]);

  const calculateBounds = () => {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;

    geoJsonData.features.forEach(feature => {
      feature.geometry.coordinates.forEach(polygon => {
        polygon.forEach(coord => {
          const [lon, lat] = coord;
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLon = Math.min(minLon, lon);
          maxLon = Math.max(maxLon, lon);
        });
      });
    });

    setBounds({ minLat, maxLat, minLon, maxLon });
  };

  // Converter coordenadas geográficas para coordenadas SVG
  const projectCoordinate = (lon: number, lat: number): [number, number] => {
    const { minLat, maxLat, minLon, maxLon } = bounds;
    
    const x = ((lon - minLon) / (maxLon - minLon)) * MAP_WIDTH;
    const y = ((maxLat - lat) / (maxLat - minLat)) * MAP_HEIGHT;
    
    return [x, y];
  };

  // Converter array de coordenadas em string SVG path
  const coordinatesToPath = (coordinates: number[][][]): string => {
    return coordinates.map(polygon => {
      const pathCommands = polygon.map((coord, index) => {
        const [x, y] = projectCoordinate(coord[0], coord[1]);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      }).join(' ');
      
      return pathCommands + ' Z'; // Fechar o path
    }).join(' ');
  };

  const handleRegionPress = (regionName: string) => {
    setSelectedRegion(regionName);
    if (onRegionPress) {
      onRegionPress(regionName);
    }
  };

  return (
    <View style={styles.container}>
      <Svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
        <G>
          {geoJsonData.features.map((feature, index) => {
            const isSelected = selectedRegion === feature.properties.name;
            const pathData = coordinatesToPath(feature.geometry.coordinates);
            
            return (
              <Path
                key={index}
                d={pathData}
                fill={isSelected ? '#2B5D36' : '#D3D3D3'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                onPress={() => handleRegionPress(feature.properties.name)}
              />
            );
          })}
        </G>
      </Svg>

      {/* Legenda da região selecionada */}
      {selectedRegion && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendText}>Região selecionada:</Text>
          <Text style={styles.legendRegion}>{selectedRegion}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2B5D36',
    borderRadius: 8,
    alignItems: 'center',
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  legendRegion: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default InteractiveMap;