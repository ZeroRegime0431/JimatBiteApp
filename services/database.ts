// Firestore database operations
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Cart,
  MenuItem,
  Order,
  PaymentMethod,
  UserProfile
} from '../types';

// ============= USER PROFILE =============

export const createUserProfile = async (
  uid: string, 
  data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...data,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid: string): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return { 
        success: true, 
        data: {
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : data.updatedAt),
        } as UserProfile 
      };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (
  uid: string, 
  data: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// ============= CART =============

export const saveCart = async (
  userId: string, 
  cart: Omit<Cart, 'userId' | 'updatedAt'>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const cartRef = doc(db, 'carts', userId);
    
    // Filter out undefined values from cart items
    const cleanedItems = cart.items.map(item => {
      const cleanedItem: any = {
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageURL: item.imageURL || '',
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
      };
      
      // Remove any undefined values
      Object.keys(cleanedItem).forEach(key => {
        if (cleanedItem[key] === undefined) {
          delete cleanedItem[key];
        }
      });
      
      return cleanedItem;
    });
    
    await setDoc(cartRef, {
      userId,
      items: cleanedItems,
      totalAmount: cart.totalAmount || 0,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error saving cart:', error);
    return { success: false, error: error.message };
  }
};

export const getCart = async (userId: string): Promise<{ success: boolean; data?: Cart; error?: string }> => {
  try {
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    
    if (cartSnap.exists()) {
      const data = cartSnap.data();
      return { 
        success: true, 
        data: {
          ...data,
          updatedAt: data.updatedAt?.toDate(),
        } as Cart 
      };
    } else {
      return { success: true, data: { userId, items: [], totalAmount: 0, updatedAt: new Date() } };
    }
  } catch (error: any) {
    console.error('Error getting cart:', error);
    return { success: false, error: error.message };
  }
};

export const clearCart = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const cartRef = doc(db, 'carts', userId);
    await deleteDoc(cartRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return { success: false, error: error.message };
  }
};

// ============= ORDERS =============

export const createOrder = async (
  orderData: Omit<Order, 'id'>
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  try {
    const orderRef = doc(collection(db, 'orders'));
    await setDoc(orderRef, {
      ...orderData,
      id: orderRef.id,
      orderDate: serverTimestamp(),
    });
    return { success: true, orderId: orderRef.id };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

export const getUserOrders = async (
  userId: string
): Promise<{ success: boolean; data?: Order[]; error?: string }> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        ...data,
        orderDate: data.orderDate?.toDate(),
        estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate(),
        actualDeliveryTime: data.actualDeliveryTime?.toDate(),
      } as Order);
    });
    
    // Sort in memory instead of in query to avoid needing composite index
    orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
    
    return { success: true, data: orders };
  } catch (error: any) {
    console.error('Error getting user orders:', error);
    return { success: false, error: error.message };
  }
};

export const getOrderById = async (
  orderId: string
): Promise<{ success: boolean; data?: Order; error?: string }> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      const data = orderSnap.data();
      const order: Order = {
        ...data,
        orderDate: data.orderDate?.toDate(),
        estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate(),
        actualDeliveryTime: data.actualDeliveryTime?.toDate(),
      } as Order;
      return { success: true, data: order };
    } else {
      return { success: false, error: 'Order not found' };
    }
  } catch (error: any) {
    console.error('Error getting order by ID:', error);
    return { success: false, error: error.message };
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status']
): Promise<{ success: boolean; error?: string }> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
};

// ============= PAYMENT METHODS =============

export const savePaymentMethod = async (
  paymentMethod: Omit<PaymentMethod, 'id'>
): Promise<{ success: boolean; paymentMethodId?: string; error?: string }> => {
  try {
    const paymentRef = doc(collection(db, 'paymentMethods'));
    await setDoc(paymentRef, {
      ...paymentMethod,
      id: paymentRef.id,
    });
    return { success: true, paymentMethodId: paymentRef.id };
  } catch (error: any) {
    console.error('Error saving payment method:', error);
    return { success: false, error: error.message };
  }
};

export const getUserPaymentMethods = async (
  userId: string
): Promise<{ success: boolean; data?: PaymentMethod[]; error?: string }> => {
  try {
    const paymentRef = collection(db, 'paymentMethods');
    const q = query(paymentRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const paymentMethods: PaymentMethod[] = [];
    querySnapshot.forEach((doc) => {
      paymentMethods.push(doc.data() as PaymentMethod);
    });
    
    return { success: true, data: paymentMethods };
  } catch (error: any) {
    console.error('Error getting payment methods:', error);
    return { success: false, error: error.message };
  }
};

export const deletePaymentMethod = async (
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const paymentRef = doc(db, 'paymentMethods', paymentMethodId);
    await deleteDoc(paymentRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    return { success: false, error: error.message };
  }
};

// ============= MENU ITEMS =============

export const getMenuItems = async (
  category?: string
): Promise<{ success: boolean; data?: MenuItem[]; error?: string }> => {
  try {
    const menuRef = collection(db, 'menuItems');
    let q = query(menuRef, where('isAvailable', '==', true));
    
    if (category) {
      q = query(menuRef, where('category', '==', category), where('isAvailable', '==', true));
    }
    
    const querySnapshot = await getDocs(q);
    const menuItems: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      menuItems.push({
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as MenuItem);
    });
    
    return { success: true, data: menuItems };
  } catch (error: any) {
    console.error('Error getting menu items:', error);
    return { success: false, error: error.message };
  }
};

export const getMenuItem = async (
  itemId: string
): Promise<{ success: boolean; data?: MenuItem; error?: string }> => {
  try {
    const itemRef = doc(db, 'menuItems', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      const data = itemSnap.data();
      return { 
        success: true, 
        data: {
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as MenuItem 
      };
    } else {
      return { success: false, error: 'Menu item not found' };
    }
  } catch (error: any) {
    console.error('Error getting menu item:', error);
    return { success: false, error: error.message };
  }
};

// ============= FAVORITES =============

export const addFavorite = async (
  userId: string,
  menuItem: MenuItem
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!menuItem.id) {
      return { success: false, error: 'Invalid menu item: missing id' };
    }
    
    const favoriteRef = doc(db, 'favorites', `${userId}_${menuItem.id}`);
    await setDoc(favoriteRef, {
      userId,
      menuItemId: menuItem.id,
      menuItem,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    return { success: false, error: error.message };
  }
};

export const removeFavorite = async (
  userId: string,
  menuItemId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const favoriteRef = doc(db, 'favorites', `${userId}_${menuItemId}`);
    await deleteDoc(favoriteRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    return { success: false, error: error.message };
  }
};

export const getFavorites = async (
  userId: string
): Promise<{ success: boolean; data?: MenuItem[]; error?: string }> => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const favorites: MenuItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.menuItem) {
        favorites.push({
          ...data.menuItem,
          createdAt: data.menuItem.createdAt?.toDate ? data.menuItem.createdAt.toDate() : data.menuItem.createdAt,
        } as MenuItem);
      }
    });
    
    return { success: true, data: favorites };
  } catch (error: any) {
    console.error('Error getting favorites:', error);
    return { success: false, error: error.message };
  }
};

export const isFavorite = async (
  userId: string,
  menuItemId: string
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> => {
  try {
    const favoriteRef = doc(db, 'favorites', `${userId}_${menuItemId}`);
    const favoriteSnap = await getDoc(favoriteRef);
    return { success: true, isFavorite: favoriteSnap.exists() };
  } catch (error: any) {
    console.error('Error checking favorite:', error);
    return { success: false, error: error.message };
  }
};
