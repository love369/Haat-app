// screens/RestaurantDetailsScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SectionList } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../utils/commonString';

type RootStackParamList = {
  RestaurantDetailsScreen: { 
    headingMainCategries: any;
  };
};

type RestaurantDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RestaurantDetailsScreen'>;

interface RestaurantDetailsScreenProps {
  route: RestaurantDetailsScreenRouteProp;
}

const RestaurantDetailsScreen: React.FC<RestaurantDetailsScreenProps> = ({ route }) => {
  const { headingMainCategries } = route.params;
  const [activeMainCategory, setActiveMainCategory] = useState(0);
  const [activeSubCategory, setActiveSubCategory] = useState(0);
  const mainCategoriesScrollRef = useRef<ScrollView>(null);
  const sectionListRef = useRef<SectionList>(null);

  // Extract main categories and subcategories from the JSON structure
  const mainCategories = headingMainCategries || [];
  
  // Prepare sections data for SectionList
  const sections = mainCategories.flatMap(mainCategory => 
    mainCategory.marketSubcategories?.map(subcategory => ({
      title: subcategory.name?.['en-US'] || 'Unnamed Subcategory',
      data: subcategory.products || [],
      mainCategoryIndex: mainCategories.indexOf(mainCategory),
      subCategoryIndex: mainCategory.marketSubcategories?.indexOf(subcategory) || 0,
      id: subcategory.id
    })) || []
  );

  // Get subcategories for the currently selected main category
  const currentSubCategories = mainCategories[activeMainCategory]?.marketSubcategories || [];

  const scrollToMainCategory = (index: number) => {
    setActiveMainCategory(index);
    
    if (mainCategoriesScrollRef.current) {
      mainCategoriesScrollRef.current.scrollTo({
        x: index * 120,
        animated: true
      });
    }

    // Scroll to the first section of the new main category
    const firstSectionIndex = sections.findIndex(section => section.mainCategoryIndex === index);
    if (firstSectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: firstSectionIndex,
        itemIndex: 0,
        viewPosition: 0,
        animated: true
      });
    }
  };

  const scrollToSubCategory = (subCategoryId: number) => {
    const sectionIndex = sections.findIndex(section => section.id === subCategoryId);
    if (sectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewPosition: 0,
        animated: true
      });
    }
  };

  // Handle section viewable items to update active subcategory
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const firstVisibleSection = viewableItems[0].section;
      if (firstVisibleSection) {
        setActiveMainCategory(firstVisibleSection.mainCategoryIndex);
        setActiveSubCategory(firstVisibleSection.subCategoryIndex);
        
        // Scroll horizontal category selector
        if (mainCategoriesScrollRef.current) {
          mainCategoriesScrollRef.current.scrollTo({
            x: firstVisibleSection.mainCategoryIndex * 120,
            animated: true
          });
        }
      }
    }
  };

  // Render horizontal main category selector
  const renderMainCategorySelector = () => (
    <ScrollView
      ref={mainCategoriesScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.mainCategorySelector}
      contentContainerStyle={styles.mainCategorySelectorContent}
    >
      {mainCategories.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.mainCategorySelectorItem,
            activeMainCategory === index && styles.activeMainCategorySelectorItem
          ]}
          onPress={() => scrollToMainCategory(index)}
        >
          <Text
            style={[
              styles.mainCategorySelectorText,
              activeMainCategory === index && styles.activeMainCategorySelectorText
            ]}
            numberOfLines={1}
          >
            {category.name?.['en-US'] || 'Unnamed Category'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render horizontal subcategory selector
  const renderSubCategorySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.subCategorySelector}
      contentContainerStyle={styles.subCategorySelectorContent}
    >
      {currentSubCategories.map((subcategory, index) => (
        <TouchableOpacity
          key={subcategory.id}
          style={[
            styles.subCategorySelectorItem,
            activeSubCategory === index && styles.activeSubCategorySelectorItem
          ]}
          onPress={() => scrollToSubCategory(subcategory.id)}
        >
          <Text
            style={[
              styles.subCategorySelectorText,
              activeSubCategory === index && styles.activeSubCategorySelectorText
            ]}
            numberOfLines={1}
          >
            {subcategory.name?.['en-US'] || 'Unnamed Subcategory'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render section header (sticky)
  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {section.title}
      </Text>
      <Text style={styles.sectionCount}>
        {section.data.length} products
      </Text>
    </View>
  );

  // Render product item - Swiggy/Zomato style
  const renderProductItem = ({ item }: { item: any }) => {
    const productImage = item.productImages?.[0]?.serverImageUrl;
    const hasDiscount = item.discountPrice && item.basePrice > item.discountPrice;
    
    return (
      <View style={styles.productCard}>
        {/* Product Image with favorite icon */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: productImage 
                ? `${IMAGE_BASE_URL}${productImage}`
                : PLACEHOLDER_IMAGE
            }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => console.log('Failed to load product image')}
          />
          {/* Favorite Heart Icon */}
          <TouchableOpacity style={styles.favoriteIcon}>
            <Text style={styles.favoriteText}>❤️</Text>
          </TouchableOpacity>
          
          {/* Discount Badge */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>
        
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name?.['en-US'] || 'Unnamed Product'}
          </Text>
          
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description?.['en-US'] || 'Delicious item'}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              ${item.discountPrice || item.basePrice}
            </Text>
            
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                ${item.basePrice}
              </Text>
            )}
          </View>
          
          {/* Rating and delivery time */}
          <View style={styles.productMeta}>
            <Text style={styles.rating}>⭐ 4.2 • 20 mins</Text>
          </View>
          
          {/* Add to Cart Button */}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>ADD +</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render section list with all products
  const renderProductsSections = () => (
    <SectionList
      ref={sectionListRef}
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderProductItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={true}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
      contentContainerStyle={styles.sectionListContent}
      showsVerticalScrollIndicator={false}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products available</Text>
        </View>
      }
    />
  );

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <Text style={styles.screenTitle}>
        All Products ({sections.reduce((total, section) => total + section.data.length, 0)})
      </Text>
      
      {/* Level 1: Horizontal Main Category Selector */}
      {mainCategories.length > 0 && renderMainCategorySelector()}
      
      {/* Level 2: Horizontal Subcategory Selector */}
      {currentSubCategories.length > 0 && renderSubCategorySelector()}
      
      {/* Level 3: SectionList with sticky headers */}
      {renderProductsSections()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mainCategorySelector: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mainCategorySelectorContent: {
    paddingHorizontal: 16,
  },
  mainCategorySelectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeMainCategorySelectorItem: {
    backgroundColor: '#007AFF',
  },
  mainCategorySelectorText: {
    fontSize: 19,
    width: 100,
    height: 50,
    color: '#666',
    fontWeight: '500',
  },
  activeMainCategorySelectorText: {
    color: 'white',
    fontWeight: '600',
  },
  subCategorySelector: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subCategorySelectorContent: {
    paddingHorizontal: 16,
  },
  subCategorySelectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeSubCategorySelectorItem: {
    backgroundColor: '#FF7E8B',
  },
  subCategorySelectorText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 100,
    height: 50,
  },
  activeSubCategorySelectorText: {
    color: 'white',
    fontWeight: '600',
  },
  // sectionListContent: {
  //   paddingHorizontal: 12,
  //   paddingBottom: 16,
  // },
  // columnWrapper: {
  //   justifyContent: 'space-between',
  //   gap: 12,
  //   marginBottom: 12,
  // },
  sectionHeader: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteText: {
    fontSize: 14,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    height: 40,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    height: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  productMeta: {
    marginBottom: 8,
  },
  rating: {
    fontSize: 11,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  /////////////////////

  sectionListContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  productCard: {
    width: '100%', // This will be 48% of the column wrapper due to numColumns=2
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default RestaurantDetailsScreen;