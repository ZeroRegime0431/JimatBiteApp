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
  // Dynamic Pricing Fields
  originalPrice?: number;
  currentPrice?: number;
  dynamicPricingEnabled?: boolean;
  preparedTime?: Date;
  expiryTime?: Date;
  freshnessHours?: number;
  freshnessStatus?: 'fresh' | 'discounted' | 'expiring-soon';
  discountRules?: {
    tier1: { hours: number; discount: number };
    tier2: { hours: number; discount: number };
    tier3: { hours: number; discount: number };
    tier4: { hours: number; discount: number };
    tier5: { hours: number; discount: number };
  };
  lastPriceUpdate?: Date;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL: string;
  restaurantId: string;
  restaurantName: string;
  notes?: string; // Customer notes to the seller
  
  // Fulfillment tracking
  fulfilled?: boolean;
  fulfilledBy?: string; // Merchant UID who fulfilled this item
  fulfilledAt?: Date;
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
  status: 'pending' | 'confirmed' | 'preparing' | 'partially-fulfilled' | 'ready-for-pickup' | 'on-the-way' | 'delivered' | 'cancelled';
  deliveryAddress: Address;
  paymentMethod: string;
  orderDate: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  restaurantId: string;
  restaurantName: string;
  
  // Multi-vendor fulfillment tracking
  fulfilledRestaurants?: string[]; // Array of restaurant names that have scanned QR
  
  // Eco-Packaging Info
  usesEcoPackaging?: boolean;
  packagingType?: PackagingType;
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
  
  // Eco-Packaging Stats & Settings
  ecoStats?: EcoPackagingStats;
  usesEcoPackaging?: boolean; // Whether merchant has enabled eco-packaging
  defaultPackagingType?: PackagingType; // Default packaging type for orders
}

export interface EcoPackagingStats {
  totalOrders: number;
  ecoOrders: number;
  ecoPercentage: number;
  points: number;
  badges: EcoBadge[];
  packagingTypes: PackagingType[];
  lastUpdated: Date;
}

export type EcoBadge = 'green-starter' | 'eco-champion' | 'sustainability-hero';

export type PackagingType = 'biodegradable' | 'compostable' | 'recyclable' | 'reusable';

export interface EcoBadgeInfo {
  id: EcoBadge;
  name: string;
  icon: string; // emoji
  description: string;
  requiredOrders: number;
  color: string;
}

export interface EcoSupplier {
  id: string;
  name: string;
  description: string;
  products: EcoProduct[];
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logoURL?: string;
  rating?: number;
  verified: boolean;
  createdAt: Date;
}

export interface EcoProduct {
  id: string;
  name: string;
  type: PackagingType;
  description: string;
  pricePerUnit: number;
  minimumOrder: number;
  imageURL?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  merchantId: string;
  merchantName: string;
  orderId?: string; // Optional link to a specific order
  lastMessage: string;
  lastMessageTime?: Date;
  unreadCount: number; // Unread messages for customer
  unreadCountMerchant: number; // Unread messages for merchant
  createdAt?: Date;
}

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  read: boolean;
  image?: string;
  system?: boolean; // For system messages like order updates
}

