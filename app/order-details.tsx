import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';
import { getUserOrders } from '../services/database';
import type { Order } from '../types';

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageURLs, setImageURLs] = useState<{[key: string]: string}>({});
  const [qrRefreshToken, setQrRefreshToken] = useState(Date.now());

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  // Auto-refresh QR code every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setQrRefreshToken(Date.now());
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefreshQR = () => {
    setQrRefreshToken(Date.now());
  };

  const getFreshImageURL = async (imageURL: string): Promise<string> => {
    if (!imageURL || !imageURL.startsWith('http')) return '';
    
    try {
      const urlObj = new URL(imageURL);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
      
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(storage, storagePath);
        const freshURL = await getDownloadURL(storageRef);
        return freshURL;
      }
    } catch (error) {
      try {
        const urlObj = new URL(imageURL);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
        if (pathMatch) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          return `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
        }
      } catch {}
    }
    return imageURL;
  };

  const loadOrderDetails = async () => {
    setLoading(true);
    const user = getCurrentUser();
    if (user) {
      const result = await getUserOrders(user.uid);
      if (result.success && result.data) {
        const foundOrder = result.data.find(o => o.id === orderId);
        setOrder(foundOrder || null);
        
        // Load fresh image URLs for items
        if (foundOrder) {
          const urls: {[key: string]: string} = {};
          for (const item of foundOrder.items) {
            if (item.imageURL) {
              urls[item.menuItemId] = await getFreshImageURL(item.imageURL);
            }
          }
          setImageURLs(urls);
        }
      }
    }
    setLoading(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'preparing': return '#2196F3';
      case 'on-the-way': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: Order['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const getCategoryColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vegan')) return '#90EE90';
    if (lowerName.includes('shake') || lowerName.includes('drink') || lowerName.includes('juice') || lowerName.includes('coffee') || lowerName.includes('tea')) return '#87CEEB';
    if (lowerName.includes('dessert') || lowerName.includes('cake') || lowerName.includes('brownie') || lowerName.includes('cookie')) return '#FFB6C1';
    if (lowerName.includes('blind') || lowerName.includes('box')) return '#FFD700';
    return '#FF6347';
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Group items by restaurant
  const groupItemsByRestaurant = () => {
    if (!order) return {};
    const grouped: { [key: string]: typeof order.items } = {};
    order.items.forEach(item => {
      if (!grouped[item.restaurantName]) {
        grouped[item.restaurantName] = [];
      }
      grouped[item.restaurantName].push(item);
    });
    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <BackArrowLeftSvg width={28} height={28} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A5D1A" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <BackArrowLeftSvg width={28} height={28} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={28} height={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <Text style={styles.orderIdText}>Order #{order.id.slice(0, 8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
        </View>

        {/* Cancelled Order Banner */}
        {order.status === 'cancelled' && (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledBannerText}>⚠️ This order has been cancelled</Text>
          </View>
        )}

        {/* Restaurants and Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items by Restaurant</Text>
          {Object.entries(groupItemsByRestaurant()).map(([restaurantName, items]) => (
            <View key={restaurantName} style={styles.restaurantSection}>
              {/* Restaurant Header */}
              <View style={styles.restaurantCard}>
                <View style={styles.restaurantIcon}>
                  <Text style={styles.restaurantIconText}>{restaurantName.charAt(0)}</Text>
                </View>
                <Text style={styles.restaurantName}>{restaurantName}</Text>
              </View>
              
              {/* Items from this restaurant */}
              {items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  {imageURLs[item.menuItemId] ? (
                    <Image
                      source={{ uri: imageURLs[item.menuItemId] }}
                      style={styles.itemImage}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={[styles.itemImage, { backgroundColor: getCategoryColor(item.name) }]}>
                      <Text style={styles.itemImageText}>{getInitial(item.name)}</Text>
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemRestaurant}>{item.restaurantName}</Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>{order.deliveryAddress.label}</Text>
            <Text style={styles.addressText}>{order.deliveryAddress.street}</Text>
            <Text style={styles.addressText}>
              {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
            </Text>
            <Text style={styles.addressText}>{order.deliveryAddress.country}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentText}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${order.totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax & Fees</Text>
              <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${order.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Order Date */}
        <View style={styles.section}>
          <Text style={styles.dateText}>
            Ordered on {order.orderDate.toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })} at {order.orderDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {/* QR Code for Order Confirmation */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Order Confirmation QR Code</Text>
          <Text style={styles.qrSubtitle}>Scan to confirm delivery receipt</Text>
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={`Order ${order.id} has been received by the customer. Thank you for your service and please come again! We appreciate your business with JimatBite. Confirmation Time: ${new Date(qrRefreshToken).toLocaleString()}`}
              size={200}
              color="#1A5D1A"
              backgroundColor="white"
            />
          </View>
          <Pressable style={styles.refreshButton} onPress={handleRefreshQR}>
            <Text style={styles.refreshButtonText}>🔄 Refresh QR Code</Text>
          </Pressable>
          <Text style={styles.qrNote}>QR code refreshes every 2 minutes • Show this to the delivery person</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F3FFCF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A5D1A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  cancelledBanner: {
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  cancelledBannerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 8,
  },
  restaurantSection: {
    marginBottom: 16,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    marginBottom: 8,
  },
  restaurantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A5D1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemRestaurant: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  qrSection: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 2,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    marginBottom: 16,
  },
  qrNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: '#1A5D1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
