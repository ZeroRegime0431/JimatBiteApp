import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import EditSvg from '../assets/Profile/icons/edit.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

export default function MyProfile() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const savedProfile = await AsyncStorage.getItem('profile');
      if (savedProfile) {
        const { fullName, dob, email, phone } = JSON.parse(savedProfile);
        setFullName(fullName);
        setDob(dob);
        setEmail(email);
        setPhone(phone);
      } else {
        setFullName('John Smith');
        setDob('09 / 10 /1991');
        setEmail('johnsmith@example.com');
        setPhone('+123 567 89000');
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    await AsyncStorage.setItem(
      'profile',
      JSON.stringify({ fullName, dob, email, phone })
    );
    Alert.alert('Profile Updated', 'Your profile details have been saved.');
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
          <TextInput
            style={styles.inputBox}
            value={dob}
            onChangeText={setDob}
            placeholder="Date of Birth"
            placeholderTextColor="#888"
          />
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
        <Pressable style={styles.updateButton} onPress={handleUpdateProfile}>
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </Pressable>
      </View>
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
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
});