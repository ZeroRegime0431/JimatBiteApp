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
import { getUserOrders, updateOrderStatus } from '../services/database';
import type { Order } from '../types';

export default function MyOrdersActiveScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveOrders();
  }, []);

  const loadActiveOrders = async () => {
    setLoading(true);
    const user = getCurrentUser();
    if (user) {
      const result = await getUserOrders(user.uid);
      if (result.success && result.data) {
        // Filter only active orders (pending, confirmed, preparing, on-the-way)
        const activeOrders = result.data.filter(
          order => ['pending', 'confirmed', 'preparing', 'on-the-way'].includes(order.status)
        );
        setOrders(activeOrders);
      }
    }
    setLoading(false);
  };

  const handleCancel = async (orderId: string) => {
    // Update order status in Firestore
    const result = await updateOrderStatus(orderId, 'cancelled');
    if (result.success) {
      // Remove from UI
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } else {
      console.error('Failed to cancel order:', result.error);
    }
  };
 // ...existing code...
  const handleTabChange = (tab: 'completed' | 'cancelled') => {
    if (tab === 'completed') router.push('./myorders-completed');
    if (tab === 'cancelled') router.push('./myorders-cancelled');
  };
// ...existing code...
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
// ...existing code...

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
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A5D1A" />
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No active orders</Text>
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
                  <View style={styles.orderImage}>
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>{order.restaurantName.charAt(0)}</Text>
                    </View>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderName}>{order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}</Text>
                    <Text style={styles.orderDateTime}>
                      {order.orderDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}, {order.orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.itemCount}>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</Text>
                    <View style={styles.orderActions}>
                      <Pressable 
                        style={styles.cancelButton} 
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCancel(order.id);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                      </Pressable>
                      <Pressable 
                        style={styles.trackButton}
                        onPress={(e) => e.stopPropagation()}
                      >
                        <Text style={styles.trackButtonText}>{order.status === 'on-the-way' ? 'Track Driver' : 'Track Order'}</Text>
                      </Pressable>
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
    paddingTop: Platform.OS === 'ios' ? 110 : 76, // Drag header further down
    paddingBottom: 36, 
    paddingHorizontal: 0, // Remove horizontal padding so icons touch screen edge
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#F3FFCF' 
  },
  headerIcon: { width: 56, alignItems: 'center', justifyContent: 'center' }, // Wider touch area for easier tap
  headerTitleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    marginTop: -18, // Increase negative margin to match new header size
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
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 14, color: '#6B7280', marginTop: 12 },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1A5D1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
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
    borderRadius: 34, 
  },
  navIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  
});