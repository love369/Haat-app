import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// Enhanced interfaces
interface EnhancedMarketData {
  name?: {
    'en-US'?: string;
  };
  description?: {
    'en-US'?: string;
  };
  address?: {
    'en-US'?: string;
  };
}

interface EnhancedMarketCardProps {
  marketData?: EnhancedMarketData;
  imageUrl?: string;
  onPress?: () => void;
  backgroundColor?: string;
  imageSize?: number;
}

const MarketCardEnhanced: React.FC<EnhancedMarketCardProps> = ({ 
  marketData, 
  imageUrl, 
  onPress, 
  backgroundColor = 'red',
  imageSize = 120 
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[styles.marketCard, { backgroundColor }]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.contentContainer}>
        {imageUrl && (
          <View style={[styles.imageContainer, { width: imageSize, height: imageSize }]}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.marketImage} 
              resizeMode="cover"
              onError={(e) => console.log('Failed to load image:', e.nativeEvent.error)}
            />
          </View>
        )}
        
        <View style={styles.textContent}>
          <Text style={styles.marketName}>{marketData?.name?.['en-US']}</Text>
          
          {marketData?.description && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>{marketData?.description?.['en-US']}</Text>
            </View>
          )}
          
          {marketData?.address && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>{marketData?.address?.['en-US']}</Text>
            </View>
          )}
        </View>
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  marketCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
    marginBottom:20
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  marketImage: {
    width: '100%',
    height: '100%',
  },
  textContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  marketName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailSection: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default MarketCardEnhanced;