// Firestore database operations
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
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
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
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
    await setDoc(cartRef, {
      userId,
      ...cart,
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
    const q = query(ordersRef, where('userId', '==', userId), orderBy('orderDate', 'desc'));
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
    
    return { success: true, data: orders };
  } catch (error: any) {
    console.error('Error getting user orders:', error);
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
