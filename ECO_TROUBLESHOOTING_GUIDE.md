# Eco-Friendly Packaging Troubleshooting Guide

## Issues Reported
1. Eco-friendly filter not showing merchants correctly
2. Eco stats not increasing after completing orders
3. Eco badges not visible on menu items

## Changes Made

### 1. Firestore Index Configuration
Created `firestore.indexes.json` with required composite indexes:
- `merchants`: `status` + `usesEcoPackaging`
- `merchants`: `status` + `ecoStats.ecoPercentage`

**Action Required**: Deploy Firestore indexes
```bash
firebase deploy --only firestore:indexes
```

### 2. Added Debug Logging
Added console logs to track the flow:
- `[Eco]` prefix: Eco service functions
- `[Home]` prefix: Home page eco loading
- `[Category-Meal]` prefix: Category page eco loading
- `[Checkout]` prefix: Order creation with eco data

### 3. Firebase Configuration
Updated `firebase.json` to include Firestore configuration.

## Troubleshooting Steps

### Step 1: Check Merchant Eco Settings in Firestore
Open Firebase Console → Firestore Database → `merchants` collection

For each merchant (e.g., "Green Plate"), verify:
```json
{
  "usesEcoPackaging": true,  // <- Must be exactly true (boolean)
  "defaultPackagingType": "biodegradable",  // <- Optional
  "status": "approved",  // <- Must be "approved"
  "ecoStats": {
    "totalOrders": 0,
    "ecoOrders": 0,
    "ecoPercentage": 0,
    "points": 0,
    "badges": [],
    "packagingTypes": [],
    "lastUpdated": <timestamp>
  }
}
```

**Common Issues**:
- ❌ `usesEcoPackaging` is a string "true" instead of boolean `true`
- ❌ `usesEcoPackaging` field doesn't exist
- ❌ `status` is not "approved"

**Fix**: Update merchant document in Firestore Console:
```javascript
// In Firestore Console, edit the merchant document:
usesEcoPackaging: true  // Set as boolean, not string
status: "approved"
```

### Step 2: Deploy Firestore Indexes
The eco filter query requires a composite index:

```bash
# From the project root directory
cd "c:\React Projects\JimatBite\JimatBiteApp"
firebase deploy --only firestore:indexes
```

Wait 2-5 minutes for the indexes to build.

### Step 3: Check Console Logs
Run the app and check the console for debug messages:

**Home Page Load**:
```
[Home] Loading all merchant eco stats
[Home] Merchant Green Plate uses eco packaging
[Home] Loaded eco status for X merchants, Y use eco
```

**Category Page**:
```
[Category-Meal] Loading eco status for items: X
[Category-Meal] Unique restaurant IDs: [...]
[Category-Meal] Merchant <id>: usesEco = true
```

**Filter Page (Enable Eco Filter)**:
```
[Eco] Querying merchants with usesEcoPackaging = true
[Eco] Found eco merchant: Green Plate
[Eco] Total eco merchants found: X
```

**Creating Order**:
```
[Checkout] Fetching merchant eco settings for: <id>
[Checkout] Merchant eco settings - usesEco: true, type: biodegradable
[Checkout] Creating order with eco data: { usesEcoPackaging: true, packagingType: 'biodegradable' }
[Eco] Updating stats for merchant <id>, usesEco: true, type: biodegradable
[Eco] Updated stats - Total: X, Eco: Y, Percentage: Z%, Points: P
```

### Step 4: Verify Badge Display

**Expected Behavior**:
- ✅ Home page: Items from eco merchants show 🌱 icon badge
- ✅ Category pages: Items show "🌱 ECO" badge in bottom-right corner
- ✅ Menu item detail: Green banner with "Eco-Friendly Packaging" message
- ✅ Merchant menu item detail: Green banner with "Eco-Friendly Packaging Enabled"

**If badges don't show**:
1. Check console for `[Home]` or `[Category-X]` logs
2. Verify `merchantUsesEco[restaurantId]` is `true` in console
3. Check that menu items have correct `restaurantId` matching merchant document ID

### Step 5: Verify Stats Update

After completing an order from an eco-friendly merchant:

