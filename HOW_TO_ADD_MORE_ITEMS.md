# How to Add More Menu Items - JimatBite

You've successfully populated your menu with 11 items! Here's how to add more items in the future.

## 🎯 Method 1: Add Items via Firebase Console (Easiest)

### Step 1: Go to Firestore
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your "jimatbite" project
3. Click **Firestore Database**
4. Click on the **menuItems** collection

### Step 2: Add New Document
1. Click **"Add document"**
2. Auto-generate Document ID (or use custom like `meal-003`)
3. Add these fields:

```
Field Name          | Type      | Value
--------------------|-----------|----------------------------------
id                  | string    | Same as document ID
name                | string    | "Pad Thai Noodles"
description         | string    | "Authentic Thai stir-fried noodles"
price               | number    | 14.50
category            | string    | meal (or drink/dessert/vegan/blindbox)
imageURL            | string    | (Firebase Storage URL - see below)
restaurantId        | string    | rest-009
restaurantName      | string    | Thai Express
rating              | number    | 4.7
isAvailable         | boolean   | true
createdAt           | timestamp | (click "use timestamp")
```

### Step 3: Upload Image (if needed)
1. Go to **Storage** in Firebase Console
2. Navigate to `menu-items/` folder
3. Click **Upload file**
4. Select your image (JPG/PNG, under 500KB recommended)
5. After upload, click the file → Copy download URL
6. Paste URL into the `imageURL` field in Firestore

### Step 4: Verify
- Go back to your app
- Navigate to the category (e.g., Meal category)
- Pull to refresh or restart app
- New item should appear!

---

## 🚀 Method 2: Update Populate Script (For Bulk Additions)

### Step 1: Edit populate-menu.tsx
1. Open `app/populate-menu.tsx`
2. Find the `menuItemsData` array
3. Add new items to the array:

```typescript
{
  id: 'meal-003',
  name: 'Pad Thai Noodles',
  description: 'Authentic Thai stir-fried noodles with peanuts',
  price: 14.50,
  category: 'meal',
  rating: 4.7,
  restaurantId: 'rest-009',
  restaurantName: 'Thai Express',
  imageKey: 'padthai',  // Add this key
},
```

### Step 2: Add Image Input Field
In the same file, update the `imageUrls` state:

```typescript
const [imageUrls, setImageUrls] = useState({
  mojito: '',
  coffee: '',
  // ... existing fields ...
  padthai: '',  // Add new field
});
```

### Step 3: Upload Images & Run
1. Upload new images to Firebase Storage
2. Navigate to `/populate-menu` in your app
3. Paste all image URLs (including new ones)
4. Click "Populate Firestore"
5. New items will be added!

---

## 📝 Method 3: Programmatically via Code

### Create a New Script
Create `scripts/add-single-item.ts`:

```typescript
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

async function addMenuItem() {
  const newItem = {
    id: 'dessert-003',
    name: 'Tiramisu',
    description: 'Classic Italian coffee-flavored dessert',
    price: 16.99,
    category: 'dessert',
    rating: 4.9,
    restaurantId: 'rest-005',
    restaurantName: 'Sweet Paradise',
    imageURL: 'YOUR_FIREBASE_STORAGE_URL',
    isAvailable: true,
    createdAt: new Date(),
  };

  try {
    await setDoc(doc(db, 'menuItems', newItem.id), newItem);
    console.log('✅ Item added successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run it
addMenuItem();
```

---

## 🏷️ Categories Reference

Make sure to use the correct category name:

| Category   | String Value |
|------------|--------------|
| Blind Box  | `'blindbox'` |
| Meals      | `'meal'`     |
| Vegan      | `'vegan'`    |
| Desserts   | `'dessert'`  |
| Drinks     | `'drink'`    |

---

## 🖼️ Image Guidelines

### Recommended Sizes:
- **Width**: 800-1200px
- **Height**: 600-900px (landscape orientation works best)
- **Format**: JPG (for photos), PNG (for graphics)
- **File Size**: Under 500KB for fast loading

### Where to Get Images:
- [Unsplash](https://unsplash.com/s/photos/food)
- [Pexels](https://pexels.com/search/food/)
- [Pixabay](https://pixabay.com/images/search/food/)
- Your own photos!

### Upload to Firebase Storage:
1. Go to Firebase Console → Storage
2. Click `menu-items/` folder
3. Click "Upload file"
4. Select image
5. Copy download URL after upload

---

## ✅ Testing Your New Items

After adding items:

1. **Restart app** or pull to refresh
2. **Navigate to category** (e.g., Drinks)
3. **Verify item appears** with correct:
   - Name
   - Price
   - Description
   - Image
   - Rating
   - Restaurant name

4. **Test functionality**:
   - Click on item (if clickable)
   - Add to cart (if implemented)
   - Check if image loads properly

---

## 🔥 Quick Add Checklist

When adding a new item, make sure you have:

- ✅ **Unique ID** (e.g., `meal-004`, `drink-004`)
- ✅ **Name** (clear and descriptive)
- ✅ **Price** (as number, not string: `15.99` not `"$15.99"`)
- ✅ **Category** (exact string: `meal`, `drink`, `dessert`, `vegan`, `blindbox`)
- ✅ **Description** (engaging, 1-2 sentences)
- ✅ **Image URL** (from Firebase Storage)
- ✅ **Restaurant ID & Name**
- ✅ **Rating** (number: `4.8`)
- ✅ **isAvailable** (boolean: `true` or `false`)
- ✅ **createdAt** (timestamp)

---

## 🚨 Common Mistakes to Avoid

❌ **Wrong category name**: `"drinks"` → Should be `"drink"`  
❌ **Price as string**: `"$15.99"` → Should be number `15.99`  
❌ **Missing imageURL**: Item won't display properly  
❌ **Wrong document ID format**: Use consistent naming like `category-###`  
❌ **Huge image files**: Keep under 500KB for performance  

---

## 💡 Pro Tips

1. **Batch Upload**: Add multiple items at once using the populate script
2. **Consistent Naming**: Use `category-001`, `category-002` format for IDs
3. **Test Images**: Verify image URLs work before adding to Firestore
4. **Update Regularly**: Keep menu fresh with seasonal items
5. **Set Availability**: Use `isAvailable: false` for sold-out items (don't delete!)

---

## 🎉 You're All Set!

Your app now:
- ✅ Fetches menu items from Firestore
- ✅ Displays real images from Firebase Storage
- ✅ Shows loading states
- ✅ Handles empty states
- ✅ Can be easily updated with new items

**No code changes needed to add more items** - just add them to Firestore and they'll appear automatically! 🚀
