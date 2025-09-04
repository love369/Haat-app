// screens/RestaurantDetailsScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../utils/commonString';
type RootStackParamList = {
  RestaurantDetailsScreen: { products: any[] };
};

type RestaurantDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RestaurantDetailsScreen'>;

interface RestaurantDetailsScreenProps {
  route: RestaurantDetailsScreenRouteProp;
}

const RestaurantDetailsScreen: React.FC<RestaurantDetailsScreenProps> = ({ route }) => {
  const { products } = route.params;
  

  const renderProductItem = ({ item }: { item: any }) => {
    const productImage = item.productImages?.[0]?.serverImageUrl;
    
    return (
      <View style={styles.productCard}>
        {productImage ? (
          <Image
            source={{ uri: `${IMAGE_BASE_URL}${productImage}` }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => console.log('Failed to load product image')}
          />
        ) : (
          <Image
            source={{ uri: PLACEHOLDER_IMAGE }}
            style={styles.productImage}
            resizeMode="contain"
          />
        )}
        
        <Text style={styles.productName}>
          {item.name?.['en-US'] || 'Unnamed Product'}
        </Text>
        
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description?.['en-US'] || 'No description available'}
        </Text>
        
        <Text style={styles.productPrice}>
          ${item.discountPrice || item.basePrice}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>
      
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default  RestaurantDetailsScreen;