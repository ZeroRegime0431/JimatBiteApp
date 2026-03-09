import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getMenuItems } from '../services/database';
import { MenuItem } from '../types';
import CartSidebar from './cart-sidebar';
import NotificationSidebar from './notification-sidebar';
import SideBar from './side-bar';

// Top bar icons
import BellSvg from '../assets/HomePage/icons/bell.svg';
import CartSvg from '../assets/HomePage/icons/cart.svg';
import FilterSvg from '../assets/HomePage/icons/filter.svg';
import ProfileSvg from '../assets/HomePage/icons/profile.svg';

// Category icons
import BlindBoxPressedSvg from '../assets/Category-BlindBox/icons/blindboxpressed.svg';
import BakerySvg from '../assets/HomePage/icons/bakery.svg';
import DrinksSvg from '../assets/HomePage/icons/drinks.svg';
import MealSvg from '../assets/HomePage/icons/meal.svg';
import VeganSvg from '../assets/HomePage/icons/vegan.svg';

// Food images

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

interface CategoryItem {
  id: string;
  icon: any;
  label: string;
  pressed: boolean;
}

interface FoodItem {
  id: string;
  name: string;
  rating: string;
  verified: boolean;
  price: string;
  description: string;
  image: any;
}

export default function CategoryBlindBoxScreen() {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [foodItems, setFoodItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);

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
    loadMenuItems();
  }, []);

  // Load filters when returning from filter page
  useFocusEffect(
    useCallback(() => {
      loadActiveFilters();
    }, [])
  );

  const loadActiveFilters = async () => {
    try {
      const filtersStr = await AsyncStorage.getItem('activeFilters');
      if (filtersStr) {
        const filters = JSON.parse(filtersStr);
        if (filters.active && (filters.categories.length === 0 || filters.categories.includes('blindbox'))) {
          setActiveFilters(filters);
          await applyFilters(filters);
        } else {
          setActiveFilters(null);
          setFilteredItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const applyFilters = async (filters: any) => {
    setFilterLoading(true);
    
    // For category pages, only filter items from this category
    const result = await getMenuItems('blindbox');
    let items: MenuItem[] = [];
    
    if (result.success && result.data) {
      items = result.data;
    }
    
    // Apply filters
    const filtered = items.filter(item => {
      // Price filter
      if (item.price < filters.minPrice || item.price > filters.maxPrice) {
        return false;
      }
      
      // Rating filter
      if (filters.rating > 0 && (!item.rating || item.rating < filters.rating)) {
        return false;
      }
      
      // Freshness filter
      if (filters.freshness.length > 0 && item.freshnessStatus && !filters.freshness.includes(item.freshnessStatus)) {
        return false;
      }
      
      return true;
    });
    
    setFilteredItems(filtered);
    setFilterLoading(false);
  };

  const clearFilters = async () => {
    try {
      await AsyncStorage.removeItem('activeFilters');
      setActiveFilters(null);
      setFilteredItems([]);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  const loadMenuItems = async () => {
    setLoading(true);
    const result = await getMenuItems('blindbox');
    if (result.success && result.data) {
      setFoodItems(result.data);
    }
    setLoading(false);
  };

  const categories: CategoryItem[] = [
    { id: '1', icon: BlindBoxPressedSvg, label: 'Blind Box', pressed: true },
    { id: '2', icon: MealSvg, label: 'Meal', pressed: false },
    { id: '3', icon: VeganSvg, label: 'Vegan', pressed: false },
    { id: '4', icon: BakerySvg, label: 'Dessert', pressed: false },
    { id: '5', icon: DrinksSvg, label: 'Drinks', pressed: false },
  ];

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
            <CartSvg width={24} height={24} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowProfileSidebar(true)}>
            <ProfileSvg width={24} height={24} />
          </Pressable>
        </View>
      </View>

      {/* Search Bar with Filter Button Overlay */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable style={styles.filterButton} onPress={() => router.push({ pathname: '/filter-page', params: { category: 'blindbox' } })}>
          <FilterSvg width={24} height={24} />
        </Pressable>
      </View>

      {/* Filter Results Overlay */}
      {activeFilters && (
        <>
          <Pressable 
            style={styles.filterBackdrop}
            onPress={clearFilters}
          />
          <View style={styles.filterResultsContainer}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterHeaderText}>Filtered Blind Boxes</Text>
              <Pressable style={styles.clearFilterButton} onPress={clearFilters}>
                <Text style={styles.clearFilterText}>✕ Clear</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.filterResultsScroll} showsVerticalScrollIndicator={false}>
              {filterLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Applying filters...</Text>
                </View>
              ) : filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No items match your filters</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your filter settings</Text>
                </View>
              ) : (
                <View style={styles.filterResultsList}>
                  <Text style={styles.filterResultsTitle}>
                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
                  </Text>
                  {filteredItems.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.filterResultItem}
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
                      <Image source={{ uri: item.imageURL }} style={styles.filterResultImage} />
                      <View style={styles.filterResultInfo}>
                        <Text style={styles.filterResultName}>{item.name}</Text>
                        <Text style={styles.filterResultRestaurant}>{item.restaurantName}</Text>
                        <Text style={styles.filterResultDescription} numberOfLines={2}>{item.description}</Text>
                        <View style={styles.filterResultBottom}>
                          <Text style={styles.filterResultPrice}>RM{item.price.toFixed(2)}</Text>
                          {item.rating && <Text style={styles.filterResultRating}>★ {item.rating.toFixed(1)}</Text>}
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

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Categories with White Container */}
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    category.id === selectedCategory && styles.selectedCategoryItem
                  ]}
                  onPress={() => {
                    if (category.id === '2') {
                      router.replace('/category-meal');
                    } else if (category.id === '3') {
                      router.replace('/category-vegan');
                    } else if (category.id === '4') {
                      router.replace('/category-dessert');
                    } else if (category.id === '5') {
                      router.replace('/category-drink');
                    } else {
                      setSelectedCategory(category.id);
                    }
                  }}
                >
                  <View style={[
                    styles.categoryIconContainer,
                    category.id === selectedCategory && styles.selectedCategoryContainer
                  ]}>
                    <category.icon width={70} height={70} />
                  </View>
                  <Text style={[
                    styles.categoryLabel,
                    category.id === selectedCategory && styles.selectedCategoryLabel
                  ]}>{category.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* White Content Container */}
          <View style={styles.whiteContentContainer}>
            {/* Sort By */}
            <View style={styles.sortSection}>
              <Text style={styles.sortLabel}>Sort By</Text>
              <Text style={styles.sortValue}>Popular</Text>
              <Pressable style={styles.groupOrderButton}>
                <Text style={styles.groupOrderText}>Group Order</Text>
              </Pressable>
              <Pressable style={styles.filterIconButton} onPress={() => router.push({ pathname: '/filter-page', params: { category: 'blindbox' } })}>
                <FilterSvg width={20} height={20} />
              </Pressable>
            </View>

            {/* Food Items */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading blind boxes...</Text>
              </View>
            ) : foodItems.filter(item => 
                searchQuery === '' || 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No blind boxes found</Text>
              </View>
            ) : (
              foodItems.filter(item => 
                searchQuery === '' || 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((item) => (
                <Pressable 
                  key={item.id} 
                  style={styles.foodCard}
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
                      // Dynamic Pricing Fields
                      originalPrice: item.originalPrice?.toString(),
                      currentPrice: item.currentPrice?.toString(),
                      dynamicPricingEnabled: item.dynamicPricingEnabled?.toString(),
                      preparedTime: item.preparedTime instanceof Date ? item.preparedTime.toISOString() : undefined,
                      expiryTime: item.expiryTime instanceof Date ? item.expiryTime.toISOString() : undefined,
                      freshnessHours: item.freshnessHours?.toString(),
                      freshnessStatus: item.freshnessStatus,
                    }
                  })}
                >
                  <View style={styles.foodImageContainer}>
                    <Image 
                      source={{ uri: item.imageURL }} 
                      style={styles.foodImage}
                    />
                    {item.freshnessStatus && (
                      <View style={styles.badgeOverlay}>
                        {item.freshnessStatus === 'fresh' && (
                          <View style={[styles.statusBadge, styles.freshBadge]}>
                            <Text style={styles.statusBadgeText}>FRESH</Text>
                          </View>
                        )}
                        {item.freshnessStatus === 'discounted' && (
                          <View style={[styles.statusBadge, styles.discountedBadge]}>
                            <Text style={styles.statusBadgeText}>DISCOUNTED</Text>
                          </View>
                        )}
                        {item.freshnessStatus === 'expiring-soon' && (
                          <View style={[styles.statusBadge, styles.expiringSoonBadge]}>
                            <Text style={styles.statusBadgeText}>LAST CALL</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.foodInfo}>
                    <View style={styles.foodHeader}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <View style={styles.priceContainer}>
                        {item.dynamicPricingEnabled && item.originalPrice && item.currentPrice && item.currentPrice < item.originalPrice ? (
                          <>
                            <Text style={styles.originalPriceText}>RM{item.originalPrice.toFixed(2)}</Text>
                            <Text style={styles.foodPrice}>RM{item.currentPrice.toFixed(2)}</Text>
                          </>
                        ) : (
                          <Text style={styles.foodPrice}>RM{item.price.toFixed(2)}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.foodMeta}>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingBadge}>{item.rating}</Text>
                        <Text style={styles.verifiedBadge}>✓</Text>
                      </View>
                    </View>
                    <Text style={styles.foodDescription}>{item.description}</Text>
                    <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.replace('/home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('/best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('/recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('/support-page')}>
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
    backgroundColor: '#F4FFC9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#F4FFC9',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#F4FFC9',
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingRight: 55,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    position: 'absolute',
    right: 30,
    top: 9,
    bottom: 15,
    width: 24,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#1A5D1A',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -2,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  categoriesSection: {
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 15,
  },
  categoriesWhiteBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 5,
    gap: 0,
    paddingBottom: 10,
  },
  categoryItem: {
    alignItems: 'center',
  },
  selectedCategoryItem: {
    marginTop: 6,
    top: -26,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1A5D1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    top: 20,
  },
  selectedCategoryContainer: {
    backgroundColor: '#fff',
    padding: 0,
    borderRadius: 18,
    width: 60,
    height: 0,
    minHeight: "115%",
  },
  categoryLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  selectedCategoryLabel: {
    color: '#333',
    top: -20,
  },
  whiteContentContainer: {
    backgroundColor: '#fff',
    flex: 1,
    minHeight: '100%',
    paddingBottom: 120,
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: '#333',
  },
  sortValue: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  groupOrderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 'auto',
    marginRight: 8,
  },
  groupOrderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterIconButton: {
    width: 32,
    height: 32,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 0,
  },
  foodImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  freshBadge: {
    backgroundColor: '#4CAF50',
  },
  discountedBadge: {
    backgroundColor: '#FF9800',
  },
  expiringSoonBadge: {
    backgroundColor: '#F44336',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  foodInfo: {
    padding: 15,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  originalPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBadge: {
    backgroundColor: '#FF6B6B',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#FFD700',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  foodDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  restaurantName: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  filterBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  filterResultsContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 5,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f4ffc9',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  clearFilterButton: {
    backgroundColor: '#1A5D1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterResultsScroll: {
    flex: 1,
  },
  filterResultsList: {
    padding: 16,
  },
  filterResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 16,
  },
  filterResultItem: {
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
  filterResultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  filterResultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  filterResultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  filterResultRestaurant: {
    fontSize: 13,
    color: '#1A5D1A',
    marginBottom: 4,
  },
  filterResultDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  filterResultBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterResultPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  filterResultRating: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '600',
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
