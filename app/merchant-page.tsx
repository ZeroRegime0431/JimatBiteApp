import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { auth, db } from '../config/firebase';
import { getMerchantProfile } from '../services/database';
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

// Admin merchant ID - can see all orders
const ADMIN_MERCHANT_ID = 'a5L1LZoUCEZxcCeeWxFW7vIow323';

const { width } = Dimensions.get('window');

export default function MerchantPage() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [merchantProfile, setMerchantProfile] = useState<MerchantAccount | null>(null);
  const [verificationBannerDismissed, setVerificationBannerDismissed] = useState(false);
  
  // Dropdown states for order categories
  const [newOrdersExpanded, setNewOrdersExpanded] = useState(true);
  const [completedOrdersExpanded, setCompletedOrdersExpanded] = useState(true);
  const [cancelledOrdersExpanded, setCancelledOrdersExpanded] = useState(true);
  
  // Orders state
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [userNames, setUserNames] = useState<{ [userId: string]: string }>({});
  
  // Sales stats (calculated from real data)
  const [todaySales, setTodaySales] = useState(0);
  const [weeklySales, setWeeklySales] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [salesTrend, setSalesTrend] = useState<{ label: string; value: number }[]>([]);
  const [monthlySalesTrend, setMonthlySalesTrend] = useState<{ label: string; value: number }[]>([]);
  const maxSalesValue = salesTrend.length > 0 ? Math.max(1, Math.max(...salesTrend.map(item => item.value))) : 1;
  const maxMonthlySalesValue = monthlySalesTrend.length > 0 ? Math.max(1, Math.max(...monthlySalesTrend.map(item => item.value))) : 1;

  // Handle hardware back button - prevent going back to auth screens
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Return true to prevent default back behavior (exit app instead)
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    loadMerchantProfile();
    loadBannerDismissalState();
  }, []);

  // Load orders after merchant profile is loaded
  useEffect(() => {
    if (merchantProfile) {
      loadOrders();
    }
  }, [merchantProfile]);

  const loadBannerDismissalState = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const dismissed = await AsyncStorage.getItem(`verificationBanner_dismissed_${currentUser.uid}`);
        setVerificationBannerDismissed(dismissed === 'true');
      }
    } catch (error) {
      console.error('Error loading banner dismissal state:', error);
    }
  };

  const dismissVerificationBanner = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await AsyncStorage.setItem(`verificationBanner_dismissed_${currentUser.uid}`, 'true');
        setVerificationBannerDismissed(true);
      }
    } catch (error) {
      console.error('Error dismissing banner:', error);
    }
  };

  const loadMerchantProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const result = await getMerchantProfile(currentUser.uid);
        if (result.success && result.data) {
          setMerchantProfile(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading merchant profile:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      // Check if user is admin
      const isAdmin = currentUser.uid === ADMIN_MERCHANT_ID;
      
      const ordersRef = collection(db, 'orders');
      
      // Fetch all orders
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
        
        // Filter orders by restaurant name if not admin
        if (!isAdmin && merchantProfile) {
          // Check if this order contains items from this merchant's restaurant
          const hasItemsFromThisRestaurant = order.items.some(
            item => item.restaurantName === merchantProfile.storeName
          );
          
          if (!hasItemsFromThisRestaurant) {
            return; // Skip this order - no items from this restaurant
          }
          
          // Check if this merchant has already fulfilled their items
          const merchantItems = order.items.filter(
            item => item.restaurantName === merchantProfile.storeName
          );
          const allMerchantItemsFulfilled = merchantItems.every(item => item.fulfilled === true);
          
          // If all this merchant's items are fulfilled, only show in completed
          if (allMerchantItemsFulfilled && order.status !== 'cancelled') {
            completed.push(order);
            userIds.add(order.userId);
            return;
          }
        }
        
        userIds.add(order.userId);
        
        // Categorize orders by status
        if (order.status === 'pending' || order.status === 'confirmed' || 
            order.status === 'preparing' || order.status === 'partially-fulfilled' || 
            order.status === 'ready-for-pickup' || order.status === 'on-the-way') {
          pending.push(order);
        } else if (order.status === 'delivered') {
          completed.push(order);
        } else if (order.status === 'cancelled') {
          cancelled.push(order);
        }
      });
      
      // Fetch user names for all unique user IDs
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
          console.error(`Error fetching user ${userId}:`, error);
          userNameMap[userId] = 'Unknown User';
        }
      }
      
      setUserNames(userNameMap);
      
      // Sort orders by date (newest first)
      pending.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      completed.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      cancelled.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      
      setNewOrders(pending);
      setCompletedOrders(completed);
      setCancelledOrders(cancelled);
      setTotalOrders(pending.length + completed.length + cancelled.length);
      
      // Calculate sales statistics from completed orders
      calculateSalesStats([...pending, ...completed, ...cancelled], isAdmin);
      
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSalesStats = (allOrders: Order[], isAdmin: boolean) => {
    // Only count delivered orders for sales calculations
    const deliveredOrders = allOrders.filter(order => order.status === 'delivered');
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;
    
    // Calculate sales for different periods
    deliveredOrders.forEach(order => {
      const orderTime = order.orderDate.getTime();
      
      if (orderTime >= todayStart.getTime()) {
        todayRevenue += order.grandTotal;
      }
      if (orderTime >= weekStart.getTime()) {
        weekRevenue += order.grandTotal;
      }
      if (orderTime >= monthStart.getTime()) {
        monthRevenue += order.grandTotal;
      }
    });
    
    setTodaySales(todayRevenue);
    setWeeklySales(weekRevenue);
    setMonthlySales(monthRevenue);
    
    // Generate 7-day sales trend
    const trend: { label: string; value: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      let dayRevenue = 0;
      deliveredOrders.forEach(order => {
        const orderTime = order.orderDate.getTime();
        if (orderTime >= dayStart.getTime() && orderTime < dayEnd.getTime()) {
          dayRevenue += order.grandTotal;
        }
      });
      
      trend.push({
        label: dayNames[dayDate.getDay()],
        value: dayRevenue
      });
    }
    
    setSalesTrend(trend);
    
    // Generate 30-day sales trend (grouped by weeks)
    const monthlyTrend: { label: string; value: number }[] = [];
    const weeksCount = 4;
    
    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      let weekRevenue = 0;
      deliveredOrders.forEach(order => {
        const orderTime = order.orderDate.getTime();
        if (orderTime >= weekStart.getTime() && orderTime < weekEnd.getTime()) {
          weekRevenue += order.grandTotal;
        }
      });
      
      // Format as "Week 1", "Week 2", "Week 3", "Week 4"
      monthlyTrend.push({
        label: `W${weeksCount - i}`,
        value: weekRevenue
      });
    }
    
    setMonthlySalesTrend(monthlyTrend);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
          <ThemedText style={styles.orderTotal}>RM{order.grandTotal.toFixed(2)}</ThemedText>
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
        <Pressable onPress={() => router.replace('/home-page')} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Merchant Dashboard</ThemedText>
      </View>

      {/* Pending Approval Banner */}
      {merchantProfile && merchantProfile.status === 'pending' && (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingBannerIcon}>⏳</Text>
          <View style={styles.pendingBannerContent}>
            <Text style={styles.pendingBannerTitle}>Account Pending Approval</Text>
            <Text style={styles.pendingBannerText}>
              Your merchant account is awaiting verification. You'll be notified once approved.
            </Text>
          </View>
        </View>
      )}

      {/* Approved Banner */}
      {merchantProfile && merchantProfile.status === 'approved' && !verificationBannerDismissed && (
        <View style={styles.approvedBanner}>
          <Text style={styles.approvedBannerIcon}>✅</Text>
          <View style={styles.approvedBannerContent}>
            <Text style={styles.approvedBannerTitle}>Account Verified!</Text>
            <Text style={styles.approvedBannerText}>
              Your merchant account is active and verified.
            </Text>
          </View>
          <Pressable onPress={dismissVerificationBanner} style={styles.closeBannerButton}>
            <Text style={styles.closeBannerText}>✕</Text>
          </Pressable>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sales Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Today's Sales</ThemedText>
            <ThemedText style={styles.statValue}>RM{todaySales.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Weekly Sales</ThemedText>
            <ThemedText style={styles.statValue}>RM{weeklySales.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Monthly Sales</ThemedText>
            <ThemedText style={styles.statValue}>RM{monthlySales.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Total Orders</ThemedText>
            <ThemedText style={styles.statValue}>{totalOrders}</ThemedText>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <ThemedText style={styles.chartTitle}>Weekly Sales Trend</ThemedText>
            <ThemedText style={styles.chartSubtitle}>Last 7 days</ThemedText>
          </View>
          <View style={styles.chartArea}>
            {salesTrend.map((item) => {
              const barHeight = Math.max(8, (item.value / maxSalesValue) * 120);
              return (
                <View key={item.label} style={styles.chartItem}>
                  {item.value > 0 && (
                    <ThemedText style={styles.chartValue}>
                      RM{item.value.toFixed(0)}
                    </ThemedText>
                  )}
                  <View style={styles.chartBarWrapper}>
                    <View style={[styles.chartBar, { height: barHeight }]} />
                  </View>
                  <ThemedText style={styles.chartLabel}>{item.label}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <ThemedText style={styles.chartTitle}>Monthly Sales Trend</ThemedText>
            <ThemedText style={styles.chartSubtitle}>Last 4 weeks</ThemedText>
          </View>
          <View style={styles.chartArea}>
            {monthlySalesTrend.map((item) => {
              const barHeight = Math.max(8, (item.value / maxMonthlySalesValue) * 120);
              return (
                <View key={item.label} style={styles.chartItem}>
                  {item.value > 0 && (
                    <ThemedText style={styles.chartValue}>
                      RM{item.value.toFixed(0)}
                    </ThemedText>
                  )}
                  <View style={styles.chartBarWrapper}>
                    <View style={[styles.chartBar, { height: barHeight }]} />
                  </View>
                  <ThemedText style={styles.chartLabel}>{item.label}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.addItemSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Add New Menu Item</ThemedText>
          </View>
          <Pressable
            style={styles.addItemButton}
            onPress={() => router.push('./add-menu-item')}
          >
            <ThemedText style={styles.addItemButtonText}>Add Item</ThemedText>
          </Pressable>
          <Pressable
            style={styles.manageItemsButton}
            onPress={() => router.push('./merchant-page-menuitem')}
          >
            <ThemedText style={styles.manageItemsButtonText}>View Menu Items</ThemedText>
          </Pressable>
        </View>

        <View style={styles.addItemSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Customer Chatbox</ThemedText>
          </View>
          <Pressable
            style={styles.addItemButton}
            onPress={() => router.push('./chat-list')}
          >
            <ThemedText style={styles.addItemButtonText}>Messages</ThemedText>
          </Pressable>
        </View>

        <View style={styles.addItemSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Dynamic Pricing Configuration</ThemedText>
          </View>
          <Pressable
            style={styles.discountConfigButton}
            onPress={() => router.push('./discount-config')}
          >
            <ThemedText style={styles.discountConfigButtonText}>⚙️ Configure Discounts</ThemedText>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A5D1A" />
            <ThemedText style={styles.loadingText}>Loading orders...</ThemedText>
          </View>
        ) : (
          <>
            {/* New Orders Section */}
            <View style={styles.section}>
              <Pressable 
                style={styles.sectionHeader}
                onPress={() => setNewOrdersExpanded(!newOrdersExpanded)}
              >
                <ThemedText style={styles.sectionTitle}>New Orders</ThemedText>
                <View style={[styles.badge, { backgroundColor: '#FFA500' }]}>
                  <Text style={styles.badgeText}>{newOrders.length}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={[styles.arrowIcon, { transform: [{ rotate: newOrdersExpanded ? '90deg' : '0deg' }] }]}>
                  <ArrowRightSvg width={20} height={20} />
                </View>
              </Pressable>
              {newOrdersExpanded && (
                newOrders.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>No new orders</ThemedText>
                  </View>
                ) : (
                  newOrders.map(order => renderOrderCard(order, '#FFA500'))
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
    alignItems: 'center',
    right: -36,
    
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    borderLeftWidth: 4,
    borderLeftColor: '#1A5D1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#1A5D1A',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#777',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: 20,
  },
  chartItem: {
    alignItems: 'center',
    width: 36,
  },
  chartBarWrapper: {
    width: 16,
    height: 120,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 16,
    borderRadius: 8,
    backgroundColor: '#1A5D1A',
  },
  chartValue: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1A5D1A',
    marginBottom: 2,
    textAlign: 'center',
  },
  chartLabel: {
    marginTop: 6,
    fontSize: 10,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addItemSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addItemButton: {
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  manageItemsButton: {
    marginTop: 10,
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A5D1A',
  },
  manageItemsButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  discountConfigButton: {
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  discountConfigButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  pendingBanner: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
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
  pendingBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  pendingBannerContent: {
    flex: 1,
  },
  pendingBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 4,
  },
  pendingBannerText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  approvedBanner: {
    backgroundColor: '#D4EDDA',
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
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
  approvedBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  approvedBannerContent: {
    flex: 1,
  },
  approvedBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#155724',
    marginBottom: 4,
  },
  approvedBannerText: {
    fontSize: 12,
    color: '#155724',
    lineHeight: 16,
  },
  closeBannerButton: {
    padding: 8,
    marginLeft: 8,
  },
  closeBannerText: {
    fontSize: 20,
    color: '#155724',
    fontWeight: '700',
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
