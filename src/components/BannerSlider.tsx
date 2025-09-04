// components/BannerSlider.tsx
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
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

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoPlay, autoPlayInterval]);

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
          <Image
            source={{ 
              uri: IMAGE_BASE_URL+banner.serverImageUrl
            }}
            style={styles.bannerImage}
            resizeMode="cover"
            onError={() => console.log(`Failed to load banner: ${banner.serverImageUrl}`)}
          />
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
    backgroundColor:'white'
  },
  bannerSlide: {
    marginLeft: -16,
    width: width,
    height: BANNER_HEIGHT,
  },
  bannerImage: {
   
    width: '105%' ,
    height: '100%',
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