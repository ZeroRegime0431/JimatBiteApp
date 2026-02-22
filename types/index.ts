// TypeScript interfaces for Firestore data models

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  photoURL?: string;
  addresses?: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Office"
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'meal' | 'dessert' | 'drink' | 'vegan' | 'blindbox';
  imageURL: string;
  restaurantId: string;
  restaurantName: string;
  rating?: number;
  isAvailable: boolean;
  createdAt: Date;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL: string;
  restaurantId: string;
  restaurantName: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
  deliveryAddress: Address;
  paymentMethod: string;
  orderDate: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  restaurantId: string;
  restaurantName: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'paypal' | 'cash';
  cardNumber?: string; // Last 4 digits only
  cardHolderName?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  rating: number;
  deliveryTime: string; // e.g., "20-30 min"
  minimumOrder: number;
  deliveryFee: number;
  cuisine: string[];
  isOpen: boolean;
}

export interface Review {
  id: string;
  userId: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface MerchantAccount {
  id: string;
  uid: string; // Firebase Auth UID
  fullName: string;
  email: string;
  password?: string; // Not stored in Firestore, only for initial creation
  confirmPassword?: string; // Not stored in Firestore
  mobileNumber?: string;
  dateOfBirth?: string;
  countryCode?: string;
  
  // Step 2: Business Information
  storeName: string;
  businessType: string; // Restaurant, Cafe, Bakery, Other
  cuisineTags: string[]; // Bakery, Chinese, Western, Healthy, Noodle, etc.
  storePhone?: string;
  logoURL?: string;
  
  // Step 3: Address & Fulfillment
  addressLine1: string;
  addressLine2?: string;
  postCode: string;
  city: string;
  fulfillmentMethods: ('pickup' | 'delivery' | 'both')[];
  
  // Business Hours
  businessHours: {
    isOpen24Hours: boolean;
    openTime?: string; // e.g., "10:00 AM"
    closeTime?: string; // e.g., "10:00 PM"
  };
  
  // Step 4: Bank & Documents
  bankDetails: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
  };
  documents?: {
    businessLicense?: string; // URL to uploaded document
    ownerID?: string; // URL to uploaded document
  };
  
  // Status & Metadata
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';
  isVerified: boolean;
  rating?: number;
  totalOrders?: number;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}
