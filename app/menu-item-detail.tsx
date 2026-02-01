import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';
import { addFavorite, isFavorite as checkIsFavorite, getCart, removeFavorite, saveCart } from '../services/database';
import { CartItem, MenuItem } from '../types';
import CartSidebar from './cart-sidebar';
import NotificationSidebar from './notification-sidebar';
import SideBar from './side-bar';

// Icons
import BellSvg from '../assets/HomePage/icons/bell.svg';
import CartIconSvg from '../assets/HomePage/icons/cart.svg';
import ProfileSvg from '../assets/HomePage/icons/profile.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

const { width, height } = Dimensions.get('window');

export default function MenuItemDetailScreen() {
  const params = useLocalSearchParams();
  const [currentTime, setCurrentTime] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [freshImageURL, setFreshImageURL] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Parse item data from params
  const item: MenuItem = {
    id: params.id as string,
    name: params.name as string,
    description: params.description as string,
    price: parseFloat(params.price as string),
    category: params.category as 'meal' | 'dessert' | 'drink' | 'vegan' | 'blindbox',
    imageURL: params.imageURL as string,
    restaurantId: params.restaurantId as string,
    restaurantName: params.restaurantName as string,
    rating: params.rating ? parseFloat(params.rating as string) : undefined,
    isAvailable: params.isAvailable === 'true',
    createdAt: new Date(),
  };

  // Get fresh download URL from Firebase Storage
  useEffect(() => {
    const getFreshImageURL = async () => {
      if (!item.imageURL) {
        setImageLoading(false);
        return;
      }

      try {
        setImageLoading(true);
        
        // Extract the storage path from the URL
        const urlObj = new URL(item.imageURL);
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
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    getFreshImageURL();
  }, [item.imageURL]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkCartStatus();
    checkFavoriteStatus();
  }, []);

  const checkCartStatus = async () => {
    const user = getCurrentUser();
    if (user) {
      const result = await getCart(user.uid);
      if (result.success && result.data) {
        const existingItem = result.data.items.find(
          (cartItem) => cartItem.menuItemId === item.id
        );
        if (existingItem) {
          setIsInCart(true);
          setCartQuantity(existingItem.quantity);
        }
      }
    }
  };

  const checkFavoriteStatus = async () => {
    const user = getCurrentUser();
    if (user) {
      const result = await checkIsFavorite(user.uid, item.id);
      if (result.success && result.isFavorite) {
        setIsFavorite(true);
      }
    }
  };

  const handleAddToCart = async () => {
    const user = getCurrentUser();
    if (!user) {
      alert('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setLoading(true);
    const result = await getCart(user.uid);
    
    if (result.success && result.data) {
      const cart = result.data;
      const existingItemIndex = cart.items.findIndex(
        (cartItem) => cartItem.menuItemId === item.id
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        cart.items[existingItemIndex].quantity += quantity;
        setCartQuantity(cart.items[existingItemIndex].quantity);
      } else {
        // New item, add to cart
        const newCartItem: CartItem = {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          imageURL: item.imageURL,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        };
        cart.items.push(newCartItem);
        setIsInCart(true);
        setCartQuantity(quantity);
      }

      // Recalculate total
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      await saveCart(user.uid, cart);
      setQuantity(1); // Reset quantity selector
    }
    
    setLoading(false);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blindbox': return '#FFD700';
      case 'meal': return '#FF6347';
      case 'vegan': return '#90EE90';
      case 'dessert': return '#FFB6C1';
      case 'drink': return '#87CEEB';
      default: return '#F5F5DC';
    }
  };

  const toggleFavorite = async () => {
    const user = getCurrentUser();
    if (!user) {
      alert('Please login to add favorites');
      router.push('/login');
      return;
    }

    if (!item.id) {
      alert('Invalid item data');
      return;
    }

    if (isFavorite) {
      // Remove from favorites
      await removeFavorite(user.uid, item.id);
      setIsFavorite(false);
    } else {
      // Add to favorites
      await addFavorite(user.uid, item);
      setIsFavorite(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.timeText}>{currentTime}</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconButton} onPress={() => setShowNotificationSidebar(true)}>
            <BellSvg width={24} height={24} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowCartSidebar(true)}>
            <CartIconSvg width={24} height={24} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowProfileSidebar(true)}>
            <ProfileSvg width={24} height={24} />
          </Pressable>
        </View>
      </View>

      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <View style={styles.locationButton}>
          <Text style={styles.locationIcon}>📍</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rating and Favorite Container */}
        <View style={styles.ratingFavoriteContainer}>
          {item.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingNumber}>{item.rating.toFixed(1)}</Text>
              <Text style={styles.ratingLabel}>⭐ Click To View</Text>
            </View>
          )}
          <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            <Text style={styles.favoriteText}>{isFavorite ? 'Favourited' : 'Favourite'}</Text>
          </Pressable>
        </View>

        {/* Item Image */}
        <View style={styles.imageContainer}>
          {imageLoading ? (
            <View style={styles.placeholderImage}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : !imageError && freshImageURL ? (
            <Image 
              source={freshImageURL}
              style={styles.itemImage}
              contentFit="cover"
              transition={300}
              onLoad={() => {
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.placeholderText}>{item.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        {/* Price and Quantity */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
          <View style={styles.quantityContainer}>
            <Pressable onPress={decrementQuantity} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>−</Text>
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable onPress={incrementQuantity} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* What's Included */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>
            {item.category === 'blindbox' ? 'What Include Blind Box' : 'Description'}
          </Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>

        {/* Notes to Seller */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Notes to seller</Text>
          <Text style={styles.notesSubtitle}>
            Add your request (at the merchant's own discretion) :
          </Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholder="Type your notes here..."
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor="#999"
          />
        </View>

        {/* Add to Cart Button */}
        <Pressable 
          onPress={handleAddToCart} 
          style={[styles.addToCartButton, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          <View style={styles.buttonContent}>
            <CartIconSvg width={20} height={20} fill="#fff" />
            <Text style={styles.addToCartText}>
              {loading ? 'Adding...' : 'Add to Cart'}
            </Text>
          </View>
        </Pressable>

        {/* Cart Status */}
        {isInCart && (
          <View style={styles.cartStatus}>
            <Text style={styles.cartStatusText}>
              ✓ In cart: {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('/home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./best-seller-page')}>
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

      {/* Sidebars */}
      <NotificationSidebar 
        visible={showNotificationSidebar} 
        onClose={() => setShowNotificationSidebar(false)} 
      />
      <CartSidebar 
        visible={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
      <SideBar 
        visible={showProfileSidebar} 
        onClose={() => setShowProfileSidebar(false)} 
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#F4FFC9',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    padding: 5,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B4513',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  locationButton: {
    backgroundColor: '#F4FFC9',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  ratingFavoriteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  ratingBadge: {
    backgroundColor: '#FF6347',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  favoriteButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  favoriteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  ratingNumber: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  ratingLabel: {
    color: '#fff',
    fontSize: 12,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
    fontWeight: '700',
    color: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityButton: {
    padding: 5,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 16,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    bottom: 3,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    minWidth: 25,
    textAlign: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  notesSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  notesInput: {
    backgroundColor: '#FFFACD',
    borderRadius: 15,
    padding: 15,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addToCartButton: {
    backgroundColor: '#2E7D32',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cartStatus: {
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: '#90EE90',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  cartStatusText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },

  bottomNav: { position: 'absolute', left: 12, right: 12, 
    bottom: 18, height: 64, backgroundColor: '#1A5D1A', 
    borderRadius: 34, flexDirection: 'row', justifyContent: 'space-around', 
    alignItems: 'center', paddingHorizontal: 10 },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
