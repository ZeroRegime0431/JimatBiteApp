import { Image } from 'expo-image';
import { router } from 'expo-router';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db, storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';
import { getMerchantProfile } from '../services/database';
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
import AdminSvg from '../assets/admin.svg';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import DashboardSvg from '../assets/MerchantPage/icons/dashboard.svg';
import ArrowRightSvg from '../assets/Settings/icons/redarrowright.svg';

const { width } = Dimensions.get('window');

interface CategoryItems {
  categoryName: string;
  items: MenuItem[];
}

export default function RecommendScreen() {
  const [currentTime, setCurrentTime] = useState('');
  const [categoryItems, setCategoryItems] = useState<CategoryItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string }>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);
  const [adminDropdownExpanded, setAdminDropdownExpanded] = useState(false);

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
    loadRecommendations();
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    setIsAdmin(user?.uid === 'a5L1LZoUCEZxcCeeWxFW7vIow323');
  }, []);

  useEffect(() => {
    const checkMerchantStatus = async () => {
      const user = getCurrentUser();
      if (user) {
        const result = await getMerchantProfile(user.uid);
        setIsMerchant(result.success && result.data !== undefined);
      }
    };
    checkMerchantStatus();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const categories = [
        { key: 'meal', name: 'Meals' },
        { key: 'vegan', name: 'Vegan' },
        { key: 'drink', name: 'Drinks' },
        { key: 'dessert', name: 'Desserts' },
        { key: 'blindbox', name: 'Blind Box' },
      ];

      const allCategoryItems: CategoryItems[] = [];

      for (const category of categories) {
        const menuItemsRef = collection(db, 'menuItems');
        const q = query(
          menuItemsRef,
          where('category', '==', category.key),
          where('isAvailable', '==', true),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        const items: MenuItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as MenuItem);
        });

        if (items.length > 0) {
          allCategoryItems.push({
            categoryName: category.name,
            items: items,
          });

          // Load fresh image URLs
          items.forEach(item => {
            if (item.imageURL) {
              getFreshImageURL(item.id, item.imageURL);
            }
          });
        }
      }

      setCategoryItems(allCategoryItems);
    } catch (error) {
      console.error('Error loading recommendations:', error);
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
      pathname: './menu-item-detail',
      params: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        imageURL: item.imageURL,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        rating: item.rating?.toString() || '0',
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meal': return '🍽️';
      case 'vegan': return '🥗';
      case 'drink': return '🥤';
      case 'dessert': return '🍰';
      case 'blindbox': return '🎁';
      default: return '✨';
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
        <Pressable onPress={() => router.replace('/home-page')} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Recommendations</Text>
          <RecommendationSvg width={28} height={28} style={styles.titleIcon} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>Discover the dishes recommended by the chef.</Text>

        {/* Recommendations by Category */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A5D1A" />
            <Text style={styles.loadingText}>Loading recommendations...</Text>
          </View>
        ) : categoryItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recommendations yet!</Text>
            <Text style={styles.emptySubtext}>Check back later for personalized suggestions</Text>
          </View>
        ) : (
          categoryItems.map((categoryGroup, index) => (
            <View key={index} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{categoryGroup.categoryName}</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {categoryGroup.items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.card}
                    onPress={() => handleItemPress(item)}
                  >
                    {/* Category Badge */}
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                      <Text style={styles.categoryBadgeText}>{getCategoryIcon(item.category)}</Text>
                    </View>

                    {/* Rating Badge */}
                    {item.rating && item.rating > 0 && (
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                      </View>
                    )}

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

                    {/* Item Details */}
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemRestaurant} numberOfLines={1}>{item.restaurantName}</Text>
                      <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
                        <Pressable style={styles.addButton}>
                          <Text style={styles.addButtonText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Admin Dashboard Floating Buttons */}
      {isAdmin && (
        <View style={styles.adminFloatingContainer}>
          {adminDropdownExpanded && (
            <>
              <Pressable
                style={[styles.adminFloatingButton, styles.adminDashboardButton]}
                onPress={() => router.push('./admin-dashboard')}
              >
                <AdminSvg width={32} height={32} />
              </Pressable>
              <Pressable
                style={[styles.adminFloatingButton, styles.merchantDashboardButton]}
                onPress={() => router.push('./merchant-page')}
              >
                <DashboardSvg width={32} height={32} />
              </Pressable>
            </>
          )}
          <Pressable
            style={styles.adminToggleButton}
            onPress={() => setAdminDropdownExpanded(!adminDropdownExpanded)}
          >
            <View style={[styles.arrowIcon, { transform: [{ rotate: adminDropdownExpanded ? '90deg' : '-90deg' }] }]}>
              <ArrowRightSvg width={20} height={20} />
            </View>
          </Pressable>
        </View>
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
        <Pressable style={styles.navItem}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./support-page')}>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A5D1A',
    right: -28,
  },
  titleIcon: {
    marginTop: 2,
    right: -20,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  subtitle: {
    fontSize: 15,
    color: '#1A5D1A',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A5D1A',
    marginLeft: 16,
    marginBottom: 12,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 2,
  },
  categoryBadgeText: {
    fontSize: 18,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6347',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    elevation: 2,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
  itemDetails: {
    padding: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  itemRestaurant: {
    fontSize: 12,
    color: '#1A5D1A',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A5D1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  adminFloatingContainer: {
    position: 'absolute',
    right: 20,
    bottom: 94,
    alignItems: 'center',
    gap: 12,
  },
  adminFloatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  adminDashboardButton: {
    backgroundColor: '#1A5D1A',
  },
  merchantDashboardButton: {
    backgroundColor: '#1A5D1A',
  },
  adminToggleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4FFC9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  arrowIcon: {
    justifyContent: 'center',
    alignItems: 'center',
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
