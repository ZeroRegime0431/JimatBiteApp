# Dynamic Pricing Migration Guide

## Overview
This migration adds dynamic pricing capabilities to all existing menu items in your Firestore database.

## ⚠️ Important: Firestore Security Rules
Before running the migration, you need to temporarily allow write access in Firestore:

### Option 1: Temporary Open Access (Fastest - for development only)
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to **Firestore Database** → **Rules**
3. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // TEMPORARY - for migration only
    }
  }
}
```
4. Click **Publish**
5. Run the migration script
6. **IMPORTANT**: Restore your original rules after migration!

### Option 2: Allow Authenticated Admin (More secure)
Run the migration from within your app as an authenticated admin user.

## What Gets Updated
Each menu item will receive these new fields:
- `originalPrice`: Original base price
- `currentPrice`: Dynamically calculated price
- `dynamicPricingEnabled`: Whether dynamic pricing is active for this item
- `preparedTime`: When the item was prepared
- `expiryTime`: When the item expires
- `freshnessHours`: Shelf life in hours
- `freshnessStatus`: Current status (fresh/discounted/expiring-soon)
- `discountRules`: Tiered discount configuration
- `lastPriceUpdate`: Last time price was updated

## Demo Data Configuration
For your March 13th presentation:
- **Most items**: Fresh with expiry set after March 13th
- **Demo items** (close to expiry for demonstration):
  - `vegan-001`, `vegan-002`
  - `meal-001`, `meal-002`
  - `dessert-001`, `dessert-002`

## How to Run

### Step 1: Install Dependencies (if needed)
```bash
npm install
```

### Step 2: Run the Migration Script
```bash
npx tsx scripts/migrate-dynamic-pricing.ts
```

Or alternatively:
```bash
npx ts-node scripts/migrate-dynamic-pricing.ts
```

### Step 3: Verify in Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to your project: **jimatbite**
3. Navigate to **Firestore Database**
4. Click on **menuItems** collection
5. Check a few items to verify the new fields exist

## Expected Output
You should see output like:
```
🚀 Starting dynamic pricing migration...

📦 Found 15 menu items to migrate

✅ drink-001: Iced Lemon Tea - RM3.50
⏰ vegan-001: Vegan Salad Bowl - RM12.00 → RM7.20
✅ meal-003: Chicken Rice Box - RM7.50
⏰ dessert-001: Chocolate Cake - RM8.50 → RM5.10

=============================================================
✨ Migration Complete!
=============================================================
✅ Successfully migrated: 15 items
❌ Errors: 0 items
⏰ Items close to expiry: 6
🆕 Fresh items: 9
=============================================================
```

## What Happens to New Items?
The [add-menu-item.tsx](../app/add-menu-item.tsx) page has been updated to automatically include dynamic pricing fields when merchants add new items. Merchants can:
- Toggle dynamic pricing on/off
- Set freshness duration
- See real-time price timeline preview

## Rollback (if needed)
If you need to undo the migration:
1. Go to Firebase Console → Firestore
2. Manually delete the new fields from documents, OR
3. Use the Cloud Firestore data import/export feature if you made a backup

## Next Steps
After migration is complete:
1. ✅ Verify data in Firebase Console
2. ⏭️ Set up Cloud Functions for automated price updates (coming next)
3. ⏭️ Add merchant dashboard for dynamic pricing configuration
4. ⏭️ Update customer-facing pages to display discounted prices

## Troubleshooting

### Error: "Cannot find module 'firebase'"
**Solution**: Make sure you're in the project directory and run `npm install`

### Error: "Permission denied"
**Solution**: Check your Firebase security rules and ensure the service account has write permissions

### Script runs but no items updated
**Solution**: Check that your Firebase config is correct in `config/firebase.ts`

## Support
If you encounter any issues, check:
1. Firebase Console for error logs
2. Terminal output for specific error messages
3. Firestore security rules (should allow writes)

---

*Created: March 3, 2026*
*For presentation: March 13, 2026*
