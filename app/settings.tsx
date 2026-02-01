import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

// SVG icons
import DeleteAccountSvg from '../assets/Settings/icons/delete.svg';
import NotificationSettingSvg from '../assets/Settings/icons/notification.svg';
import PasswordSettingSvg from '../assets/Settings/icons/password.svg';
import RedArrowRightSvg from '../assets/Settings/icons/redarrowright.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

export default function SettingsScreen() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    // Navigate to login/signup screen
    router.push('./(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, showDeleteModal && styles.fadedContent]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Notification Setting */}
        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('./settings-notification')}
        >
          <View style={styles.menuItemLeft}>
            <NotificationSettingSvg width={24} height={24} />
            <Text style={styles.menuItemText}>Notification Setting</Text>
          </View>
          <RedArrowRightSvg width={20} height={20} />
        </Pressable>

        {/* Password Setting */}
        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('./settings-password')}
        >
          <View style={styles.menuItemLeft}>
            <PasswordSettingSvg width={24} height={24} />
            <Text style={styles.menuItemText}>Password Setting</Text>
          </View>
          <RedArrowRightSvg width={20} height={20} />
        </Pressable>

        {/* Delete Account */}
        <Pressable
          style={styles.menuItem}
          onPress={() => setShowDeleteModal(true)}
        >
          <View style={styles.menuItemLeft}>
            <DeleteAccountSvg width={24} height={24} />
            <Text style={styles.menuItemText}>Delete Account</Text>
          </View>
          <RedArrowRightSvg width={20} height={20} />
        </Pressable>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.overlayTouchable} 
            onPress={() => setShowDeleteModal(false)} 
          />
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Are you sure you want</Text>
            <Text style={styles.deleteTitle}>to delete your account?</Text>
            <View style={styles.deleteButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteButtonText}>Yes, Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, showDeleteModal && styles.fadedContent]}>
        <Pressable style={styles.navItem} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/favorites-page')}>
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
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8D6',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  deleteModal: {
    backgroundColor: '#F4FFC9',
    borderRadius: 20,
    padding: 30,
    width: 320,
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  deleteButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#FFB6C1',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    fontSize: 14,
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
  fadedContent: {
    opacity: 0.3,
  },
});
