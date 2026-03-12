# Eco-Packaging Implementation Guide

## Overview
This guide shows how to use the eco-packaging features in JimatBite. Phase 1 and Phase 2 are now implemented.

## ✅ What's Implemented

### Phase 1 (MVP)
- ✅ Checkbox for merchants to mark eco-packaging
- ✅ Display eco-badge on merchant profiles
- ✅ Simple points counter in merchant dashboard

### Phase 2 (Medium Complexity)
- ✅ Badge system with milestones
- ✅ Analytics dashboard with charts
- ✅ Customer filter for eco-merchants

## 📁 New Files Created

### Components
1. **`components/EcoBadge.tsx`** - Badge display component
2. **`components/EcoDashboard.tsx`** - Merchant analytics dashboard
3. **`components/EcoFilterToggle.tsx`** - Customer filter component
4. **`components/EcoPackagingPicker.tsx`** - Packaging type selector

### Services
5. **`services/eco.ts`** - Eco-packaging service functions

### Types
6. **`types/index.ts`** - Updated with eco-packaging types

## 🎯 Usage Examples

### 1. For Merchants: Add Eco-Packaging to Checkout

To allow customers to see if their order uses eco-packaging, update your checkout page:

```typescript
import EcoPackagingPicker from '@/components/EcoPackagingPicker';
import { PackagingType } from '@/types';

// In your checkout component
const [usesEcoPackaging, setUsesEcoPackaging] = useState(false);
const [packagingType, setPackagingType] = useState<PackagingType>();

// In your JSX
<EcoPackagingPicker
  value={usesEcoPackaging}
  packagingType={packagingType}
  onChangeValue={(usesEco, type) => {
    setUsesEcoPackaging(usesEco);
    setPackagingType(type);
  }}
  label="I use eco-friendly packaging for this order"
/>

// When creating order
const orderData = {
  // ... other order fields
  usesEcoPackaging: usesEcoPackaging,
  packagingType: packagingType,
};

await createOrder(orderData);
// The eco stats will be automatically updated!
```

### 2. For Merchants: View Dashboard

The eco dashboard is already integrated in `merchant-page.tsx`. It will automatically display:
- Total eco orders
- Eco percentage
- Points earned
- Badges unlocked
- Environmental impact
- Next badge progress

### 3. For Customers: Filter Eco-Friendly Merchants

Add this to your home page or merchant listing:

```typescript
import EcoFilterToggle from '@/components/EcoFilterToggle';
import { getEcoFriendlyMerchants } from '@/services/eco';

const [ecoFilterEnabled, setEcoFilterEnabled] = useState(false);
const [merchants, setMerchants] = useState<MerchantAccount[]>([]);

// Load merchants based on filter
useEffect(() => {
  const loadMerchants = async () => {
    if (ecoFilterEnabled) {
      const result = await getEcoFriendlyMerchants(50); // 50% eco threshold
      if (result.success && result.data) {
        setMerchants(result.data);
      }
    } else {
      // Load all merchants normally
      const result = await getAllMerchants();
      if (result.success && result.data) {
        setMerchants(result.data);
      }
    }
  };
  loadMerchants();
}, [ecoFilterEnabled]);

// In your JSX
<EcoFilterToggle
  enabled={ecoFilterEnabled}
  onToggle={setEcoFilterEnabled}
/>
```

### 4. Display Eco Badge on Merchant Cards

```typescript
import EcoBadge from '@/components/EcoBadge';

// In merchant card component
{merchant.ecoStats && merchant.ecoStats.badges.length > 0 && (
  <View style={styles.badgeContainer}>
    {merchant.ecoStats.badges.map((badge) => (
      <EcoBadge
        key={badge}
        badge={badge}
        size="small"
        showName={false}
      />
    ))}
  </View>
)}

// Or show eco percentage
{merchant.ecoStats && merchant.ecoStats.ecoPercentage >= 50 && (
  <View style={styles.ecoIndicator}>
    <Text>🌱 {merchant.ecoStats.ecoPercentage}% Eco-Friendly</Text>
  </View>
)}
```

## 🗄️ Firestore Collections

### merchants/{merchantId}
```json
{
  "storeName": "Green Cafe",
  "ecoStats": {
    "totalOrders": 150,
    "ecoOrders": 120,
    "ecoPercentage": 80,
    "points": 1200,
    "badges": ["green-starter", "eco-champion"],
    "packagingTypes": ["biodegradable", "recyclable"],
    "lastUpdated": "2026-03-13T10:30:00Z"
  }
}
```

