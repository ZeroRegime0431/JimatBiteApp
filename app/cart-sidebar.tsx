import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCurrentUser } from '../services/auth';
import { getCart, saveCart } from '../services/database';
import type { CartItem as CartItemType } from '../types';

// SVG icons
import CartSvg from '../assets/CartSideBar/icons/cart.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Product images
import LasagnaSvg from '../assets/CartSideBar/images/lasagna.svg';
import StrawberrySvg from '../assets/CartSideBar/images/strawberryshake.svg';

const { width } = Dimensions.get('window');

interface CartSidebarProps {
  visible: boolean;
  onClose: () => void;
}

interface CartItemDisplay extends CartItemType {
  image: React.FC<any>;
}

export default function CartSidebar({ visible, onClose }: CartSidebarProps) {
  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);

  // Update time every second
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

  // Load cart items when sidebar becomes visible
  useEffect(() => {
    if (visible) {
      loadCartItems();
    }
  }, [visible]);

  // Save cart items whenever they change
  useEffect(() => {
    if (!loading && cartItems.length > 0) {
      saveCartItems();
    }
  }, [cartItems, loading]);

  const loadCartItems = async () => {
    setLoading(true);
    const user = getCurrentUser();
    if (user) {
      const result = await getCart(user.uid);
      if (result.success && result.data && result.data.items.length > 0) {
        // Map items with image components
        const mappedItems: CartItemDisplay[] = result.data.items.map((item) => ({
          ...item,
          image: item.name.toLowerCase().includes('shake') ? StrawberrySvg : LasagnaSvg,
        }));
        setCartItems(mappedItems);
      } else {
        // Load demo items for new users
        loadDemoItems();
      }
    }
    setLoading(false);
  };

  const loadDemoItems = () => {
    const demoItems: CartItemDisplay[] = [
      {
        menuItemId: 'demo-1',
        name: 'Strawberry Shake',
        price: 20.00,
        quantity: 2,
        imageURL: '',
        restaurantId: 'demo-restaurant',
        restaurantName: 'Demo Restaurant',
        image: StrawberrySvg,
      },
      {
        menuItemId: 'demo-2',
        name: 'Broccoli Lasagna',
        price: 12.00,
        quantity: 1,
        imageURL: '',
        restaurantId: 'demo-restaurant',
        restaurantName: 'Demo Restaurant',
        image: LasagnaSvg,
      },
    ];
    setCartItems(demoItems);
  };

  const saveCartItems = async () => {
    const user = getCurrentUser();
    if (user) {
      // Save without image components
      const itemsToSave = cartItems.map(({ image, ...item }) => item);
      const subtotal = itemsToSave.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      await saveCart(user.uid, {
        items: itemsToSave,
        totalAmount: subtotal,
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAndFees = 5.00;
  const delivery = 3.00;
  const total = subtotal + taxAndFees + delivery;

  const incrementQuantity = (menuItemId: string) => {
    setCartItems(items => 
      items.map(item => 
        item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (menuItemId: string) => {
    setCartItems(items => 
      items.map(item => 
        item.menuItemId === menuItemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeItem = (menuItemId: string) => {
    setCartItems(items => items.filter(item => item.menuItemId !== menuItemId));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={onClose}>
              <BackArrowLeftSvg width={28} height={28} />
            </Pressable>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleSection}>
              <CartSvg width={28} height={28} />
              <Text style={styles.titleText}>Cart</Text>
            </View>

            <Text style={styles.itemCountText}>You have {cartItems.length} items in the cart</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A5D1A" />
                <Text style={styles.loadingText}>Loading cart...</Text>
              </View>
            ) : (
              <View style={styles.cartItemsContainer}>
                {cartItems.map((item) => {
                  const ImageComponent = item.image;
                  return (
                    <View key={item.menuItemId} style={styles.cartItem}>
                      <View style={styles.itemImageContainer}>
                        <ImageComponent width={76} height={76} />
                      </View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                        <View style={styles.quantityRow}>
                          <View style={styles.quantityControl}>
                            <Pressable 
                              style={styles.quantityButton}
                              onPress={() => decrementQuantity(item.menuItemId)}
                            >
                              <Text style={styles.quantityButtonText}>-</Text>
                            </Pressable>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                            <Pressable 
                              style={styles.quantityButton}
                              onPress={() => incrementQuantity(item.menuItemId)}
                            >
                              <Text style={styles.quantityButtonText}>+</Text>
                            </Pressable>
                          </View>
                          <Pressable 
                            style={styles.removeButton}
                            onPress={() => removeItem(item.menuItemId)}
                          >
                            <Text style={styles.removeText}>Remove</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
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

            <Pressable style={styles.checkoutButton} onPress={() => { onClose(); router.push('./checkout'); }}>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </Pressable>

            <View style={styles.bottomIconScrollable}>
              <Pressable onPress={onClose}>
                <View style={styles.homeIconContainer}>
                  <HomeSvg width={24} height={24} />
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    width: width * 0.85,
    backgroundColor: '#1A5D1A',
    paddingTop: 50,
    paddingHorizontal: 0,
    elevation: 10,
    zIndex: 1000,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemCountText: {
    fontSize: 16,
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cartItemsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(45, 122, 45, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginHorizontal: 12,
  },
  itemDateTime: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#E0E0E0',
    marginBottom: 2,
  },
  timeText2: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  totalLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#F4FFC9',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkoutButtonText: {
    fontSize: 16,
    color: '#1A5D1A',
    fontWeight: 'bold',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  restaurantName: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  removeButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  removeText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  bottomIconScrollable: {
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 20,
  },
  homeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(45, 122, 45, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
