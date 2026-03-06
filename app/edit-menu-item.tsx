import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
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
import { storage } from '../config/firebase';
import { getCurrentUser } from '../services/auth';
import { getMenuItem, updateMenuItem } from '../services/database';
import type { MenuItem } from '../types';

// Icons
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

const { width } = Dimensions.get('window');

type Category = 'meal' | 'dessert' | 'drink' | 'vegan' | 'blindbox';

export default function EditMenuItemScreen() {
  const params = useLocalSearchParams();
  const itemId = params.itemId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('meal');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [rating, setRating] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [existingImageURL, setExistingImageURL] = useState<string>('');
  const [currentTime, setCurrentTime] = useState('');
  
  // Dynamic Pricing Fields
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(false);
  const [freshnessHours, setFreshnessHours] = useState('8');
  const [preparedTimeInput, setPreparedTimeInput] = useState('');
  const [expiryTimeInput, setExpiryTimeInput] = useState('');

  useEffect(() => {
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

  useEffect(() => {
    if (itemId) {
      loadMenuItem();
    }
  }, [itemId]);

  const loadMenuItem = async () => {
    try {
      setLoading(true);
      const result = await getMenuItem(itemId);
      
      if (!result.success || !result.data) {
        Alert.alert('Error', 'Menu item not found');
        router.back();
        return;
      }

      const item = result.data;
      setMenuItem(item);
      
      // Populate form fields
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toString());
      setCategory(item.category);
      setRestaurantName(item.restaurantName);
      setRestaurantId(item.restaurantId);
      setRating(item.rating?.toString() || '');
      setExistingImageURL(item.imageURL);
      
      // Dynamic pricing fields
      setDynamicPricingEnabled(item.dynamicPricingEnabled || false);
      setFreshnessHours(item.freshnessHours?.toString() || '8');
      
      if (item.preparedTime) {
        const prepTime = item.preparedTime instanceof Date ? item.preparedTime : new Date();
        setPreparedTimeInput(formatDateTimeForInput(prepTime));
      }
      
      if (item.expiryTime) {
        const expTime = item.expiryTime instanceof Date ? item.expiryTime : new Date();
        setExpiryTimeInput(formatDateTimeForInput(expTime));
      }
    } catch (error) {
      console.error('Error loading menu item:', error);
      Alert.alert('Error', 'Failed to load menu item');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take photos.');
      return;
    }

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
      const response = await fetch(uri);
      const blob = await response.blob();

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `${timestamp}_${randomString}.jpg`;

      const categoryFolderMap: { [key in Category]: string } = {
        'meal': 'Meal',
        'dessert': 'Dessert',
        'drink': 'Drinks',
        'vegan': 'Vegan',
        'blindbox': 'BlindBox',
      };

      const categoryFolder = categoryFolderMap[category];
      
      const categoryPath = `menu-items/${categoryFolder}/${filename}`;
      const categoryRef = ref(storage, categoryPath);
      await uploadBytes(categoryRef, blob);

      const cartPath = `menu-items/Cart/${filename}`;
      const cartRef = ref(storage, cartPath);
      await uploadBytes(cartRef, blob);

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

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in to update items');
      return;
    }

    try {
      setSaving(true);

      // Upload new image if selected
      let imageURL = existingImageURL;
      if (imageUri) {
        imageURL = await uploadImageToStorage(imageUri);
      }

      // Calculate dynamic pricing fields if enabled
      const now = new Date();
      
      let preparedTime: Date;
      if (dynamicPricingEnabled && preparedTimeInput.trim()) {
        try {
          const [datePart, timePart] = preparedTimeInput.trim().split(' ');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hour, minute] = timePart.split(':').map(Number);
          preparedTime = new Date(year, month - 1, day, hour, minute);
          
          if (isNaN(preparedTime.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (error) {
          Alert.alert('Error', 'Invalid Prepared Time format. Use: YYYY-MM-DD HH:MM (e.g., 2026-03-03 09:00)');
          setSaving(false);
          return;
        }
      } else {
        preparedTime = now;
      }
      
      let expiryTime: Date;
      if (dynamicPricingEnabled && expiryTimeInput.trim()) {
        try {
          const [datePart, timePart] = expiryTimeInput.trim().split(' ');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hour, minute] = timePart.split(':').map(Number);
          expiryTime = new Date(year, month - 1, day, hour, minute);
          
          if (isNaN(expiryTime.getTime())) {
            throw new Error('Invalid date');
          }
          
          if (expiryTime <= preparedTime) {
            Alert.alert('Error', 'Expiry time must be after prepared time');
            setSaving(false);
            return;
          }
        } catch (error) {
          Alert.alert('Error', 'Invalid Expiry Time format. Use: YYYY-MM-DD HH:MM (e.g., 2026-03-15 09:00)');
          setSaving(false);
          return;
        }
      } else {
        const hours = parseFloat(freshnessHours) || 8;
        expiryTime = new Date(preparedTime.getTime() + (hours * 60 * 60 * 1000));
      }
      
      const hours = (expiryTime.getTime() - preparedTime.getTime()) / (1000 * 60 * 60);
      
      const discountRules = {
        tier1: { hours: 2, discount: 0 },
        tier2: { hours: 4, discount: 10 },
        tier3: { hours: 6, discount: 25 },
        tier4: { hours: 8, discount: 40 },
        tier5: { hours: 999, discount: 50 },
      };

      // Prepare update data
      const updates: Partial<MenuItem> = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        restaurantName: restaurantName.trim(),
        restaurantId: restaurantId.trim(),
        rating: rating.trim() ? parseFloat(rating) : undefined,
        imageURL,
        originalPrice: parseFloat(price),
        currentPrice: parseFloat(price),
        dynamicPricingEnabled,
        preparedTime,
        expiryTime,
        freshnessHours: hours,
        freshnessStatus: 'fresh' as const,
        discountRules,
        lastPriceUpdate: new Date(),
      };

      const result = await updateMenuItem(itemId, updates);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Menu item updated successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update menu item');
      }
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      Alert.alert('Error', error.message || 'Failed to update menu item');
    } finally {
      setSaving(false);
    }
  };

  const categories: { value: Category; label: string }[] = [
    { value: 'meal', label: 'Meal' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'drink', label: 'Drink' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'blindbox', label: 'Blind Box' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A5D1A" />
          <Text style={styles.loadingText}>Loading menu item...</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.title}>Edit Menu Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Item ID (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item ID</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{itemId}</Text>
            </View>
            <Text style={styles.infoText}>💡 Item ID cannot be changed</Text>
          </View>

          {/* Image Picker */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Product Image</Text>
            {imageUri || existingImageURL ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: imageUri || existingImageURL }} 
                  style={styles.imagePreview} 
                />
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
            <Text style={styles.label}>Category *</Text>
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
            <Text style={styles.label}>Restaurant ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., rest-020"
              value={restaurantId}
              onChangeText={setRestaurantId}
              placeholderTextColor="#999"
            />
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
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Menu Item</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  disabledInput: {
    backgroundColor: '#E8E8E8',
    opacity: 0.7,
  },
  disabledText: {
    fontSize: 16,
    color: '#666',
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
