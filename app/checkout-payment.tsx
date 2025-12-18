import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCurrentUser } from '../services/auth';
import { getUserPaymentMethods } from '../services/database';

// SVG icons
import ApplePaySvg from '../assets/PaymentMethod/icons/applepay.svg';
import CardSvg from '../assets/PaymentMethod/icons/card.svg';
import GooglePaySvg from '../assets/PaymentMethod/icons/googlepay.svg';
import PaypalSvg from '../assets/PaymentMethod/icons/paypal.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPaymentScreen() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('••• ••• ••• 43');
  const [paymentMethodName, setPaymentMethodName] = useState('Credit/Debit Card');
  const [paymentIconType, setPaymentIconType] = useState<string>('card');
  const [pickupAddress, setPickupAddress] = useState('53300, Wangsa Maju, KL');
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrderData();
    }, [])
  );

  const loadOrderData = async () => {
    try {
      // Load cart items
      const savedCart = await AsyncStorage.getItem('cartItems');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        setOrderItems(items);
      }

      // Load selected payment method
      const selectedMethod = await AsyncStorage.getItem('selectedPaymentMethod');
      const user = getCurrentUser();
      
      if (selectedMethod && user) {
        // Check if it's a saved card from Firestore
        if (selectedMethod.startsWith('card-')) {
          const cardId = selectedMethod.replace('card-', '');
          const result = await getUserPaymentMethods(user.uid);
          if (result.success && result.data) {
            const selectedCard = result.data.find((card: any) => card.id === cardId);
            if (selectedCard) {
              setPaymentMethod(`•••• ${selectedCard.cardNumber}`);
              setPaymentMethodName(`${selectedCard.cardHolderName}'s Card`);
              setPaymentIconType('card');
            }
          }
        } else {
          // Handle other payment methods
          switch (selectedMethod) {
            case 'card':
              setPaymentMethodName('Credit/Debit Card');
              setPaymentMethod('••• ••• ••• 43');
              setPaymentIconType('card');
              break;
            case 'applepay':
              setPaymentMethodName('Apple Pay');
              setPaymentMethod('');
              setPaymentIconType('applepay');
              break;
            case 'paypal':
              setPaymentMethodName('Paypal');
              setPaymentMethod('');
              setPaymentIconType('paypal');
              break;
            case 'googlepay':
              setPaymentMethodName('Google Pay');
              setPaymentMethod('');
              setPaymentIconType('googlepay');
              break;
          }
        }
      } else if (user) {
        // No payment method selected, load default card from Firestore
        const result = await getUserPaymentMethods(user.uid);
        if (result.success && result.data) {
          const defaultCard = result.data.find((card: any) => card.isDefault);
          if (defaultCard) {
            setPaymentMethod(`•••• ${defaultCard.cardNumber}`);
            setPaymentMethodName(`${defaultCard.cardHolderName}'s Card`);
            setPaymentIconType('card');
          }
        }
      }

      // Load promo state
      const savedPromo = await AsyncStorage.getItem('promoApplied');
      if (savedPromo) {
        setIsPromoApplied(JSON.parse(savedPromo));
      }
    } catch (error) {
      console.error('Error loading order data:', error);
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemPrice = isPromoApplied ? item.price * 0.5 : item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const renderPaymentIcon = () => {
    switch (paymentIconType) {
      case 'card':
        return <CardSvg width={32} height={32} />;
      case 'applepay':
        return <ApplePaySvg width={32} height={32} />;
      case 'paypal':
        return <PaypalSvg width={32} height={32} />;
      case 'googlepay':
        return <GooglePaySvg width={32} height={32} />;
      default:
        return <CardSvg width={32} height={32} />;
    }
  };

  const handlePayNow = () => {
    console.log('Processing payment...');
    router.push('./checkout-confirmation');
  };

  const subtotal = calculateSubtotal();
  const taxAndFees = 5.00;
  const delivery = isPromoApplied ? 0.00 : 3.00;
  const total = subtotal + taxAndFees + delivery;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={28} height={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pickup Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pickup Address</Text>
            <Pressable onPress={() => router.push('./checkout')}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{pickupAddress}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <Pressable onPress={() => router.push('./checkout')}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.summaryBox}>
            {orderItems.map((item, index) => (
              <View key={item.id} style={styles.summaryItem}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity} items</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <Pressable onPress={() => router.push('./payment-method')}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.paymentBox}>
            <View style={styles.paymentInfo}>
              {renderPaymentIcon()}
              <Text style={styles.paymentText}>{paymentMethodName}</Text>
            </View>
            {paymentMethod ? (
              <Text style={styles.cardNumber}>{paymentMethod}</Text>
            ) : null}
          </View>
        </View>

        {/* Delivery Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Time</Text>
          <View style={styles.deliveryBox}>
            <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
            <Text style={styles.deliveryTime}>25 mins</Text>
          </View>
        </View>

        {/* Pay Now Button */}
        <Pressable style={styles.payNowButton} onPress={handlePayNow}>
          <Text style={styles.payNowText}>Pay Now</Text>
        </Pressable>
      </ScrollView>

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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  addressBox: {
    backgroundColor: '#F5DEB3',
    borderRadius: 15,
    padding: 15,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
  },
  summaryBox: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    elevation: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  paymentBox: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardNumber: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  deliveryBox: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#666',
  },
  deliveryTime: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  payNowButton: {
    backgroundColor: '#C8E6C9',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  payNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5016',
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
});
