import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { getCurrentUser } from '../services/auth';
import { getMerchantProfile } from '../services/database';
import CartSidebar from './cart-sidebar';
import NotificationSidebar from './notification-sidebar';
import SideBar from './side-bar';

// Top icons
import BellSvg from '../assets/HomePage/icons/bell.svg';
import CartIconSvg from '../assets/HomePage/icons/cart.svg';
import ProfileSvg from '../assets/HomePage/icons/profile.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import DashboardSvg from '../assets/MerchantPage/icons/dashboard.svg';

// Arrow icon
import RedArrowRightSvg from '../assets/Settings/icons/redarrowright.svg';

const { width } = Dimensions.get('window');

export default function SupportScreen() {
  const [currentTime, setCurrentTime] = useState('');
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const user = getCurrentUser();
    const email = user?.email?.toLowerCase().trim();
    setIsAdmin(email === 'ali@example.com');
  }, []);

  React.useEffect(() => {
    const checkMerchantStatus = async () => {
      const user = getCurrentUser();
      if (user) {
        const result = await getMerchantProfile(user.uid);
        setIsMerchant(result.success && result.data !== undefined);
      }
    };
    checkMerchantStatus();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with Time and Icons */}
      <View style={styles.topHeader}>
        <Text style={styles.timeText}>{currentTime}</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconButton} onPress={() => setShowNotificationSidebar(true)}>
            <BellSvg width={24} height={24} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowCartSidebar(true)}>
            <CartIconSvg width={24} height={24} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowProfileSidebar(true)}>
            <ProfileSvg width={24} height={24} />
          </Pressable>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.replace('/home-page')}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Help</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Description Text */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pellentesque congue lorem, vel tincidunt tortor.
          </Text>
        </View>

        {/* Help with the order */}
        <Pressable style={styles.optionCard}>
          <View style={styles.optionContent}>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Help with the order</Text>
              <Text style={styles.optionSubtitle}>Support</Text>
            </View>
            <RedArrowRightSvg width={24} height={24} />
          </View>
        </Pressable>

        {/* Help center - Routes to FAQ */}
        <Pressable 
          style={styles.optionCard}
          onPress={() => router.push('./help-faq')}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Help center</Text>
              <Text style={styles.optionSubtitle}>General Information</Text>
            </View>
            <RedArrowRightSvg width={24} height={24} />
          </View>
        </Pressable>
      </ScrollView>

      {/* Dashboard Floating Button (Admin or Merchant) */}
      {(isAdmin || isMerchant) && (
        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.push('./merchant-page')}
        >
          <DashboardSvg width={32} height={32} />
        </Pressable>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.replace('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>

      {/* Sidebars */}
      <NotificationSidebar 
        visible={showNotificationSidebar}
        onClose={() => setShowNotificationSidebar(false)}
      />
      <CartSidebar 
        visible={showCartSidebar}
        onClose={() => setShowCartSidebar(false)}
      />
      <SideBar 
        visible={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FFCF',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#F3FFCF',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A5D1A',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#F3FFCF',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A5D1A',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  descriptionContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  dashboardButton: {
    position: 'absolute',
    right: 20,
    bottom: 94,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A5D1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
