// Eco-packaging service functions
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
    EcoBadge,
    EcoPackagingStats,
    EcoSupplier,
    MerchantAccount,
    PackagingType,
} from '../types';

// Points per eco order
const POINTS_PER_ECO_ORDER = 10;

// Badge thresholds
const BADGE_THRESHOLDS: Record<EcoBadge, number> = {
  'green-starter': 25,
  'eco-champion': 100,
  'sustainability-hero': 500,
};

// Calculate which badges should be awarded
function calculateBadges(ecoOrders: number): EcoBadge[] {
  const badges: EcoBadge[] = [];
  
  if (ecoOrders >= BADGE_THRESHOLDS['green-starter']) {
    badges.push('green-starter');
  }
  if (ecoOrders >= BADGE_THRESHOLDS['eco-champion']) {
    badges.push('eco-champion');
  }
  if (ecoOrders >= BADGE_THRESHOLDS['sustainability-hero']) {
    badges.push('sustainability-hero');
  }
  
  return badges;
}

// Initialize eco stats for a merchant
export const initializeEcoStats = async (
  merchantId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const merchantRef = doc(db, 'merchants', merchantId);
    
    const initialStats: EcoPackagingStats = {
      totalOrders: 0,
      ecoOrders: 0,
      ecoPercentage: 0,
      points: 0,
      badges: [],
      packagingTypes: [],
      lastUpdated: new Date(),
    };
    
    await updateDoc(merchantRef, {
      ecoStats: initialStats,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error initializing eco stats:', error);
    return { success: false, error: error.message };
  }
};

// Update eco stats when an order is created
export const updateEcoStats = async (
  merchantId: string,
  usesEcoPackaging: boolean,
  packagingType?: PackagingType
): Promise<{ success: boolean; error?: string }> => {
  try {
    const merchantRef = doc(db, 'merchants', merchantId);
    const merchantSnap = await getDoc(merchantRef);
    
    if (!merchantSnap.exists()) {
      return { success: false, error: 'Merchant not found' };
    }
    
    const merchantData = merchantSnap.data() as MerchantAccount;
    let ecoStats = merchantData.ecoStats;
    
    // Initialize if doesn't exist
    if (!ecoStats) {
      ecoStats = {
        totalOrders: 0,
        ecoOrders: 0,
        ecoPercentage: 0,
        points: 0,
        badges: [],
        packagingTypes: [],
        lastUpdated: new Date(),
      };
    }
    
    // Update counts
    ecoStats.totalOrders += 1;
    if (usesEcoPackaging) {
      ecoStats.ecoOrders += 1;
      ecoStats.points += POINTS_PER_ECO_ORDER;
      
      // Add packaging type if not already present
      if (packagingType && !ecoStats.packagingTypes.includes(packagingType)) {
        ecoStats.packagingTypes.push(packagingType);
      }
    }
    
    // Recalculate percentage
    ecoStats.ecoPercentage = Math.round((ecoStats.ecoOrders / ecoStats.totalOrders) * 100);
    
    // Update badges
    ecoStats.badges = calculateBadges(ecoStats.ecoOrders);
    ecoStats.lastUpdated = new Date();
    
    // Update in Firestore - only update ecoStats to match security rules
    await updateDoc(merchantRef, {
      ecoStats,
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating eco stats:', error);
    return { success: false, error: error.message };
  }
};

// Get eco stats for a merchant
export const getEcoStats = async (
  merchantId: string
): Promise<{ success: boolean; data?: EcoPackagingStats; error?: string }> => {
  try {
    const merchantRef = doc(db, 'merchants', merchantId);
    const merchantSnap = await getDoc(merchantRef);
    
    if (!merchantSnap.exists()) {
      return { success: false, error: 'Merchant not found' };
    }
    
    const merchantData = merchantSnap.data() as MerchantAccount;
    
    if (!merchantData.ecoStats) {
      // Initialize if doesn't exist
      await initializeEcoStats(merchantId);
      return {
        success: true,
        data: {
          totalOrders: 0,
          ecoOrders: 0,
          ecoPercentage: 0,
          points: 0,
          badges: [],
          packagingTypes: [],
          lastUpdated: new Date(),
        },
      };
    }
    
    return { success: true, data: merchantData.ecoStats };
  } catch (error: any) {
    console.error('Error getting eco stats:', error);
    return { success: false, error: error.message };
  }
};

// Get all eco-friendly merchants (with eco percentage > threshold)
export const getEcoFriendlyMerchants = async (
  minEcoPercentage: number = 50
): Promise<{ success: boolean; data?: MerchantAccount[]; error?: string }> => {
  try {
    const merchantsRef = collection(db, 'merchants');
    const q = query(
      merchantsRef,
      where('status', '==', 'approved'),
      where('ecoStats.ecoPercentage', '>=', minEcoPercentage)
    );
    
    const querySnapshot = await getDocs(q);
    const merchants: MerchantAccount[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      merchants.push({
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as MerchantAccount);
    });
    
    // Sort by eco percentage
    merchants.sort((a, b) => {
      const aPercent = a.ecoStats?.ecoPercentage || 0;
      const bPercent = b.ecoStats?.ecoPercentage || 0;
      return bPercent - aPercent;
    });
    
    return { success: true, data: merchants };
  } catch (error: any) {
    console.error('Error getting eco-friendly merchants:', error);
    return { success: false, error: error.message };
  }
};

// Get merchants with eco-packaging enabled (regardless of percentage)
export const getMerchantsWithEcoPackaging = async (): Promise<{
  success: boolean;
  data?: MerchantAccount[];
  error?: string;
}> => {
  try {
    const merchantsRef = collection(db, 'merchants');
    const q = query(
      merchantsRef,
      where('status', '==', 'approved'),
      where('usesEcoPackaging', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const merchants: MerchantAccount[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      merchants.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as MerchantAccount);
    });
    
    // Sort by eco percentage (if available)
    merchants.sort((a, b) => {
      const aPercent = a.ecoStats?.ecoPercentage || 0;
      const bPercent = b.ecoStats?.ecoPercentage || 0;
      return bPercent - aPercent;
    });
    
    return { success: true, data: merchants };
  } catch (error: any) {
    console.error('Error getting merchants with eco-packaging:', error);
    return { success: false, error: error.message };
  }
};

// Get eco leaderboard (top 10 eco merchants)
export const getEcoLeaderboard = async (): Promise<{
  success: boolean;
  data?: Array<{ merchant: MerchantAccount; rank: number }>;
  error?: string;
}> => {
  try {
    const merchantsRef = collection(db, 'merchants');
    const q = query(merchantsRef, where('status', '==', 'approved'));
    
    const querySnapshot = await getDocs(q);
    const merchants: MerchantAccount[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.ecoStats && data.ecoStats.ecoOrders > 0) {
        merchants.push({
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as MerchantAccount);
      }
    });
    
    // Sort by eco orders descending
    merchants.sort((a, b) => {
      const aOrders = a.ecoStats?.ecoOrders || 0;
      const bOrders = b.ecoStats?.ecoOrders || 0;
      return bOrders - aOrders;
    });
    
    // Take top 10 and add rank
    const leaderboard = merchants.slice(0, 10).map((merchant, index) => ({
      merchant,
      rank: index + 1,
    }));
    
    return { success: true, data: leaderboard };
  } catch (error: any) {
    console.error('Error getting eco leaderboard:', error);
    return { success: false, error: error.message };
  }
};

// Get all eco suppliers
export const getEcoSuppliers = async (): Promise<{
  success: boolean;
  data?: EcoSupplier[];
  error?: string;
}> => {
  try {
    const suppliersRef = collection(db, 'ecoSuppliers');
    const q = query(suppliersRef, where('verified', '==', true));
    
    const querySnapshot = await getDocs(q);
    const suppliers: EcoSupplier[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      suppliers.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      } as EcoSupplier);
    });
    
    return { success: true, data: suppliers };
  } catch (error: any) {
    console.error('Error getting eco suppliers:', error);
    return { success: false, error: error.message };
  }
};
