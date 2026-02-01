import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';
import { getCart, saveCart } from '../services/database';
import type { CartItem } from '../types';

// SVG icons
import DiscountSvg from '../assets/Checkout/icons/discount.svg';
import LineSvg from '../assets/Checkout/icons/line.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

export default function CheckoutScreen() {
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [imageURLs, setImageURLs] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);

  const [promoCode, setPromoCode] = useState('Promo4377');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [cancelledItem, setCancelledItem] = useState<CartItem | null>(null);
  const [error, setError] = useState('');

  const getCategoryColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vegan')) return '#90EE90';
    if (lowerName.includes('shake') || lowerName.includes('drink')) return '#87CEEB';
    if (lowerName.includes('dessert') || lowerName.includes('cake')) return '#FFB6C1';
    if (lowerName.includes('blind')) return '#FFD700';
    return '#FF6347';
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  const getFreshImageURL = async (imageURL: string): Promise<string> => {
    if (!imageURL || !imageURL.startsWith('http')) return '';
    
    try {
      const urlObj = new URL(imageURL);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
      
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(storage, storagePath);
        const freshURL = await getDownloadURL(storageRef);
        return freshURL;
      }
    } catch (error) {
      try {
        const urlObj = new URL(imageURL);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
        if (pathMatch) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          return `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
        }
      } catch {}
    }
    return imageURL;
  };

  const loadCartItems = async () => {
    setLoading(true);
    const user = getCurrentUser();
    if (user) {
      const result = await getCart(user.uid);
      if (result.success && result.data && result.data.items.length > 0) {
        setOrderItems(result.data.items);
        
        // Load fresh image URLs
        const urls: {[key: string]: string} = {};
        for (const item of result.data.items) {
          if (item.imageURL) {
            urls[item.menuItemId] = await getFreshImageURL(item.imageURL);
          }
        }
        setImageURLs(urls);
      } else {
        setOrderItems([]);
      }
    }
    setLoading(false);
  };

  const saveCartItems = async () => {
    const user = getCurrentUser();
    if (user && orderItems.length > 0) {
      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await saveCart(user.uid, {
        items: orderItems,
        totalAmount: subtotal,
      });
    }
  };

  // Calculate prices with promo discount (halves item prices)
  const subtotal = orderItems.length > 0 ? orderItems.reduce((sum, item) => {
    const itemPrice = isPromoApplied ? item.price * 0.5 : item.price;
    return sum + (itemPrice * item.quantity);
  }, 0) : 0;
  const taxAndFees = orderItems.length > 0 ? 5.00 : 0;
  const delivery = orderItems.length > 0 ? (isPromoApplied ? 0.00 : 3.00) : 0; // Free delivery with promo
  const total = subtotal + taxAndFees + delivery;

const incrementQuantity = (menuItemId: string) => {
    setOrderItems(items => 
      items.map(item => 
        item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    saveCartItems();
  };

  const decrementQuantity = (menuItemId: string) => {
    setOrderItems(items =>
      items.map(item =>
        item.menuItemId === menuItemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
    saveCartItems();
  };

  const cancelOrder = async (menuItemId: string) => {
    const itemToCancel = orderItems.find(item => item.menuItemId === menuItemId);
    if (itemToCancel) {
      const updatedItems = orderItems.filter(item => item.menuItemId !== menuItemId);
      setOrderItems(updatedItems);
      setCancelledItem(itemToCancel);
      setShowUndo(true);
      
      // Save to Firestore immediately
      const user = getCurrentUser();
      if (user && updatedItems.length > 0) {
        const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await saveCart(user.uid, {
          items: updatedItems,
          totalAmount: subtotal,
        });
      } else if (user && updatedItems.length === 0) {
        // Clear cart if no items left
        await saveCart(user.uid, {
          items: [],
          totalAmount: 0,
        });
      }
      
      // Auto-hide undo after 5 seconds
      setTimeout(() => {
        setShowUndo(false);
        setCancelledItem(null);
      }, 5000);
    }
  };

  const dismissUndo = () => {
    setShowUndo(false);
    setCancelledItem(null);
  };

  const undoCancel = () => {
    if (cancelledItem) {
      setOrderItems(items => [...items, cancelledItem]);
      setCancelledItem(null);
      setShowUndo(false);
      saveCartItems();
    }
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === 'promo4377') {
      setIsPromoApplied(true);
    }
  };

  const removePromo = () => {
    setIsPromoApplied(false);
    setPromoCode('');
  };

  const placeOrder = async () => {
    // Validate cart is not empty
    if (orderItems.length === 0) {
      setError('No items chosen');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      // Save promo state for payment screen
      await AsyncStorage.setItem('promoApplied', JSON.stringify(isPromoApplied));
    } catch (error) {
      console.error('Error saving promo state:', error);
    }
    router.push('./checkout-payment');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={28} height={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pick Up Address */}
        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressTitle}>Pick Up Address</Text>
            <Pressable>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>53300, Wangsa Maju, KL</Text>
          </View>
        </View>

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>

        {orderItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>You have no items in the cart</Text>
          </View>
        ) : (
          orderItems.map((item) => {
          return (
          <View key={item.menuItemId} style={styles.orderItem}>
            {imageURLs[item.menuItemId] ? (
              <Image
                source={{ uri: imageURLs[item.menuItemId] }}
                style={styles.itemImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.itemImage, { backgroundColor: getCategoryColor(item.name), justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff' }}>
                  {getInitial(item.name)}
                </Text>
              </View>
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemRestaurant}>{item.restaurantName}</Text>
              <Pressable onPress={() => cancelOrder(item.menuItemId)}>
                <Text style={styles.cancelText}>Cancel Order</Text>
              </Pressable>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemPrice}>${(isPromoApplied ? item.price * 0.5 : item.price).toFixed(2)}</Text>
              <View style={styles.quantityControl}>
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => decrementQuantity(item.menuItemId)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </Pressable>
                <View style={styles.quantityCircle}>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                </View>
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => incrementQuantity(item.menuItemId)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
          );
        })
        )}

        {/* Line Separator */}
        <View style={styles.lineSeparator}>
          <LineSvg width={320} height={2} />
        </View>

        {/* Promo Code */}
        <View style={styles.promoContainer}>
        <View style={styles.promoSection}>
          <DiscountSvg width={24} height={24} />
          {!isPromoApplied ? (
            <>
              <TextInput
                style={styles.promoInput}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                placeholderTextColor="#999"
              />
              <Pressable style={styles.applyButton} onPress={applyPromo}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.promoAppliedText}>Promo Applied</Text>
              <Pressable style={styles.removeButton} onPress={removePromo}>
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            </>
          )}
        </View>
        </View>

        {/* Line Separator */}
        <View style={styles.lineSeparator}>
          <LineSvg width={320} height={2} />
        </View>

        {/* Price Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>-${discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax and Fees</Text>
            <Text style={styles.summaryValue}>${taxAndFees.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>${delivery.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Place Order Button */}
        <Pressable style={styles.placeOrderButton} onPress={placeOrder}>
          <Text style={styles.placeOrderText}>Place Order</Text>
        </Pressable>
      </ScrollView>

      {/* Undo Button */}
      {showUndo && cancelledItem && (
        <View style={styles.undoContainer}>
          <Text style={styles.undoText}>Item removed</Text>
          <View style={styles.undoActions}>
            <Pressable style={styles.undoButton} onPress={undoCancel}>
              <Text style={styles.undoButtonText}>UNDO</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={dismissUndo}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navButton} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navButton} onPress={() => router.push('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navButton} onPress={() => router.push('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navButton}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navButton}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#f4ffc9ff',
    marginBottom: 0,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A5D1A',
  },
  placeholder: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  addressSection: {
    marginBottom: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    bottom: -10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    bottom: -5,
  },
  addressBox: {
    backgroundColor: '#F5DEB3',
    borderRadius: 10,
    padding: 15,
    bottom: -10,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemRestaurant: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  cancelText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 10,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quantityCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  promoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '600',
  },
  promoAppliedText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
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
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 100,
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  undoText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  undoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  undoButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  undoButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  lineSeparator: {
    alignItems: 'center',
    marginVertical: 15,
  },
  promoContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    bottom: -10,
  },
  emptyCartContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '600',
    textAlign: 'center',
  },
});
