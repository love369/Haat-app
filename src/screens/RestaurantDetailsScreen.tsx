// screens/RestaurantDetailsScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  StatusBar,
  Platform 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../utils/commonString';

const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = 8;
const HORIZONTAL_PADDING = 16;
// Change back to 2 columns
const CARD_WIDTH = (screenWidth - (HORIZONTAL_PADDING * 2) - CARD_MARGIN) / 2;

type RootStackParamList = {
  RestaurantDetailsScreen: { 
    headingMainCategries: any;
    restaurantInfo?: {
      rating?: number;
      deliveryTime?: string;
    };
  };
};

type RestaurantDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RestaurantDetailsScreen'>;

interface RestaurantDetailsScreenProps {
  route: RestaurantDetailsScreenRouteProp;
}

interface ProductSection {
  title: string;
  data: any[];
  mainCategoryIndex: number;
  subCategoryIndex: number;
  id: string;
}

const RestaurantDetailsScreen: React.FC<RestaurantDetailsScreenProps> = ({ route }) => {
  const { headingMainCategries, restaurantInfo } = route.params;
  const [activeMainCategory, setActiveMainCategory] = useState(0);
  const [activeSubCategory, setActiveSubCategory] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  
  const mainCategoriesScrollRef = useRef<ScrollView>(null);
  const subCategoriesScrollRef = useRef<ScrollView>(null);
  const productsListRef = useRef<FlatList>(null);

  // Extract main categories and subcategories from the JSON structure
  const mainCategories = headingMainCategries || [];
  
  // Prepare all products with section info
  React.useEffect(() => {
    const products: any[] = [];
    let productIndex = 0;
    
    mainCategories.forEach((mainCategory: any, mainIndex: number) => {
      mainCategory.marketSubcategories?.forEach((subcategory: any, subIndex: number) => {
        // Add section header
        products.push({
          id: `section-${subcategory.id}`,
          type: 'section',
          title: subcategory.name?.['en-US'] || 'Unnamed Subcategory',
          itemCount: subcategory.products?.length || 0,
          mainCategoryIndex: mainIndex,
          subCategoryIndex: subIndex,
          sectionId: subcategory.id
        });
        
        // Add products
        subcategory.products?.forEach((product: any) => {
          products.push({
            ...product,
            type: 'product',
            mainCategoryIndex: mainIndex,
            subCategoryIndex: subIndex,
            productIndex: productIndex++,
            sectionId: subcategory.id
          });
        });
      });
    });
    
    setAllProducts(products);
  }, [mainCategories]);

  // Get subcategories for the currently selected main category
  const currentSubCategories = mainCategories[activeMainCategory]?.marketSubcategories || [];

  const scrollToMainCategory = useCallback((index: number) => {
    setActiveMainCategory(index);
    setActiveSubCategory(0);
    
    // Smooth scroll main category selector
    if (mainCategoriesScrollRef.current) {
      const scrollX = Math.max(0, (index - 1) * 120);
      mainCategoriesScrollRef.current.scrollTo({
        x: scrollX,
        animated: true
      });
    }

    // Reset subcategory selector
    if (subCategoriesScrollRef.current) {
      subCategoriesScrollRef.current.scrollTo({ x: 0, animated: true });
    }

    // Find first product of the main category and scroll to it
    const firstProductIndex = allProducts.findIndex(
      item => item.type === 'section' && item.mainCategoryIndex === index
    );
    
    if (firstProductIndex !== -1 && productsListRef.current) {
      productsListRef.current.scrollToIndex({
        index: firstProductIndex,
        animated: true,
        viewPosition: 0
      });
    }
  }, [allProducts]);

  const scrollToSubCategory = useCallback((subCategoryId: string, subCategoryIndex: number) => {
    setActiveSubCategory(subCategoryIndex);
    
    // Smooth scroll subcategory selector
    if (subCategoriesScrollRef.current) {
      const scrollX = Math.max(0, (subCategoryIndex - 1) * 120);
      subCategoriesScrollRef.current.scrollTo({
        x: scrollX,
        animated: true
      });
    }
    
    // Find the section and scroll to it
    const sectionIndex = allProducts.findIndex(
      item => item.type === 'section' && item.sectionId === subCategoryId
    );
    
    if (sectionIndex !== -1 && productsListRef.current) {
      productsListRef.current.scrollToIndex({
        index: sectionIndex,
        animated: true,
        viewPosition: 0
      });
    }
  }, [allProducts]);

  // Handle scroll events to sync category selectors
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0].item;
      if (firstVisibleItem && firstVisibleItem.mainCategoryIndex !== undefined) {
        const newMainCategory = firstVisibleItem.mainCategoryIndex;
        const newSubCategory = firstVisibleItem.subCategoryIndex;
        
        if (newMainCategory !== activeMainCategory) {
          setActiveMainCategory(newMainCategory);
          
          if (mainCategoriesScrollRef.current) {
            const scrollX = Math.max(0, (newMainCategory - 1) * 120);
            mainCategoriesScrollRef.current.scrollTo({
              x: scrollX,
              animated: true
            });
          }
        }
        
        if (newSubCategory !== activeSubCategory) {
          setActiveSubCategory(newSubCategory);
          
          if (subCategoriesScrollRef.current) {
            const scrollX = Math.max(0, (newSubCategory - 1) * 120);
            subCategoriesScrollRef.current.scrollTo({
              x: scrollX,
              animated: true
            });
          }
        }
      }
    }
  }, [activeMainCategory, activeSubCategory]);

  const calculateDiscount = useCallback((basePrice: number, discountPrice: number) => {
    return Math.round(((basePrice - discountPrice) / basePrice) * 100);
  }, []);

  // Render horizontal main category selector
  const renderMainCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <ScrollView
        ref={mainCategoriesScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categorySelectorContent}
        decelerationRate="fast"
        snapToInterval={120}
        snapToAlignment="start"
      >
        {mainCategories.map((category: any, index: number) => (
          <TouchableOpacity
            key={`main-${category.id}`}
            style={[
              styles.categoryItem,
              styles.mainCategoryItem,
              activeMainCategory === index && styles.activeCategoryItem
            ]}
            onPress={() => scrollToMainCategory(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                activeMainCategory === index && styles.activeCategoryText
              ]}
              numberOfLines={2}
            >
              {category.name?.['en-US'] || 'Unnamed Category'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render horizontal subcategory selector
  const renderSubCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <ScrollView
        ref={subCategoriesScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categorySelectorContent}
        decelerationRate="fast"
        snapToInterval={120}
        snapToAlignment="start"
      >
        {currentSubCategories.map((subcategory: any, index: number) => (
          <TouchableOpacity
            key={`sub-${subcategory.id}`}
            style={[
              styles.categoryItem,
              styles.subCategoryItem,
              activeSubCategory === index && styles.activeSubCategoryItem
            ]}
            onPress={() => scrollToSubCategory(subcategory.id, index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                styles.subCategoryText,
                activeSubCategory === index && styles.activeSubCategoryText
              ]}
              numberOfLines={2}
            >
              {subcategory.name?.['en-US'] || 'Unnamed Subcategory'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render section header - 100% width
  const renderSectionHeader = (item: any) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderContent}>
        <Text style={styles.sectionHeaderText}>
          {item.title}
        </Text>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionCount}>
            {item.itemCount}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render product card
  const renderProductCard = (item: any) => {
    const productImage = item.productImages?.[0]?.serverImageUrl;
    const hasDiscount = item.discountPrice && item.basePrice > item.discountPrice;
    const rating = item.rating || restaurantInfo?.rating || 4.2;
    const deliveryTime = item.deliveryTime || restaurantInfo?.deliveryTime || '20-30 mins';
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        activeOpacity={0.95}
        onPress={() => console.log('Product pressed:', item.id)}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: productImage 
                ? `${IMAGE_BASE_URL}${productImage}`
                : PLACEHOLDER_IMAGE
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {/* Favorite Icon */}
          <TouchableOpacity style={styles.favoriteIcon} activeOpacity={0.8}>
            <Text style={styles.favoriteText}>♡</Text>
          </TouchableOpacity>
          
          {/* Discount Badge */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {calculateDiscount(item.basePrice, item.discountPrice)}% OFF
              </Text>
            </View>
          )}
          
          {/* Quick Add Overlay */}
          <View style={styles.imageOverlay}>
            <TouchableOpacity style={styles.quickAddButton} activeOpacity={0.8}>
              <Text style={styles.quickAddText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name?.['en-US'] || 'Unnamed Product'}
          </Text>
          
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description?.['en-US'] || 'Delicious item from our kitchen'}
          </Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.deliveryTime}>• {deliveryTime}</Text>
          </View>
          
          {/* Price and Add Button */}
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>
                ${(item.discountPrice || item.basePrice)?.toFixed(2)}
              </Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>
                  ${item.basePrice?.toFixed(2)}
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => console.log('Add to cart:', item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Main render item function
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === 'section') {
      return renderSectionHeader(item);
    }
    
    return (
      <>
      
      <View style={styles.productWrapper}>
      {renderProductCard(item)}
      </View>
      </>
    );
  };

  const getItemLayout = (data: any, index: number) => {
    const item = data[index];
    if (item?.type === 'section') {
      return { length: 60, offset: 60 * index, index };
    }
    // Approximate height for products
    return { length: 280, offset: 280 * index, index };
  };

  const totalProducts = allProducts.filter(item => item.type === 'product').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          Menu ({totalProducts} items)
        </Text>
      </View>
      
      {/* Main Category Selector */}
      {mainCategories.length > 0 && renderMainCategorySelector()}
      
      {/* Subcategory Selector */}
      {currentSubCategories.length > 0 && renderSubCategorySelector()}
      
      {/* Products List - 2 columns */}
      <FlatList
        ref={productsListRef}
        data={allProducts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${item.id || item.sectionId}-${index}`}
        numColumns={1} // Back to 2 columns
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 30,
          waitForInteraction: true,
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={100}
        initialNumToRender={8}
        windowSize={10}
        decelerationRate="normal"
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        }
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            productsListRef.current?.scrollToIndex({ 
              index: info.index, 
              animated: true,
              viewPosition: 0
            });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  selectorContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categorySelectorContent: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCategoryItem: {
    backgroundColor: '#f1f5f9',
  },
  subCategoryItem: {
    backgroundColor: '#f1f5f9',
  },
  activeCategoryItem: {
    backgroundColor: '#3b82f6',
    transform: [{ scale: 1.05 }],
  },
  activeSubCategoryItem: {
    backgroundColor: '#ef4444',
    transform: [{ scale: 1.05 }],
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  subCategoryText: {
    fontSize: 13,
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: '700',
  },
  activeSubCategoryText: {
    color: 'white',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sectionCount: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  productWrapper: {
    width: '50%', // 2 columns
    paddingBottom: 16,
    paddingHorizontal: CARD_MARGIN / 2,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  favoriteText: {
    fontSize: 16,
    color: '#ef4444',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
  },
  quickAddButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickAddText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 18,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  deliveryTime: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 20,
  },
  originalPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RestaurantDetailsScreen;