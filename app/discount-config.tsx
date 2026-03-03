import { router } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { auth, db } from '../config/firebase';
import { getMerchantProfile } from '../services/database';
import { MenuItem, MerchantAccount } from '../types';

import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

const { width } = Dimensions.get('window');

interface DiscountTier {
  hours: number;
  discount: number;
}

interface MenuItemWithConfig extends MenuItem {
  discountRules?: {
    tier1: DiscountTier;
    tier2: DiscountTier;
    tier3: DiscountTier;
    tier4: DiscountTier;
    tier5: DiscountTier;
  };
}

export default function DiscountConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [merchantProfile, setMerchantProfile] = useState<MerchantAccount | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemWithConfig[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItemWithConfig | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Category expansion states
  const [mealExpanded, setMealExpanded] = useState(true);
  const [dessertExpanded, setDessertExpanded] = useState(true);
  const [drinkExpanded, setDrinkExpanded] = useState(true);
  const [veganExpanded, setVeganExpanded] = useState(true);
  const [blindboxExpanded, setBlindboxExpanded] = useState(true);
  
  // Default discount tiers
  const [tier1Hours, setTier1Hours] = useState('2');
  const [tier1Discount, setTier1Discount] = useState('0');
  const [tier2Hours, setTier2Hours] = useState('4');
  const [tier2Discount, setTier2Discount] = useState('10');
  const [tier3Hours, setTier3Hours] = useState('6');
  const [tier3Discount, setTier3Discount] = useState('25');
  const [tier4Hours, setTier4Hours] = useState('8');
  const [tier4Discount, setTier4Discount] = useState('40');
  const [tier5Discount, setTier5Discount] = useState('50');

  const ADMIN_MERCHANT_ID = 'a5L1LZoUCEZxcCeeWxFW7vIow323';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Please log in');
        router.back();
        return;
      }

      // Check if admin
      const adminCheck = currentUser.uid === ADMIN_MERCHANT_ID;
      setIsAdmin(adminCheck);

      // Load merchant profile
      const profileResult = await getMerchantProfile(currentUser.uid);
      if (profileResult.success && profileResult.data) {
        setMerchantProfile(profileResult.data);
      }

      // Load menu items
      await loadMenuItems(currentUser.uid, adminCheck);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async (userId: string, adminMode: boolean) => {
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const querySnapshot = await getDocs(menuItemsRef);
      
      const items: MenuItemWithConfig[] = [];
      
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Admin sees all items, merchant sees only their items
        if (adminMode || data.merchantId === userId) {
          items.push({
            id: docSnap.id,
            ...data,
          } as MenuItemWithConfig);
        }
      });
      
      setMenuItems(items.filter(item => item.dynamicPricingEnabled));
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  // Group items by category
  const groupItemsByCategory = () => {
    const grouped = {
      meal: menuItems.filter(item => item.category === 'meal'),
      dessert: menuItems.filter(item => item.category === 'dessert'),
      drink: menuItems.filter(item => item.category === 'drink'),
      vegan: menuItems.filter(item => item.category === 'vegan'),
      blindbox: menuItems.filter(item => item.category === 'blindbox'),
    };
    return grouped;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      meal: '🍱',
      dessert: '🍰',
      drink: '🥤',
      vegan: '🥗',
      blindbox: '📦',
    };
    return icons[category] || '📋';
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      meal: 'Meals',
      dessert: 'Desserts',
      drink: 'Drinks',
      vegan: 'Vegan',
      blindbox: 'Blind Boxes',
    };
    return names[category] || category;
  };

  const loadItemConfig = (item: MenuItemWithConfig) => {
    setSelectedItem(item);
    
    // Load existing discount rules or use defaults
    const rules = item.discountRules || {
      tier1: { hours: 2, discount: 0 },
      tier2: { hours: 4, discount: 10 },
      tier3: { hours: 6, discount: 25 },
      tier4: { hours: 8, discount: 40 },
      tier5: { hours: 999, discount: 50 },
    };
    
    setTier1Hours(rules.tier1.hours.toString());
    setTier1Discount(rules.tier1.discount.toString());
    setTier2Hours(rules.tier2.hours.toString());
    setTier2Discount(rules.tier2.discount.toString());
    setTier3Hours(rules.tier3.hours.toString());
    setTier3Discount(rules.tier3.discount.toString());
    setTier4Hours(rules.tier4.hours.toString());
    setTier4Discount(rules.tier4.discount.toString());
    setTier5Discount(rules.tier5.discount.toString());
  };

  const validateInputs = (): boolean => {
    const t1h = parseFloat(tier1Hours);
    const t2h = parseFloat(tier2Hours);
    const t3h = parseFloat(tier3Hours);
    const t4h = parseFloat(tier4Hours);
    const t1d = parseFloat(tier1Discount);
    const t2d = parseFloat(tier2Discount);
    const t3d = parseFloat(tier3Discount);
    const t4d = parseFloat(tier4Discount);
    const t5d = parseFloat(tier5Discount);
    
    // Check if all values are valid numbers
    if (isNaN(t1h) || isNaN(t2h) || isNaN(t3h) || isNaN(t4h) ||
        isNaN(t1d) || isNaN(t2d) || isNaN(t3d) || isNaN(t4d) || isNaN(t5d)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for all fields');
      return false;
    }
    
    // Check hours are in ascending order
    if (t1h >= t2h || t2h >= t3h || t3h >= t4h) {
      Alert.alert('Invalid Hours', 'Hour thresholds must be in ascending order');
      return false;
    }
    
    // Check discounts are in ascending order
    if (t1d > t2d || t2d > t3d || t3d > t4d || t4d > t5d) {
      Alert.alert('Invalid Discounts', 'Discount percentages should increase with time');
      return false;
    }
    
    // Check discount range
    if (t1d < 0 || t5d > 100) {
      Alert.alert('Invalid Discounts', 'Discount percentages must be between 0% and 100%');
      return false;
    }
    
    return true;
  };

  const handleSaveConfig = async () => {
    if (!selectedItem) {
      Alert.alert('Error', 'Please select a menu item');
      return;
    }
    
    if (!validateInputs()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const discountRules = {
        tier1: { hours: parseFloat(tier1Hours), discount: parseFloat(tier1Discount) },
        tier2: { hours: parseFloat(tier2Hours), discount: parseFloat(tier2Discount) },
        tier3: { hours: parseFloat(tier3Hours), discount: parseFloat(tier3Discount) },
        tier4: { hours: parseFloat(tier4Hours), discount: parseFloat(tier4Discount) },
        tier5: { hours: 999, discount: parseFloat(tier5Discount) },
      };
      
      const itemRef = doc(db, 'menuItems', selectedItem.id);
      await updateDoc(itemRef, {
        discountRules: discountRules,
      });
      
      Alert.alert('Success', 'Discount configuration saved successfully!');
      
      // Reload items
      const currentUser = auth.currentUser;
      if (currentUser) {
        await loadMenuItems(currentUser.uid, isAdmin);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      Alert.alert('Error', 'Failed to save discount configuration');
    } finally {
      setSaving(false);
    }
  };

  const toggleDynamicPricing = async (item: MenuItemWithConfig) => {
    try {
      const itemRef = doc(db, 'menuItems', item.id);
      await updateDoc(itemRef, {
        dynamicPricingEnabled: !item.dynamicPricingEnabled,
      });
      
      // Reload items
      const currentUser = auth.currentUser;
      if (currentUser) {
        await loadMenuItems(currentUser.uid, isAdmin);
      }
    } catch (error) {
      console.error('Error toggling dynamic pricing:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5D1A" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Discount Configuration</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>⚙️</Text>
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Dynamic Pricing Settings</Text>
            <Text style={styles.infoBannerText}>
              {isAdmin 
                ? 'Configure discount rules for all menu items across all merchants. The Cloud Function automatically updates prices every 30 minutes.'
                : 'Configure how discounts are applied to your menu items based on freshness. The Cloud Function automatically updates prices every 30 minutes.'
              }
            </Text>
          </View>
        </View>

        {/* Menu Items List by Category */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {isAdmin ? 'All Menu Items with Dynamic Pricing' : 'My Menu Items with Dynamic Pricing'}
          </ThemedText>
          {menuItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <ThemedText style={styles.emptyText}>
                No items with dynamic pricing enabled
              </ThemedText>
              <Text style={styles.emptySubtext}>
                Enable dynamic pricing when adding menu items to see them here
              </Text>
            </View>
          ) : (
            Object.entries(groupItemsByCategory()).map(([category, items]) => {
              if (items.length === 0) return null;
              
              const isExpanded = 
                category === 'meal' ? mealExpanded :
                category === 'dessert' ? dessertExpanded :
                category === 'drink' ? drinkExpanded :
                category === 'vegan' ? veganExpanded :
                blindboxExpanded;
              
              const setExpanded = 
                category === 'meal' ? setMealExpanded :
                category === 'dessert' ? setDessertExpanded :
                category === 'drink' ? setDrinkExpanded :
                category === 'vegan' ? setVeganExpanded :
                setBlindboxExpanded;
              
              return (
                <View key={category} style={styles.categorySection}>
                  <Pressable
                    style={styles.categoryHeader}
                    onPress={() => setExpanded(!isExpanded)}
                  >
                    <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                    <ThemedText style={styles.categoryTitle}>{getCategoryName(category)}</ThemedText>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{items.length}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                  </Pressable>
                  
                  {isExpanded && items.map((item) => (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.menuItemCard,
                        selectedItem?.id === item.id && styles.menuItemCardSelected
                      ]}
                      onPress={() => loadItemConfig(item)}
                    >
                      <View style={styles.menuItemInfo}>
                        <ThemedText style={styles.menuItemName}>{item.name}</ThemedText>
                        <ThemedText style={styles.menuItemPrice}>
                          Original: RM{item.originalPrice?.toFixed(2) || item.price.toFixed(2)}
                        </ThemedText>
                        {item.discountRules ? (
                          <Text style={styles.menuItemStatus}>✅ Custom rules configured</Text>
                        ) : (
                          <Text style={styles.menuItemStatusDefault}>🔧 Using default rules</Text>
                        )}
                      </View>
                      {selectedItem?.id === item.id && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.selectedIndicatorText}>✓</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              );
            })
          )}
        </View>

        {/* Discount Rules Configuration */}
        {selectedItem && (
          <View style={styles.configSection}>
            <ThemedText style={styles.configTitle}>
              Configure Discount Tiers for: {selectedItem.name}
            </ThemedText>
            
            <Text style={styles.configDescription}>
              Set the time thresholds (hours after preparation) and discount percentages for each tier.
              As items age, they automatically move to higher discount tiers.
            </Text>

            {/* Tier 1 */}
            <View style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierBadge}>Tier 1 - FRESH</Text>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hours After Prep</Text>
                  <TextInput
                    style={styles.input}
                    value={tier1Hours}
                    onChangeText={setTier1Hours}
                    keyboardType="numeric"
                    placeholder="2"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discount %</Text>
                  <TextInput
                    style={styles.input}
                    value={tier1Discount}
                    onChangeText={setTier1Discount}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>
              <Text style={styles.tierDescription}>
                0-{tier1Hours}h: {tier1Discount}% off (Item is fresh)
              </Text>
            </View>

            {/* Tier 2 */}
            <View style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <Text style={[styles.tierBadge, { backgroundColor: '#4CAF50' }]}>Tier 2</Text>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hours After Prep</Text>
                  <TextInput
                    style={styles.input}
                    value={tier2Hours}
                    onChangeText={setTier2Hours}
                    keyboardType="numeric"
                    placeholder="4"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discount %</Text>
                  <TextInput
                    style={styles.input}
                    value={tier2Discount}
                    onChangeText={setTier2Discount}
                    keyboardType="numeric"
                    placeholder="10"
                  />
                </View>
              </View>
              <Text style={styles.tierDescription}>
                {tier1Hours}-{tier2Hours}h: {tier2Discount}% off
              </Text>
            </View>

            {/* Tier 3 */}
            <View style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <Text style={[styles.tierBadge, { backgroundColor: '#FFA500' }]}>Tier 3 - DISCOUNTED</Text>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hours After Prep</Text>
                  <TextInput
                    style={styles.input}
                    value={tier3Hours}
                    onChangeText={setTier3Hours}
                    keyboardType="numeric"
                    placeholder="6"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discount %</Text>
                  <TextInput
                    style={styles.input}
                    value={tier3Discount}
                    onChangeText={setTier3Discount}
                    keyboardType="numeric"
                    placeholder="25"
                  />
                </View>
              </View>
              <Text style={styles.tierDescription}>
                {tier2Hours}-{tier3Hours}h: {tier3Discount}% off
              </Text>
            </View>

            {/* Tier 4 */}
            <View style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <Text style={[styles.tierBadge, { backgroundColor: '#FF6347' }]}>Tier 4</Text>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hours After Prep</Text>
                  <TextInput
                    style={styles.input}
                    value={tier4Hours}
                    onChangeText={setTier4Hours}
                    keyboardType="numeric"
                    placeholder="8"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discount %</Text>
                  <TextInput
                    style={styles.input}
                    value={tier4Discount}
                    onChangeText={setTier4Discount}
                    keyboardType="numeric"
                    placeholder="40"
                  />
                </View>
              </View>
              <Text style={styles.tierDescription}>
                {tier3Hours}-{tier4Hours}h: {tier4Discount}% off
              </Text>
            </View>

            {/* Tier 5 */}
            <View style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <Text style={[styles.tierBadge, { backgroundColor: '#DC143C' }]}>Tier 5 - LAST CALL</Text>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hours After Prep</Text>
                  <View style={styles.input}>
                    <Text style={styles.disabledText}>{tier4Hours}+</Text>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discount %</Text>
                  <TextInput
                    style={styles.input}
                    value={tier5Discount}
                    onChangeText={setTier5Discount}
                    keyboardType="numeric"
                    placeholder="50"
                  />
                </View>
              </View>
              <Text style={styles.tierDescription}>
                {tier4Hours}+ hours: {tier5Discount}% off (Maximum discount)
              </Text>
            </View>

            {/* Save Button */}
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveConfig}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Save Configuration</Text>
              )}
            </Pressable>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#F4FFC9',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A5D1A',
  },
  scrollView: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1A5D1A',
  },
  infoBannerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A5D1A',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  categorySection: {
    marginTop: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryBadge: {
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  menuItemCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  menuItemCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1A5D1A',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  menuItemStatus: {
    fontSize: 12,
    color: '#1A5D1A',
  },
  menuItemStatusDefault: {
    fontSize: 12,
    color: '#666',
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A5D1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  configSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A5D1A',
    marginBottom: 8,
  },
  configDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  tierCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1A5D1A',
  },
  tierHeader: {
    marginBottom: 12,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A5D1A',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledText: {
    color: '#999',
    fontSize: 16,
  },
  tierDescription: {
    fontSize: 13,
    color: '#1A5D1A',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1A5D1A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
