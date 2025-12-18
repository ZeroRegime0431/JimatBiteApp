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
    mojito: '',
    coffee: '',
    strawberryshake: '',
    meetarik: '',
    hotpot: '',
    brownie: '',
    macaron: '',
    risotto: '',
    lasagna: '',
    goodbakery: '',
    urbankoreanfry: '',
  });

  const addLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };

  const menuItemsData = [
    {
      id: 'drink-001',
      name: 'Mojito',
      description: 'Made with white rum, fresh mint leaves, and lime for a crisp.',
      price: 15.00,
      category: 'drink',
      rating: 4.8,
      restaurantId: 'rest-001',
      restaurantName: 'Tropical Bar',
      imageKey: 'mojito',
    },
    {
      id: 'drink-002',
      name: 'Iced Coffee',
      description: 'Espresso, ice milk, and a touch of sweetness - perfect to keep you awake.',
      price: 12.99,
      category: 'drink',
      rating: 4.8,
      restaurantId: 'rest-002',
      restaurantName: 'Coffee Corner',
      imageKey: 'coffee',
    },
    {
      id: 'drink-003',
      name: 'Strawberry Shake',
      description: 'Creamy strawberry shake blended with fresh strawberries and vanilla ice cream.',
      price: 20.00,
      category: 'drink',
      rating: 4.9,
      restaurantId: 'rest-003',
      restaurantName: 'Shake Palace',
      imageKey: 'strawberryshake',
    },
    {
      id: 'meal-001',
      name: 'Mee Tarik Set',
      description: 'Lengthy Ramen, tofu+Meat ball or Mini Cucumber+Hot Roll+Kimchi choose two',
      price: 2.96,
      category: 'meal',
      rating: 4.8,
      restaurantId: 'rest-004',
      restaurantName: 'Asian Noodle House',
      imageKey: 'meetarik',
    },
    {
      id: 'meal-002',
      name: 'Spicy HotPot Set',
      description: 'Mix and match the package, select 5 out of the 10 options',
      price: 2.96,
      category: 'meal',
      rating: 4.9,
      restaurantId: 'rest-004',
      restaurantName: 'Asian Noodle House',
      imageKey: 'hotpot',
    },
    {
      id: 'dessert-001',
      name: 'Chocolate Brownie',
      description: 'Crispy on the outside and tender on the inside, this chocolate brownie is a bestseller.',
      price: 13.00,
      category: 'dessert',
      rating: 4.8,
      restaurantId: 'rest-005',
      restaurantName: 'Sweet Paradise',
      imageKey: 'brownie',
    },
    {
      id: 'dessert-002',
      name: 'Macarons',
      description: 'Try variety of delicious French Macaroons with many different flavors.',
      price: 12.99,
      category: 'dessert',
      rating: 4.8,
      restaurantId: 'rest-005',
      restaurantName: 'Sweet Paradise',
      imageKey: 'macaron',
    },
    {
      id: 'vegan-001',
      name: 'Mushroom Risotto',
      description: 'Juicy mushrooms and chewy risotto. Try this delightful option.',
      price: 15.00,
      category: 'vegan',
      rating: 4.8,
      restaurantId: 'rest-006',
      restaurantName: 'Green Leaf Bistro',
      imageKey: 'risotto',
    },
    {
      id: 'vegan-002',
      name: 'Broccoli Lasagna',
      description: 'Our secret cheesecake recipe makes this incredibly smooth, tender broccoli, rich vegan cheese.',
      price: 12.00,
      category: 'vegan',
      rating: 4.8,
      restaurantId: 'rest-006',
      restaurantName: 'Green Leaf Bistro',
      imageKey: 'lasagna',
    },
    {
      id: 'blindbox-001',
      name: 'Good Ground Bakery',
      description: 'Blind Box Only (After 20:00) - The remaining fresh bread of the day.',
      price: 10.00,
      category: 'blindbox',
      rating: 4.8,
      restaurantId: 'rest-007',
      restaurantName: 'Good Ground Bakery',
      imageKey: 'goodbakery',
    },
    {
      id: 'blindbox-002',
      name: 'K Fry Urban Korean',
      description: 'Fresh fried chicken every day. The remaining fried chicken will be made into blind box!',
      price: 10.99,
      category: 'blindbox',
      rating: 4.9,
      restaurantId: 'rest-008',
      restaurantName: 'K Fry Urban Korean',
      imageKey: 'urbankoreanfry',
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
        {['mojito', 'coffee', 'strawberryshake'].map((key) => {
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
        {['meetarik', 'hotpot'].map((key) => {
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
        {['brownie', 'macaron'].map((key) => {
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
        {['risotto', 'lasagna'].map((key) => {
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
        {['goodbakery', 'urbankoreanfry'].map((key) => {
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