### orders/{orderId}
```json
{
  "id": "order123",
  "restaurantId": "merchant456",
  "usesEcoPackaging": true,
  "packagingType": "biodegradable",
  "items": [...],
  "status": "delivered"
}
```

### ecoSuppliers/{supplierId} (Future Use)
```json
{
  "id": "supplier123",
  "name": "Green Pack Malaysia",
  "products": [
    {
      "id": "prod1",
      "name": "Biodegradable Box",
      "type": "biodegradable",
      "pricePerUnit": 0.50
    }
  ],
  "verified": true
}
```

## 🎨 Badge Levels

| Badge | Icon | Required Orders | Points | Color |
|-------|------|----------------|--------|-------|
| Green Starter | 🌱 | 25 | 250 | #90EE90 |
| Eco Champion | 🌿 | 100 | 1000 | #4CAF50 |
| Sustainability Hero | 🏆 | 500 | 5000 | #2E7D32 |

## 📊 Available Service Functions

```typescript
// Initialize eco stats (automatic on first order)
await initializeEcoStats(merchantId);

// Update eco stats (automatic on order creation)
await updateEcoStats(merchantId, usesEcoPackaging, packagingType);

// Get merchant eco stats
const result = await getEcoStats(merchantId);

// Get eco-friendly merchants (min 50% eco)
const result = await getEcoFriendlyMerchants(50);

// Get eco leaderboard (top 10)
const result = await getEcoLeaderboard();

// Get eco suppliers (Phase 3 - future)
const result = await getEcoSuppliers();
```

## 🚀 Next Steps for Full Integration

### 1. Update Checkout Page
Add the `EcoPackagingPicker` to your checkout flow so merchants can mark orders as eco-friendly when they're being created.

**File to update:** `app/checkout.tsx` or wherever orders are created

```typescript
// Add these state variables
const [usesEcoPackaging, setUsesEcoPackaging] = useState(false);
const [packagingType, setPackagingType] = useState<PackagingType>();

// Add the picker in your form
<EcoPackagingPicker
  value={usesEcoPackaging}
  packagingType={packagingType}
  onChangeValue={(usesEco, type) => {
    setUsesEcoPackaging(usesEco);
    setPackagingType(type);
  }}
/>

// Include in order creation
const orderData: Omit<Order, 'id'> = {
  // ... existing fields
  usesEcoPackaging,
  packagingType,
};
```

### 2. Update Home Page
Add the eco filter toggle to let customers filter eco-friendly merchants.

**File to update:** `app/home-page.tsx`

```typescript
import EcoFilterToggle from '@/components/EcoFilterToggle';
import { getEcoFriendlyMerchants } from '@/services/eco';

// Add state
const [ecoFilter, setEcoFilter] = useState(false);

// Update merchant loading logic
// Add filter toggle to UI
```

### 3. Display Badges on Merchant Cards
Show eco badges on merchant listings and detail pages.

**Files to update:** 
- Merchant listing page
- `app/merchant-page.tsx` (customer view, if exists)

### 4. Test the Flow

1. **As Merchant:**
   - Log in as merchant
   - Go to merchant dashboard
   - Click on "Eco-Packaging Dashboard" section
   - Create a new order and mark it as eco-packaged
   - Refresh and see stats update

2. **As Customer:**
   - Browse merchants
   - Toggle "Eco-Friendly Only" filter
   - See only eco-certified merchants
   - View merchant badges

## 🔧 Troubleshooting

### Stats Not Updating?
- Check that `restaurantId` matches merchant's uid
- Verify order is being created with `usesEcoPackaging` field
- Check console for errors in `updateEcoStats`

### Badge Not Showing?
- Ensure merchant has reached threshold (25, 100, or 500 orders)
- Check `ecoStats.badges` array in Firestore
- Verify badge component is imported correctly

### Dashboard Empty?
- Create at least one order with eco-packaging
- Check that merchant is logged in
- Verify `loadEcoStats()` is being called

## 📈 Phase 3 (Future Enhancements)

When you're ready for Phase 3:

1. **Supplier Marketplace**
   - Create `app/eco-supplier-marketplace.tsx`
   - Add supplier CRUD operations
   - Link to merchant dashboard

2. **Social Sharing**
   - Generate shareable cards
   - Add social media integration
   - Track shared eco achievements

3. **Customer Eco Score**
   - Track customer eco purchases
   - Award customer badges
   - Show on profile

## 🎉 Summary

You now have:
- ✅ Full eco-packaging tracking system
- ✅ Merchant analytics dashboard
- ✅ Badge and points system
- ✅ Customer filtering
- ✅ Automatic stats calculation
- ✅ Environmental impact metrics
- ✅ Reusable components

The system is modular and ready to scale!
