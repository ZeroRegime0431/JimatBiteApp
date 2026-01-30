import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

// SVG icons
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

export default function NotificationSettingScreen() {
  const [generalNotification, setGeneralNotification] = useState(true);
  const [sound, setSound] = useState(true);
  const [soundCall, setSoundCall] = useState(true);
  const [vibrate, setVibrate] = useState(false);
  const [specialOffers, setSpecialOffers] = useState(false);
  const [payments, setPayments] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(false);
  const [cashback, setCashback] = useState(false);

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
              onValueChange={setGeneralNotification}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          {/* Sound */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Sound</Text>
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          {/* Sound Call */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Sound Call</Text>
            <Switch
              value={soundCall}
              onValueChange={setSoundCall}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          {/* Vibrate */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Vibrate</Text>
            <Switch
              value={vibrate}
              onValueChange={setVibrate}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          {/* Special Offers */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Special Offers</Text>
            <Switch
              value={specialOffers}
              onValueChange={setSpecialOffers}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          {/* Payments */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Payments</Text>
            <Switch
              value={payments}
              onValueChange={setPayments}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          {/* Promo and discount */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Promo and discount</Text>
            <Switch
              value={promoDiscount}
              onValueChange={setPromoDiscount}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          {/* Cashback */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Cashback</Text>
            <Switch
              value={cashback}
              onValueChange={setCashback}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem}>
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
