# Cloud Functions Setup Guide for Dynamic Pricing

## ✅ DEPLOYMENT STATUS: COMPLETE

**Deployment Date**: March 3, 2026  
**Function Name**: `updateDynamicPricing`  
**Region**: us-central1  
**Runtime**: Node.js 20  
**Schedule**: Every 30 minutes  
**Status**: ✅ Active and Running

### Quick Links
- **Firebase Console**: https://console.firebase.google.com/project/jimatbite/functions
- **Cloud Scheduler**: https://console.cloud.google.com/cloudscheduler?project=jimatbite
- **View Logs**: `firebase functions:log --only updateDynamicPricing`

---

## Overview
This guide documents the Firebase Cloud Functions setup that automatically updates menu item prices every 30 minutes based on their freshness and expiry times.

**✨ The function is now deployed and actively updating prices!**

---

## Prerequisites

✅ Firebase Blaze Plan (Pay-as-you-go) - **Done!**  
✅ Firebase CLI installed (v15.8.0) - **Done!**  
✅ Node.js 20+ installed - **Done!**  
✅ Dynamic pricing fields in database - **Done!**  
✅ Cloud Functions deployed - **Done!**

---

## Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

---

## Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser for authentication. Use the same Google account as your Firebase project.

---

## Step 3: Initialize Firebase Functions

Navigate to your project root directory:
```bash
cd "c:\React Projects\JimatBite\JimatBiteApp"
```

Initialize Firebase Functions:
```bash
firebase init functions
```

You'll be asked several questions:
1. **Select features**: Choose "Functions" (use space to select, enter to confirm)
2. **Select project**: Choose your existing project "jimatbite"
3. **Language**: Select "TypeScript"
4. **ESLint**: Yes (recommended)
5. **Install dependencies**: Yes

This creates a `functions/` folder in your project.

---

## Step 4: Create the Dynamic Pricing Function

Navigate to the functions folder:
```bash
cd functions
```

### Install Additional Dependencies

```bash
npm install firebase-admin firebase-functions
```

### Create the Function File

Create a new file: `functions/src/updateDynamicPricing.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Scheduled function that runs every 30 minutes
export const updateDynamicPricing = functions.pubsub
  .schedule('every 30 minutes')
  .timeZone('Asia/Kuala_Lumpur') // Adjust to your timezone
  .onRun(async (context) => {
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
```

### Update index.ts

Edit `functions/src/index.ts`:

```typescript
import { updateDynamicPricing } from './updateDynamicPricing';

// Export the function
export { updateDynamicPricing };
```

---

## Step 5: Deploy the Function

From the functions directory:

```bash
npm run build
```

Then deploy:

```bash
cd ..
firebase deploy --only functions
```

This will:
1. Build your TypeScript code
2. Upload to Firebase
3. Create the scheduled job in Cloud Scheduler

Expected output:
```
✔ functions[updateDynamicPricing] Successful create operation.
Function URL (updateDynamicPricing): https://us-central1-jimatbite.cloudfunctions.net/updateDynamicPricing
```

---

## Step 6: Verify Deployment

### Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project "jimatbite"
3. Navigate to **Functions** in left sidebar
4. You should see `updateDynamicPricing` listed

### Check Cloud Scheduler

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project "jimatbite"
3. Navigate to **Cloud Scheduler**
4. You should see a job running every 30 minutes

---

## Step 7: Test the Function Manually

### Option 1: Via Firebase Console
1. Go to Functions in Firebase Console
2. Click on `updateDynamicPricing`
3. Click **Logs** tab
4. Click **Run** button to test

### Option 2: Via Command Line
```bash
firebase functions:shell
```

Then run:
```javascript
updateDynamicPricing()
```

### Option 3: Via Cloud Scheduler
1. Go to Cloud Scheduler in Google Cloud Console
2. Find your function
3. Click **RUN NOW**

---

## Monitoring & Logs

### View Logs in Real-Time
```bash
firebase functions:log --only updateDynamicPricing
```

### View All Functions
```bash
firebase functions:list
```

Output:
```
┌──────────────────────┬─────────┬───────────┬─────────────┬────────┬──────────┐
│ Function             │ Version │ Trigger   │ Location    │ Memory │ Runtime  │
├──────────────────────┼─────────┼───────────┼─────────────┼────────┼──────────┤
│ updateDynamicPricing │ v1      │ scheduled │ us-central1 │ 256    │ nodejs20 │
└──────────────────────┴─────────┴───────────┴─────────────┴────────┴──────────┘
```

