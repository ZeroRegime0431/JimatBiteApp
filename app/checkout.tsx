import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

// Order images
import LasagnaSvg from '../assets/CartSideBar/images/lasagna.svg';
import StrawberryShakeSvg from '../assets/CartSideBar/images/strawberryshake.svg';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  date: string;
  image: any;
}

export default function CheckoutScreen() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [promoCode, setPromoCode] = useState('Promo4377');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [cancelledItem, setCancelledItem] = useState<OrderItem | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // Load cart items from AsyncStorage when component mounts
  useEffect(() => {
    loadCartItems();
  }, []);

  // Save cart items to AsyncStorage whenever they change
  useEffect(() => {
    saveCartItems();
  }, [orderItems]);

  const loadCartItems = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cartItems');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        // Check if it's not an empty array
        if (items.length > 0) {
          // Map the saved items back to include image components
          const mappedItems = items.map((item: any) => ({
            ...item,
            image: item.id === '1' ? StrawberryShakeSvg : LasagnaSvg,
          }));
          setOrderItems(mappedItems);
        } else {
          // Empty array saved, load defaults
          loadDefaultItems();
        }
      } else {
        // No saved cart, load defaults
        loadDefaultItems();
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      loadDefaultItems();
    }
  };

  const loadDefaultItems = () => {
    const defaultItems = [
      {
        id: '1',
        name: 'Strawberry Shake',
        price: 20.00,
        quantity: 2,
        date: '29 Nov, 20:30 pm',
        image: StrawberryShakeSvg,
      },
      {
        id: '2',
        name: 'Broccoli Lasagna',
        price: 12.00,
        quantity: 1,
        date: '29 Nov, 20:30 pm',
        image: LasagnaSvg,
      },
    ];
    setOrderItems(defaultItems);
  };

  const saveCartItems = async () => {
    try {
      // Only save if there are items (don't save empty array)
      if (orderItems.length > 0) {
        // Save cart items without the image component (can't serialize functions)
        const itemsToSave = orderItems.map(({ image, ...item }) => item);
        await AsyncStorage.setItem('cartItems', JSON.stringify(itemsToSave));
      }
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  };

  // Calculate prices with promo discount (halves item prices)
  const subtotal = orderItems.reduce((sum, item) => {
    const itemPrice = isPromoApplied ? item.price * 0.5 : item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);
  const taxAndFees = 5.00;
  const delivery = isPromoApplied ? 0.00 : 3.00; // Free delivery with promo
  const total = subtotal + taxAndFees + delivery;

  const incrementQuantity = (id: string) => {
    setOrderItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (id: string) => {
    setOrderItems(items =>
      items.map(item =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const cancelOrder = (id: string) => {
    const itemToCancel = orderItems.find(item => item.id === id);
    if (itemToCancel) {
      setCancelledItem(itemToCancel);
      setOrderItems(items => items.filter(item => item.id !== id));
      setShowUndo(true);
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

        {orderItems.map((item) => {
          const ItemImage = item.image;
          return (
          <View key={item.id} style={styles.orderItem}>
            <ItemImage width={76} height={76} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDate}>{item.date}</Text>
              <Pressable onPress={() => cancelOrder(item.id)}>
                <Text style={styles.cancelText}>Cancel Order</Text>
              </Pressable>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemPrice}>${(isPromoApplied ? item.price * 0.5 : item.price).toFixed(2)}</Text>
              <View style={styles.quantityControl}>
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => decrementQuantity(item.id)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </Pressable>
                <View style={styles.quantityCircle}>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                </View>
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => incrementQuantity(item.id)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
          );
        })}

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
        <Pressable style={styles.navButton}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navButton}>
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
});
