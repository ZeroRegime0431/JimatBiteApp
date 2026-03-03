import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Scheduled function that runs every 30 minutes
export const updateDynamicPricing = functions.pubsub
  .schedule('every 30 minutes')
  .timeZone('Asia/Kuala_Lumpur') // Adjust to your timezone
  .onRun(async (context: functions.EventContext) => {
    console.log('Starting dynamic pricing update...');

    try {
      // Get all menu items where dynamic pricing is enabled
      const menuItemsRef = db.collection('menuItems');
      const snapshot = await menuItemsRef
        .where('dynamicPricingEnabled', '==', true)
        .get();

      if (snapshot.empty) {
        console.log('No items with dynamic pricing enabled');
        return null;
      }

      console.log(`Found ${snapshot.size} items with dynamic pricing`);

      const batch = db.batch();
      let updateCount = 0;
      let expiredCount = 0;

      const now = admin.firestore.Timestamp.now();

      for (const doc of snapshot.docs) {
        const item = doc.data();
        const itemId = doc.id;

        // Check if item has expired
        if (item.expiryTime && item.expiryTime.toMillis() <= now.toMillis()) {
          // Item has expired - mark as unavailable
          batch.update(doc.ref, {
            isAvailable: false,
            freshnessStatus: 'expiring-soon',
            lastPriceUpdate: now,
          });
          expiredCount++;
          console.log(`Expired: ${itemId} - ${item.name}`);
          continue;
        }

        // Calculate hours elapsed since preparation
        const preparedTime = item.preparedTime;
        if (!preparedTime) {
          console.log(`Skipping ${itemId}: No prepared time`);
          continue;
        }

        const hoursElapsed = 
          (now.toMillis() - preparedTime.toMillis()) / (1000 * 60 * 60);

        // Calculate discount based on discount rules or default tiers
        const discountRules = item.discountRules || {
          tier1: { hours: 2, discount: 0 },
          tier2: { hours: 4, discount: 10 },
          tier3: { hours: 6, discount: 25 },
          tier4: { hours: 8, discount: 40 },
          tier5: { hours: 999, discount: 50 },
        };

        let discountPercent = 0;
        
        // Apply discount tiers
        if (hoursElapsed >= 8) {
          discountPercent = discountRules.tier5.discount;
        } else if (hoursElapsed >= 6) {
          discountPercent = discountRules.tier4.discount;
        } else if (hoursElapsed >= 4) {
          discountPercent = discountRules.tier3.discount;
        } else if (hoursElapsed >= 2) {
          discountPercent = discountRules.tier2.discount;
        } else {
          discountPercent = discountRules.tier1.discount;
        }

        // Calculate new price
        const originalPrice = item.originalPrice || item.price;
        const newCurrentPrice = originalPrice * (1 - discountPercent / 100);
        const roundedPrice = Math.round(newCurrentPrice * 100) / 100;

        // Determine freshness status
        const hoursUntilExpiry = item.expiryTime
          ? (item.expiryTime.toMillis() - now.toMillis()) / (1000 * 60 * 60)
          : 999;

        let freshnessStatus: 'fresh' | 'discounted' | 'expiring-soon';
        if (hoursUntilExpiry < 2) {
          freshnessStatus = 'expiring-soon';
        } else if (hoursElapsed > 2) {
          freshnessStatus = 'discounted';
        } else {
          freshnessStatus = 'fresh';
        }

        // Update if price has changed
        if (item.currentPrice !== roundedPrice || item.freshnessStatus !== freshnessStatus) {
          batch.update(doc.ref, {
            currentPrice: roundedPrice,
            price: roundedPrice, // Update main price field too
            freshnessStatus: freshnessStatus,
            lastPriceUpdate: now,
          });
          updateCount++;
          console.log(`Updated: ${itemId} - ${item.name}: RM${originalPrice.toFixed(2)} → RM${roundedPrice.toFixed(2)} (${discountPercent}% off)`);
        }
      }

      // Commit the batch update
      await batch.commit();

      console.log(`✅ Dynamic pricing update complete!`);
      console.log(`   Updated: ${updateCount} items`);
      console.log(`   Expired: ${expiredCount} items`);

      return null;
    } catch (error) {
      console.error('Error updating dynamic pricing:', error);
      throw error;
    }
  });