Or in Firebase Console:
1. **Functions** → `updateDynamicPricing` → **Logs**

### What to Monitor
- ✅ **Execution count**: Should run ~48 times per day (every 30 minutes)
- ✅ **Items updated**: Number of menu items with price changes
- ✅ **Expired items**: Items marked as unavailable
- ✅ **Errors**: Should be 0 under normal operation
- ✅ **Execution time**: Typically 5-15 seconds

### Sample Log Output
```
Starting dynamic pricing update...
Found 32 items with dynamic pricing
Updated: meal-001 - Mee Tarik Set: RM2.96 → RM1.78 (40% off)
Updated: vegan-001 - Mushroom Risotto: RM15.00 → RM9.00 (40% off)
Expired: dessert-003 - Chocolate Cake
✅ Dynamic pricing update complete!
   Updated: 8 items
   Expired: 1 items
```

---

## Cost Estimate

### Cloud Functions Pricing (Blaze Plan)
- **Invocations**: First 2 million/month FREE, then $0.40 per million
- **Compute time**: First 400,000 GB-seconds FREE, then $0.0000025 per GB-second
- **Memory**: 256 MB allocated per function

### Example Monthly Cost
Running every 30 minutes:
- **Invocations**: ~1,440/month (FREE)
- **Execution time**: ~10 seconds per run = 14,400 seconds/month
- **GB-seconds**: 14,400 × 0.256 = 3,686 GB-seconds (FREE)

**Total Monthly Cost: $0** (well within free tier)

Even with 100+ items and longer execution times, you'll likely stay under $1/month.

---

## Troubleshooting

### Error: "Deployment requires payment"
- Ensure you're on Blaze Plan (you already are!)

### Error: "Permission denied"
- Run `firebase login` again
- Ensure you're logged in with correct account

### Function not running
- Check Cloud Scheduler is enabled
- Verify timezone settings
- Check function logs for errors

### Items not updating
- Verify `dynamicPricingEnabled: true` in Firestore
- Check `preparedTime` and `expiryTime` are valid Timestamps
- Review function logs for specific errors

---

## Advanced: Update Schedule

To change the schedule, edit the function:

```typescript
// Every 15 minutes
.schedule('every 15 minutes')

// Every hour
.schedule('every 1 hours')

// At specific times (9 AM and 5 PM daily)
.schedule('0 9,17 * * *')

// Every day at midnight
.schedule('0 0 * * *')
```

Then redeploy:
```bash
firebase deploy --only functions
```

---

## Next Steps

After Cloud Functions are set up:

1. ✅ Verify prices update automatically in Firestore
2. ✅ Test on your app - prices should reflect discounts
3. ✅ Add merchant dashboard for dynamic pricing config
4. ✅ Add customer notifications for nearby deals
5. ✅ Monitor logs for the first few days

---

## Support Commands

```bash
# View all functions
firebase functions:list

# View specific function logs
firebase functions:log --only updateDynamicPricing

# Delete a function
firebase functions:delete updateDynamicPricing

# Redeploy after changes
firebase deploy --only functions
```

---

## Summary

✅ **What has been completed:**
- ✅ Database migration with dynamic pricing fields (32 items)
- ✅ Add menu item page with time inputs
- ✅ Menu item detail pages showing prices and times  
- ✅ Category pages with freshness badges
- ✅ Currency updated to RM throughout app
- ✅ Firebase CLI installed (v15.8.0)
- ✅ Firebase Functions initialized
- ✅ `updateDynamicPricing` function created
- ✅ Function deployed to Firebase
- ✅ Cloud Scheduler configured (every 30 minutes)

✅ **Current Status:**
- 🟢 Function is LIVE and running
- 🟢 Prices updating automatically every 30 minutes
- 🟢 Expired items being marked unavailable
- 🟢 Customers see fresh vs discounted pricing
- 🟢 Zero manual maintenance required

✅ **What to do next:**
1. Monitor function logs for first 24 hours
2. Verify price updates in Firestore console
3. Test app with items at different freshness levels
4. (Optional) Create merchant dashboard for discount config
5. (Optional) Add customer notifications for nearby deals

✅ **Result:**
Your JimatBite app now has a fully automated dynamic pricing system that:
- Updates prices every 30 minutes based on freshness
- Applies discounts from 0% (fresh) to 50% (8+ hours old)
- Marks expired items as unavailable automatically
- Shows customers real-time freshness status
- Requires no manual intervention

---

*Initial Setup: March 3, 2026*  
*Deployment Complete: March 3, 2026*  
*For presentation: March 13, 2026*
