import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCurrentUser } from '../services/auth';
import { deletePaymentMethod, getUserPaymentMethods } from '../services/database';
import type { PaymentMethod as PaymentMethodType } from '../types';

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
  const [savedCards, setSavedCards] = useState<PaymentMethodType[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [viewingCard, setViewingCard] = useState<PaymentMethodType | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSavedCards();
    }, [])
  );

  const loadSavedCards = async () => {
    setLoading(true);
    const user = getCurrentUser();
    if (user) {
      const result = await getUserPaymentMethods(user.uid);
      if (result.success && result.data) {
        setSavedCards(result.data);
        // Set default card as selected if exists
        const defaultCard = result.data.find(card => card.isDefault);
        if (defaultCard) {
          setSelectedMethod(`card-${defaultCard.id}`);
        }
      }
    }
    setLoading(false);
  };

  const handleSelectMethod = async (methodId: string) => {
    setSelectedMethod(methodId);
    // Save to AsyncStorage for checkout-payment to use
    try {
      await AsyncStorage.setItem('selectedPaymentMethod', methodId);
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const removeCard = async (cardId: string) => {
    setRemoving(cardId);
    const result = await deletePaymentMethod(cardId);
    if (result.success) {
      setSavedCards(cards => cards.filter(card => card.id !== cardId));
      if (selectedMethod === `card-${cardId}`) {
        setSelectedMethod('card');
      }
    } else {
      alert('Failed to remove card');
    }
    setRemoving(null);
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A5D1A" />
            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </View>
        ) : (
          <>
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
                        onPress={() => handleSelectMethod(`card-${card.id}`)}
                      >
                        <View style={styles.savedCardIconContainer}>
                          <CardSvg width={20} height={20} />
                        </View>
                        <View style={styles.savedCardDetails}>
                          <Text style={styles.cardHolderName}>{card.cardHolderName}</Text>
                          <Text style={styles.cardNumberPreview}>•••• {card.cardNumber}</Text>
                        </View>
                        <View style={[styles.radioButtonSmall, selectedMethod === `card-${card.id}` && styles.radioButtonSelected]}>
                          {selectedMethod === `card-${card.id}` && <View style={styles.radioButtonInnerSmall} />}
                        </View>
                      </Pressable>
                      <View style={styles.cardActions}>
                        <Pressable 
                          style={styles.detailsButton}
                          onPress={() => { setViewingCard(card); setShowCardDetails(false); }}
                        >
                          <Text style={styles.detailsButtonText}>Details</Text>
                        </Pressable>
                        <Pressable 
                          style={[styles.removeButton, removing === card.id && styles.removeButtonDisabled]}
                          onPress={() => removeCard(card.id)}
                          disabled={removing === card.id}
                        >
                          {removing === card.id ? (
                            <ActivityIndicator size="small" color="#FF4444" />
                          ) : (
                            <Text style={styles.removeButtonText}>Remove</Text>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </React.Fragment>
              );
            })}
          </>
        )}

        <Pressable 
          style={styles.addNewCardButton}
          onPress={() => router.push('./payment-method-addcard')}
        >
          <Text style={styles.addNewCardText}>Add New Card</Text>
        </Pressable>
      </ScrollView>

      {/* Card Details Modal */}
      <Modal
        visible={viewingCard !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewingCard(null)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setViewingCard(null)}
        >
          <View style={styles.detailsModal}>
            <Text style={styles.detailsModalTitle}>Card Details</Text>
            
            {viewingCard && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Card Holder Name</Text>
                  <Text style={styles.detailValue}>{viewingCard.cardHolderName}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailRowHeader}>
                    <Text style={styles.detailLabel}>Card Number</Text>
                    <Pressable onPress={() => setShowCardDetails(!showCardDetails)}>
                      <Text style={styles.showHideText}>{showCardDetails ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.detailValue}>
                    {showCardDetails ? `**** **** **** ${viewingCard.cardNumber}` : `•••• •••• •••• ${viewingCard.cardNumber}`}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expiry Date</Text>
                  <Text style={styles.detailValue}>{viewingCard.expiryDate}</Text>
                </View>
                
                {showCardDetails && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>CVV</Text>
                    <Text style={styles.detailValue}>•••</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{viewingCard.type === 'card' ? 'Credit/Debit Card' : viewingCard.type}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Default Card</Text>
                  <Text style={styles.detailValue}>{viewingCard.isDefault ? 'Yes' : 'No'}</Text>
                </View>
                
                <Pressable 
                  style={styles.closeButton}
                  onPress={() => setViewingCard(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./support-page')}>
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A5D1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailRow: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  detailRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  showHideText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#1A5D1A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
