// Script to populate Firestore with menu items
// Run this once to add all menu items to Firestore

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Menu items data structure
const menuItemsData = [
  // DRINKS
  {
    id: 'drink-001',
    name: 'Mojito',
    description: 'Made with white rum, fresh mint leaves, and lime for a crisp.',
    price: 15.00,
    category: 'drink',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-001',
    restaurantName: 'Tropical Bar',
    // REPLACE THIS URL with your Firebase Storage URL for mojito.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'drink-002',
    name: 'Iced Coffee',
    description: 'Espresso, ice milk, and a touch of sweetness - perfect to keep you awake.',
    price: 12.99,
    category: 'drink',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-002',
    restaurantName: 'Coffee Corner',
    // REPLACE THIS URL with your Firebase Storage URL for coffee.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'drink-003',
    name: 'Strawberry Shake',
    description: 'Creamy strawberry shake blended with fresh strawberries and vanilla ice cream.',
    price: 20.00,
    category: 'drink',
    rating: 4.9,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-003',
    restaurantName: 'Shake Palace',
    // REPLACE THIS URL with your Firebase Storage URL for strawberryshake.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },

  // MEALS
  {
    id: 'meal-001',
    name: 'Mee Tarik Set',
    description: 'Lengthy Ramen, tofu+Meat ball or Mini Cucumber+Hot Roll+Kimchi choose two',
    price: 2.96,
    category: 'meal',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-004',
    restaurantName: 'Asian Noodle House',
    // REPLACE THIS URL with your Firebase Storage URL for meetarik.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'meal-002',
    name: 'Spicy HotPot Set',
    description: 'Mix and match the package, select 5 out of the 10 options',
    price: 2.96,
    category: 'meal',
    rating: 4.9,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-004',
    restaurantName: 'Asian Noodle House',
    // REPLACE THIS URL with your Firebase Storage URL for hotpot.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },

  // DESSERTS
  {
    id: 'dessert-001',
    name: 'Chocolate Brownie',
    description: 'Crispy on the outside and tender on the inside, this chocolate brownie is a bestseller. Try our new variety.',
    price: 13.00,
    category: 'dessert',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-005',
    restaurantName: 'Sweet Paradise',
    // REPLACE THIS URL with your Firebase Storage URL for brownie.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'dessert-002',
    name: 'Macarons',
    description: 'Try variety of delicious French Macaroons with many different flavors. A colorful and yums dessert.',
    price: 12.99,
    category: 'dessert',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-005',
    restaurantName: 'Sweet Paradise',
    // REPLACE THIS URL with your Firebase Storage URL for macaron.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },

  // VEGAN
  {
    id: 'vegan-001',
    name: 'Mushroom Risotto',
    description: 'Juicy mushrooms and chewy risotto. Try this delightful option.',
    price: 15.00,
    category: 'vegan',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-006',
    restaurantName: 'Green Leaf Bistro',
    // REPLACE THIS URL with your Firebase Storage URL for risotto.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'vegan-002',
    name: 'Broccoli Lasagna',
    description: 'Our secret cheesecake recipe makes this incredibly smooth, tender broccoli, rich vegan cheese.',
    price: 12.00,
    category: 'vegan',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-006',
    restaurantName: 'Green Leaf Bistro',
    // REPLACE THIS URL with your Firebase Storage URL for lasagna.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },

  // BLINDBOX
  {
    id: 'blindbox-001',
    name: 'Good Ground Bakery',
    description: 'Blind Box Only (After 20:00) - The remaining fresh bread of the day, the quantity depends on the type of bread.',
    price: 10.00,
    category: 'blindbox',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-007',
    restaurantName: 'Good Ground Bakery',
    // REPLACE THIS URL with your Firebase Storage URL for goodbakery.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'blindbox-002',
    name: 'K Fry Urban Korean',
    description: 'I insist on selling fresh fried chicken every day. The remaining fried chicken of the day will be made into blind box!',
    price: 10.99,
    category: 'blindbox',
    rating: 4.9,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-008',
    restaurantName: 'K Fry Urban Korean',
    // REPLACE THIS URL with your Firebase Storage URL for urbankoreanfry.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
];

export async function populateMenuItems() {
  console.log('Starting to populate menu items...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const item of menuItemsData) {
    try {
      const menuRef = doc(db, 'menuItems', item.id);
      await setDoc(menuRef, {
        ...item,
        createdAt: new Date(),
      });
      console.log(`✅ Added: ${item.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${item.name}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully added: ${successCount} items`);
  console.log(`❌ Failed: ${errorCount} items`);
  console.log(`📦 Total: ${menuItemsData.length} items`);
}

// Run this function manually or uncomment below to auto-run
// populateMenuItems();
