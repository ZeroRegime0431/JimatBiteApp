import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

interface Order {
  id: string;
  name: string;
  price: number;
  date: string;
  time: string;
  itemCount: number;
  image: any;
  status: string;
}

export default function MyOrdersCompletedScreen() {
  const [orders] = useState<Order[]>([
    {
      id: '1',
      name: 'Chicken Curry',
      price: 50.0,
      date: '29 Nov',
      time: '1:20 pm',
      itemCount: 2,
      image: require('../assets/OrderImages/chickencurry.png'),
      status: 'Delivered',
    },
     {
      id: '2',
      name: 'Bean and Vegetable Burger',
      price: 50.0,
      date: '10 Nov',
      time: '06:05 pm',
      itemCount: 2,
      image: require('../assets/OrderImages/beanandvegetableburger.png'),
      status: 'Delivered',
    },
    {
      id: '3',
      name: 'Coffe Latte',
      price: 8.0,
      date: '10 Nov',
      time: '8:30 am',
      itemCount: 1,
      image: require('../assets/OrderImages/coffeelatte.png'),
      status: 'Delivered',
    },
      {
      id: '4',
      name: 'strawberry Cheesecake',
      price: 22.0,
      date: '03 Oct',
      time: '3:40 pm',
      itemCount: 2,
      image: require('../assets/OrderImages/strawberrycheesecake.png'),
      status: 'Delivered',
    },
     {
      id: '5',
      name: 'Noondle Bowl',
      price: 17.0,
      date: '01 Oct',
      time: '5:40 pm',
      itemCount: 1,
      image: require('../assets/OrderImages/image11.png'),
      status: 'Delivered',
    },
    {
      id: '6',
      name: 'Grilled Chicken Thigh',
      price: 24.0,
      date: '29 Aug',
      time: '6:10 pm',
      itemCount: 1,
      image: require('../assets/OrderImages/image12.png'),
      status: 'Delivered',
    },
    {
      id: '7',
      name: 'Chicken Thali',
      price: 9.0,
      date: '24 Aug',
      time: '7:30 pm',
      itemCount: 1,
      image: require('../assets/OrderImages/image13.png'),
      status: 'Delivered',
    },
    {
      id: '8',
      name: 'KFC Chicken Strips',
      price: 22.0,
      date: '20 Aug',
      time: '9:40 pm',
      itemCount: 1,
      image: require('../assets/OrderImages/image14.png'),
      status: 'Delivered',
    },
  ]);

  const handleTabChange = (tab: 'active' | 'cancelled') => {
    if (tab === 'active') router.push('./myorders-active');
    if (tab === 'cancelled') router.push('./myorders-cancelled');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => router.back()}>
          <BackArrowLeftSvg width={22} height={22} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.titleText}>My Orders</Text>
        </View>
        <View style={styles.headerIcon} />
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tabsContainer}>
            <Pressable style={styles.tabButton} onPress={() => handleTabChange('active')}>
              <Text style={styles.tabButtonText}>Active</Text>
            </Pressable>
            <Pressable style={[styles.tabButton, styles.tabButtonActive]}>
              <Text style={[styles.tabButtonText, styles.tabButtonTextActive]}>Completed</Text>
            </Pressable>
            <Pressable style={styles.tabButton} onPress={() => handleTabChange('cancelled')}>
              <Text style={styles.tabButtonText}>Cancelled</Text>
            </Pressable>
          </View>

          <View style={styles.ordersContainer}>
            {orders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <Image source={order.image} style={styles.orderImage} />
                <View style={styles.orderDetails}>
                  <Text style={styles.orderName}>{order.name}</Text>
                  <Text style={styles.orderDateTime}>{order.date}, {order.time}</Text>
                  <Text style={styles.itemCount}>{order.itemCount} items</Text>
                  <View style={styles.orderActions}>
                    <View style={styles.completedButton}>
                      <Text style={styles.completedButtonText}>{order.status}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.orderRightSection}>
                  <Text style={styles.orderPrice}>${order.price.toFixed(2)}</Text>
                </View>
              </View>
            ))}

            {orders.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No completed orders</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

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
  header: { 
    paddingTop: Platform.OS === 'ios' ? 100 : 76, // Match myorders-active
    paddingBottom: 36, // Match myorders-active
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3FFCF'
  },
  headerIcon: { width: 56, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-start',
    height: '100%',
  },
  titleText: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#306639', 
    textAlign: 'center',
    marginTop: -10,
  },
  contentWrapper: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    marginTop: -18, // Match myorders-active
    overflow: 'hidden'
  },
  scrollContent: { paddingBottom: 140, paddingTop: 16 },
  tabsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 16, 
    marginBottom: 6 
  },
  tabButton: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#E8F5E9', 
    borderWidth: 1, 
    borderColor: '#C8E6C9' 
  },
  tabButtonActive: { backgroundColor: '#1A5D1A', borderColor: '#1A5D1A' },
  tabButtonText: { fontSize: 14, fontWeight: '600', color: '#1A5D1A' },
  tabButtonTextActive: { color: '#fff' },
  ordersContainer: { paddingHorizontal: 16, marginTop: 8 },
  orderCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 16, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#F1E9E6' 
  },
  orderImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  orderDetails: { flex: 1 },
  orderName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  orderDateTime: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  itemCount: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  orderActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  completedButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    backgroundColor: '#E8F5E9', 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: '#1A5D1A'
  },
  completedButtonText: { color: '#1A5D1A', fontSize: 11, fontWeight: '600' },
  orderRightSection: { alignItems: 'flex-end' },
  orderPrice: { fontSize: 16, fontWeight: '700', color: '#1A5D1A' },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 16, color: '#9CA3AF' },
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
    borderRadius: 24 
  },
  navIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});