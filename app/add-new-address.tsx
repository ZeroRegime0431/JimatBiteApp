import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { getCurrentUser } from '../services/auth';
import { addAddress } from '../services/database';

const { width, height } = Dimensions.get('window');

export default function AddNewAddress() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 3.1390, // Default to Malaysia (Kuala Lumpur)
    longitude: 101.6869,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 3.1390,
    longitude: 101.6869,
  });
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
    
    if (status === 'granted') {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      setMarkerCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Reverse geocode to get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.replace(/^, |, $/g, '');
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkerCoordinate(coordinate);

    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.replace(/^, |, $/g, '');
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleApply = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for this address');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);

    const addressData = {
      name: name.trim(),
      fullAddress: address.trim(),
      coordinates: markerCoordinate,
      createdAt: new Date(),
    };

    const result = await addAddress(user.uid, addressData);

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Address added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to add address');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
          Add New Address
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Home Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <HomeSvg width={48} height={48} />
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Anna House"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Address Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="778 Locust View Drive Oakland, CA"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Map Dropdown Toggle */}
        <Pressable 
          style={styles.mapToggle}
          onPress={() => setShowMap(!showMap)}
        >
          <Text style={styles.mapToggleText}>
            {showMap ? '▼ Hide Map' : '▶ Show Map (Select Location)'}
          </Text>
          {locationPermission && !showMap && (
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                getCurrentLocation();
              }}
              style={styles.useLocationButton}
            >
              <Text style={styles.useLocationText}>
                {locationLoading ? '...' : '📍 Use Current Location'}
              </Text>
            </Pressable>
          )}
        </Pressable>

        {/* Collapsible Map */}
        {showMap && (
          <View style={styles.mapContainer}>
            {locationLoading ? (
              <View style={styles.mapLoading}>
                <ActivityIndicator size="large" color="#1A5D1A" />
                <Text style={styles.mapLoadingText}>Getting your location...</Text>
              </View>
            ) : (
              <>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={region}
                  onPress={handleMapPress}
                  onRegionChangeComplete={setRegion}
                >
                  <Marker
                    coordinate={markerCoordinate}
                    draggable
                    onDragEnd={handleMapPress}
                  />
                </MapView>
                <View style={styles.mapInstructions}>
                  <Text style={styles.mapInstructionsText}>
                    📍 Tap on the map or drag the marker to select your location
                  </Text>
                  {locationPermission && (
                    <Pressable 
                      onPress={getCurrentLocation}
                      style={styles.recenterButton}
                      disabled={locationLoading}
                    >
                      <Text style={styles.recenterButtonText}>
                        {locationLoading ? 'Loading...' : '🎯 Re-center to Current Location'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* Apply Button */}
        <Pressable 
          style={[styles.applyButton, loading && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.applyButtonText}>Apply</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('/home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/support-page')}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#2D5F2E',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A5D1A',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5F2E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E8E0C8',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mapToggle: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A5D1A',
  },
  mapToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A5D1A',
    textAlign: 'center',
  },
  useLocationButton: {
    marginTop: 8,
    padding: 8,
  },
  useLocationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  mapContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  map: {
    width: '100%',
    height: 300,
  },
  mapLoading: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  mapInstructions: {
    padding: 12,
    backgroundColor: '#FFF9E6',
  },
  mapInstructionsText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  recenterButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  recenterButtonText: {
    fontSize: 13,
    color: '#1A5D1A',
    textAlign: 'center',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonDisabled: {
    backgroundColor: '#A5C9A5',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    height: 64,
    backgroundColor: '#1A5D1A',
    borderRadius: 34,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
