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

const RestaurantDetailsScreen: React.FC<RestaurantDetailsScreenProps> = ({ route }) => {
  const { headingMainCategries, restaurantInfo } = route.params;
  const [activeMainCategory, setActiveMainCategory] = useState(0);
  const [activeSubCategory, setActiveSubCategory] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  
  const mainCategoriesScrollRef = useRef<ScrollView>(null);
  const subCategoriesScrollRef = useRef<ScrollView>(null);
  const productsListRef = useRef<FlatList>(null);

  const mainCategories = headingMainCategries || [];
  
  React.useEffect(() => {
    const products: any[] = [];
    let productIndex = 0;
    
    mainCategories.forEach((mainCategory: any, mainIndex: number) => {
      mainCategory.marketSubcategories?.forEach((subcategory: any, subIndex: number) => {
        const subcategoryProducts = subcategory.products || [];
        
        products.push({
          id: `section-${subcategory.id}`,
          type: 'section',
          title: subcategory.name?.['en-US'] || 'Unnamed Subcategory',
          itemCount: subcategoryProducts.length,
          mainCategoryIndex: mainIndex,
          subCategoryIndex: subIndex,
          sectionId: subcategory.id
        });
        
        for (let i = 0; i < subcategoryProducts.length; i += 2) {
          const leftProduct = subcategoryProducts[i];
          const rightProduct = subcategoryProducts[i + 1] || null;
          
          products.push({
            id: `row-${leftProduct.id}-${rightProduct?.id || 'single'}`,
            type: 'productRow',
            leftProduct: {
              ...leftProduct,
              mainCategoryIndex: mainIndex,
              subCategoryIndex: subIndex,
              productIndex: productIndex++,
              sectionId: subcategory.id
            },
            rightProduct: rightProduct ? {
              ...rightProduct,
              mainCategoryIndex: mainIndex,
              subCategoryIndex: subIndex,
              productIndex: productIndex++,
              sectionId: subcategory.id
            } : null,
            mainCategoryIndex: mainIndex,
            subCategoryIndex: subIndex,
            sectionId: subcategory.id
          });
        }
      });
    });
    
    setAllProducts(products);
  }, [mainCategories]);

  const currentSubCategories = mainCategories[activeMainCategory]?.marketSubcategories || [];

  const scrollToMainCategory = useCallback((index: number) => {
    setActiveMainCategory(index);
    setActiveSubCategory(0);
    
    if (mainCategoriesScrollRef.current) {
      const scrollX = Math.max(0, (index - 1) * 120);
      mainCategoriesScrollRef.current.scrollTo({
        x: scrollX,
        animated: true
      });
    }

    if (subCategoriesScrollRef.current) {
      subCategoriesScrollRef.current.scrollTo({ x: 0, animated: true });
    }

    const firstSectionIndex = allProducts.findIndex(
      item => item.type === 'section' && item.mainCategoryIndex === index
    );
    
    if (firstSectionIndex !== -1 && productsListRef.current) {
      const estimatedOffset = firstSectionIndex * 60; // Approximate offset
      productsListRef.current.scrollToOffset({
        offset: estimatedOffset,
        animated: true
      });
      
      setTimeout(() => {
        try {
          productsListRef.current?.scrollToIndex({
            index: firstSectionIndex,
            animated: true,
            viewPosition: 0
          });
        } catch (error) {
          console.log('ScrollToIndex failed, using scrollToOffset');
        }
      }, 100);
    }
  }, [allProducts]);

  const scrollToSubCategory = useCallback((subCategoryId: string, subCategoryIndex: number) => {
    setActiveSubCategory(subCategoryIndex);
    
    if (subCategoriesScrollRef.current) {
      const scrollX = Math.max(0, (subCategoryIndex - 1) * 120);
      subCategoriesScrollRef.current.scrollTo({
        x: scrollX,
        animated: true
      });
    }
    
    const sectionIndex = allProducts.findIndex(
      item => item.type === 'section' && item.sectionId === subCategoryId
    );
    
    if (sectionIndex !== -1 && productsListRef.current) {
      const estimatedOffset = sectionIndex * 60;
      productsListRef.current.scrollToOffset({
        offset: estimatedOffset,
        animated: true
      });
      
      setTimeout(() => {
        try {
          productsListRef.current?.scrollToIndex({
            index: sectionIndex,
            animated: true,
            viewPosition: 0
          });
        } catch (error) {
          console.log('ScrollToIndex failed, using scrollToOffset');
        }
      }, 100);
    }
  }, [allProducts]);

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

  const renderProductCard = (product: any, isLeft: boolean = true) => {
    if (!product) return <View style={[styles.productCard, styles.emptyCard]} />;
    
    const productImage = product.productImages?.[0]?.serverImageUrl;
    const hasDiscount = product.discountPrice && product.basePrice > product.discountPrice;
    const rating = product.rating || restaurantInfo?.rating || 4.2;
    const deliveryTime = product.deliveryTime || restaurantInfo?.deliveryTime || '20-30 mins';
    
    return (
      <TouchableOpacity 
        style={[styles.productCard, isLeft ? styles.leftCard : styles.rightCard]}
        activeOpacity={0.95}
        onPress={() => console.log('Product pressed:', product.id)}
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
                {calculateDiscount(product.basePrice, product.discountPrice)}% OFF
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
            {product.name?.['en-US'] || 'Unnamed Product'}
          </Text>
          
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description?.['en-US'] || 'Delicious item from our kitchen'}
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
                ${(product.discountPrice || product.basePrice)?.toFixed(2)}
              </Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>
                  ${product.basePrice?.toFixed(2)}
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => console.log('Add to cart:', product.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductRow = (item: any) => (
    <View style={styles.productRow}>
      {renderProductCard(item.leftProduct, true)}
      {renderProductCard(item.rightProduct, false)}
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === 'section') {
      return renderSectionHeader(item);
    }
    
    if (item.type === 'productRow') {
      return renderProductRow(item);
    }
    
    return null;
  };

  const getItemLayout = useCallback((data: any, index: number) => {
    const item = data?.[index];
    if (item?.type === 'section') {
      return { 
        length: 80, // Section header height
        offset: 80 * index, 
        index 
      };
    }
    const PRODUCT_ROW_HEIGHT = 300;
    return { 
      length: PRODUCT_ROW_HEIGHT, 
      offset: PRODUCT_ROW_HEIGHT * index, 
      index 
    };
  }, []);

  const totalProducts = allProducts.reduce((count, item) => {
    if (item.type === 'productRow') {
      return count + (item.rightProduct ? 2 : 1);
    }
    return count;
  }, 0);

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
      
      {/* Products List */}
      <FlatList
        ref={productsListRef}
        data={allProducts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${item.id || item.sectionId}-${index}`}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 30,
          waitForInteraction: true,
        }}
        getItemLayout={getItemLayout}
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
          console.log('ScrollToIndex failed, retrying...', info);
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            try {
              productsListRef.current?.scrollToIndex({ 
                index: Math.min(info.index, allProducts.length - 1), 
                animated: true,
                viewPosition: 0
              });
            } catch (error) {
              const estimatedOffset = Math.min(info.index, allProducts.length - 1) * 60;
              productsListRef.current?.scrollToOffset({
                offset: estimatedOffset,
                animated: true
              });
            }
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
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
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
  leftCard: {
    marginRight: CARD_MARGIN / 2,
  },
  rightCard: {
    marginLeft: CARD_MARGIN / 2,
  },
  emptyCard: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
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