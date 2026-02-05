import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

// SVG icons
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

export default function PasswordSettingScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChangePassword = () => {
    setErrorMessage('');
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match');
      return;
    }
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    // Password change logic here
    console.log('Password changed');
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Password Setting</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="............"
                secureTextEntry={!showCurrentPassword}
              />
              <Pressable 
                style={styles.showButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Text style={styles.showButtonText}>{showCurrentPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
            <Pressable 
              style={styles.forgotPassword}
              onPress={() => router.push('./settings-password-forget')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setErrorMessage('');
                }}
                placeholder="............"
                secureTextEntry={!showNewPassword}
              />
              <Pressable 
                style={styles.showButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Text style={styles.showButtonText}>{showNewPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrorMessage('');
                }}
                placeholder="............"
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable 
                style={styles.showButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.showButtonText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Change Password Button */}
          <Pressable style={styles.changeButton} onPress={handleChangePassword}>
            <Text style={styles.changeButtonText}>Change Password</Text>
          </Pressable>
        </ScrollView>
      </View>

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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8D6',
    borderRadius: 12,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  showButton: {
    paddingHorizontal: 8,
  },
  showButtonText: {
    fontSize: 14,
    color: '#1A5D1A',
    fontWeight: '700',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  changeButtonText: {
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
});
