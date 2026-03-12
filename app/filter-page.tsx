import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

// SVG icons
import BakerySvg from '../assets/HomePage/icons/bakery.svg';
import DrinksSvg from '../assets/HomePage/icons/drinks.svg';
import MealSvg from '../assets/HomePage/icons/meal.svg';
import BlindBoxSvg from '../assets/HomePage/icons/snacks.svg';
import VeganSvg from '../assets/HomePage/icons/vegan.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

export default function FilterPage() {
  const params = useLocalSearchParams();
  const sourceCategory = params.category as string || '';

  // Category selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>(sourceCategory ? [sourceCategory] : []);
  
  // Sort by rating
  const [selectedRating, setSelectedRating] = useState<number>(0); // 0 = all, 1-5 = minimum rating
  
  // Freshness filter
  const [selectedFreshness, setSelectedFreshness] = useState<string[]>([]);
  
  // Eco-friendly filter
  const [ecoFriendlyOnly, setEcoFriendlyOnly] = useState<boolean>(false);
  
  // Price range
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  // Subcategories per category
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  const categories = [
    { key: 'blindbox', icon: BlindBoxSvg, label: 'Blind Box' },
    { key: 'meal', icon: MealSvg, label: 'Meal' },
    { key: 'vegan', icon: VeganSvg, label: 'Vegan' },
    { key: 'dessert', icon: BakerySvg, label: 'Dessert' },
    { key: 'drink', icon: DrinksSvg, label: 'Drinks' },
  ];

  const subcategories = {
    meal: ['Rice', 'Noodles', 'Pasta', 'Burgers', 'Pizza', 'Sandwich'],
    vegan: ['Salads', 'Smoothies', 'Tofu', 'Plant-Based', 'Organic'],
    drink: ['Coffee', 'Tea', 'Juice', 'Smoothies', 'Milkshakes', 'Soda'],
    dessert: ['Cakes', 'Cookies', 'Ice Cream', 'Pastries', 'Puddings'],
    blindbox: ['Surprise Box', 'Daily Special', 'Mystery Box'],
  };

  const freshnessOptions = [
    { key: 'fresh', label: 'Fresh', color: '#4CAF50' },
    { key: 'discounted', label: 'Discounted', color: '#FF9800' },
    { key: 'expiring-soon', label: 'Expiring Soon', color: '#F44336' },
  ];

  const toggleCategory = (key: string) => {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
    setSelectedSubcategories([]); // Reset subcategories when category changes
  };

  const toggleFreshness = (key: string) => {
    setSelectedFreshness(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const toggleSubcategory = (key: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const handleApply = async () => {
    // Use custom prices if entered, otherwise use preset range
    const minPrice = customMinPrice ? parseFloat(customMinPrice) : priceRange.min;
    const maxPrice = customMaxPrice ? parseFloat(customMaxPrice) : priceRange.max;
    
    // Build filter parameters
    const filters = {
      categories: selectedCategories,
      rating: selectedRating,
      freshness: selectedFreshness,
      minPrice: minPrice,
      maxPrice: maxPrice,
      subcategories: selectedSubcategories,
      ecoFriendlyOnly: ecoFriendlyOnly,
      active: true,
    };

    // Store filters in AsyncStorage
    try {
      await AsyncStorage.setItem('activeFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }

    // Navigate back
    if (sourceCategory) {
      router.back();
    } else {
      router.back();
    }
  };

  const handleReset = () => {
    setSelectedCategories(sourceCategory ? [sourceCategory] : []);
    setSelectedRating(0);
    setSelectedFreshness([]);
    setPriceRange({ min: 0, max: 500 });
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSelectedSubcategories([]);
    setEcoFriendlyOnly(false);
  };

  const getVisibleSubcategories = () => {
    const visibleSubs: string[] = [];
    selectedCategories.forEach(cat => {
      if (cat in subcategories) {
        visibleSubs.push(...subcategories[cat as keyof typeof subcategories]);
      }
    });
    return [...new Set(visibleSubs)]; // Remove duplicates
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={28} height={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Filter</Text>
        <Pressable onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Pressable
                key={cat.key}
                style={[
                  styles.categoryItem,
                  selectedCategories.includes(cat.key) && styles.categoryItemActive
                ]}
                onPress={() => toggleCategory(cat.key)}
              >
                <View style={[
                  styles.categoryCircle,
                  selectedCategories.includes(cat.key) && styles.categoryCircleActive
                ]}>
                  <cat.icon width={76} height={76} />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategories.includes(cat.key) && styles.categoryLabelActive
                ]}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sort by Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort by</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Top Rated</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  style={styles.starButton}
                >
                  <Text style={[
                    styles.star,
                    selectedRating >= star && styles.starActive
                  ]}>★</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Freshness Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Freshness</Text>
          <View style={styles.chipsContainer}>
            {freshnessOptions.map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.chip,
                  selectedFreshness.includes(option.key) && {
                    backgroundColor: option.color,
                    borderColor: option.color,
                  }
                ]}
                onPress={() => toggleFreshness(option.key)}
              >
                <Text style={[
                  styles.chipText,
                  selectedFreshness.includes(option.key) && styles.chipTextActive
                ]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Eco-Friendly Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sustainability</Text>
          <Pressable
            style={[
              styles.ecoFilterButton,
              ecoFriendlyOnly && styles.ecoFilterButtonActive
            ]}
            onPress={() => setEcoFriendlyOnly(!ecoFriendlyOnly)}
          >
            <View style={styles.ecoFilterContent}>
              <Text style={styles.ecoIcon}>🌱</Text>
              <View style={styles.ecoTextContainer}>
                <Text style={[
                  styles.ecoFilterTitle,
                  ecoFriendlyOnly && styles.ecoFilterTitleActive
                ]}>Eco-Friendly Merchants</Text>
                <Text style={styles.ecoFilterSubtitle}>Show only merchants using sustainable packaging</Text>
              </View>
              <View style={[
                styles.ecoCheckbox,
                ecoFriendlyOnly && styles.ecoCheckboxActive
              ]}>
                {ecoFriendlyOnly && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
          </Pressable>
        </View>

        {/* Subcategories */}
        {getVisibleSubcategories().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subcategories</Text>
            <View style={styles.chipsContainer}>
              {getVisibleSubcategories().map((sub) => (
                <Pressable
                  key={sub}
                  style={[
                    styles.chip,
                    selectedSubcategories.includes(sub) && styles.chipActive
                  ]}
                  onPress={() => toggleSubcategory(sub)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedSubcategories.includes(sub) && styles.chipTextActive
                  ]}>{sub}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <Text style={styles.priceSubtitle}>Custom Price Range</Text>
          <View style={styles.priceInputRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Min (RM)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0"
                keyboardType="numeric"
                value={customMinPrice}
                onChangeText={(text) => {
                  setCustomMinPrice(text);
                  setPriceRange({ min: 0, max: 500 }); // Reset preset when custom entered
                }}
              />
            </View>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Max (RM)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="500"
                keyboardType="numeric"
                value={customMaxPrice}
                onChangeText={(text) => {
                  setCustomMaxPrice(text);
                  setPriceRange({ min: 0, max: 500 }); // Reset preset when custom entered
                }}
              />
            </View>
          </View>
          <Text style={styles.priceSubtitle}>Or Select Preset Range</Text>
          <View style={styles.priceButtonsRow}>
            <Pressable
              style={[styles.priceButton, priceRange.min === 0 && priceRange.max === 50 && !customMinPrice && !customMaxPrice && styles.priceButtonActive]}
              onPress={() => {
                setPriceRange({ min: 0, max: 50 });
                setCustomMinPrice('');
                setCustomMaxPrice('');
              }}
            >
              <Text style={[styles.priceButtonText, priceRange.min === 0 && priceRange.max === 50 && !customMinPrice && !customMaxPrice && styles.priceButtonTextActive]}>Under RM50</Text>
            </Pressable>
            <Pressable
              style={[styles.priceButton, priceRange.min === 50 && priceRange.max === 100 && !customMinPrice && !customMaxPrice && styles.priceButtonActive]}
              onPress={() => {
                setPriceRange({ min: 50, max: 100 });
                setCustomMinPrice('');
                setCustomMaxPrice('');
              }}
            >
              <Text style={[styles.priceButtonText, priceRange.min === 50 && priceRange.max === 100 && !customMinPrice && !customMaxPrice && styles.priceButtonTextActive]}>RM50-100</Text>
            </Pressable>
          </View>
          <View style={styles.priceButtonsRow}>
            <Pressable
              style={[styles.priceButton, priceRange.min === 100 && priceRange.max === 200 && !customMinPrice && !customMaxPrice && styles.priceButtonActive]}
              onPress={() => {
                setPriceRange({ min: 100, max: 200 });
                setCustomMinPrice('');
                setCustomMaxPrice('');
              }}
            >
              <Text style={[styles.priceButtonText, priceRange.min === 100 && priceRange.max === 200 && !customMinPrice && !customMaxPrice && styles.priceButtonTextActive]}>RM100-200</Text>
            </Pressable>
            <Pressable
              style={[styles.priceButton, priceRange.min === 200 && priceRange.max === 500 && !customMinPrice && !customMaxPrice && styles.priceButtonActive]}
              onPress={() => {
                setPriceRange({ min: 200, max: 500 });
                setCustomMinPrice('');
                setCustomMaxPrice('');
              }}
            >
              <Text style={[styles.priceButtonText, priceRange.min === 200 && priceRange.max === 500 && !customMinPrice && !customMaxPrice && styles.priceButtonTextActive]}>RM200+</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.bottomContainer}>
        <Pressable style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </Pressable>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.replace('/home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./support-page')}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#f4ffc9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  resetText: {
    fontSize: 16,
    color: '#1A5D1A',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryItemActive: {
    // Active styling handled in circle/label
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryCircleActive: {
    backgroundColor: '#1A5D1A',
  },
  categoryLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#1A5D1A',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 24,
    color: '#DDD',
  },
  starActive: {
    color: '#FFD700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActive: {
    backgroundColor: '#1A5D1A',
    borderColor: '#1A5D1A',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  priceSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
    marginTop: 8,
  },
  priceButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  priceButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  priceButtonActive: {
    backgroundColor: '#1A5D1A',
    borderColor: '#1A5D1A',
  },
  priceButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  priceButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#1A5D1A',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#1A5D1A',
    borderRadius: 34,
    marginHorizontal: 12,
    marginBottom: 18,
    height: 64,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Eco-Friendly filter styles
  ecoFilterButton: {
    backgroundColor: '#F9FFF9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#C5E1A5',
  },
  ecoFilterButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1A5D1A',
  },
  ecoFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  ecoTextContainer: {
    flex: 1,
  },
  ecoFilterTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ecoFilterTitleActive: {
    color: '#1A5D1A',
  },
  ecoFilterSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  ecoCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C5E1A5',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ecoCheckboxActive: {
    backgroundColor: '#1A5D1A',
    borderColor: '#1A5D1A',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