1. Check console for `[Eco] Updated stats` message
2. Open Firestore Console → `merchants` → (your merchant) → `ecoStats`
3. Verify fields updated:
   ```json
   {
     "totalOrders": 3,      // Should increment by 1
     "ecoOrders": 3,        // Should increment by 1 (if eco enabled)
     "ecoPercentage": 100,  // Recalculated percentage
     "points": 30,          // Should increase by 10 per order
     "badges": ["green-starter"],  // Awarded at 25 orders
     "lastUpdated": <timestamp>
   }
   ```

### Step 6: Test Eco Filter

1. Go to Filter Page
2. Enable "Eco-Friendly Merchants Only" toggle
3. Click "Apply"
4. Check console:
   ```
   [Eco] Querying merchants with usesEcoPackaging = true
   [Eco] Found eco merchant: Green Plate
   [Eco] Total eco merchants found: 1
   ```
5. Home page should only show items from eco merchants

**If filter shows no items**:
- Verify Firestore indexes are deployed (`firebase deploy --only firestore:indexes`)
- Check that at least one merchant has `usesEcoPackaging: true` AND `status: "approved"`
- Check console for index error: "The query requires an index"

## Common Fixes

### Fix 1: Merchant Not Found in Filter
**Problem**: Eco filter doesn't show any merchants
**Solution**:
1. Verify merchant document: `usesEcoPackaging: true` (boolean)
2. Deploy Firestore indexes
3. Wait 2-5 minutes for index build

### Fix 2: Stats Not Updating
**Problem**: `ecoStats` not incrementing after orders
**Solution**:
1. Check `[Checkout]` logs show `usesEcoPackaging: true`
2. Check `[Eco] Updating stats` message appears
3. Verify merchant document exists with correct `restaurantId`
4. Check no Firestore permission errors in console

### Fix 3: Badges Not Showing
**Problem**: No 🌱 badges visible on items
**Solution**:
1. Wait for home page load to complete
2. Check `[Home] Loaded eco status` message
3. Verify at least one merchant has `usesEcoPackaging: true`
4. Check menu items have matching `restaurantId`
5. Force reload app (close and reopen)

## Quick Checklist

- [ ] Firestore indexes deployed (`firebase deploy --only firestore:indexes`)
- [ ] At least one merchant has:
  - [ ] `usesEcoPackaging: true` (boolean)
  - [ ] `status: "approved"`
  - [ ] `defaultPackagingType` set (e.g., "biodegradable")
- [ ] Menu items have correct `restaurantId` matching merchant ID
- [ ] Console shows eco-related logs (search for `[Eco]`, `[Home]`, `[Checkout]`)
- [ ] App reloaded after making Firestore changes

## Testing Eco Flow End-to-End

1. **Enable Eco Packaging**:
   - Login as merchant (Green Plate)
   - Go to Merchant Dashboard
   - Toggle "Use Eco-Friendly Packaging" ON
   - Select packaging type (e.g., "Biodegradable")
   - Save

2. **Verify Badge Shows**:
   - Go to Home Page
   - Check console for: `[Home] Merchant Green Plate uses eco packaging`
   - Verify 🌱 icon appears on Green Plate items

3. **Test Filter**:
   - Open Filter Page
   - Enable "Eco-Friendly Merchants Only"
   - Apply
   - Home should show only Green Plate items

4. **Place Order**:
   - Add Green Plate item to cart
   - Complete checkout
   - Check console for:
     ```
     [Checkout] usesEcoPackaging: true
     [Eco] Updating stats...
     [Eco] Updated stats - Total: X, Eco: Y
     ```

5. **Verify Stats Updated**:
   - Open Firestore Console
   - Check `merchants/<green-plate-id>/ecoStats`
   - Verify `totalOrders` and `ecoOrders` incremented
   - Verify `points` increased by 10
   - Check `ecoPercentage` updated

## If Still Not Working

1. **Clear app cache and restart**
2. **Check Firestore rules** allow read/write to `merchants` collection
3. **Verify Firebase Authentication** is working
4. **Check for errors** in Metro bundler terminal
5. **Try with a fresh merchant**: Create a new test merchant with eco enabled from scratch

## Contact Info for Support
Share console logs showing:
- `[Eco]` messages
- `[Home]` messages
- `[Checkout]` messages
- Any error messages
