import { router } from 'expo-router';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image as ExpoImage } from 'expo-image';
import { db, storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';
import { addFavorite, getFavorites, getMenuItems, removeFavorite } from '../services/database';
// import { registerForPushNotifications } from '../services/notifications'; // Commented out - requires development build
import { MenuItem } from '../types';
import CartSidebar from './cart-sidebar';
import NotificationSidebar from './notification-sidebar';
import SideBar from './side-bar';

// Declared SVG images (imported as components).

// SVG icons
import BakerySvg from '../assets/HomePage/icons/bakery.svg';
import BellSvg from '../assets/HomePage/icons/bell.svg';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import CartSvg from '../assets/HomePage/icons/cart.svg';
import DrinksSvg from '../assets/HomePage/icons/drinks.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import FilterSvg from '../assets/HomePage/icons/filter.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import LikeSvg from '../assets/HomePage/icons/like.svg';
import LineSvg from '../assets/HomePage/icons/Line.svg';
import MealSvg from '../assets/HomePage/icons/meal.svg';
import ProfileSvg from '../assets/HomePage/icons/profile.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SnacksSvg from '../assets/HomePage/icons/snacks.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import VeganSvg from '../assets/HomePage/icons/vegan.svg';
import DashboardSvg from '../assets/MerchantPage/icons/dashboard.svg';

const { width } = Dimensions.get('window');

const categoryIcons = [
  { key: 'Blind Box', icon: SnacksSvg, label: 'Blind Box' },
  { key: 'meal', icon: MealSvg, label: 'Meal' },
  { key: 'vegan', icon: VeganSvg, label: 'Vegan' },
  { key: 'bakery', icon: BakerySvg, label: 'Bakery' },
  { key: 'drinks', icon: DrinksSvg, label: 'Drinks' },
];

const topIcons = {
  filter: FilterSvg,
  cart: CartSvg,
  bell: BellSvg,
  profile: ProfileSvg,
};

export default function HomePage() {
  const [likedItems, setLikedItems] = useState<{ [key: string]: boolean }>({});
  const [ratedItems, setRatedItems] = useState<{ [key: string]: boolean }>({});
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  const [promoItem, setPromoItem] = useState<MenuItem | null>(null);
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string }>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    const email = user?.email?.toLowerCase().trim();
    setIsAdmin(email === 'ali@example.com');
  }, []);

  useEffect(() => {
    loadUserFavorites();
    // registerPushNotifications(); // Commented out - requires development build
  }, []);

  // Commented out - Push notifications require development build (not supported in Expo Go SDK 53+)
  // const registerPushNotifications = async () => {
  //   const user = getCurrentUser();
  //   if (user) {
  //     await registerForPushNotifications(user.uid);
  //   }
  // };

  useEffect(() => {
    // Load all menu items when search starts
    const loadAllItems = async () => {
      if (searchQuery.length > 0 && allMenuItems.length === 0) {
        setSearchLoading(true);
        const categories = ['meal', 'vegan', 'drink', 'dessert', 'blindbox'];
        const allItems: MenuItem[] = [];
        
        for (const category of categories) {
          const result = await getMenuItems(category);
          if (result.success && result.data) {
            allItems.push(...result.data);
          }
        }
        
        setAllMenuItems(allItems);
        setSearchLoading(false);
      }
    };
    
    loadAllItems();
  }, [searchQuery]);

  const loadHomeData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        loadBestSellers(),
        loadRecommendations(),
        loadPromoItem(),
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
    setDataLoading(false);
  };

  const loadBestSellers = async () => {
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const q = query(
        menuItemsRef,
        where('isAvailable', '==', true),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      
      const items: MenuItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter by rating > 4.5 on client side
        if (data.rating && data.rating > 4.5) {
          items.push({
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as MenuItem);
        }
      });

      setBestSellers(items.slice(0, 10));
      
      // Load fresh image URLs
      items.forEach(item => {
        if (item.imageURL) {
          getFreshImageURL(item.id, item.imageURL);
        }
      });
    } catch (error) {
      console.error('Error loading best sellers:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const categories = ['meal', 'vegan', 'drink', 'dessert', 'blindbox'];
      const allItems: MenuItem[] = [];

      for (const category of categories) {
        const menuItemsRef = collection(db, 'menuItems');
        const q = query(
          menuItemsRef,
          where('category', '==', category),
          where('isAvailable', '==', true),
          limit(2)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allItems.push({
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as MenuItem);
        });
      }

      setRecommendations(allItems.slice(0, 10));
      
      // Load fresh image URLs
      allItems.forEach(item => {
        if (item.imageURL) {
          getFreshImageURL(item.id, item.imageURL);
        }
      });
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadPromoItem = async () => {
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const q = query(
        menuItemsRef,
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
        // Pick a random item
        const randomItem = items[Math.floor(Math.random() * items.length)];
        setPromoItem(randomItem);
        if (randomItem.imageURL) {
          getFreshImageURL(randomItem.id, randomItem.imageURL);
        }
      }
    } catch (error) {
      console.error('Error loading promo item:', error);
    }
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
      }
    });
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour < 12) {
      return {
        title: 'Good Morning',
        subtitle: "Rise And Shine! It's Breakfast Time"
      };
    } else if (currentHour < 19) {
      return {
        title: 'Good Afternoon',
        subtitle: 'Time For A Delicious Lunch!'
      };
    } else {
      return {
        title: 'Good Evening',
        subtitle: 'Enjoy Your Dinner Tonight!'
      };
    }
  };

  const greeting = getGreeting();

  const loadUserFavorites = async () => {
    const user = getCurrentUser();
    if (!user) return;

    const result = await getFavorites(user.uid);
    if (result.success && result.data) {
      const favoritesMap: { [key: string]: boolean } = {};
      result.data.forEach(item => {
        favoritesMap[item.id] = true;
      });
      setLikedItems(favoritesMap);
    }
  };

  const toggleFavorite = async (item: MenuItem, event?: any) => {
    if (event) {
      event.stopPropagation();
    }

    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const isCurrentlyLiked = likedItems[item.id] || false;

    // Optimistically update UI
    setLikedItems(prev => ({ ...prev, [item.id]: !isCurrentlyLiked }));

    try {
      if (isCurrentlyLiked) {
        // Remove from favorites
        const result = await removeFavorite(user.uid, item.id);
        if (!result.success) {
          // Revert on error
          setLikedItems(prev => ({ ...prev, [item.id]: isCurrentlyLiked }));
          console.error('Failed to remove favorite');
        }
      } else {
        // Add to favorites
        const result = await addFavorite(user.uid, item);
        if (!result.success) {
          // Revert on error
          setLikedItems(prev => ({ ...prev, [item.id]: isCurrentlyLiked }));
          console.error('Failed to add favorite');
        }
      }
    } catch (error) {
      // Revert on error
      setLikedItems(prev => ({ ...prev, [item.id]: isCurrentlyLiked }));
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRating = (id: string) => {
    setRatedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSearchResults = allMenuItems.filter(item =>
    searchQuery.trim() !== '' && (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <ThemedView style={styles.container}>
      <SideBar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <NotificationSidebar visible={notificationVisible} onClose={() => setNotificationVisible(false)} />
      <CartSidebar visible={cartVisible} onClose={() => setCartVisible(false)} />
      <View style={styles.headerArea}>
        <View style={styles.topRow}>
          <View style={styles.searchWrap}>
            <TextInput 
              placeholder="Search" 
              placeholderTextColor="#7a7a7a" 
              style={styles.search}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Pressable style={styles.filterButton} onPress={() => {}}>
              <topIcons.filter width={22} height={22} />
            </Pressable>
          </View>

          <Pressable style={styles.topIcon} onPress={() => setCartVisible(true)}>
            <topIcons.cart width={28} height={28} />
          </Pressable>
          <Pressable style={styles.topIcon} onPress={() => setNotificationVisible(true)}>
            <topIcons.bell width={28} height={28} />
          </Pressable>
          <Pressable style={styles.topIcon} onPress={() => setSidebarVisible(true)}>
            <topIcons.profile width={28} height={28} />
          </Pressable>
        </View>
      </View>

      {searchQuery.trim() !== '' && (
        <>
          <Pressable 
            style={styles.searchBackdrop}
            onPress={() => setSearchQuery('')}
          />
          <View style={styles.searchResultsContainer}>
            <ScrollView style={styles.searchResultsScroll} showsVerticalScrollIndicator={false}>
              {searchLoading ? (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="large" color="#1A5D1A" />
                <Text style={styles.searchLoadingText}>Searching...</Text>
              </View>
            ) : filteredSearchResults.length === 0 ? (
              <View style={styles.searchEmptyContainer}>
                <Text style={styles.searchEmptyText}>No items found</Text>
                <Text style={styles.searchEmptySubtext}>Try searching for something else</Text>
              </View>
            ) : (
              <View style={styles.searchResultsList}>
                <Text style={styles.searchResultsTitle}>
                  {filteredSearchResults.length} {filteredSearchResults.length === 1 ? 'result' : 'results'} found
                </Text>
                {filteredSearchResults.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.searchResultItem}
                    onPress={() => router.push({
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
                      }
                    })}
                  >
                    <Image source={{ uri: item.imageURL }} style={styles.searchResultImage} />
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Text style={styles.searchResultRestaurant}>{item.restaurantName}</Text>
                      <Text style={styles.searchResultDescription} numberOfLines={2}>{item.description}</Text>
                      <View style={styles.searchResultBottom}>
                        <Text style={styles.searchResultPrice}>${item.price.toFixed(2)}</Text>
                        <Text style={styles.searchResultCategory}>{item.category}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
          </View>
        </>
      )}

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.greetingCard}>
          <View style={styles.greetingHeader}>
            <View style={styles.greetingTextContainer}>
              <ThemedText type="title" style={styles.greetingTitle}>{greeting.title}</ThemedText>
              <ThemedText type="subtitle" style={styles.greetingSub}>{greeting.subtitle}</ThemedText>
            </View>
          </View>

          <View style={styles.categoriesRow}>
            {categoryIcons.map((cat) => (
              <Pressable 
                key={cat.key} 
                style={styles.categoryItem}
                onPress={() => {
                  if (cat.key === 'Blind Box') {
                    router.push('./category-blindbox');
                  } else if (cat.key === 'meal') {
                    router.push('./category-meal');
                  } else if (cat.key === 'vegan') {
                    router.push('./category-vegan');
                  } else if (cat.key === 'bakery') {
                    router.push('./category-dessert');
                  } else if (cat.key === 'drinks') {
                    router.push('./category-drink');
                  }
                }}
              >
                <View style={styles.categoryCircle}>
                  <cat.icon width={72} height={72} />
                </View>
                <ThemedText style={styles.categoryLabel}>{cat.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.lineContainer}>
            <LineSvg width={width - 36} height={4} />
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="defaultSemiBold" style={{ color: '#000' }}>Best Seller</ThemedText>
            <Pressable onPress={() => router.push('./best-seller-page')}>
              <ThemedText type="link">View All</ThemedText>
            </Pressable>
          </View>

          {dataLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1A5D1A" />
            </View>
          ) : (
            <FlatList
              horizontal
              data={bestSellers}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const displayImageURL = imageURLs[item.id] || item.imageURL;
                return (
                  <Pressable style={styles.card} onPress={() => handleItemPress(item)}>
                    <ExpoImage 
                      source={{ uri: displayImageURL }} 
                      style={styles.cardImage}
                      contentFit="cover"
                      transition={300}
                    />
                    <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{item.name}</ThemedText>
                    <ThemedText style={styles.cardPrice}>${item.price.toFixed(2)}</ThemedText>
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          )}

          <View style={styles.promoBanner}>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" style={{ color: '#fff', fontSize: 18 }}>New Customer Code : Promo4377</ThemedText>
              <ThemedText style={{ color: '#fff', marginTop: 8, fontSize: 20, fontWeight: '700' }}>50% OFF</ThemedText>
            </View>
            {promoItem && (
              <ExpoImage 
                source={{ uri: imageURLs[promoItem.id] || promoItem.imageURL }} 
                style={styles.promoImage}
                contentFit="cover"
                transition={300}
              />
            )}
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="defaultSemiBold" style={{ color: '#000' }}>Recommend</ThemedText>
            <Pressable onPress={() => router.push('./recommend-page')}>
              <ThemedText type="link">View All</ThemedText>
            </Pressable>
          </View>

          {dataLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1A5D1A" />
            </View>
          ) : (
            <FlatList
              horizontal
              data={recommendations}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const displayImageURL = imageURLs[item.id] || item.imageURL;
                const isLiked = likedItems[item.id] || false;
                return (
                  <Pressable style={styles.recommendCard} onPress={() => handleItemPress(item)}>
                    <View style={styles.recommendImageContainer}>
                      <ExpoImage 
                        source={{ uri: displayImageURL }} 
                        style={styles.recommendImage}
                        contentFit="cover"
                        transition={300}
                      />
                      <Pressable 
                        style={[styles.likeButton, isLiked && styles.likeButtonActive]} 
                        onPress={(e) => toggleFavorite(item, e)}
                      >
                        <LikeSvg 
                          width={24} 
                          height={24} 
                          fill={isLiked ? '#FF6B6B' : 'transparent'}
                          stroke={isLiked ? '#FF6B6B' : '#fff'}
                        />
                      </Pressable>
                    </View>
                    <View style={styles.recommendTitleRow}>
                      <ThemedText type="defaultSemiBold" style={styles.recommendTitle}>{item.name}</ThemedText>
                      <ThemedText style={styles.distanceText}>{item.restaurantName}</ThemedText>
                    </View>
                    <ThemedText style={styles.recommendPrice}>${item.price.toFixed(2)}</ThemedText>
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          )}
        </View>
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

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => {}}>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { backgroundColor: '#f4ffc9ff', paddingTop: 76, paddingHorizontal: 14, paddingBottom: 16},
  topRow: { flexDirection: 'row', alignItems: 'center' },
  search: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 0,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  topIcon: { marginLeft: 9 },
  topIconImage: { width: 36, height: 36, resizeMode: 'contain' },
  /* search wrapper allows placing a floating filter button above the search field */
  searchWrap: { flex: 1, position: 'relative' },
  filterButton: { position: 'absolute', right: 16, top: 3, backgroundColor: '#fff', borderRadius: 20, padding: 0, elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  filterImage: { width: 20, height: 20, resizeMode: 'contain' },

  content: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -2 },
  greetingCard: { padding: 18 },
  greetingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingTextContainer: { flex: 1 },
  greetingTitle: { color: '#1A5D1A', fontSize: 28, fontWeight: 'bold' },
  greetingSub: { color: '#7a7a7a', marginTop: 4, fontSize: 12 },

  categoriesRow: { flexDirection: 'row', marginTop: 54, justifyContent: 'space-between' },
  categoryItem: { alignItems: 'center', width: (width - 36) / 5 },
  categoryCircle: { width: 44, height: 44, borderRadius: 36, backgroundColor: '#FFF8D6', justifyContent: 'center', alignItems: 'center' },
  categoryIcon: { width: 72, height: 72, resizeMode: 'contain' },
  categoryLabel: { marginTop: 0, fontSize: 12, color: '#444' },

  lineContainer: { marginTop: 16, alignItems: 'center' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },

  loadingContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },

  card: { width: 160, alignItems: 'center' },
  cardImage: { width: 160, height: 140, borderRadius: 12, resizeMode: 'cover' },
  cardTitle: { marginTop: 8, fontSize: 13, color: '#333' },
  cardPrice: { marginTop: 0, color: '#1A5D1A', fontWeight: '700' },

  promoBanner: { flexDirection: 'row', marginTop: 18, backgroundColor: '#1A5D1A', borderRadius: 14, padding: 14, alignItems: 'center' },
  promoImage: { width: 120, height: 90, marginLeft: 10, resizeMode: 'cover', borderRadius: 8 },

  recommendCard: { width: 260, bottom: 24 },
  recommendImageContainer: { position: 'relative', width: '100%', height: 240, bottom: -12 },
  recommendImage: { width: '100%', height: 180, borderRadius: 10, resizeMode: 'cover' },

  likeButton: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 6, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  likeButtonActive: { backgroundColor: '#FF6B6B' },

  recommendInfo: { padding: 12 },

  recommendTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 0 },
  recommendTitle: { fontSize: 14, color: '#333', flex: 1, bottom: 48 },
  distanceText: { fontSize: 12, color: '#888', marginLeft: 8, left: -24, bottom: 48 },
  recommendPrice: { marginTop: 2, color: '#1A5D1A', fontWeight: '700', bottom: 48 },

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
  bottomNav: { position: 'absolute', left: 12, right: 12, 
    bottom: 18, height: 64, backgroundColor: '#1A5D1A', 
    borderRadius: 34, flexDirection: 'row', justifyContent: 'space-around', 
    alignItems: 'center', paddingHorizontal: 10 },
    
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navIcon: { width: 26, height: 26, tintColor: '#fff', resizeMode: 'contain' },
  searchBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },  searchResultsContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 5,
  },
  searchResultsScroll: {
    flex: 1,
  },
  searchLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  searchEmptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  searchEmptySubtext: {
    fontSize: 14,
    color: '#BBB',
  },
  searchResultsList: {
    padding: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchResultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  searchResultRestaurant: {
    fontSize: 13,
    color: '#1A5D1A',
    marginBottom: 4,
  },
  searchResultDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  searchResultBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchResultPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  searchResultCategory: {
    fontSize: 11,
    color: '#fff',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
});
