import { Image } from 'expo-image';
import { router } from 'expo-router';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';
import { getFavorites, removeFavorite } from '../services/database';
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

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const [currentTime, setCurrentTime] = useState('');
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string }>({});

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
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    const result = await getFavorites(user.uid);
    if (result.success && result.data) {
      setFavorites(result.data);
      // Load fresh image URLs
      result.data.forEach(item => {
        if (item.imageURL) {
          getFreshImageURL(item.id, item.imageURL);
        }
      });
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

  const handleRemoveFavorite = async (item: MenuItem, event: any) => {
    event.stopPropagation();
    const user = getCurrentUser();
    if (!user) return;

    await removeFavorite(user.uid, item.id);
    setFavorites(prev => prev.filter(fav => fav.id !== item.id));
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
        <Text style={styles.title}>Favorites</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>It's time to buy your favorite dish.</Text>

        {/* Favorites Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorites yet!</Text>
            <Text style={styles.emptySubtext}>Start adding items to your favorites</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {favorites.map((item) => (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => handleItemPress(item)}
              >
                {/* Discount Badge */}
                {item.rating && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.rating.toFixed(1)}⭐</Text>
                  </View>
                )}

                {/* Heart Button */}
                <Pressable
                  style={styles.heartButton}
                  onPress={(e) => handleRemoveFavorite(item, e)}
                >
                  <Text style={styles.heartIcon}>❤️</Text>
                </Pressable>

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
                  <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    width: (width - 56) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6347',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 11,
    color: '#666',
    lineHeight: 14,
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
