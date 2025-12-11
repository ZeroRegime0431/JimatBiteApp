import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

// SVG icons
import DisplayCardSvg from '../assets/PaymentMethod-AddCard/icons/displaycard.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

export default function AddCardScreen() {
  const [cardName, setCardName] = useState('John Smith');
  const [cardNumber, setCardNumber] = useState('000 000 000 00');
  const [expiryDate, setExpiryDate] = useState('04/28');
  const [cvv, setCvv] = useState('000');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('04');
  const [selectedYear, setSelectedYear] = useState('28');

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const years = Array.from({ length: 31 }, (_, i) => (2020 + i).toString().slice(-2));

  useEffect(() => {
    const loadCard = async () => {
      const savedCard = await AsyncStorage.getItem('cardDetails');
      if (savedCard) {
        const { cardName, cardNumber, expiryDate, cvv } = JSON.parse(savedCard);
        setCardName(cardName);
        setCardNumber(cardNumber);
        setExpiryDate(expiryDate);
        setCvv(cvv);
        const [month, year] = expiryDate.split('/');
        if (month && year) {
          setSelectedMonth(month);
          setSelectedYear(year);
        }
      }
    };
    loadCard();
  }, []);

  const handleSelectDate = () => {
    setExpiryDate(`${selectedMonth}/${selectedYear}`);
    setShowDatePicker(false);
  };

  const handleSaveCard = async () => {
    await AsyncStorage.setItem(
      'cardDetails',
      JSON.stringify({ cardName, cardNumber, expiryDate, cvv })
    );
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={28} height={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Card</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Preview */}
        <View style={styles.cardPreview}>
        <DisplayCardSvg width={280} height={180} />
        <View style={styles.cardOverlay}>
          <View style={styles.cardTopRow}>
            <View style={styles.flex1} />
            <Text style={styles.cvvPreview}>{cvv}</Text>
          </View>
          <Text style={styles.cardNumberPreview}>{cardNumber}</Text>
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardLabel}>Card holder Name</Text>
              <Text style={styles.cardValue}>{cardName}</Text>
            </View>
            <View style={styles.expiryContainer}>
              <Text style={styles.cardLabel}>Expiry Date</Text>
              <Text style={styles.cardValue}>{expiryDate}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Card holder name</Text>
        <TextInput
          style={styles.input}
          value={cardName}
          onChangeText={setCardName}
          placeholder="John Smith"
          keyboardType='default'
        />

        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={setCardNumber}
          placeholder="000 000 000 00"
          keyboardType="numeric"
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Expiry Date</Text>
            <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.inputText}>{expiryDate}</Text>
            </Pressable>
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              value={cvv}
              onChangeText={setCvv}
              placeholder="000"
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSaveCard}>
          <Text style={styles.saveButtonText}>Save Card</Text>
        </Pressable>
      </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerPanel}>
            <Text style={styles.pickerTitle}>Select Expiry Date</Text>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {months.map((month) => (
                    <Pressable
                      key={month}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedMonth(month)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedMonth === month && styles.pickerItemTextSelected
                      ]}>
                        {month}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <Pressable
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedYear === year && styles.pickerItemTextSelected
                      ]}>
                        20{year}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Pressable style={styles.pickerButton} onPress={handleSelectDate}>
              <Text style={styles.pickerButtonText}>Confirm</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  placeholder: {
    width: 28,
    height: 28,
  },
  cardPreview: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  cardOverlay: {
    position: 'absolute',
    top: 24,
    left: 32,
    right: 32,
    bottom: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  cvvPreview: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#222',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardNumberPreview: {
    fontSize: 18,
    color: '#000000ff',
    fontWeight: 'bold',
    marginVertical: 14,
    letterSpacing: 2,
    top: 0,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: '#000000ff',
    marginBottom: 4,
    right: -20,
  },
  cardValue: {
    fontSize: 14,
    color: '#000000ff',
    fontWeight: 'bold',
    top: -8,
    right: -20,
  },
  expiryContainer: {
    alignItems: 'flex-end',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: '#222',
  },
  inputText: {
    fontSize: 16,
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#26a90bff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerPanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  pickerScroll: {
    maxHeight: 120,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#F2F2F2',
  },
  pickerItemSelected: {
    backgroundColor: '#FF7F50',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerButton: {
    backgroundColor: '#FF7F50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});