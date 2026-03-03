import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { db, storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';

// Icons
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

const { width } = Dimensions.get('window');

type Category = 'meal' | 'dessert' | 'drink' | 'vegan' | 'blindbox';

export default function AddMenuItemScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('meal');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [itemId, setItemId] = useState('');
  const [rating, setRating] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [totalCategoryItems, setTotalCategoryItems] = useState(0);
  
  // Dynamic Pricing Fields
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(false);
  const [freshnessHours, setFreshnessHours] = useState('8');
  const [preparedTimeInput, setPreparedTimeInput] = useState('');
  const [expiryTimeInput, setExpiryTimeInput] = useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    fetchRestaurantCount();
    fetchCategoryItemCount();
  }, []);

  React.useEffect(() => {
    fetchCategoryItemCount();
  }, [category]);

  const fetchRestaurantCount = async () => {
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const q = query(menuItemsRef);
      const snapshot = await getDocs(q);
      
      // Get unique restaurant IDs
      const restaurantIds = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.restaurantId) {
          restaurantIds.add(data.restaurantId);
        }
      });
      
      const count = restaurantIds.size;
      setTotalRestaurants(count);
      
      // Auto-generate next restaurant ID
      const nextId = `rest-${String(count + 9).padStart(3, '0')}`;
      setRestaurantId(nextId);
    } catch (error) {
      console.error('Error fetching restaurant count:', error);
      // Default to rest-020 if error
      setRestaurantId('rest-020');
      setTotalRestaurants(11);
    }
  };

  const fetchCategoryItemCount = async () => {
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const q = query(menuItemsRef);
      const snapshot = await getDocs(q);
      
      // Count items in selected category
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category === category) {
          count++;
        }
      });
      
      setTotalCategoryItems(count);
      
      // Auto-generate next item ID based on category
      const nextId = `${category}-${String(count + 1).padStart(3, '0')}`;
      setItemId(nextId);
    } catch (error) {
      console.error('Error fetching category item count:', error);
      // Default to category-001 if error
      setItemId(`${category}-001`);
      setTotalCategoryItems(0);
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take photos.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageToStorage = async (uri: string): Promise<string> => {
    try {
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `${timestamp}_${randomString}.jpg`;

      // Map category to folder name
      const categoryFolderMap: { [key in Category]: string } = {
        'meal': 'Meal',
        'dessert': 'Dessert',
        'drink': 'Drinks',
        'vegan': 'Vegan',
        'blindbox': 'BlindBox',
      };

      const categoryFolder = categoryFolderMap[category];
      
      // Upload to category folder
      const categoryPath = `menu-items/${categoryFolder}/${filename}`;
      const categoryRef = ref(storage, categoryPath);
      await uploadBytes(categoryRef, blob);

      // Also upload to Cart folder (always)
      const cartPath = `menu-items/Cart/${filename}`;
      const cartRef = ref(storage, cartPath);
      await uploadBytes(cartRef, blob);

      // Get download URL from category folder
      const downloadURL = await getDownloadURL(categoryRef);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter description');
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (!restaurantName.trim()) {
      Alert.alert('Error', 'Please enter restaurant name');
      return;
    }
    if (!restaurantId.trim()) {
      Alert.alert('Error', 'Please enter restaurant ID');
      return;
    }
    if (!itemId.trim()) {
      Alert.alert('Error', 'Please enter item ID');
      return;
    }
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add items');
      return;
    }

    try {
      setLoading(true);

      // Upload image first
      const imageURL = await uploadImageToStorage(imageUri);

      // Calculate dynamic pricing fields if enabled
      const now = new Date();
      
      // Parse prepared time (format: YYYY-MM-DD HH:MM)
      let preparedTime: Date;
      if (dynamicPricingEnabled && preparedTimeInput.trim()) {
        try {
          // Parse format like "2026-03-03 09:00"
          const [datePart, timePart] = preparedTimeInput.trim().split(' ');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hour, minute] = timePart.split(':').map(Number);
          preparedTime = new Date(year, month - 1, day, hour, minute);
          
          if (isNaN(preparedTime.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (error) {
          Alert.alert('Error', 'Invalid Prepared Time format. Use: YYYY-MM-DD HH:MM (e.g., 2026-03-03 09:00)');
          setLoading(false);
          return;
        }
      } else {
        preparedTime = now;
      }
      
      // Parse expiry time (format: YYYY-MM-DD HH:MM)
      let expiryTime: Date;
      if (dynamicPricingEnabled && expiryTimeInput.trim()) {
        try {
          // Parse format like "2026-03-15 09:00"
          const [datePart, timePart] = expiryTimeInput.trim().split(' ');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hour, minute] = timePart.split(':').map(Number);
          expiryTime = new Date(year, month - 1, day, hour, minute);
          
          if (isNaN(expiryTime.getTime())) {
            throw new Error('Invalid date');
          }
          
          // Validate expiry is after prepared
          if (expiryTime <= preparedTime) {
            Alert.alert('Error', 'Expiry time must be after prepared time');
            setLoading(false);
            return;
          }
        } catch (error) {
          Alert.alert('Error', 'Invalid Expiry Time format. Use: YYYY-MM-DD HH:MM (e.g., 2026-03-15 09:00)');
          setLoading(false);
          return;
        }
      } else {
        const hours = parseFloat(freshnessHours) || 8;
        expiryTime = new Date(preparedTime.getTime() + (hours * 60 * 60 * 1000));
      }
      
      // Calculate freshness hours from the times
      const hours = (expiryTime.getTime() - preparedTime.getTime()) / (1000 * 60 * 60);
      
      // Default discount rules
      const discountRules = {
        tier1: { hours: 2, discount: 0 },      // 0-2 hours: Full price
        tier2: { hours: 4, discount: 10 },     // 2-4 hours: 10% off
        tier3: { hours: 6, discount: 25 },     // 4-6 hours: 25% off
        tier4: { hours: 8, discount: 40 },     // 6-8 hours: 40% off
        tier5: { hours: 999, discount: 50 },   // 8+ hours: 50% off
      };

      // Prepare menu item data
      const menuItemData = {
        id: itemId.trim(),
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        restaurantName: restaurantName.trim(),
        restaurantId: restaurantId.trim(),
        rating: rating.trim() ? parseFloat(rating) : undefined,
        imageURL,
        isAvailable: true,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        // Dynamic Pricing Fields
        originalPrice: parseFloat(price),
        currentPrice: parseFloat(price),
        dynamicPricingEnabled,
        preparedTime: Timestamp.fromDate(preparedTime),
        expiryTime: Timestamp.fromDate(expiryTime),
        freshnessHours: hours,
        freshnessStatus: 'fresh' as const,
        discountRules,
        lastPriceUpdate: serverTimestamp(),
      };

      // Add to Firestore with custom document ID (category-id format)
      const menuItemDocRef = doc(db, 'menuItems', itemId.trim());
      await setDoc(menuItemDocRef, menuItemData);

      Alert.alert(
        'Success!',
        'Menu item added successfully',
        [
          {
            text: 'Add Another',
            onPress: () => {
              // Reset form
              setName('');
              setDescription('');
              setPrice('');
              setCategory('meal');
              setRestaurantName('');
              setRestaurantId('');
              setItemId('');
              setRating('');
              setImageUri(null);
              setDynamicPricingEnabled(false);
              setFreshnessHours('8');
              setPreparedTimeInput('');
              setExpiryTimeInput('');
              fetchRestaurantCount();
              fetchCategoryItemCount();
            },
          },
          {
            text: 'Go Back',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      Alert.alert('Error', error.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const categories: { value: Category; label: string }[] = [
    { value: 'meal', label: 'Meal' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'drink', label: 'Drink' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'blindbox', label: 'Blind Box' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.timeText}>{currentTime}</Text>
      </View>

      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <Text style={styles.title}>Add Menu Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Image Picker */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Product Image *</Text>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <Pressable style={styles.changeImageButton} onPress={pickImage}>
                  <Text style={styles.changeImageText}>Change Image</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
                <Text style={styles.imagePlaceholderSubtext}>Add Product Image</Text>
                <View style={styles.imageButtonsRow}>
                  <Pressable style={styles.imageButton} onPress={pickImage}>
                    <Text style={styles.imageButtonText}>Choose from Gallery</Text>
                  </Pressable>
                  <Pressable style={[styles.imageButton, styles.cameraButton]} onPress={takePhoto}>
                    <Text style={styles.imageButtonText}>Take Photo</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Nasi Lemak Special"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your dish..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (RM) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12.99"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Category *</Text>
              <Text style={styles.helperText}>
                ({totalCategoryItems} items in {category})
              </Text>
            </View>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    category === cat.value && styles.categoryChipSelected,
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.value && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Item ID */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Item ID *</Text>
              <Text style={styles.helperText}>
                (Next available: {itemId})
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., meal-001"
              value={itemId}
              onChangeText={setItemId}
              placeholderTextColor="#999"
            />
          </View>

          {/* Restaurant Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Warung Pak Ali"
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholderTextColor="#999"
            />
          </View>

          {/* Restaurant ID */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Restaurant ID *</Text>
              <Text style={styles.helperText}>
                (Total restaurants: {totalRestaurants})
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., rest-020"
              value={restaurantId}
              onChangeText={setRestaurantId}
              placeholderTextColor="#999"
            />
            <Text style={styles.infoText}>
              💡 Auto-generated. Edit if using existing restaurant.
            </Text>
          </View>

          {/* Rating (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rating (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 4.5"
              value={rating}
              onChangeText={setRating}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Dynamic Pricing Section */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>⏰ Dynamic Pricing</Text>
          
          {/* Enable Dynamic Pricing Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <Text style={styles.label}>Enable Dynamic Pricing</Text>
                <Text style={styles.infoText}>Automatically lower price as item ages</Text>
              </View>
              <Pressable
                style={[
                  styles.toggle,
                  dynamicPricingEnabled && styles.toggleActive,
                ]}
                onPress={() => setDynamicPricingEnabled(!dynamicPricingEnabled)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    dynamicPricingEnabled && styles.toggleThumbActive,
                  ]}
                />
              </Pressable>
            </View>
          </View>

          {/* Prepared Time */}
          {dynamicPricingEnabled && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prepared Time (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD HH:MM (e.g., 2026-03-03 09:00)"
                value={preparedTimeInput}
                onChangeText={setPreparedTimeInput}
                placeholderTextColor="#999"
              />
              <Text style={styles.infoText}>
                📅 Format: YYYY-MM-DD HH:MM (e.g., 2026-03-03 09:00)
              </Text>
              <Text style={styles.infoText}>
                💡 Leave empty to use current time
              </Text>
            </View>
          )}

          {/* Expiry Time */}
          {dynamicPricingEnabled && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expiry Time (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD HH:MM (e.g., 2026-03-15 09:00)"
                value={expiryTimeInput}
                onChangeText={setExpiryTimeInput}
                placeholderTextColor="#999"
              />
              <Text style={styles.infoText}>
                📅 Format: YYYY-MM-DD HH:MM (e.g., 2026-03-15 09:00)
              </Text>
              <Text style={styles.infoText}>
                💡 Leave empty to auto-calculate from freshness hours
              </Text>
            </View>
          )}

          {/* Freshness Duration */}
          {dynamicPricingEnabled && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Freshness Duration (hours)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 8"
                value={freshnessHours}
                onChangeText={setFreshnessHours}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
              <Text style={styles.infoText}>
                💡 Used only if Expiry Time is not specified. Items will be discounted as they age.
              </Text>
              {freshnessHours && !isNaN(parseFloat(freshnessHours)) && !expiryTimeInput.trim() && (
                <View style={styles.pricingPreview}>
                  <Text style={styles.pricingPreviewTitle}>Price Timeline:</Text>
                  <Text style={styles.pricingPreviewItem}>⏱️ 0-2 hrs: RM{price || '0.00'} (Full Price)</Text>
                  <Text style={styles.pricingPreviewItem}>⏱️ 2-4 hrs: RM{price ? (parseFloat(price) * 0.9).toFixed(2) : '0.00'} (10% off)</Text>
                  <Text style={styles.pricingPreviewItem}>⏱️ 4-6 hrs: RM{price ? (parseFloat(price) * 0.75).toFixed(2) : '0.00'} (25% off)</Text>
                  <Text style={styles.pricingPreviewItem}>⏱️ 6+ hrs: RM{price ? (parseFloat(price) * 0.6).toFixed(2) : '0.00'} (40% off)</Text>
                </View>
              )}
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Publish Menu Item</Text>
            )}
          </Pressable>

          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#F4FFC9',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePlaceholderSubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  cameraButton: {
    backgroundColor: '#1976D2',
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#fff',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabelContainer: {
    flex: 1,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#2E7D32',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  pricingPreview: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  pricingPreviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0277BD',
    marginBottom: 8,
  },
  pricingPreviewItem: {
    fontSize: 13,
    color: '#01579B',
    marginBottom: 4,
    paddingLeft: 8,
  },
});
