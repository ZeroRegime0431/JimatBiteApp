import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { getCurrentUser } from '../services/auth';
import { getUserOrders } from '../services/database';
import type { Order } from '../types';

export default function MyOrdersCompletedScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletedOrders();
  }, []);

  const loadCompletedOrders = async () => {
    setLoading(true);
    const user = getCurrentUser();
    if (user) {
      const result = await getUserOrders(user.uid);
      if (result.success && result.data) {
        // Filter only completed orders (delivered status)
        const completedOrders = result.data.filter(
          order => order.status === 'delivered'
        );
        setOrders(completedOrders);
      }
    }
    setLoading(false);
  };

  const handleTabChange = (tab: 'active' | 'cancelled') => {
    if (tab === 'active') router.push('./myorders-active');
    if (tab === 'cancelled') router.push('./myorders-cancelled');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => router.push('./home-page')}>
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
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A5D1A" />
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No completed orders</Text>
              </View>
            ) : (
              orders.map(order => (
                <Pressable 
                  key={order.id} 
                  style={styles.orderCard}
                  onPress={() => router.push({
                    pathname: './order-details',
                    params: { orderId: order.id }
                  })}
                >
                  <View style={styles.orderImagePlaceholder}>
                    <Text style={styles.orderImageText}>📦</Text>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderName}>Order #{order.id.substring(0, 8)}</Text>
                    <Text style={styles.orderDateTime}>
                      {order.orderDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, {' '}
                      {order.orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.itemCount}>{order.items.length} items</Text>
                    <View style={styles.orderActions}>
                      <View style={styles.completedButton}>
                        <Text style={styles.completedButtonText}>Delivered</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.orderRightSection}>
                    <Text style={styles.orderPrice}>${order.grandTotal.toFixed(2)}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.bottomNavigation}>
        <Pressable style={styles.navIcon} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.push('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.push('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.push('./recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3FFCF' },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 110 : 76, // Match myorders-active
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
  orderImagePlaceholder: { 
    width: 80, 
    height: 80, 
    borderRadius: 8, 
    marginRight: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderImageText: {
    fontSize: 32,
  },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40 
  },
  loadingText: { 
    fontSize: 16, 
    color: '#9CA3AF',
    marginTop: 12,
  },
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
    bottom: 18, 
    left: 12, 
    right: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingVertical: 10, 
    backgroundColor: '#1A5D1A', 
    borderRadius: 34 
  },
  navIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});