import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

// SVG icons
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

export default function CheckoutConfirmationScreen() {
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate circle growing
    Animated.sequence([
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Then animate checkmark appearing
      Animated.parallel([
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.push('./home-page')}>
          <BackArrowLeftSvg width={28} height={28} />
        </Pressable>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Circle with Checkmark */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [{ scale: circleScale }],
              },
            ]}
          >
            <Animated.View
              style={{
                opacity: checkmarkOpacity,
                transform: [{ scale: checkmarkScale }],
              }}
            >
              <View style={styles.checkmark}>
                <View style={styles.checkmarkStem} />
                <View style={styles.checkmarkKick} />
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Order Confirmed Text */}
        <Text style={styles.title}>¡Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed{'\n'}successfully
        </Text>

        {/* Delivery Info */}
        <Text style={styles.deliveryText}>Delivery by Thu, 29th, 4:00 PM</Text>

        {/* Track Order Link */}
        <Pressable onPress={() => router.push('./myorders-active')}>
          <Text style={styles.trackOrderText}>Track my order</Text>
        </Pressable>

        {/* Support Text */}
        <Text style={styles.supportText}>
          If you have any questions, please reach out{'\n'}directly to our customer support
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FFC9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 28,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkmark: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  checkmarkStem: {
    position: 'absolute',
    width: 6,
    height: 40,
    backgroundColor: '#4CAF50',
    left: 35,
    top: 14,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  checkmarkKick: {
    position: 'absolute',
    width: 6,
    height: 20,
    backgroundColor: '#4CAF50',
    left: 17,
    top: 30,
    transform: [{ rotate: '-45deg' }],
    borderRadius: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  deliveryText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
    fontWeight: '500',
  },
  trackOrderText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 60,
  },
  supportText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    height: 64,
    backgroundColor: '#1A5D1A',
    borderRadius: 34,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navItem: {
    padding: 8,
  },
});
