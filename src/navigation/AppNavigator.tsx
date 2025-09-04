import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RestaurantDetailsScreen from '../screens/RestaurantDetailsScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { Image, StyleSheet } from 'react-native';
import { CART_ICON, HOME_ICON, PROFILE_ICON } from '../utils/commonString';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Home
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen 
        name="RestaurantDetailsScreen" 
        component={RestaurantDetailsScreen}
        options={{ title: 'Products' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
  initialRouteName="Home"
  screenOptions={({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ color, size, focused }) => {
      let iconUrl: string = '';

      if (route.name === 'Home') {
        iconUrl = HOME_ICON;
      } else if (route.name === 'Cart') {
        iconUrl = CART_ICON;
      } else if (route.name === 'Profile') {
        iconUrl = PROFILE_ICON;
      }

      return (
        <Image
          source={{ uri: iconUrl }}
          style={[
            styles.tabIcon,
            {
              width: size,
              height: size,
              tintColor: focused ? '#FF6347' : 'gray', // Apply color based on focus
            }
          ]}
        />
      );
    },
    tabBarActiveTintColor: '#FF6347',
    tabBarInactiveTintColor: 'gray',
    tabBarStyle: {
      paddingBottom: 5,
      height: 60,
    },
  })}
>
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    resizeMode: 'contain',
  },
});