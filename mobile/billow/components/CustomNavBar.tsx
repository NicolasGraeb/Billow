import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = '#0080FF';
const SECONDARY_COLOR = '#6E7A94';
const BACKGROUND_COLOR = 'rgba(22,24,30,0.35)';

const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  
  // Responsive calculations
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 414;
  
  const containerStyle = [
    styles.container,
    {
      bottom: insets.bottom + (isSmallScreen ? 15 : 20),
      height: isSmallScreen ? 55 : isLargeScreen ? 65 : 60,
      left: isSmallScreen ? 40 : 60,
      right: isSmallScreen ? 40 : 60,
    }
  ];

  return (
    <View style={containerStyle}>
      {/* Blur background */}
      <BlurView
        intensity={15}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      
      {/* Semi-transparent overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: Platform.OS === 'android' 
              ? 'rgba(22,24,30,0.95)'
              : 'rgba(22,24,30,0.92)',
          },
        ]}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Glass border */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            borderRadius: 30,
          },
        ]}
      />

      {/* Tab buttons */}
      <View style={[
        styles.tabsContainer,
        {
          paddingHorizontal: isSmallScreen ? 20 : 25,
          gap: isSmallScreen ? 12 : 16,
        }
      ]}>
        {state.routes.map((route, index) => {
          if (['_sitemap', '+not-found'].includes(route.name)) return null;

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <AnimatedTouchableOpacity
              layout={LinearTransition.springify().mass(0.8)}
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                {
                  backgroundColor: isFocused ? 'rgba(255,255,255,0.2)' : 'transparent',
                  height: isSmallScreen ? 40 : isLargeScreen ? 48 : 44,
                  paddingHorizontal: isSmallScreen ? 16 : 20,
                  borderRadius: isSmallScreen ? 20 : isLargeScreen ? 24 : 22,
                }
              ]}
            >
              {getIconByRouteName(
                route.name,
                isFocused ? PRIMARY_COLOR : SECONDARY_COLOR,
                isSmallScreen ? 18 : isLargeScreen ? 22 : 20
              )}
              {isFocused && (
                <Animated.Text
                  entering={FadeIn.duration(300)}
                  exiting={FadeOut.duration(200)}
                  style={[
                    styles.text,
                    {
                      fontSize: isSmallScreen ? 11 : 12,
                      marginLeft: isSmallScreen ? 4 : 6,
                    }
                  ]}
                >
                  {label as string}
                </Animated.Text>
              )}
            </AnimatedTouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  function getIconByRouteName(routeName: string, color: string, size: number) {
    switch (routeName) {
      case 'index':
        return <Ionicons name="home" size={size} color={color} />;
      case 'profile':
        return <Ionicons name="person" size={size} color={color} />;
      case 'search':
        return <Ionicons name="search-outline" size={size} color={color} />;
      default:
        return <Ionicons name="home" size={size} color={color} />;
    }
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 0,
    shadowColor: 'transparent',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  text: {
    color: PRIMARY_COLOR,
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 12,
  },
});

export default CustomNavBar;
