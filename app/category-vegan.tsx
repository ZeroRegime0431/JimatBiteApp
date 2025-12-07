import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import CartSidebar from './cart-sidebar';
import NotificationSidebar from './notification-sidebar';
import SideBar from './side-bar';

// Top bar icons
import BellSvg from '../assets/HomePage/icons/bell.svg';
import CartSvg from '../assets/HomePage/icons/cart.svg';
import FilterSvg from '../assets/HomePage/icons/filter.svg';
import ProfileSvg from '../assets/HomePage/icons/profile.svg';

// Category icons
import VeganPressedSvg from '../assets/Category-Vegan/icons/veganpressed.svg';
import BakerySvg from '../assets/HomePage/icons/bakery.svg';
import DrinksSvg from '../assets/HomePage/icons/drinks.svg';
import MealSvg from '../assets/HomePage/icons/meal.svg';
import BlindBoxSvg from '../assets/HomePage/icons/snacks.svg';

// Food images
import LasagnaSvg from '../assets/Category-Vegan/images/lasagna.svg';
import RisottoSvg from '../assets/Category-Vegan/images/risotto.svg';

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

export default function CategoryVeganScreen() {
  const [selectedCategory, setSelectedCategory] = useState('3');
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  const categories: CategoryItem[] = [
    { id: '1', icon: BlindBoxSvg, label: 'Blind Box', pressed: false },
    { id: '2', icon: MealSvg, label: 'Meal', pressed: false },
    { id: '3', icon: VeganPressedSvg, label: 'Vegan', pressed: true },
    { id: '4', icon: BakerySvg, label: 'Dessert', pressed: false },
    { id: '5', icon: DrinksSvg, label: 'Drinks', pressed: false },
  ];

  const foodItems: FoodItem[] = [
    {
      id: '1',
      name: 'Mushroom Risotto',
      rating: '4.8',
      verified: true,
      price: '$15.00',
      description: 'Juicy mushrooms and chewy risotto. Try this delightful option.',
      image: RisottoSvg,
    },
    {
      id: '2',
      name: 'Broccoli Lasagna',
      rating: '4.8',
      verified: true,
      price: '$2.99',
      description: 'Our secret cheesecake recipe makes this incredibly smooth, tender broccoli, rich vegan cheese.',
      image: LasagnaSvg,
    },
  ];

  const handleCategoryPress = (categoryId: string) => {
    if (categoryId === '1') {
      router.push('./category-blindbox');
    } else if (categoryId === '2') {
      router.push('./category-meal');
    } else if (categoryId === '4') {
      router.push('./category-dessert');
    } else if (categoryId === '5') {
      router.push('./category-drink');
    } else {
      setSelectedCategory(categoryId);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.timeText}>16:04</Text>
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
        />
        <Pressable style={styles.filterButton}>
          <FilterSvg width={24} height={24} />
        </Pressable>
      </View>

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
                  onPress={() => handleCategoryPress(category.id)}
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
              <Pressable style={styles.filterIconButton}>
                <FilterSvg width={20} height={20} />
              </Pressable>
            </View>

            {/* Food Items */}
            {foodItems.map((item) => (
              <View key={item.id} style={styles.foodCard}>
                <View style={styles.foodImageContainer}>
                  <item.image width="100%" height={200} preserveAspectRatio="none" />
                </View>
                <View style={styles.foodInfo}>
                  <View style={styles.foodHeader}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodPrice}>{item.price}</Text>
                  </View>
                  <View style={styles.foodMeta}>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingBadge}>{item.rating}</Text>
                      {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                    </View>
                  </View>
                  <Text style={styles.foodDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem}>
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
  foodPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
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
