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
  trackingStatus: string;
}

export default function MyOrdersActiveScreen() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      name: 'Strawberry shake',
      price: 20.0,
      date: '29 Nov',
      time: '01:20 pm',
      itemCount: 2,
      image: require('../assets/OrderImages/strawberry.png'),
      trackingStatus: 'Track Driver',
    },
  ]);

  const handleCancel = (orderId: string) => setOrders(prev => prev.filter(o => o.id !== orderId));
  const handleTabChange = (tab: 'completed' | 'cancelled') => router.push(tab === 'completed' ? './myorders-completed' : './myorders-cancelled');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <BackArrowLeftSvg width={22} height={22} />
        </Pressable>
        <Text style={styles.titleText}>My Orders</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tabsContainer}>
            <Pressable style={[styles.tabButton, styles.tabButtonActive]}>
              <Text style={[styles.tabButtonText, styles.tabButtonTextActive]}>Active</Text>
            </Pressable>
            <Pressable style={styles.tabButton} onPress={() => handleTabChange('completed')}>
              <Text style={styles.tabButtonText}>Completed</Text>
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
                    <Pressable style={styles.cancelButton} onPress={() => handleCancel(order.id)}>
                      <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </Pressable>
                    <Pressable style={styles.trackButton}>
                      <Text style={styles.trackButtonText}>{order.trackingStatus}</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.orderRightSection}>
                  <Text style={styles.orderPrice}>${order.price.toFixed(2)}</Text>
                </View>
              </View>
            ))}

            {orders.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No active orders</Text>
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
    paddingTop: Platform.OS === 'ios' ? 70 : 36, 
    paddingBottom: 24, 
    paddingHorizontal: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#F3FFCF' 
  },
  titleText: { fontSize: 22, fontWeight: '700', color: '#306639' },
  contentWrapper: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    marginTop: -16, 
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
  cancelButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    backgroundColor: '#1A5D1A', 
    borderRadius: 6 
  },
  cancelButtonText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  trackButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    backgroundColor: '#E8F5E9', 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: '#1A5D1A' 
  },
  trackButtonText: { color: '#1A5D1A', fontSize: 11, fontWeight: '600' },
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