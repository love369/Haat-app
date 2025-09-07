// components/BannerSlider.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../utils/commonString';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 200;

interface Banner {
  id: number;
  serverImageUrl: string;
  smallImageUrl?: string;
  blurhash?: string | null;
  priority?: number;
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  autoPlay = true,
  autoPlayInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingStates, setLoadingStates] = useState<{[key: number]: boolean}>({});
  const [errorStates, setErrorStates] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoPlay, autoPlayInterval]);

  
  const handleLoadStart = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: true }));
    setErrorStates(prev => ({ ...prev, [index]: false }));
  };

  
  const handleLoadEnd = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
  };

  
  const handleError = (index: number, banner: Banner) => {
    console.log(`Failed to load banner: ${banner.serverImageUrl}`);
    setLoadingStates(prev => ({ ...prev, [index]: false }));
    setErrorStates(prev => ({ ...prev, [index]: true }));
  };

  
  const getSafeImageUri = (banner: Banner) => {
    if (!banner?.serverImageUrl) return PLACEHOLDER_IMAGE;
    
    try {
      
      if (banner.serverImageUrl.startsWith('http')) {
        return banner.serverImageUrl;
      }
      
      
      const encodedUrl = encodeURI(banner.serverImageUrl);
      return `${IMAGE_BASE_URL}${encodedUrl}`;
    } catch (error) {
      console.log('Error processing image URL:', error);
      return PLACEHOLDER_IMAGE;
    }
  };

  if (!banners || banners.length === 0) {
    return (
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: PLACEHOLDER_IMAGE }}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.bannerContainer}>
      {banners.map((banner, index) => (
        <View
          key={banner.id}
          style={[
            styles.bannerSlide,
            { display: index === currentIndex ? 'flex' : 'none' },
          ]}
        >
          {/* Loading indicator */}
          {loadingStates[index] && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
          
          {/* Main banner image */}
          <Image
            source={{ 
              uri: errorStates[index] ? PLACEHOLDER_IMAGE : getSafeImageUri(banner)
            }}
            style={[
              styles.bannerImage,
              loadingStates[index] && styles.hiddenImage
            ]}
            resizeMode="cover"
            onLoadStart={() => handleLoadStart(index)}
            onLoadEnd={() => handleLoadEnd(index)}
            onError={() => handleError(index, banner)}
          />
          
          {/* Fallback image for errors */}
          {errorStates[index] && (
            <Image
              source={{ uri: PLACEHOLDER_IMAGE }}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          )}
        </View>
      ))}
      
      {/* Indicator dots */}
      {banners.length > 1 && (
        <View style={styles.indicatorContainer}>
          {banners.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
              ]}
              onPress={() => setCurrentIndex(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: width,
    height: BANNER_HEIGHT,
    position: 'relative',
    backgroundColor: 'white'
  },
  bannerSlide: {
    width: width,
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  bannerImage: {
    width: width,
    height: BANNER_HEIGHT,
  },
  hiddenImage: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 10,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default BannerSlider;