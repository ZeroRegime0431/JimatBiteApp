// Temporary screen to populate Firestore with menu items
// Navigate to this screen once to add all items

import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../config/firebase';

export default function PopulateMenuScreen() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>(['Ready to populate menu items...']);
  const [imageUrls, setImageUrls] = useState({
    icedlemontea: '',
    coldbrewcoffee: '',
    orangejuice: '',
    chickenrice: '',
    beefburger: '',
    spaghettibolognese: '',
    friednoodles: '',
    chocolatebrownie: '',
    cheesecake: '',
    vanillacupcake: '',
    redvelvetcake: '',
    chocchipcookie: '',
    veganbuddhabowl: '',
    veganwrap: '',
    tofustirfry: '',
    quinoasalad: '',
    jimatbiteblindbox: '',
    bakeryblindbox: '',
    cafeblindbox: '',
    veganblindbox: '',
  });

  const addLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };

  const menuItemsData = [



    {
      id: 'drink-004',
      name: 'Iced Lemon Tea',
      description: 'Refreshing iced lemon tea with a hint of mint',
      price: 3.5,
      category: 'drink',
      rating: 4.3,
      restaurantId: 'rest-012',
      restaurantName: 'Cool Sips Cafe',
      imageKey: 'icedlemontea',
    },
    {
      id: 'drink-005',
      name: 'Cold Brew Coffee',
      description: 'Smooth cold brew coffee served without sugar',
      price: 4.8,
      category: 'drink',
      rating: 4.6,
      restaurantId: 'rest-015',
      restaurantName: 'Daily Grind',
      imageKey: 'coldbrewcoffee',
    },
    {
      id: 'drink-006',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice served chilled',
      price: 4,
      category: 'drink',
      rating: 4.4,
      restaurantId: 'rest-018',
      restaurantName: 'Juice Junction',
      imageKey: 'orangejuice',
    },


    {
      id: 'meal-003',
      name: 'Chicken Rice Box',
      description: 'Steamed chicken served with fragrant rice and chili sauce',
      price: 7.5,
      category: 'meal',
      rating: 4.6,
      restaurantId: 'rest-009',
      restaurantName: 'Uncle Lim Kitchen',
      imageKey: 'chickenrice',
    },
    {
      id: 'meal-004',
      name: 'Beef Burger',
      description: 'Juicy beef patty with lettuce, cheese and house sauce',
      price: 9.9,
      category: 'meal',
      rating: 4.4,
      restaurantId: 'rest-010',
      restaurantName: 'Burger Bros',
      imageKey: 'beefburger',
    },
    {
      id: 'meal-005',
      name: 'Spaghetti Bolognese',
      description: 'Classic spaghetti with slow-cooked beef bolognese sauce',
      price: 10.5,
      category: 'meal',
      rating: 4.5,
      restaurantId: 'rest-014',
      restaurantName: 'Pasta Corner',
      imageKey: 'spaghettibolognese',
    },
    {
      id: 'meal-006',
      name: 'Fried Noodles',
      description: 'Wok-fried noodles with vegetables and soy sauce',
      price: 6.8,
      category: 'meal',
      rating: 4.2,
      restaurantId: 'rest-009',
      restaurantName: 'Uncle Lim Kitchen',
      imageKey: 'friednoodles',
    },


    {
      id: 'dessert-003',
      name: 'Chocolate Brownie',
      description: 'Rich and fudgy chocolate brownie with walnuts',
      price: 5.0,
      category: 'dessert',
      rating: 4.8,
      restaurantId: 'rest-011',
      restaurantName: 'Sweet Treats Bakery',
      imageKey: 'chocolatebrownie',
    },
    {
      id: 'dessert-004',
      name: 'Cheesecake Slice',
      description: 'Creamy New York style cheesecake with berry topping',
      price: 6.5,
      category: 'dessert',
      rating: 4.9,
      restaurantId: 'rest-011',
      restaurantName: 'Sweet Treats Bakery',
      imageKey: 'cheesecake',
    },
    {
      id: 'dessert-005',
      name: 'Vanilla Cupcake',
      description: 'Fluffy vanilla cupcake with buttercream frosting',
      price: 4.2,
      category: 'dessert',
      rating: 4.3,
      restaurantId: 'rest-017',
      restaurantName: 'Daily Oven',
      imageKey: 'vanillacupcake',
    },
    {
      id: 'dessert-006',
      name: 'Red Velvet Cake',
      description: 'Moist red velvet cake with cream cheese frosting',
      price: 6.8,
      category: 'dessert',
      rating: 4.7,
      restaurantId: 'rest-011',
      restaurantName: 'Sweet Treats Bakery',
      imageKey: 'redvelvetcake',
    },
    {
      id: 'dessert-007',
      name: 'Chocolate Chip Cookie',
      description: 'Freshly baked chocolate chip cookie, warm and gooey',
      price: 3.5,
      category: 'dessert',
      rating: 4.4,
      restaurantId: 'rest-017',
      restaurantName: 'Daily Oven',
      imageKey: 'chocchipcookie',
    },


    {
      id: 'vegan-003',
      name: 'Vegan Buddha Bowl',
      description: 'Nutritious bowl with quinoa, chickpeas, and roasted vegetables',
      price: 8.9,
      category: 'vegan',
      rating: 4.7,
      restaurantId: 'rest-013',
      restaurantName: 'Green Plate',
      imageKey: 'veganbuddhabowl',
    },
    {
      id: 'vegan-004',
      name: 'Vegan Wrap',
      description: 'Whole wheat wrap filled with hummus and fresh veggies',
      price: 7.2,
      category: 'vegan',
      rating: 4.5,
      restaurantId: 'rest-013',
      restaurantName: 'Green Plate',
      imageKey: 'veganwrap',
    },
    {
      id: 'vegan-005',
      name: 'Tofu Stir Fry',
      description: 'Crispy tofu with mixed vegetables in savory sauce',
      price: 8.0,
      category: 'vegan',
      rating: 4.6,
      restaurantId: 'rest-019',
      restaurantName: 'Herbivore Hub',
      imageKey: 'tofustirfry',
    },
    {
      id: 'vegan-006',
      name: 'Quinoa Salad',
      description: 'Fresh quinoa salad with pomegranate and mint dressing',
      price: 7.8,
      category: 'vegan',
      rating: 4.4,
      restaurantId: 'rest-019',
      restaurantName: 'Herbivore Hub',
      imageKey: 'quinoasalad',
    },


    {
      id: 'blindbox-003',
      name: 'JimatBite Surprise Box',
      description: 'Mystery box with assorted items from partner restaurants',
      price: 5.0,
      category: 'blindbox',
      rating: 4.5,
      restaurantId: 'rest-016',
      restaurantName: 'JimatBite Partner Store',
      imageKey: 'jimatbiteblindbox',
    },
    {
      id: 'blindbox-004',
      name: 'Bakery Blind Box',
      description: 'Surprise selection of fresh bakery items',
      price: 4.5,
      category: 'blindbox',
      rating: 4.6,
      restaurantId: 'rest-011',
      restaurantName: 'Sweet Treats Bakery',
      imageKey: 'bakeryblindbox',
    },
    {
      id: 'blindbox-005',
      name: 'Cafe Blind Box',
      description: 'Random beverage and pastry combo from our cafe',
      price: 4.0,
      category: 'blindbox',
      rating: 4.3,
      restaurantId: 'rest-012',
      restaurantName: 'Cool Sips Cafe',
      imageKey: 'cafeblindbox',
    },
    {
      id: 'blindbox-006',
      name: 'Vegan Blind Box',
      description: 'Healthy plant-based meal surprise box',
      price: 5.5,
      category: 'blindbox',
      rating: 4.7,
      restaurantId: 'rest-013',
      restaurantName: 'Green Plate',
      imageKey: 'veganblindbox',
    },
  ];

  const handlePopulate = async () => {
    setLoading(true);
    setLog(['🚀 Starting to populate menu items...']);

    let successCount = 0;
    let errorCount = 0;

    for (const item of menuItemsData) {
      try {
        const imageUrl = imageUrls[item.imageKey as keyof typeof imageUrls];
        
        if (!imageUrl) {
          addLog(`⚠️ Skipping ${item.name} - No image URL provided`);
          errorCount++;
          continue;
        }

        const menuRef = doc(db, 'menuItems', item.id);
        await setDoc(menuRef, {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          rating: item.rating,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          imageURL: imageUrl,
          isAvailable: true,
          createdAt: new Date(),
        });

        addLog(`✅ Added: ${item.name}`);
        successCount++;

        // Small delay to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error: any) {
        addLog(`❌ Failed: ${item.name} - ${error.message}`);
        errorCount++;
      }
    }

    addLog('');
    addLog('📊 Summary:');
    addLog(`✅ Successfully added: ${successCount} items`);
    addLog(`❌ Failed/Skipped: ${errorCount} items`);
    addLog(`📦 Total: ${menuItemsData.length} items`);
    addLog('');
    addLog('🎉 Done! You can now delete this screen.');

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Populate Menu Items</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.instruction}>
          Paste the Firebase Storage URLs for each image below, then click "Populate Firestore"
        </Text>

        {/* Drinks Section */}
        <Text style={styles.sectionTitle}>🍹 Drinks</Text>
        {['icedlemontea', 'coldbrewcoffee', 'orangejuice'].map((key) => {
          const item = menuItemsData.find(item => item.imageKey === key);
          return (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{item?.name || key}</Text>
              <Text style={styles.itemId}>{item?.id}</Text>
              <TextInput
                style={styles.input}
                value={imageUrls[key as keyof typeof imageUrls]}
                onChangeText={(text) => setImageUrls(prev => ({ ...prev, [key]: text }))}
                placeholder="https://firebasestorage.googleapis.com/..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          );
        })}

        {/* Meals Section */}
        <Text style={styles.sectionTitle}>🍜 Meals</Text>
        {['chickenrice', 'beefburger', 'spaghettibolognese', 'friednoodles'].map((key) => {
          const item = menuItemsData.find(item => item.imageKey === key);
          return (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{item?.name || key}</Text>
              <Text style={styles.itemId}>{item?.id}</Text>
              <TextInput
                style={styles.input}
                value={imageUrls[key as keyof typeof imageUrls]}
                onChangeText={(text) => setImageUrls(prev => ({ ...prev, [key]: text }))}
                placeholder="https://firebasestorage.googleapis.com/..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          );
        })}

        {/* Desserts Section */}
        <Text style={styles.sectionTitle}>🍰 Desserts</Text>
        {['chocolatebrownie', 'cheesecake', 'vanillacupcake', 'redvelvetcake', 'chocchipcookie'].map((key) => {
          const item = menuItemsData.find(item => item.imageKey === key);
          return (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{item?.name || key}</Text>
              <Text style={styles.itemId}>{item?.id}</Text>
              <TextInput
                style={styles.input}
                value={imageUrls[key as keyof typeof imageUrls]}
                onChangeText={(text) => setImageUrls(prev => ({ ...prev, [key]: text }))}
                placeholder="https://firebasestorage.googleapis.com/..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          );
        })}

        {/* Vegan Section */}
        <Text style={styles.sectionTitle}>🥗 Vegan</Text>
        {['veganbuddhabowl', 'veganwrap', 'tofustirfry', 'quinoasalad'].map((key) => {
          const item = menuItemsData.find(item => item.imageKey === key);
          return (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{item?.name || key}</Text>
              <Text style={styles.itemId}>{item?.id}</Text>
              <TextInput
                style={styles.input}
                value={imageUrls[key as keyof typeof imageUrls]}
                onChangeText={(text) => setImageUrls(prev => ({ ...prev, [key]: text }))}
                placeholder="https://firebasestorage.googleapis.com/..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          );
        })}

        {/* Blind Box Section */}
        <Text style={styles.sectionTitle}>📦 Blind Box</Text>
        {['jimatbiteblindbox', 'bakeryblindbox', 'cafeblindbox', 'veganblindbox'].map((key) => {
          const item = menuItemsData.find(item => item.imageKey === key);
          return (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{item?.name || key}</Text>
              <Text style={styles.itemId}>{item?.id}</Text>
              <TextInput
                style={styles.input}
                value={imageUrls[key as keyof typeof imageUrls]}
                onChangeText={(text) => setImageUrls(prev => ({ ...prev, [key]: text }))}
                placeholder="https://firebasestorage.googleapis.com/..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          );
        })}

        <Pressable 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handlePopulate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Populate Firestore</Text>
          )}
        </Pressable>

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Log:</Text>
          {log.map((line, index) => (
            <Text key={index} style={styles.logLine}>{line}</Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1A5D1A',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A5D1A',
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#1A5D1A',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemId: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#1A5D1A',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    marginBottom: 40,
  },
  logTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logLine: {
    color: '#0F0',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
