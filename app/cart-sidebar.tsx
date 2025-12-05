import React, { useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  date: string;
  time: string;
  image: React.FC<any>;
}

export default function CartSidebar({ visible, onClose }: CartSidebarProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Strawberry Shake',
      price: 20.00,
      quantity: 2,
      date: '29/11/24',
      time: '15:00',
      image: StrawberrySvg,
    },
    {
      id: '2',
      name: 'Broccoli Lasagna',
      price: 12.00,
      quantity: 1,
      date: '29/11/24',
      time: '12:00',
      image: LasagnaSvg,
    },
  ]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAndFees = 5.00;
  const delivery = 3.00;
  const total = subtotal + taxAndFees + delivery;

  const incrementQuantity = (id: string) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (id: string) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
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
            <Text style={styles.timeText}>16:04</Text>
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

            <View style={styles.cartItemsContainer}>
              {cartItems.map((item) => {
                const ImageComponent = item.image;
                return (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.itemImageContainer}>
                      <ImageComponent width={76} height={76} />
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                      <View style={styles.quantityRow}>
                        <View style={styles.quantityControl}>
                          <Pressable 
                            style={styles.quantityButton}
                            onPress={() => decrementQuantity(item.id)}
                          >
                            <Text style={styles.quantityButtonText}>-</Text>
                          </Pressable>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <Pressable 
                            style={styles.quantityButton}
                            onPress={() => incrementQuantity(item.id)}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                    <View style={styles.itemDateTime}>
                      <Text style={styles.dateText}>{item.date}</Text>
                      <Text style={styles.timeText2}>{item.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

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

            <Pressable style={styles.checkoutButton} onPress={() => console.log('Checkout')}>
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
