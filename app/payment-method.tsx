import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.FC<any>;
  details?: string;
}

export default function PaymentMethodScreen() {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [savedCards, setSavedCards] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSavedCards();
      loadSelectedMethod();
    }, [])
  );

  const loadSavedCards = async () => {
    try {
      const cards = await AsyncStorage.getItem('savedCards');
      if (cards) {
        setSavedCards(JSON.parse(cards));
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const loadSelectedMethod = async () => {
    try {
      const method = await AsyncStorage.getItem('selectedPaymentMethod');
      if (method) {
        setSelectedMethod(method);
      }
    } catch (error) {
      console.error('Error loading selected method:', error);
    }
  };

  const handleSelectMethod = async (methodId: string) => {
    try {
      setSelectedMethod(methodId);
      await AsyncStorage.setItem('selectedPaymentMethod', methodId);
    } catch (error) {
      console.error('Error saving selected method:', error);
    }
  };

  const removeCard = async (cardId: string) => {
    try {
      const updatedCards = savedCards.filter(card => card.id !== cardId);
      await AsyncStorage.setItem('savedCards', JSON.stringify(updatedCards));
      setSavedCards(updatedCards);
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Card', icon: CardSvg, details: '••• ••• ••• 43' },
    { id: 'applepay', name: 'Apple Play', icon: ApplePaySvg },
    { id: 'paypal', name: 'Paypal', icon: PaypalSvg },
    { id: 'googlepay', name: 'Google Play', icon: GooglePaySvg },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={28} height={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {paymentMethods.map((method, index) => {
          const IconComponent = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <React.Fragment key={method.id}>
              <Pressable
                style={styles.paymentItem}
                onPress={() => handleSelectMethod(method.id)}
              >
                <View style={styles.iconContainer}>
                  <IconComponent width={32} height={32} />
                </View>
                <View style={styles.paymentDetails}>
                  {method.details ? (
                    <Text style={styles.cardDetails}>{method.details}</Text>
                  ) : (
                    <Text style={styles.paymentName}>{method.name}</Text>
                  )}
                </View>
                <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                  {isSelected && <View style={styles.radioButtonInner} />}
                </View>
              </Pressable>
              
              {/* Show saved cards after first card option */}
              {index === 0 && savedCards.map((card) => (
                <View key={card.id} style={styles.savedCardContainer}>
                  <Pressable
                    style={styles.savedCardItem}
                    onPress={() => handleSelectMethod(`savedcard-${card.id}`)}
                  >
                    <View style={styles.savedCardIconContainer}>
                      <CardSvg width={20} height={20} />
                    </View>
                    <View style={styles.savedCardDetails}>
                      <Text style={styles.cardHolderName}>{card.cardName}</Text>
                      <Text style={styles.cardNumberPreview}>•••• {card.cardNumber.slice(-4)}</Text>
                    </View>
                    <View style={[styles.radioButtonSmall, selectedMethod === `savedcard-${card.id}` && styles.radioButtonSelected]}>
                      {selectedMethod === `savedcard-${card.id}` && <View style={styles.radioButtonInnerSmall} />}
                    </View>
                  </Pressable>
                  <Pressable 
                    style={styles.removeButton}
                    onPress={() => removeCard(card.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </React.Fragment>
          );
        })}

        <Pressable 
          style={styles.addNewCardButton}
          onPress={() => router.push('./payment-method-addcard')}
        >
          <Text style={styles.addNewCardText}>Add New Card</Text>
        </Pressable>
      </ScrollView>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#1A5D1A',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A5D1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -2,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentDetails: {
    flex: 1,
  },
  cardDetails: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  paymentName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  savedCardContainer: {
    marginLeft: 50,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedCardIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  savedCardDetails: {
    flex: 1,
  },
  cardHolderName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  cardNumberPreview: {
    fontSize: 11,
    color: '#666',
  },
  radioButtonSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioButtonInnerSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  addNewCardButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addNewCardText: {
    fontSize: 16,
    color: '#1A5D1A',
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
  navIcon: {
    fontSize: 24,
  },
});
