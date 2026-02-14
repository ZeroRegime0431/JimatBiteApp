import { Image } from 'expo-image';
import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db, storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';
import { MenuItem } from '../types';
import CartSidebar from './cart-sidebar';
import NotificationSidebar from './notification-sidebar';
import SideBar from './side-bar';

// Icons
import BellSvg from '../assets/HomePage/icons/bell.svg';
import CartIconSvg from '../assets/HomePage/icons/cart.svg';
import ProfileSvg from '../assets/HomePage/icons/profile.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import DashboardSvg from '../assets/MerchantPage/icons/dashboard.svg';

const { width } = Dimensions.get('window');

export default function BestSellerScreen() {
  const [currentTime, setCurrentTime] = useState('');
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string }>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    loadBestSellers();
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    const email = user?.email?.toLowerCase().trim();
    setIsAdmin(email === 'ali@example.com');
  }, []);

  const loadBestSellers = async () => {
    setLoading(true);
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const q = query(
        menuItemsRef,
        where('isAvailable', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const items: MenuItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter by rating > 4.5 on client side to avoid composite index
        if (data.rating && data.rating > 4.5) {
          items.push({
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as MenuItem);
        }
      });

      setBestSellers(items);
      
      // Load fresh image URLs
      items.forEach(item => {
        if (item.imageURL) {
          getFreshImageURL(item.id, item.imageURL);
        }
      });
    } catch (error) {
      console.error('Error loading best sellers:', error);
    }
    setLoading(false);
  };

  const getFreshImageURL = async (itemId: string, imageURL: string) => {
    try {
      const urlObj = new URL(imageURL);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
      
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1]);
        
        try {
          const storageRef = ref(storage, storagePath);
          const freshURL = await getDownloadURL(storageRef);
          setImageURLs(prev => ({ ...prev, [itemId]: freshURL }));
        } catch (storageError) {
          const publicURL = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
          setImageURLs(prev => ({ ...prev, [itemId]: publicURL }));
        }
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const handleItemPress = (item: MenuItem) => {
    router.push({
      pathname: '/menu-item-detail',
      params: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        imageURL: item.imageURL,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        rating: item.rating?.toString() || '',
        isAvailable: item.isAvailable.toString(),
      },
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blindbox': return '#FFD700';
      case 'meal': return '#FF6347';
      case 'vegan': return '#90EE90';
      case 'dessert': return '#FFB6C1';
      case 'drink': return '#87CEEB';
      default: return '#F5F5DC';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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

      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <Text style={styles.title}>Best Seller</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>Discover our most popular dishes!</Text>

        {/* Best Sellers Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : bestSellers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No best sellers yet!</Text>
            <Text style={styles.emptySubtext}>Check back later for top-rated items</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {bestSellers.map((item) => (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => handleItemPress(item)}
              >
                {/* Rating Badge */}
                {item.rating && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.rating.toFixed(1)}⭐</Text>
                  </View>
                )}

                {/* Heart Button (Empty for best sellers) */}
                <View style={styles.heartButton}>
                  <Text style={styles.heartIcon}>🔥</Text>
                </View>

                {/* Item Image */}
                <View style={styles.imageContainer}>
                  {imageURLs[item.id] ? (
                    <Image
                      source={imageURLs[item.id]}
                      style={styles.itemImage}
                      contentFit="cover"
                      transition={300}
                    />
                  ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: getCategoryColor(item.category) }]}>
                      <Text style={styles.placeholderText}>{item.name.charAt(0)}</Text>
                    </View>
                  )}
                </View>

                {/* Price Badge */}
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
                </View>

                {/* Item Details */}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Dashboard Floating Button (Admin only) */}
      {isAdmin && (
        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.push('./merchant-page')}
        >
          <DashboardSvg width={32} height={32} />
        </Pressable>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('/home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./support-page')}>
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
    backgroundColor: '#ffffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F4FFC9',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4FFC9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F5F5F5',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 80,
    right: 8,
    backgroundColor: '#FF6347',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  itemDetails: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
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
    bottom: 18,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#1A5D1A',
    borderRadius: 34,
    elevation: 5,
  },
  navItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
