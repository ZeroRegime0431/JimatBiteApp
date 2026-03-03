import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { db, storage } from '../config/firebase';
import { getMenuItem } from '../services/database';
import type { MenuItem, Order, Review } from '../types';

export default function MerchantMenuItemDetail() {
  const params = useLocalSearchParams();
  const itemId = params.itemId as string;

  const [loading, setLoading] = useState(true);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [soldCount, setSoldCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [freshImageURL, setFreshImageURL] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadItemDetails();
  }, [itemId]);

  useEffect(() => {
    const getFreshImageURL = async () => {
      if (!menuItem?.imageURL) {
        setImageLoading(false);
        setImageError(true);
        return;
      }

      try {
        setImageLoading(true);
        setImageError(false);

        const urlObj = new URL(menuItem.imageURL);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);

        if (pathMatch) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          try {
            const storageRef = ref(storage, storagePath);
            const freshURL = await getDownloadURL(storageRef);
            setFreshImageURL(freshURL);
            setImageError(false);
          } catch (storageError: any) {
            const publicURL = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
            setFreshImageURL(publicURL);
            setImageError(false);
          }
        } else {
          setImageError(true);
        }
      } catch (error: any) {
        console.warn('Error getting fresh image URL:', error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    getFreshImageURL();
  }, [menuItem?.imageURL]);

  const loadItemDetails = async () => {
    try {
      setLoading(true);
      if (!itemId) {
        Alert.alert('Error', 'Missing menu item ID');
        router.back();
        return;
      }

      const itemResult = await getMenuItem(itemId);
      if (!itemResult.success || !itemResult.data) {
        Alert.alert('Error', 'Menu item not found');
        router.back();
        return;
      }

      setMenuItem(itemResult.data);

      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));

      const orders: Order[] = [];
      const allReviews: Review[] = [];

      ordersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        orders.push({
          ...data,
          orderDate: data.orderDate?.toDate?.(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate?.(),
          actualDeliveryTime: data.actualDeliveryTime?.toDate?.(),
        } as Order);
      });

      reviewsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        allReviews.push({
          ...data,
          createdAt: data.createdAt?.toDate?.(),
        } as Review);
      });

      const itemNameKey = itemResult.data.name.toLowerCase();
      let sold = 0;
      let earned = 0;

      orders.forEach((order) => {
        if (order.status !== 'delivered') return;
        order.items.forEach((item) => {
          const matchesId = item.menuItemId === itemId;
          const matchesName = !item.menuItemId && item.name.toLowerCase() === itemNameKey;
          if (matchesId || matchesName) {
            const qty = item.quantity || 0;
            sold += qty;
            earned += (item.price || 0) * qty;
          }
        });
      });

      const reviewMap = new Map<string, Review>();
      const matchedReviews: Review[] = [];

      allReviews.forEach((review) => {
        const matchesId = review.menuItemId === itemId;
        const matchesName = review.menuItemName?.toLowerCase() === itemNameKey;
        if (matchesId || matchesName) {
          if (!reviewMap.has(review.id)) {
            reviewMap.set(review.id, review);
            matchedReviews.push(review);
          }
        }
      });

      const ratingSum = matchedReviews.reduce((sum, review) => sum + review.rating, 0);
      const ratingAvg = matchedReviews.length ? Number((ratingSum / matchedReviews.length).toFixed(1)) : 0;

      setSoldCount(sold);
      setRevenue(earned);
      setReviewCount(matchedReviews.length);
      setAvgRating(ratingAvg);
      setReviews(matchedReviews);
    } catch (error) {
      console.error('Error loading menu item details:', error);
      Alert.alert('Error', 'Something went wrong');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RM${value.toFixed(2)}`;

  const renderRating = (value: number) => {
    const fullStars = Math.round(value);
    return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A5D1A" />
          <Text style={styles.loadingText}>Loading item...</Text>
        </View>
      </View>
    );
  }

  if (!menuItem) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={22} height={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Item Insights</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.itemCard}>
          <View style={styles.imageWrap}>
            {imageLoading ? (
              <View style={[styles.imagePlaceholder, styles.itemImage]}>
                <Text style={styles.placeholderText}>Loading...</Text>
              </View>
            ) : !imageError && freshImageURL ? (
              <Image
                source={freshImageURL}
                style={styles.itemImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.imagePlaceholder, styles.itemImage]}>
                <Text style={styles.placeholderText}>🍽️</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemName}>{menuItem.name}</Text>
          <Text style={styles.itemRestaurant}>{menuItem.restaurantName}</Text>
          <View style={styles.priceRow}>
            {menuItem.dynamicPricingEnabled && menuItem.originalPrice && menuItem.currentPrice && menuItem.currentPrice < menuItem.originalPrice ? (
              <>
                <Text style={styles.originalPriceText}>{formatCurrency(menuItem.originalPrice)}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(menuItem.currentPrice)}</Text>
                <View style={[styles.badge, styles.discountBadge]}>
                  <Text style={styles.badgeText}>
                    {Math.round(((menuItem.originalPrice - menuItem.currentPrice) / menuItem.originalPrice) * 100)}% OFF
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.itemPrice}>{formatCurrency(menuItem.price)}</Text>
            )}
          </View>

          {/* Dynamic Pricing Info */}
          {(menuItem.dynamicPricingEnabled || menuItem.preparedTime || menuItem.expiryTime) && (
            <View style={styles.dynamicPricingSection}>
              <View style={styles.dynamicPricingHeader}>
                <Text style={styles.sectionSubtitle}>⏰ Freshness Information</Text>
                {menuItem.freshnessStatus === 'fresh' && (
                  <View style={[styles.badge, styles.freshBadge]}>
                    <Text style={styles.badgeText}>FRESH</Text>
                  </View>
                )}
                {menuItem.freshnessStatus === 'discounted' && (
                  <View style={[styles.badge, styles.discountedBadge]}>
                    <Text style={styles.badgeText}>DISCOUNTED</Text>
                  </View>
                )}
                {menuItem.freshnessStatus === 'expiring-soon' && (
                  <View style={[styles.badge, styles.expiringSoonBadge]}>
                    <Text style={styles.badgeText}>LAST CALL</Text>
                  </View>
                )}
              </View>
              <View style={styles.timeInfoGrid}>
                {menuItem.dynamicPricingEnabled && (
                  <View style={styles.timeInfoRow}>
                    <Text style={styles.timeInfoLabel}>⚡ Status:</Text>
                    <Text style={[styles.timeInfoValue, { color: '#2E7D32', fontWeight: '700' }]}>Dynamic Pricing Active</Text>
                  </View>
                )}
                {menuItem.preparedTime && (
                  <View style={styles.timeInfoRow}>
                    <Text style={styles.timeInfoLabel}>🍳 Prepared:</Text>
                    <Text style={styles.timeInfoValue}>
                      {new Date(menuItem.preparedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                      {new Date(menuItem.preparedTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                )}
                {menuItem.expiryTime && (
                  <View style={styles.timeInfoRow}>
                    <Text style={styles.timeInfoLabel}>⏱️ Expires:</Text>
                    <Text style={styles.timeInfoValue}>
                      {new Date(menuItem.expiryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                      {new Date(menuItem.expiryTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                )}
                {menuItem.freshnessHours && (
                  <View style={styles.timeInfoRow}>
                    <Text style={styles.timeInfoLabel}>📅 Shelf Life:</Text>
                    <Text style={styles.timeInfoValue}>{menuItem.freshnessHours} hours</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{soldCount}</Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(revenue)}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgRating || 'N/A'}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>No reviews yet</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewRating}>{renderRating(review.rating)}</Text>
                  <Text style={styles.reviewScore}>{review.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#F3FFCF',
  },
  backButton: {
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
  },
  imageWrap: {
    marginBottom: 12,
  },
  itemImage: {
    width: 140,
    height: 140,
    borderRadius: 18,
  },
  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  itemRestaurant: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A5D1A',
  },
  originalPriceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  freshBadge: {
    backgroundColor: '#4CAF50',
  },
  discountBadge: {
    backgroundColor: '#FF5722',
  },
  discountedBadge: {
    backgroundColor: '#FF9800',
  },
  expiringSoonBadge: {
    backgroundColor: '#F44336',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  dynamicPricingSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  dynamicPricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F57C00',
  },
  timeInfoGrid: {
    gap: 6,
  },
  timeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    minWidth: 85,
  },
  timeInfoValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  reviewSection: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewRating: {
    fontSize: 14,
    color: '#F59E0B',
  },
  reviewScore: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewComment: {
    marginTop: 6,
    fontSize: 13,
    color: '#374151',
  },
});
