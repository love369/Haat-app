// components/Categories.tsx
import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, FlatList, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { IMAGE_BASE_URL } from '../utils/commonString';

// Define types based on your JSON structure
interface ProductImage {
  id: number;
  priority: number;
  serverImageUrl: string;
  smallImageUrl: string;
  blurhash: string | null;
  group: number;
}

interface Product {
  id: number;
  name: {
    ar: string | null;
    'en-US': string | null;
    he: string | null;
  };
  description: {
    ar: string | null;
    'en-US': string | null;
    he: string | null;
  };
  discountPrice: number;
  basePrice: number;
  productImages: ProductImage[];
  // Add other product properties as needed
}

interface MarketSubcategory {
  id: number;
  name: {
    ar: string;
    'en-US': string;
    he: string;
  };
  serverImageUrl: string | null;
  smallImageUrl: string | null;
  blurhash: string | null;
  priority: number;
  hide: boolean;
  products: Product[];
  productsCount: number;
  hasDiscount: boolean;
  supportDynamicPricing: boolean;
}

interface MarketCategory {
  id: number;
  name: {
    ar: string;
    'en-US': string;
    he: string;
    fr: string;
  };
  serverImageUrl: string;
  smallImageUrl: string;
  blurhash: string;
  priority: number;
  hide: boolean;
  marketSubcategories: MarketSubcategory[];
  productsCount: number;
  hasDiscount: boolean;
  supportDynamicPricing: boolean;
}

interface CategoriesProps {
  categories: MarketCategory[];
  imageBaseUrl: string;
}

type RootStackParamList = {
  RestaurantDetailsScreen: { products: Product[] };
};

const Categories: React.FC<CategoriesProps> = ({ categories, imageBaseUrl }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeCategory, setActiveCategory] = useState(0);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<FlatList>(null);

  const handleSubcategoryPress = (subcategory: MarketSubcategory) => {
    navigation.navigate('RestaurantDetailsScreen', { 
      products: subcategory.products 
    });
  };

  const scrollToCategory = (index: number) => {
    setActiveCategory(index);
    if (verticalScrollRef.current) {
      verticalScrollRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.1
      });
    }
  };

  const handleVerticalScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const categoryHeights = categories.map((_, index) => {
      // Estimate height of each category section (adjust based on your layout)
      return 200 + (categories[index].marketSubcategories.length > 0 ? 150 : 0);
    });

    let accumulatedHeight = 0;
    let currentIndex = 0;
    
    for (let i = 0; i < categoryHeights.length; i++) {
      accumulatedHeight += categoryHeights[i];
      if (scrollY < accumulatedHeight) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex !== activeCategory) {
      setActiveCategory(currentIndex);
      if (horizontalScrollRef.current) {
        horizontalScrollRef.current.scrollTo({
          x: currentIndex * 120, // Adjust based on your category item width
          animated: true
        });
      }
    }
  };

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCategoriesText}>{"No categories available"}</Text>
      </View>
    );
  }

  // Horizontal category selector
  const renderCategorySelector = () => (
    <ScrollView
      ref={horizontalScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categorySelector}
    >
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categorySelectorItem,
            activeCategory === index && styles.activeCategorySelectorItem
          ]}
          onPress={() => scrollToCategory(index)}
        >
          <Text
            style={[
              styles.categorySelectorText,
              activeCategory === index && styles.activeCategorySelectorText
            ]}
            numberOfLines={1}
          >
            {category.name?.['en-US'] || 'Unnamed Category'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render each category section
  const renderCategorySection = ({ item: category, index }: { item: MarketCategory; index: number }) => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Image
          source={{ 
            uri: category.serverImageUrl 
              ? `${imageBaseUrl}${category.serverImageUrl}`
              : 'https://www.haat.delivery/assets/logo.svg'
          }}
          style={styles.categoryImage}
          resizeMode={category.serverImageUrl ? "cover" : "contain"}
          onError={() => console.log('Failed to load category image')}
        />
        <Text style={styles.categoryName}>
          {category.name?.['en-US'] || 'Unnamed Category'}
        </Text>
      </View>

      {/* Subcategories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.subcategoriesContainer}
      >
        {category.marketSubcategories.map((subcategory) => (
          <TouchableOpacity
            key={subcategory.id}
            style={styles.subcategoryCard}
            onPress={() => handleSubcategoryPress(subcategory)}
          >
            {/* Subcategory Image */}
            <Image
              source={{ 
                uri: subcategory.serverImageUrl 
                  ? `${imageBaseUrl}${subcategory.serverImageUrl}`
                  : 'https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/nyblwunnuflkmm9yyfit'
              }}
              style={styles.subcategoryImage}
              resizeMode={subcategory.serverImageUrl ? "cover" : "cover"}
              onError={() => console.log('Failed to load subcategory image')}
            />
            
            <Text style={styles.subcategoryName} numberOfLines={2}>
              {subcategory.name?.['en-US'] || 'Unnamed Subcategory'}
            </Text>
            
            <Text style={styles.productsCount}>
              {subcategory.productsCount} products
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Sticky Category Selector */}
      <View style={styles.stickyHeader}>
        {renderCategorySelector()}
      </View>

      {/* Vertical Scroll with Categories */}
      <FlatList
        ref={verticalScrollRef}
        data={categories}
        renderItem={renderCategorySection}
        keyExtractor={(item) => item.id.toString()}
        onScroll={handleVerticalScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.verticalListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  categorySelector: {
    paddingHorizontal: 16,
  },
  categorySelectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeCategorySelectorItem: {
    backgroundColor: '#007AFF',
  },
  categorySelectorText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategorySelectorText: {
    color: 'white',
    fontWeight: '600',
  },
  verticalListContent: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  subcategoriesContainer: {
    marginHorizontal: -4,
  },
  subcategoryCard: {
    width: 120,
    marginHorizontal: 8,
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
  subcategoryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  productsCount: {
    fontSize: 12,
    color: '#666',
  },
  noCategoriesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
});

export default Categories;