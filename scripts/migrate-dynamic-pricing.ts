// Migration Script: Add Dynamic Pricing Fields to Existing Menu Items
// This script updates all existing menu items with dynamic pricing capabilities
// Run this once: npx tsx scripts/migrate-dynamic-pricing.ts

import { collection, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Items that should be close to expiry (for demo purposes)
const ITEMS_CLOSE_TO_EXPIRY = [
  'vegan-001', 'vegan-002',  // 2 vegan items
  'meal-001', 'meal-002',     // 2 meal items
  'dessert-001', 'dessert-002' // 2 dessert items
];

async function migrateDynamicPricing() {
  try {
    console.log('🚀 Starting dynamic pricing migration...\n');

    // Fetch all menu items
    const menuItemsRef = collection(db, 'menuItems');
    const snapshot = await getDocs(menuItemsRef);

    console.log(`📦 Found ${snapshot.size} menu items to migrate\n`);

    let successCount = 0;
    let errorCount = 0;

    // Current date: March 3, 2026
    const now = new Date('2026-03-03T10:00:00');
    
    // Date after presentation: March 14, 2026 (day after presentation)
    const afterPresentation = new Date('2026-03-14T23:59:59');

    for (const docSnapshot of snapshot.docs) {
      const itemData = docSnapshot.data();
      const itemId = docSnapshot.id;

      try {
        // Determine if this item should be close to expiry
        const isClosingToExpiry = ITEMS_CLOSE_TO_EXPIRY.includes(itemId);

        // Calculate prepared time and expiry time
        let preparedTime: Date;
        let expiryTime: Date;
        let freshnessHours: number;

        if (isClosingToExpiry) {
          // These items were prepared 6 hours ago and expire in 2 hours
          preparedTime = new Date(now.getTime() - (6 * 60 * 60 * 1000)); // 6 hours ago
          freshnessHours = 8; // Total shelf life: 8 hours
          expiryTime = new Date(preparedTime.getTime() + (freshnessHours * 60 * 60 * 1000));
        } else {
          // Fresh items prepared recently, expires after March 13th
          preparedTime = new Date(now.getTime() - (1 * 60 * 60 * 1000)); // 1 hour ago
          
          // Set expiry to be 260+ hours from now (after March 13th)
          freshnessHours = 288; // 12 days worth
          expiryTime = new Date(preparedTime.getTime() + (freshnessHours * 60 * 60 * 1000));
        }

        // Calculate current price based on freshness
        const currentPrice = calculateDynamicPrice(
          itemData.price,
          preparedTime,
          expiryTime,
          now
        );

        // Determine freshness status
        const hoursElapsed = (now.getTime() - preparedTime.getTime()) / (1000 * 60 * 60);
        const hoursUntilExpiry = (expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        let freshnessStatus: 'fresh' | 'discounted' | 'expiring-soon';
        if (hoursUntilExpiry < 2) {
          freshnessStatus = 'expiring-soon';
        } else if (hoursElapsed > 2) {
          freshnessStatus = 'discounted';
        } else {
          freshnessStatus = 'fresh';
        }

        // Default discount rules (merchant can customize later)
        const discountRules = {
          tier1: { hours: 2, discount: 0 },      // 0-2 hours: Full price
          tier2: { hours: 4, discount: 10 },     // 2-4 hours: 10% off
          tier3: { hours: 6, discount: 25 },     // 4-6 hours: 25% off
          tier4: { hours: 8, discount: 40 },     // 6-8 hours: 40% off
          tier5: { hours: 999, discount: 50 },   // 8+ hours: 50% off
        };

        // Prepare update data
        const updateData = {
          originalPrice: itemData.price,
          currentPrice: currentPrice,
          dynamicPricingEnabled: isClosingToExpiry, // Enable for demo items, disable for others
          preparedTime: Timestamp.fromDate(preparedTime),
          expiryTime: Timestamp.fromDate(expiryTime),
          freshnessHours: freshnessHours,
          freshnessStatus: freshnessStatus,
          discountRules: discountRules,
          lastPriceUpdate: Timestamp.fromDate(now),
        };

        // Update the document
        const itemDocRef = doc(db, 'menuItems', itemId);
        await updateDoc(itemDocRef, updateData);

        const statusEmoji = isClosingToExpiry ? '⏰' : '✅';
        const priceInfo = isClosingToExpiry 
          ? `RM${itemData.price.toFixed(2)} → RM${currentPrice.toFixed(2)}`
          : `RM${itemData.price.toFixed(2)}`;
        
        console.log(`${statusEmoji} ${itemId}: ${itemData.name} - ${priceInfo}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error updating ${itemId}:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    console.log(`⏰ Items close to expiry: ${ITEMS_CLOSE_TO_EXPIRY.length}`);
    console.log(`🆕 Fresh items: ${successCount - ITEMS_CLOSE_TO_EXPIRY.length}`);
    console.log('='.repeat(60));
    console.log('\n📝 Next Steps:');
    console.log('   1. Check Firebase Console to verify changes');
    console.log('   2. Update merchant dashboard for dynamic pricing config');
    console.log('   3. Deploy Cloud Functions for automated price updates');
    console.log('\n');

  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    process.exit(1);
  }
}

// Calculate discounted price based on time elapsed
function calculateDynamicPrice(
  originalPrice: number, 
  preparedTime: Date, 
  expiryTime: Date,
  currentTime: Date
): number {
  const hoursElapsed = (currentTime.getTime() - preparedTime.getTime()) / (1000 * 60 * 60);
  
  let discountPercent = 0;
  
  // Apply discount tiers
  if (hoursElapsed >= 8) {
    discountPercent = 50;
  } else if (hoursElapsed >= 6) {
    discountPercent = 40;
  } else if (hoursElapsed >= 4) {
    discountPercent = 25;
  } else if (hoursElapsed >= 2) {
    discountPercent = 10;
  }
  
  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  return Math.round(discountedPrice * 100) / 100; // Round to 2 decimal places
}

// Run the migration
console.log('\n🔄 Dynamic Pricing Migration Tool');
console.log('Current Date: March 3, 2026');
console.log('Presentation Date: March 13, 2026\n');

migrateDynamicPricing()
  .then(() => {
    console.log('✅ Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
