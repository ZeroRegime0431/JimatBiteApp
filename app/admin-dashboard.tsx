import { router, useFocusEffect } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { db } from '../config/firebase';
import { approveMerchantAccount, getAllMerchants, rejectMerchantAccount } from '../services/database';
import { MerchantAccount, Order } from '../types';
import CartSidebar from './cart-sidebar';
import NotificationSidebar from './notification-sidebar';
import SideBar from './side-bar';

// SVG icons
import BellSvg from '../assets/HomePage/icons/bell.svg';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import CartSvg from '../assets/HomePage/icons/cart.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import ProfileSvg from '../assets/HomePage/icons/profile.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import ArrowRightSvg from '../assets/Settings/icons/redarrowright.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dropdown states
  const [quickLinksExpanded, setQuickLinksExpanded] = useState(true);
  const [merchantsExpanded, setMerchantsExpanded] = useState(true);
  const [pendingOrdersExpanded, setPendingOrdersExpanded] = useState(true);
  const [completedOrdersExpanded, setCompletedOrdersExpanded] = useState(true);
  const [cancelledOrdersExpanded, setCancelledOrdersExpanded] = useState(true);
  
  // Data states
  const [pendingMerchants, setPendingMerchants] = useState<MerchantAccount[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [userNames, setUserNames] = useState<{ [userId: string]: string }>({});

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadPendingMerchants(),
      loadOrders()
    ]);
    setLoading(false);
  };

  const loadPendingMerchants = async () => {
    try {
      const result = await getAllMerchants('pending');
      if (result.success && result.data) {
        setPendingMerchants(result.data);
      }
    } catch (error) {
      console.error('Error loading pending merchants:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const querySnapshot = await getDocs(ordersRef);
      
      const pending: Order[] = [];
      const completed: Order[] = [];
      const cancelled: Order[] = [];
      const userIds = new Set<string>();
      
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const order: Order = {
          ...data,
          orderDate: data.orderDate?.toDate(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate(),
          actualDeliveryTime: data.actualDeliveryTime?.toDate(),
        } as Order;
        
        userIds.add(order.userId);
        
        if (order.status === 'pending') {
          pending.push(order);
        } else if (order.status === 'delivered') {
          completed.push(order);
        } else if (order.status === 'cancelled') {
          cancelled.push(order);
        }
      });
      
      // Fetch user names
      const userNameMap: { [userId: string]: string } = {};
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userNameMap[userId] = userData.fullName || 'Unknown User';
          } else {
            userNameMap[userId] = 'Unknown User';
          }
        } catch (error) {
          userNameMap[userId] = 'Unknown User';
        }
      }
      
      setUserNames(userNameMap);
      
      // Sort orders by date (newest first)
      pending.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      completed.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      cancelled.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      
      setPendingOrders(pending);
      setCompletedOrders(completed);
      setCancelledOrders(cancelled);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleApproveMerchant = async (merchant: MerchantAccount) => {
    Alert.alert(
      'Approve Merchant',
      `Are you sure you want to approve ${merchant.storeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const result = await approveMerchantAccount(merchant.uid);
              if (result.success) {
                Alert.alert('Success', 'Merchant approved successfully!');
                loadPendingMerchants();
              } else {
                Alert.alert('Error', result.error || 'Failed to approve merchant');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while approving merchant');
            }
          }
        }
      ]
    );
  };

  const handleRejectMerchant = async (merchant: MerchantAccount) => {
    Alert.alert(
      'Reject Merchant',
      `Are you sure you want to reject ${merchant.storeName}? This will mark their account as rejected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mark as rejected in Firestore
              const result = await rejectMerchantAccount(merchant.uid);
              
              if (result.success) {
                // Note: Deleting Firebase Auth users requires Admin SDK (server-side)
                // For now, we mark as rejected. Consider implementing a Cloud Function
                // to delete the auth account when status is set to 'rejected'
                
                Alert.alert('Success', 'Merchant rejected. Account marked as rejected.');
                loadPendingMerchants();
              } else {
                Alert.alert('Error', result.error || 'Failed to reject merchant');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while rejecting merchant');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMerchantCard = (merchant: MerchantAccount) => {
    return (
      <View key={merchant.uid} style={styles.merchantCard}>
        <View style={styles.merchantHeader}>
          <View style={styles.merchantInfo}>
            <ThemedText style={styles.merchantStoreName}>{merchant.storeName}</ThemedText>
            <ThemedText style={styles.merchantOwnerName}>{merchant.fullName}</ThemedText>
            <ThemedText style={styles.merchantEmail}>{merchant.email}</ThemedText>
          </View>
        </View>
        
        <View style={styles.merchantDetails}>
          <ThemedText style={styles.merchantDetailLabel}>Business Type:</ThemedText>
          <ThemedText style={styles.merchantDetailValue}>{merchant.businessType}</ThemedText>
        </View>
        
        <View style={styles.merchantDetails}>
          <ThemedText style={styles.merchantDetailLabel}>Phone:</ThemedText>
          <ThemedText style={styles.merchantDetailValue}>{merchant.mobileNumber || 'N/A'}</ThemedText>
        </View>
        
        <View style={styles.merchantDetails}>
          <ThemedText style={styles.merchantDetailLabel}>Address:</ThemedText>
          <ThemedText style={styles.merchantDetailValue}>
            {merchant.addressLine1}, {merchant.city}, {merchant.postCode}
          </ThemedText>
        </View>
        
        {merchant.bankDetails && (
          <View style={styles.merchantDetails}>
            <ThemedText style={styles.merchantDetailLabel}>Bank:</ThemedText>
            <ThemedText style={styles.merchantDetailValue}>
              {merchant.bankDetails.bankName} - {merchant.bankDetails.accountHolderName}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.merchantActions}>
          <Pressable 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveMerchant(merchant)}
          >
            <Text style={styles.approveButtonText}>✓ Approve</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectMerchant(merchant)}
          >
            <Text style={styles.rejectButtonText}>✗ Reject</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderOrderCard = (order: Order, statusColor: string) => {
    const customerName = userNames[order.userId] || 'Loading...';
    
    return (
      <Pressable 
        key={order.id} 
        style={[styles.orderCard, { borderLeftColor: statusColor }]}
        onPress={() => router.push(`./order-details?orderId=${order.id}`)}
      >
        <View style={styles.orderHeader}>
          <ThemedText style={styles.orderId}>Order #{order.id.slice(-6)}</ThemedText>
          <ThemedText style={styles.orderDate}>{formatDate(order.orderDate)}</ThemedText>
        </View>
        <ThemedText style={styles.restaurantName}>{order.restaurantName}</ThemedText>
        <View style={styles.orderDetails}>
          <ThemedText style={styles.itemCount}>{order.items.length} items</ThemedText>
          <ThemedText style={styles.orderTotal}>${order.grandTotal.toFixed(2)}</ThemedText>
        </View>
        <View style={styles.orderFooter}>
          <ThemedText style={styles.customerName}>Customer: {customerName}</ThemedText>
          <ThemedText style={styles.customerInfo}>ID: {order.userId.slice(-6)}</ThemedText>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
        </View>
        <View style={styles.topIcons}>
          <Pressable onPress={() => setNotificationVisible(true)} style={styles.iconButton}>
            <BellSvg width={24} height={24} />
          </Pressable>
          <Pressable onPress={() => setCartVisible(true)} style={styles.iconButton}>
            <CartSvg width={24} height={24} />
          </Pressable>
          <Pressable onPress={() => setSidebarVisible(true)} style={styles.iconButton}>
            <ProfileSvg width={24} height={24} />
          </Pressable>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Admin Dashboard</ThemedText>
      </View>

      {/* Admin Badge */}
      <View style={styles.adminBanner}>
        <Text style={styles.adminBannerIcon}>👑</Text>
        <View style={styles.adminBannerContent}>
          <Text style={styles.adminBannerTitle}>Super Admin Access</Text>
          <Text style={styles.adminBannerText}>
            You have full access to manage merchants, orders, and all platform operations.
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Quick Links Section */}
        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => setQuickLinksExpanded(!quickLinksExpanded)}
          >
            <ThemedText style={styles.sectionTitle}>Quick Links</ThemedText>
            <View style={{ flex: 1 }} />
            <View style={[styles.arrowIcon, { transform: [{ rotate: quickLinksExpanded ? '90deg' : '0deg' }] }]}>
              <ArrowRightSvg width={20} height={20} />
            </View>
          </Pressable>
          {quickLinksExpanded && (
            <View style={styles.quickLinksContainer}>
              <Pressable
                style={styles.quickLinkButton}
                onPress={() => router.push('./merchant-page-menuitem')}
              >
                <ThemedText style={styles.quickLinkText}>Manage Menu Items</ThemedText>
              </Pressable>
            </View>
          )}
        </View>

        {/* Customer Chatbox Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Customer Chatbox</ThemedText>
          </View>
          <Pressable
            style={styles.chatButton}
            onPress={() => router.push('./chat-list')}
          >
            <ThemedText style={styles.chatButtonText}>View All Messages</ThemedText>
          </Pressable>
        </View>

        {/* Pending Merchants Section */}
        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => setMerchantsExpanded(!merchantsExpanded)}
          >
            <ThemedText style={styles.sectionTitle}>Pending Merchants</ThemedText>
            <View style={[styles.badge, { backgroundColor: '#FFA500' }]}>
              <Text style={styles.badgeText}>{pendingMerchants.length}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={[styles.arrowIcon, { transform: [{ rotate: merchantsExpanded ? '90deg' : '0deg' }] }]}>
              <ArrowRightSvg width={20} height={20} />
            </View>
          </Pressable>
          {merchantsExpanded && (
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1A5D1A" />
              </View>
            ) : pendingMerchants.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No pending merchant applications</ThemedText>
              </View>
            ) : (
              pendingMerchants.map(merchant => renderMerchantCard(merchant))
            )
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A5D1A" />
            <ThemedText style={styles.loadingText}>Loading orders...</ThemedText>
          </View>
        ) : (
          <>
            {/* Pending Orders Section */}
            <View style={styles.section}>
              <Pressable 
                style={styles.sectionHeader}
                onPress={() => setPendingOrdersExpanded(!pendingOrdersExpanded)}
              >
                <ThemedText style={styles.sectionTitle}>Pending Orders</ThemedText>
                <View style={[styles.badge, { backgroundColor: '#FFA500' }]}>
                  <Text style={styles.badgeText}>{pendingOrders.length}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={[styles.arrowIcon, { transform: [{ rotate: pendingOrdersExpanded ? '90deg' : '0deg' }] }]}>
                  <ArrowRightSvg width={20} height={20} />
                </View>
              </Pressable>
              {pendingOrdersExpanded && (
                pendingOrders.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>No pending orders</ThemedText>
                  </View>
                ) : (
                  pendingOrders.map(order => renderOrderCard(order, '#FFA500'))
                )
              )}
            </View>

            {/* Completed Orders Section */}
            <View style={styles.section}>
              <Pressable 
                style={styles.sectionHeader}
                onPress={() => setCompletedOrdersExpanded(!completedOrdersExpanded)}
              >
                <ThemedText style={styles.sectionTitle}>Completed Orders</ThemedText>
                <View style={[styles.badge, { backgroundColor: '#1A5D1A' }]}>
                  <Text style={styles.badgeText}>{completedOrders.length}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={[styles.arrowIcon, { transform: [{ rotate: completedOrdersExpanded ? '90deg' : '0deg' }] }]}>
                  <ArrowRightSvg width={20} height={20} />
                </View>
              </Pressable>
              {completedOrdersExpanded && (
                completedOrders.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>No completed orders</ThemedText>
                  </View>
                ) : (
                  completedOrders.map(order => renderOrderCard(order, '#1A5D1A'))
                )
              )}
            </View>

            {/* Cancelled Orders Section */}
            <View style={styles.section}>
              <Pressable 
                style={styles.sectionHeader}
                onPress={() => setCancelledOrdersExpanded(!cancelledOrdersExpanded)}
              >
                <ThemedText style={styles.sectionTitle}>Cancelled Orders</ThemedText>
                <View style={[styles.badge, { backgroundColor: '#DC143C' }]}>
                  <Text style={styles.badgeText}>{cancelledOrders.length}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={[styles.arrowIcon, { transform: [{ rotate: cancelledOrdersExpanded ? '90deg' : '0deg' }] }]}>
                  <ArrowRightSvg width={20} height={20} />
                </View>
              </Pressable>
              {cancelledOrdersExpanded && (
                cancelledOrders.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>No cancelled orders</ThemedText>
                  </View>
                ) : (
                  cancelledOrders.map(order => renderOrderCard(order, '#DC143C'))
                )
              )}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.replace('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./recommend-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('./support-page')}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>

      {/* Sidebars */}
      <SideBar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <NotificationSidebar visible={notificationVisible} onClose={() => setNotificationVisible(false)} />
      <CartSidebar visible={cartVisible} onClose={() => setCartVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#F4FFC9',
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  topIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4FFC9',
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A5D1A',
    right: -30,
  },
  scrollView: {
    flex: 1,
  },
  adminBanner: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#1A5D1A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  adminBannerContent: {
    flex: 1,
  },
  adminBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 4,
  },
  adminBannerText: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  quickLinksContainer: {
    gap: 10,
  },
  quickLinkButton: {
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  chatButton: {
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  merchantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantStoreName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  merchantOwnerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  merchantEmail: {
    fontSize: 12,
    color: '#999',
  },
  merchantDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  merchantDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  merchantDetailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  merchantActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#1A5D1A',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  rejectButton: {
    backgroundColor: '#DC143C',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  restaurantName: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
