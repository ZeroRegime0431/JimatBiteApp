import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// SVG icons
import HomeSvg from '../assets/HomePage/icons/home.svg';
import AddressSvg from '../assets/SideBar/icons/address.svg';
import BackArrowSvg from '../assets/SideBar/icons/backarrow.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import ContactSvg from '../assets/SideBar/icons/contact.svg';
import HelpSvg from '../assets/SideBar/icons/help.svg';
import LineSvg from '../assets/SideBar/icons/line.svg';
import LogoutSvg from '../assets/SideBar/icons/logout.svg';
import MyProfileSvg from '../assets/SideBar/icons/myprofile.svg';
import OrdersSvg from '../assets/SideBar/icons/orders.svg';
import PaymentSvg from '../assets/SideBar/icons/payment.svg';
import SettingsSvg from '../assets/SideBar/icons/settings.svg';

const { width } = Dimensions.get('window');

interface SideBarProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideBar({ visible, onClose }: SideBarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({ fullName: 'John Smith', email: 'Loremipsum@email.com' });
  const [currentTime, setCurrentTime] = useState('');

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

  useEffect(() => {
    const loadProfile = async () => {
      const savedProfile = await AsyncStorage.getItem('profile');
      if (savedProfile) {
        const { fullName, email } = JSON.parse(savedProfile);
        setProfile({ fullName, email });
      }
    };
    if (visible) {
      loadProfile();
    }
  }, [visible]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    onClose();
    router.push('./(tabs)');
  };

  const menuItems = [
    { icon: OrdersSvg, label: 'My Orders', action: () => { onClose(); router.push('./myorders-active'); } },
    { icon: MyProfileSvg, label: 'My Profile', action: () => { onClose(); router.push('./MyProfile'); } },
    { icon: AddressSvg, label: 'Delivery Address', action: () => console.log('Delivery Address') },
    { icon: PaymentSvg, label: 'Payment Methods', action: () => { onClose(); router.push('./payment-method'); } },
    { icon: ContactSvg, label: 'Contact Us', action: () => console.log('Contact Us') },
    { icon: HelpSvg, label: 'Help & FAQs', action: () => console.log('Help & FAQs') },
    { icon: SettingsSvg, label: 'Settings', action: () => { onClose(); router.push('./settings'); } },
  ];

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
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={require('../assets/Profile/Rectangle128.png')}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.fullName}</Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
              </View>
              <Pressable style={styles.profileArrow} onPress={() => { onClose(); router.push('./MyProfile'); }}>
                <BackArrowSvg width={18} height={18} />
              </Pressable>
            </View>

            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <View key={index}>
                  <Pressable style={styles.menuItem} onPress={item.action}>
                    <View style={styles.iconContainer}>
                      <item.icon width={44} height={44} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </Pressable>
                  {index < menuItems.length - 1 && (
                    <View style={styles.lineContainer}>
                      <LineSvg width={width * 0.7} height={2} />
                    </View>
                  )}
                </View>
              ))}

              <Pressable style={styles.logoutItem} onPress={() => setShowLogoutModal(true)}>
                <View style={styles.iconContainer}>
                  <LogoutSvg width={38} height={38} />
                </View>
                <Text style={styles.logoutLabel}>Log Out</Text>
              </Pressable>
            </View>

            <View style={styles.bottomIconScrollable}>
              <Pressable onPress={onClose}>
                <View style={styles.homeIconContainer}>
                  <HomeSvg width={24} height={24} />
                </View>
              </Pressable>
            </View>
          </ScrollView>

          {/* Logout Confirmation Modal */}
          {showLogoutModal && (
            <View style={styles.logoutModalContainer}>
              <View style={styles.logoutModal}>
                <Text style={styles.logoutTitle}>Are you sure you want</Text>
                <Text style={styles.logoutTitle}>to log out?</Text>
                <View style={styles.logoutButtons}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => setShowLogoutModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.logoutButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.logoutButtonText}>Yes, logout</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
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
    width: width * 0.8,
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
  backArrow: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(45, 122, 45, 0.3)',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 15,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  profileArrow: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  lineContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  logoutLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  bottomIcon: {
    position: 'absolute',
    bottom: 30,
    left: 30,
  },
  bottomIconScrollable: {
    marginTop: 30,
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
  homeIcon: {
    fontSize: 24,
  },
  logoutModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModal: {
    backgroundColor: '#F4FFC9',
    borderRadius: 20,
    padding: 30,
    width: 300,
    alignItems: 'center',
    right: 33,
  },
  logoutTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#ffb6b6ff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});
