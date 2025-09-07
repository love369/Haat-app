// components/Categories.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { IMAGE_BASE_URL } from '../utils/commonString';

// ... (your existing interfaces remain the same)

const Categories: React.FC<CategoriesProps> = ({ categories, imageBaseUrl }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeCategory, setActiveCategory] = useState(0);

  const handleCategoryPress = (category: MarketCategory) => {
    // Get all products from all subcategories in this category
    navigation.navigate('RestaurantDetailsScreen', {
      headingMainCategries: category,
     
    });
  };

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCategoriesText}>{"No categories available"}</Text>
      </View>
    );
  }

  // Main category cards with background images
  const renderCategoryCards = () => (
    <ScrollView
      style={styles.mainScrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.categoryGridContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(categories)}
          >

            {/* Category Image */}
            
            <Image
              source={{
                uri: category.serverImageUrl && category.serverImageUrl !== 'null'
                  ? `${imageBaseUrl}${category.serverImageUrl}`
                  : 'https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/nyblwunnuflkmm9yyfit'
              }}
              style={styles.categoryCardImage}
              resizeMode="cover"
              onError={(e) => {
                console.log('Failed to load category image:', e.nativeEvent.error);
                // Fallback to default image if the URL fails to load
                e.currentTarget.source = { uri: 'https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/nyblwunnuflkmm9yyfit' };
              }}
            />

            {/* White background for text */}
            <View style={styles.textContainer}>
              {/* Category Name */}
              <Text style={styles.categoryCardText} numberOfLines={2}>
                {category.name?.['en-US'] || 'Unnamed Category'}
              </Text>

              {/* Products Count */}
              <Text style={styles.productsCount}>
                {category.productsCount} products
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Main Content - Category Cards */}
      {renderCategoryCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  mainScrollContainer: {
    flex: 1,
  },
  categoryGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardImage: {
    width: '100%',
    height: 120,
  },
  textContainer: {
    padding: 12,
    backgroundColor: 'white',
  },
  categoryCardText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  productsCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  noCategoriesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
});

export default Categories;