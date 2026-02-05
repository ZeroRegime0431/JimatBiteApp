import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { db } from '../config/firebase';
import { getCurrentUser } from '../services/auth';

// SVG icons
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationSettings {
  generalNotification: boolean;
  sound: boolean;
  soundCall: boolean;
  vibrate: boolean;
  specialOffers: boolean;
  payments: boolean;
  promoDiscount: boolean;
  cashback: boolean;
  updatedAt: Date;
}

export default function NotificationSettingScreen() {
  const [generalNotification, setGeneralNotification] = useState(true);
  const [sound, setSound] = useState(true);
  const [soundCall, setSoundCall] = useState(true);
  const [vibrate, setVibrate] = useState(false);
  const [specialOffers, setSpecialOffers] = useState(false);
  const [payments, setPayments] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(false);
  const [cashback, setCashback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const settingsRef = doc(db, 'notificationSettings', user.uid);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const settings = settingsSnap.data() as NotificationSettings;
        setGeneralNotification(settings.generalNotification ?? true);
        setSound(settings.sound ?? true);
        setSoundCall(settings.soundCall ?? true);
        setVibrate(settings.vibrate ?? false);
        setSpecialOffers(settings.specialOffers ?? false);
        setPayments(settings.payments ?? false);
        setPromoDiscount(settings.promoDiscount ?? false);
        setCashback(settings.cashback ?? false);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
    setLoading(false);
  };

  const saveNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const settingsRef = doc(db, 'notificationSettings', user.uid);
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive updates.',
          [{ text: 'OK', style: 'default' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const handleGeneralNotificationChange = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        return;
      }
    }
    
    setGeneralNotification(value);
    await saveNotificationSettings({ generalNotification: value });
    
    // Update notification handler based on settings
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: value,
        shouldPlaySound: value && sound,
        shouldSetBadge: value,
        shouldShowBanner: value,
        shouldShowList: value,
      }),
    });
  };

  const handleSoundChange = async (value: boolean) => {
    setSound(value);
    await saveNotificationSettings({ sound: value });
  };

  const handleSoundCallChange = async (value: boolean) => {
    setSoundCall(value);
    await saveNotificationSettings({ soundCall: value });
  };

  const handleVibrateChange = async (value: boolean) => {
    setVibrate(value);
    await saveNotificationSettings({ vibrate: value });
  };

  const handleSpecialOffersChange = async (value: boolean) => {
    setSpecialOffers(value);
    await saveNotificationSettings({ specialOffers: value });
  };

  const handlePaymentsChange = async (value: boolean) => {
    setPayments(value);
    await saveNotificationSettings({ payments: value });
  };

  const handlePromoDiscountChange = async (value: boolean) => {
    setPromoDiscount(value);
    await saveNotificationSettings({ promoDiscount: value });
  };

  const handleCashbackChange = async (value: boolean) => {
    setCashback(value);
    await saveNotificationSettings({ cashback: value });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Notification Setting</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* General Notification */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>General Notification</Text>
            <Switch
              value={generalNotification}
              onValueChange={handleGeneralNotificationChange}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>

          {/* Sound */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Sound</Text>
            <Switch
              value={sound}
              onValueChange={handleSoundChange}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>

          {/* Sound Call */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Sound Call</Text>
            <Switch
              value={soundCall}
              onValueChange={handleSoundCallChange}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>

          {/* Vibrate */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Vibrate</Text>
            <Switch
              value={vibrate}
              onValueChange={handleVibrateChange}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>

          {/* Special Offers */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Special Offers</Text>
            <Switch
              value={specialOffers}
              onValueChange={handleSpecialOffersChange}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>

          {/* Payments */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Payments</Text>
            <Switch
              value={payments}
              onValueChange={handlePaymentsChange}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>

          {/* Promo and discount */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Promo and discount</Text>
            <Switch
              value={promoDiscount}
              onValueChange={handlePromoDiscountChange}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>

          {/* Cashback */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Cashback</Text>
            <Switch
              value={cashback}
              onValueChange={handleCashbackChange}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
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
