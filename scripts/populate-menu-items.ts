// Script to populate Firestore with menu items
// Run this once to add all menu items to Firestore

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Menu items data structure
const menuItemsData = [
  // DRINKS
  {
    id: 'drink-004',
    name: 'Iced Lemon Tea',
    description: 'Refreshing iced lemon tea with a hint of mint',
    price: 3.5,
    category: 'drink',
    rating: 4.3,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-012',
    restaurantName: 'Cool Sips Cafe',
    // REPLACE THIS URL with your Firebase Storage URL for icedlemontea.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'drink-005',
    name: 'Cold Brew Coffee',
    description: 'Smooth cold brew coffee served without sugar',
    price: 4.8,
    category: 'drink',
    rating: 4.6,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-015',
    restaurantName: 'Daily Grind',
    // REPLACE THIS URL with your Firebase Storage URL for coldbrewcoffee.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'drink-006',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice served chilled',
    price: 4,
    category: 'drink',
    rating: 4.4,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-018',
    restaurantName: 'Juice Junction',
    // REPLACE THIS URL with your Firebase Storage URL for orangejuice.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },

  // MEALS
  {
    id: 'meal-003',
    name: 'Chicken Rice Box',
    description: 'Steamed chicken served with fragrant rice and chili sauce',
    price: 7.5,
    category: 'meal',
    rating: 4.6,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-009',
    restaurantName: 'Uncle Lim Kitchen',
    // REPLACE THIS URL with your Firebase Storage URL for chickenrice.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'meal-004',
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, cheese and house sauce',
    price: 9.9,
    category: 'meal',
    rating: 4.4,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-010',
    restaurantName: 'Burger Bros',
    // REPLACE THIS URL with your Firebase Storage URL for beefburger.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'meal-005',
    name: 'Spaghetti Bolognese',
    description: 'Classic spaghetti with slow-cooked beef bolognese sauce',
    price: 10.5,
    category: 'meal',
    rating: 4.5,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-014',
    restaurantName: 'Pasta Corner',
    // REPLACE THIS URL with your Firebase Storage URL for spaghettibolognese.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'meal-006',
    name: 'Fried Noodles',
    description: 'Wok-fried noodles with vegetables and soy sauce',
    price: 6.8,
    category: 'meal',
    rating: 4.2,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-009',
    restaurantName: 'Uncle Lim Kitchen',
    // REPLACE THIS URL with your Firebase Storage URL for friednoodles.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },

  // DESSERTS
  {
    id: 'dessert-003',
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with a soft and fudgy center',
    price: 5,
    category: 'dessert',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-011',
    restaurantName: 'Sweet Treats Bakery',
    // REPLACE THIS URL with your Firebase Storage URL for chocolatebrownie.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'dessert-004',
    name: 'Cheesecake Slice',
    description: 'Creamy cheesecake with a buttery biscuit base',
    price: 6.5,
    category: 'dessert',
    rating: 4.9,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-011',
    restaurantName: 'Sweet Treats Bakery',
    // REPLACE THIS URL with your Firebase Storage URL for cheesecake.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'dessert-005',
    name: 'Vanilla Cupcake',
    description: 'Soft vanilla cupcake topped with buttercream frosting',
    price: 4.2,
    category: 'dessert',
    rating: 4.5,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-017',
    restaurantName: 'Daily Oven',
    // REPLACE THIS URL with your Firebase Storage URL for vanillacupcake.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'dessert-006',
    name: 'Red Velvet Cake',
    description: 'Moist red velvet cake layered with cream cheese frosting',
    price: 6.8,
    category: 'dessert',
    rating: 4.7,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-011',
    restaurantName: 'Sweet Treats Bakery',
    // REPLACE THIS URL with your Firebase Storage URL for redvelvetcake.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'dessert-007',
    name: 'Chocolate Chip Cookie',
    description: 'Freshly baked cookie with melted chocolate chips',
    price: 3.5,
    category: 'dessert',
    rating: 4.4,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-017',
    restaurantName: 'Daily Oven',
    // REPLACE THIS URL with your Firebase Storage URL for chocchipcookie.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },

  // VEGAN
  {
    id: 'vegan-003',
    name: 'Vegan Buddha Bowl',
    description: 'Mixed grains with roasted vegetables and tahini dressing',
    price: 8.9,
    category: 'vegan',
    rating: 4.7,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-013',
    restaurantName: 'Green Plate',
    // REPLACE THIS URL with your Firebase Storage URL for veganbuddhabowl.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'vegan-004',
    name: 'Vegan Wrap',
    description: 'Whole wheat wrap filled with grilled vegetables and hummus',
    price: 7.2,
    category: 'vegan',
    rating: 4.5,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-013',
    restaurantName: 'Green Plate',
    // REPLACE THIS URL with your Firebase Storage URL for veganwrap.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'vegan-005',
    name: 'Tofu Stir Fry',
    description: 'Stir-fried tofu with mixed vegetables and soy sauce',
    price: 8,
    category: 'vegan',
    rating: 4.6,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-019',
    restaurantName: 'Herbivore Hub',
    // REPLACE THIS URL with your Firebase Storage URL for tofustirfry.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'vegan-006',
    name: 'Quinoa Salad',
    description: 'Quinoa salad with cherry tomatoes, cucumber and lemon dressing',
    price: 7.8,
    category: 'vegan',
    rating: 4.4,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-019',
    restaurantName: 'Herbivore Hub',
    // REPLACE THIS URL with your Firebase Storage URL for quinoasalad.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },

  // BLINDBOX
  {
    id: 'blindbox-003',
    name: 'JimatBite Surprise Box',
    description: 'A surprise mix of leftover meals and snacks for the day',
    price: 5,
    category: 'blindbox',
    rating: 4.8,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-016',
    restaurantName: 'JimatBite Partner Store',
    // REPLACE THIS URL with your Firebase Storage URL for jimatbiteblindbox.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'blindbox-004',
    name: 'Bakery Blind Box',
    description: 'Assorted unsold bakery items from the day',
    price: 4.5,
    category: 'blindbox',
    rating: 4.6,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-011',
    restaurantName: 'Sweet Treats Bakery',
    // REPLACE THIS URL with your Firebase Storage URL for bakeryblindbox.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'blindbox-005',
    name: 'Cafe Blind Box',
    description: 'Mixed drinks and light snacks from cafe leftovers',
    price: 4,
    category: 'blindbox',
    rating: 4.5,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-012',
    restaurantName: 'Cool Sips Cafe',
    // REPLACE THIS URL with your Firebase Storage URL for cafeblindbox.jpg
    imageURL: 'YOUR_FIREBASE_STORAGE_URL_HERE',
  },
  {
    id: 'blindbox-006',
    name: 'Vegan Blind Box',
    description: 'Leftover vegan meals and sides for a surprise pick',
    price: 5.5,
    category: 'blindbox',
    rating: 4.7,
    verified: true,
    isAvailable: true,
    restaurantId: 'rest-013',
    restaurantName: 'Green Plate',
    // REPLACE THIS URL with your Firebase Storage URL for veganblindbox.jpg
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
