import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import EditSvg from '../assets/Profile/icons/edit.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { getCurrentUser } from '../services/auth';
import { getMerchantProfile, getUserProfile, updateUserProfile } from '../services/database';
import { MerchantAccount } from '../types';

export default function MyProfile() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [merchantProfile, setMerchantProfile] = useState<MerchantAccount | null>(null);
  const [isMerchant, setIsMerchant] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2000);

  useEffect(() => {
    const loadProfile = async () => {
      const user = getCurrentUser();
      if (user) {
        const result = await getUserProfile(user.uid);
        const merchantResult = await getMerchantProfile(user.uid);
        
        // Set merchant profile if exists
        if (merchantResult.success && merchantResult.data) {
          setMerchantProfile(merchantResult.data);
          setIsMerchant(true);
        }
        
        // Use user profile data, or fall back to merchant data if user profile is missing
        if (result.success && result.data) {
          setFullName(result.data.fullName || '');
          setDob(result.data.dateOfBirth || '');
          setEmail(result.data.email || '');
          setPhone(result.data.mobileNumber || '');
        } else if (merchantResult.success && merchantResult.data) {
          // Fall back to merchant profile data
          console.log('Using merchant profile data as fallback');
          setFullName(merchantResult.data.fullName || '');
          setDob('');
          setEmail(merchantResult.data.email || '');
          setPhone(merchantResult.data.mobileNumber || merchantResult.data.storePhone || '');
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleDateConfirm = () => {
    const formattedDate = `${String(selectedDay).padStart(2, '0')} / ${String(selectedMonth).padStart(2, '0')} / ${selectedYear}`;
    setDob(formattedDate);
    setDateModalVisible(false);
  };

  // Generate year options from 1970 to 2050
  const years = Array.from({ length: 81 }, (_, i) => 1970 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleUpdateProfile = async () => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in to update your profile.');
      return;
    }

    setUpdating(true);
    const result = await updateUserProfile(user.uid, {
      fullName,
      dateOfBirth: dob,
      mobileNumber: phone,
    });
    setUpdating(false);

    if (result.success) {
      Alert.alert('Success', 'Your profile has been updated! ✓');
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => router.back()}>
          <BackArrowLeftSvg width={22} height={22} />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerIcon} />
      </View>
      <ScrollView 
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
        <View style={styles.contentWrapper}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={require('../assets/Profile/Rectangle128.png')}
            style={styles.profileImage}
          />
          <View style={styles.editIconWrapper}>
            <EditSvg width={24} height={24} />
          </View>
        </View>
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.inputBox}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Date of Birth</Text>
          <Pressable 
            style={styles.inputBox}
            onPress={() => setDateModalVisible(true)}
          >
            <Text style={[styles.inputText, !dob && styles.placeholderText]}>
              {dob || "DD / MM / YYYY"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.inputBox}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.inputBox}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone Number"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
          />
        </View>
        <Pressable 
          style={[styles.updateButton, updating && styles.updateButtonDisabled]} 
          onPress={handleUpdateProfile}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Profile</Text>
          )}
        </Pressable>

        {/* Merchant Information Section */}
        {isMerchant && merchantProfile && (
          <View style={styles.merchantSection}>
            <Text style={styles.merchantSectionTitle}>Merchant Information</Text>
            
            <View style={styles.merchantInfoCard}>
              <View style={styles.merchantFieldRow}>
                <Text style={styles.merchantFieldLabel}>Store Name:</Text>
                <Text style={styles.merchantFieldValue}>{merchantProfile.storeName}</Text>
              </View>
              
              <View style={styles.merchantFieldRow}>
                <Text style={styles.merchantFieldLabel}>Business Type:</Text>
                <Text style={styles.merchantFieldValue}>{merchantProfile.businessType}</Text>
              </View>
              
              <View style={styles.merchantFieldRow}>
                <Text style={styles.merchantFieldLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  merchantProfile.status === 'approved' && styles.statusBadgeApproved,
                  merchantProfile.status === 'pending' && styles.statusBadgePending,
                  merchantProfile.status === 'rejected' && styles.statusBadgeRejected,
                ]}>
                  <Text style={styles.statusBadgeText}>{merchantProfile.status.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.merchantFieldRow}>
                <Text style={styles.merchantFieldLabel}>Store Phone:</Text>
                <Text style={styles.merchantFieldValue}>{merchantProfile.storePhone || 'N/A'}</Text>
              </View>
              
              <View style={styles.merchantFieldRow}>
                <Text style={styles.merchantFieldLabel}>Address:</Text>
                <Text style={styles.merchantFieldValue}>
                  {merchantProfile.addressLine1}, {merchantProfile.city} {merchantProfile.postCode}
                </Text>
              </View>
              
              <View style={styles.merchantFieldRow}>
                <Text style={styles.merchantFieldLabel}>Cuisine Tags:</Text>
                <View style={styles.cuisineTagsContainer}>
                  {merchantProfile.cuisineTags.map((tag, index) => (
                    <View key={index} style={styles.cuisineTag}>
                      <Text style={styles.cuisineTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Pressable 
              style={styles.viewDashboardButton}
              onPress={() => router.push('./merchant-page')}
            >
              <Text style={styles.viewDashboardButtonText}>View Merchant Dashboard</Text>
            </Pressable>
          </View>
        )}
      </View>
        )}
      </ScrollView>
      <View style={styles.bottomNavigation}>
        <Pressable style={styles.navIcon}>
          <HomeSvg width={22} height={22} />
        </Pressable>
        <Pressable style={styles.navIcon}>
          <BestsellingSvg width={22} height={22} />
        </Pressable>
        <Pressable style={styles.navIcon}>
          <FavouriteSvg width={22} height={22} />
        </Pressable>
        <Pressable style={styles.navIcon}>
          <RecommendationSvg width={22} height={22} />
        </Pressable>
        <Pressable style={styles.navIcon}>
          <SupportSvg width={22} height={22} />
        </Pressable>
      </View>

      {/* Date of Birth Modal */}
      <Modal
        visible={dateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            
            <View style={styles.pickerRow}>
              {/* Day Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {days.map((day) => (
                    <Pressable
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedDay === day && styles.pickerItemTextSelected
                      ]}>
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
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

              {/* Year Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
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
                        {year}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleDateConfirm}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3FFCF' },
  scrollWrapper: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 120 : 76,
    paddingBottom: 18,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3FFCF',
  },
  headerIcon: { width: 56, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#306639',
    textAlign: 'center',
    marginTop: -70,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -18,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  profileImageWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#F3FFCF',
  },
  editIconWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 2,
    borderWidth: 1,
    borderColor: '#F3FFCF',
  },
  fieldWrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: '#F3FFCF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
  },
  inputText: {
    fontSize: 16,
    color: '#222',
  },
  updateButton: {
    marginTop: 24,
    backgroundColor: '#1A5D1A',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  updateButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  bottomNavigation: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#1A5D1A',
    borderRadius: 24,
  },
  navIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  placeholderText: {
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A5D1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  picker: {
    height: 150,
    backgroundColor: '#F3FFCF',
    borderRadius: 12,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#C5E1A5',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#222',
  },
  pickerItemTextSelected: {
    fontWeight: '700',
    color: '#1A5D1A',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonCancel: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonConfirm: {
    backgroundColor: '#1A5D1A',
  },
  modalButtonTextCancel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  modalButtonTextConfirm: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  merchantSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  merchantSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 16,
  },
  merchantInfoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  merchantFieldRow: {
    marginBottom: 12,
  },
  merchantFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  merchantFieldValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  statusBadgeApproved: {
    backgroundColor: '#4CAF50',
  },
  statusBadgePending: {
    backgroundColor: '#FFC107',
  },
  statusBadgeRejected: {
    backgroundColor: '#F44336',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cuisineTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  cuisineTag: {
    backgroundColor: '#F3FFCF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  cuisineTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A5D1A',
  },
  viewDashboardButton: {
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  viewDashboardButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});