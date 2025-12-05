import { router } from 'expo-router';
import React, { useState } from 'react';
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

  const handleSelectDate = () => {
    setExpiryDate(`${selectedMonth}/${selectedYear}`);
    setShowDatePicker(false);
  };

  const handleSaveCard = () => {
    // Save card logic here
    console.log('Card saved');
    router.back(); // Go back to payment methods screen
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

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
  cardPreview: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  cardOverlay: {
    position: 'absolute',
    top: 40,
    left: 60,
    right: 60,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    left: 20,
  },
  flex1: {
    flex: 1,
  },
  cvvPreview: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    letterSpacing: 1,
    bottom: 23,
    left: -5,
  },
  cardNumberPreview: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 20,
    left: -16,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    left: -16,
  },
  cardLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  expiryContainer: {
    marginLeft: 20,
  },
  chipPlaceholder: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    width: 30,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFF8D6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerPanel: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: 320,
    maxHeight: 400,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A5D1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  pickerScroll: {
    height: 200,
    backgroundColor: '#F4FFC9',
    borderRadius: 12,
  },
  pickerItem: {
    padding: 12,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#4CAF50',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 14,
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
