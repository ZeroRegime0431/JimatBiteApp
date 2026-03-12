# Eco-Packaging Stats Guide

## How Merchants Increase Their Eco Stats

### 📊 Overview
Eco stats track a merchant's sustainability performance based on their use of eco-friendly packaging. Stats are automatically updated with every order.

---

## 🔄 How Stats Increase

### Step 1: Enable Eco-Packaging
1. **Go to Merchant Dashboard** → Scroll to "🌱 Eco-Packaging Settings"
2. **Toggle "Enable Eco-Packaging"** to ON
3. **Select Default Packaging Type**:
   - 🍃 Biodegradable
   - 🌿 Compostable
   - ♻️ Recyclable
   - 🔄 Reusable
4. **Click "💾 Save Settings"**

### Step 2: Receive Orders
Once eco-packaging is enabled, **every customer order automatically counts as an eco-friendly order**.

### Step 3: Stats Auto-Update
When a customer completes checkout:
- ✅ `totalOrders` increases by 1
- ✅ `ecoOrders` increases by 1 (if merchant has eco-packaging enabled)
- ✅ `points` increases by 10 per eco order
- ✅ `ecoPercentage` = (ecoOrders / totalOrders) × 100
- ✅ Badges unlock at milestones

---

## 🏆 Badge System

### Badge Milestones
| Badge | Requirement | Icon |
|-------|------------|------|
| **Green Starter** | 25 eco orders | 🌱 |
| **Eco Champion** | 100 eco orders | 🏆 |
| **Sustainability Hero** | 500 eco orders | ⭐ |

### How to Earn Badges
- Each order from a merchant with eco-packaging enabled = 1 eco order
- Badges unlock automatically when thresholds are reached
- Previous badges remain unlocked

---

## 📈 Stats Breakdown

### Key Metrics

1. **Total Orders** (`totalOrders`)
   - All orders received (eco + non-eco)
   - Increases by 1 per order

2. **Eco Orders** (`ecoOrders`)
   - Orders with eco-packaging enabled
   - Increases by 1 per order (if `usesEcoPackaging: true`)

3. **Eco Percentage** (`ecoPercentage`)
   - Formula: `(ecoOrders / totalOrders) × 100`
   - Example: 30 eco orders / 40 total orders = 75%

4. **Points** (`points`)
   - 10 points per eco order
   - Used for gamification/leaderboards

5. **Packaging Types** (`packagingTypes`)
   - Array of all packaging types used
   - Automatically adds merchant's default type

---

## 🌟 Example Progression

### Scenario: New Merchant "Green Plate"

#### Week 1: Initial Setup
```javascript
// Merchant enables eco-packaging
usesEcoPackaging: true
defaultPackagingType: 'biodegradable'

// Initial stats (no orders yet)
{
  totalOrders: 0,
  ecoOrders: 0,
  ecoPercentage: 0,
  points: 0,
  badges: [],
  packagingTypes: []
}
```

#### Week 2: After 5 Orders
```javascript
// Customer places 5 orders
// All 5 count as eco orders (usesEcoPackaging: true)

{
  totalOrders: 5,
  ecoOrders: 5,
  ecoPercentage: 100,  // (5/5) × 100
  points: 50,          // 5 × 10
  badges: [],          // Need 25 for first badge
  packagingTypes: ['biodegradable']
}
```

#### Month 2: After 30 Orders
```javascript
// 30 total orders received

{
  totalOrders: 30,
  ecoOrders: 30,
  ecoPercentage: 100,
  points: 300,         // 30 × 10
  badges: ['green-starter'],  // ✅ Unlocked at 25 orders!
  packagingTypes: ['biodegradable']
}
```

#### Month 6: After 120 Orders
```javascript
{
  totalOrders: 120,
  ecoOrders: 120,
  ecoPercentage: 100,
  points: 1200,
  badges: ['green-starter', 'eco-champion'],  // ✅ Second badge unlocked!
  packagingTypes: ['biodegradable']
}
```

---

## 🎯 Customer Experience

### Eco Filter
- **Customers** can toggle "Eco-Friendly Merchants" filter on home page
- **Filters** for merchants with `usesEcoPackaging: true`
- **Shows** only items from eco-friendly restaurants

### Eco Badges on Menu Items
- **🌱 Icon** appears on menu items from eco-friendly merchants
- **Badge text** shows "🌱 X% Eco Orders" (on recommendation cards)
- **Visibility** increases customer awareness

---

## 🔧 Technical Implementation

### Automatic Stats Update
Location: `services/eco.ts` → `updateEcoStats()`

```typescript
// Called automatically in services/database.ts → createOrder()
await updateEcoStats(
  restaurantId,
  merchantUsesEco,      // from merchant settings
  merchantPackagingType  // from merchant settings
);
```

### Filter Logic
Location: `services/eco.ts` → `getMerchantsWithEcoPackaging()`

```typescript
// Queries merchants collection where usesEcoPackaging === true
const q = query(
  merchantsRef,
  where('status', '==', 'approved'),
  where('usesEcoPackaging', '==', true)
);
```

---

## ⚡ Quick Reference

| Action | Effect |
|--------|--------|
| Enable eco-packaging | All future orders count as eco orders |
| Customer places order | +1 totalOrders, +1 ecoOrders, +10 points |
| Disable eco-packaging | Future orders don't count as eco, but stats remain |
| Change packaging type | New type added to `packagingTypes` array |
| 25th eco order | 🌱 Green Starter badge unlocked |
| 100th eco order | 🏆 Eco Champion badge unlocked |
| 500th eco order | ⭐ Sustainability Hero badge unlocked |

---

## 🚨 Important Notes

1. **Stats persist**: Disabling eco-packaging doesn't reset stats
2. **No manual updates**: Stats update automatically via order creation
3. **Filter by enabled status**: Eco filter shows merchants with `usesEcoPackaging: true` (not percentage threshold)
4. **Firebase index required**: Create composite index for `status` + `usesEcoPackaging` fields
5. **Visible immediately**: Once merchant enables eco-packaging, they appear in eco filter

---

## 🔍 Troubleshooting

### "Merchants not showing in eco filter"
- ✅ Check merchant has `usesEcoPackaging: true` in Firestore
- ✅ Create Firebase index: `status` + `usesEcoPackaging`
- ✅ Ensure merchant status is "approved"

### "Eco stats not updating"
- ✅ Check `services/database.ts` calls `updateEcoStats()`
- ✅ Verify merchant ID matches between orders and merchants collection
- ✅ Check console for errors during order creation

### "Badges not unlocking"
- ✅ Verify `ecoOrders` count in Firestore
- ✅ Check thresholds: 25, 100, 500
- ✅ Ensure `calculateBadges()` is called in `updateEcoStats()`

---

## 📞 Summary

**For Merchants:**
1. Enable eco-packaging in settings
2. Receive orders normally
3. Stats automatically increase with each order
4. Watch badges unlock as you reach milestones!

**For Customers:**
1. Toggle eco filter to see sustainable merchants
2. Look for 🌱 badges on menu items
3. Support eco-friendly businesses with your orders
