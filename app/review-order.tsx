import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { storage } from '../config/firebase';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

import { getCurrentUser } from '../services/auth';
import { getMenuItems, getOrderById, getOrderReviews, hasUserReviewedItem, saveReview } from '../services/database';
import type { CartItem, Order, Review } from '../types';

export default function ReviewOrderScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const viewMode = params.viewMode === 'true';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [itemsToReview, setItemsToReview] = useState<CartItem[]>([]);
  const [freshImageURL, setFreshImageURL] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [itemsWithReviews, setItemsWithReviews] = useState<Array<{ item: CartItem; review: Review }>>([]);

  useEffect(() => {
    loadOrderAndCheckReviews();
  }, [orderId]);

  // Get fresh download URL whenever current item changes
  useEffect(() => {
    const getFreshImageURL = async () => {
      const currentEntry = viewMode ? itemsWithReviews[currentItemIndex]?.item : itemsToReview[currentItemIndex];
      if (!currentEntry) return;

      if (!currentEntry.imageURL) {
        setImageLoading(false);
        setImageError(true);
        return;
      }

      try {
        setImageLoading(true);
        setImageError(false);
        
        // Extract the storage path from the URL
        const urlObj = new URL(currentEntry.imageURL);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
        
        if (pathMatch) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          
          try {
            // Try to get fresh download URL from Firebase Storage
            const storageRef = ref(storage, storagePath);
            const freshURL = await getDownloadURL(storageRef);
            
            setFreshImageURL(freshURL);
            setImageError(false);
          } catch (storageError: any) {
            // Construct public URL without token (requires Storage rules to allow public read)
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
  }, [currentItemIndex, itemsToReview, itemsWithReviews, viewMode]);

  const loadOrderAndCheckReviews = async () => {
    try {
      setLoading(true);

      // If in view mode, load existing reviews
      if (viewMode) {
        await loadExistingReviews();
        return;
      }
      const user = getCurrentUser();
      
      if (!user) {
        Alert.alert('Error', 'Please log in to leave a review');
        router.back();
        return;
      }

      const result = await getOrderById(orderId);
      
      if (result.success && result.data) {
        setOrder(result.data);
        
        // Check which items haven't been reviewed yet
        const unreviewedItems: CartItem[] = [];
        
        console.log('Order items:', result.data.items);
        
        // Try to fetch menu items to get IDs for items missing menuItemId
        let menuItemsMap: any = {};
        let menuItemsImageMap: any = {};
        try {
          const menuResult = await getMenuItems();
          if (menuResult.success && menuResult.data) {
            menuResult.data.forEach(item => {
              const lowerName = item.name.toLowerCase();
              menuItemsMap[lowerName] = item.id;
              menuItemsImageMap[lowerName] = item.imageURL;
              // Also map by ID
              menuItemsImageMap[item.id] = item.imageURL;
            });
          }
        } catch (error) {
          console.warn('Could not load menu items for ID lookup:', error);
        }
        
        for (const item of result.data.items) {
          // Try to find menuItemId if missing
          let itemId = item.menuItemId;
          
          if (!itemId && menuItemsMap[item.name.toLowerCase()]) {
            // Found matching item in menu by name
            itemId = menuItemsMap[item.name.toLowerCase()];
            console.log(`Found menuItemId for ${item.name}: ${itemId}`);
            // Update the item with the found ID
            item.menuItemId = itemId;
          }
          
          // If still no ID, create fallback
          if (!itemId) {
            itemId = `temp-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
            console.warn(`Using fallback ID for ${item.name}: ${itemId}`);
          }
          
          // Try to get imageURL from menu items if missing
          if (!item.imageURL || item.imageURL.trim() === '') {
            const lowerName = item.name.toLowerCase();
            if (menuItemsImageMap[itemId]) {
              item.imageURL = menuItemsImageMap[itemId];
              console.log(`Found imageURL for ${item.name} by ID`);
            } else if (menuItemsImageMap[lowerName]) {
              item.imageURL = menuItemsImageMap[lowerName];
              console.log(`Found imageURL for ${item.name} by name`);
            }
          }
          
          console.log('Checking item:', { name: item.name, menuItemId: itemId, imageURL: item.imageURL });
          
          try {
            // Always check with the ID we'll use for saving
            const reviewCheck = await hasUserReviewedItem(user.uid, orderId, itemId);
            console.log('Review check result:', { itemId, hasReviewed: reviewCheck.hasReviewed });
            
            if (reviewCheck.success && !reviewCheck.hasReviewed) {
              unreviewedItems.push(item);
            } else if (!reviewCheck.success) {
              // If check fails due to permissions, include item
              console.warn('Review check failed, including item');
              unreviewedItems.push(item);
            }
          } catch (error) {
            // If there's an error, include the item
            console.warn('Could not check review status, including item:', error);
            unreviewedItems.push(item);
          }
        }
        
        if (unreviewedItems.length === 0) {
          Alert.alert(
            'No Items',
            'This order has no items to review',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else {
          setItemsToReview(unreviewedItems);
        }
      } else {
        Alert.alert('Error', 'Could not load order details');
        router.back();
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Something went wrong');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadExistingReviews = async () => {
    try {
      const user = getCurrentUser();

      if (!user) {
        Alert.alert('Error', 'Please log in to view your review');
        router.back();
        return;
      }

      const orderResult = await getOrderById(orderId);
      if (!orderResult.success || !orderResult.data) {
        Alert.alert('Error', 'Could not load order details');
        router.back();
        return;
      }

      setOrder(orderResult.data);

      const reviewResult = await getOrderReviews(user.uid, orderId);
      if (!reviewResult.success || !reviewResult.data) {
        Alert.alert('Error', 'Could not load review details');
        router.back();
        return;
      }

      const reviewByItemId = new Map<string, Review>();
      const reviewByName = new Map<string, Review>();

      reviewResult.data.forEach((review) => {
        if (review.menuItemId) {
          reviewByItemId.set(review.menuItemId, review);
        }
        if (review.menuItemName) {
          reviewByName.set(review.menuItemName.toLowerCase(), review);
        }
      });

      const itemsWithReviewData: Array<{ item: CartItem; review: Review }> = [];

      orderResult.data.items.forEach((item) => {
        const fallbackId = `temp-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
        const itemId = item.menuItemId || fallbackId;
        const review = reviewByItemId.get(itemId) || reviewByName.get(item.name.toLowerCase());

        if (review) {
          itemsWithReviewData.push({ item, review });
        }
      });

      if (itemsWithReviewData.length === 0) {
        Alert.alert('No Reviews', 'No reviews were found for this order.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }

      setItemsWithReviews(itemsWithReviewData);
      setCurrentItemIndex(0);
    } catch (error) {
      console.error('Error loading existing reviews:', error);
      Alert.alert('Error', 'Something went wrong');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    const user = getCurrentUser();
    
    if (!user) {
      Alert.alert('Error', 'Please log in to leave a review');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert('Comment Required', 'Please leave a comment about your experience');
      return;
    }

    try {
      setSubmitting(true);
      const currentItem = itemsToReview[currentItemIndex];
      
      // Use menuItemId or create fallback ID (MUST be consistent with checking)
      const itemId = currentItem.menuItemId || `temp-${currentItem.name.replace(/\s+/g, '-').toLowerCase()}`;

      console.log('Submitting review:', { 
        userId: user.uid, 
        orderId, 
        itemId, 
        itemName: currentItem.name,
        rating,
        hasMenuItemId: !!currentItem.menuItemId
      });

      const result = await saveReview({
        userId: user.uid,
        orderId: orderId,
        menuItemId: itemId,
        menuItemName: currentItem.name,
        rating: rating,
        comment: comment.trim(),
      });

      console.log('Save review result:', result);

      if (result.success) {
        // Remove the reviewed item from the list
        const newItemsToReview = itemsToReview.filter((_, index) => index !== currentItemIndex);
        
        // Check if there are more items to review
        if (newItemsToReview.length > 0) {
          setItemsToReview(newItemsToReview);
          // Keep the same index since we removed the current item
          // If we were at the last item, go back to previous
          if (currentItemIndex >= newItemsToReview.length) {
            setCurrentItemIndex(newItemsToReview.length - 1);
          }
          setRating(0);
          setComment('');
          Alert.alert('Success', 'Review submitted! Please review the next item.');
        } else {
          // All items reviewed
          Alert.alert(
            'Thank You!',
            'All reviews submitted successfully!',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } else {
        Alert.alert('Error', result.error || 'Could not submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, readOnly: boolean) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => {
              if (!readOnly) setRating(star);
            }}
            disabled={readOnly}
          >
            <Text style={styles.star}>
              {star <= value ? '⭐' : '☆'}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A5D1A" />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </View>
    );
  }

  const displayItems = viewMode ? itemsWithReviews.map((entry) => entry.item) : itemsToReview;
  const currentReview = viewMode ? itemsWithReviews[currentItemIndex]?.review : undefined;

  if (!order || displayItems.length === 0) {
    return null;
  }

  const currentItem = displayItems[currentItemIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{viewMode ? 'Your Review' : 'Leave a Review'}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress indicator */}
        {displayItems.length > 1 && (
          <Text style={styles.progressText}>
            Item {currentItemIndex + 1} of {displayItems.length}
          </Text>
        )}

        {/* Item Image */}
        <View style={styles.imageContainer}>
          {imageLoading ? (
            <View style={[styles.itemImage, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>Loading...</Text>
            </View>
          ) : !imageError && freshImageURL ? (
            <Image
              source={freshImageURL}
              style={styles.itemImage}
              contentFit="cover"
              transition={200}
              onLoad={() => {
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <View style={[styles.itemImage, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>🍽️</Text>
            </View>
          )}
        </View>

        {/* Item Name */}
        <Text style={styles.itemName}>{currentItem.name}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          We'd love to know what you{'\n'}think of your dish
        </Text>

        {/* Star Rating */}
        {renderStars(viewMode ? (currentReview?.rating || 0) : rating, viewMode)}

        {/* Comment Label */}
        <Text style={styles.commentLabel}>
          {viewMode ? 'Your comment' : 'Leave us your comment!'}
        </Text>

        {/* Comment Input */}
        <TextInput
          style={styles.commentInput}
          placeholder="Write Review..."
          placeholderTextColor="#C4B5A0"
          multiline
          numberOfLines={4}
          value={viewMode ? (currentReview?.comment || '') : comment}
          onChangeText={setComment}
          editable={!viewMode}
          textAlignVertical="top"
        />

        {viewMode && displayItems.length > 1 && (
          <View style={styles.reviewNavRow}>
            <Pressable
              style={[
                styles.reviewNavButton,
                currentItemIndex === 0 && styles.reviewNavButtonDisabled,
              ]}
              onPress={() => setCurrentItemIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentItemIndex === 0}
            >
              <Text style={styles.reviewNavButtonText}>Previous</Text>
            </Pressable>
            <Pressable
              style={[
                styles.reviewNavButton,
                currentItemIndex === displayItems.length - 1 && styles.reviewNavButtonDisabled,
              ]}
              onPress={() => setCurrentItemIndex((prev) => Math.min(displayItems.length - 1, prev + 1))}
              disabled={currentItemIndex === displayItems.length - 1}
            >
              <Text style={styles.reviewNavButtonText}>Next</Text>
            </Pressable>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>{viewMode ? 'Close' : 'Cancel'}</Text>
          </Pressable>
          {!viewMode && (
            <Pressable
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <Pressable style={styles.navIcon} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.push('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.push('./favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.push('./recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.push('./support-page')}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FFCF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F3FFCF',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A5D1A',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A5D1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImage: {
    width: 160,
    height: 160,
    borderRadius: 20,
  },
  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  star: {
    fontSize: 36,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3E5D0',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  reviewNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  reviewNavButton: {
    flex: 1,
    backgroundColor: '#F3FFCF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  reviewNavButtonDisabled: {
    opacity: 0.5,
  },
  reviewNavButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A5D1A',
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
    elevation: 5,
  },
  navIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
