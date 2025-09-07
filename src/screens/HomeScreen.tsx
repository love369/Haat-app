import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView,TouchableOpacity,ActivityIndicator,Image } from 'react-native';
import { useApi } from '../hooks/useApi';
import { ApiResponseHandler } from '../components/ApiResponseHandler';
import { apiService } from '../services/apiService';
import { GET_API_END_POINT, HEADER_HOME_PAGE, IMAGE_BASE_URL } from '../utils/commonString';
import BannerSlider from '../components/BannerSlider';
import Categories from '../components/Categories';
import MarketCardEnhanced from '../components/MarketCardEnhanced';

interface MarketIcon {
  serverImage: string;
  smallServerImage: string;
  blurhashImage: string;
}

interface MarketBanner {
  id: number;
  serverImageUrl: string;
  smallImageUrl?: string;
  blurhash?: string | null;
  priority?: number;
}

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
  // Add other properties as needed
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
interface Market {
  id: number;
  name: {
    ar: string;
    'en-US': string;
    fr: string;
    he: string;
  };
  description?: {
    ar?: string;
    'en-US'?: string;
    fr?: string;
    he?: string;
  };
  address?: {
    ar?: string;
    'en-US'?: string;
    fr?: string;
    he?: string;
  };
  icon?: MarketIcon; 
  marketBanners?: MarketBanner[];
  marketCategories?: MarketCategory[];
}

const HomeScreen = () => {
  const { data, loading, error, execute } = useApi<Market>();

  const fetchMarketData = () => {
    execute(() => apiService.get<Market>(GET_API_END_POINT));
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    if (data) {
      console.log('API Response:', data, "marketData");
    }
  }, [data]);

  
  const renderErrorComponent = (error: any, onRetry?: () => void) => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorTitle}>Failed to load market data</Text>
      <Text style={styles.errorMessage}>
        {error.message} {error.status ? `(Status: ${error.status})` : ''}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  
  const renderLoadingComponent = (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading market data...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{HEADER_HOME_PAGE}</Text>
      
      <ApiResponseHandler
        loading={loading}
        error={error}
        data={data}
        onRetry={fetchMarketData}
        loadingComponent={renderLoadingComponent}
        errorComponent={renderErrorComponent}
        emptyComponent={
          <View style={styles.centerContainer}>
            <Text>No market data available</Text>
          </View>
        }
      >
       {(marketData) => {
  
  
  
  const imageUrl = marketData?.icon?.serverImage 
  
    ? IMAGE_BASE_URL+marketData.icon.serverImage
    : null;

  return (
    <>
    <ScrollView style={styles.scrollView}>
       {/* Banner Slider at the top */}
       <BannerSlider banners={marketData?.marketBanners || []} />

       <MarketCardEnhanced 
  marketData={marketData} 
  imageUrl={imageUrl}
  backgroundColor="#fff"
  imageSize={100}
  onPress={() => console.log('Market card pressed')}
/>

   
        {/* Categories Section */}
        <Categories 
                categories={marketData?.marketCategories || []} 
                imageBaseUrl={IMAGE_BASE_URL}
              />
     </ScrollView>
    </>
  );
}}
      </ApiResponseHandler>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  
});



export default HomeScreen;