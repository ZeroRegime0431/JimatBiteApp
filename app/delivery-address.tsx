import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { getCurrentUser } from '../services/auth';
import { deleteAddress, getAddresses } from '../services/database';

const { width } = Dimensions.get('window');

interface Address {
  id: string;
  name: string;
  fullAddress: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
}

export default function DeliveryAddress() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [region, setRegion] = useState({
    latitude: 3.1390, // Default to Malaysia (Kuala Lumpur)
    longitude: 101.6869,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    if (addresses.length > 0 && addresses[0].coordinates) {
      setRegion({
        latitude: addresses[0].coordinates.latitude,
        longitude: addresses[0].coordinates.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  }, [addresses]);

  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
  };

  const getCurrentLocation = async () => {
    if (!locationPermission) return;
    
    try {
      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadAddresses = async () => {
    setLoading(true);
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const result = await getAddresses(user.uid);
    if (result.success && result.data) {
      setAddresses(result.data);
    }
    setLoading(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    const user = getCurrentUser();
    if (!user) return;

    const result = await deleteAddress(user.uid, addressId);
    if (result.success) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
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
          Delivery Address
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A5D1A" />
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved addresses yet</Text>
            <Text style={styles.emptySubtext}>Add your first address</Text>
          </View>
        ) : (
          <>
            {addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressIcon}>
                  <HomeSvg width={28} height={28} />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <Text style={styles.addressText}>{address.fullAddress}</Text>
                </View>
                <Pressable 
                  onPress={() => handleDeleteAddress(address.id)}
                  style={styles.deleteButton}
                >
                  <View style={styles.deleteCircle}>
                    <Text style={styles.deleteIcon}>×</Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </>
        )}

        {/* Map Toggle */}
        {addresses.length > 0 && (
          <Pressable 
            style={styles.mapToggle}
            onPress={() => setShowMap(!showMap)}
          >
            <Text style={styles.mapToggleText}>
              {showMap ? '▼ Hide Map' : '▶ Show Map (View Address Locations)'}
            </Text>
          </Pressable>
        )}

        {/* Collapsible Map */}
        {showMap && addresses.length > 0 && (
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
            >
              {addresses.map((address) => (
                address.coordinates && (
                  <Marker
                    key={address.id}
                    coordinate={{
                      latitude: address.coordinates.latitude,
                      longitude: address.coordinates.longitude,
                    }}
                    title={address.name}
                    description={address.fullAddress}
                  />
                )
              ))}
            </MapView>
            <View style={styles.mapInstructions}>
              <Text style={styles.mapInstructionsText}>
                📍 Showing {addresses.filter(a => a.coordinates).length} saved location(s)
              </Text>
              {locationPermission && (
                <Pressable 
                  onPress={getCurrentLocation}
                  style={styles.recenterButton}
                >
                  <Text style={styles.recenterButtonText}>
                    🎯 Center to My Current Location
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Add New Address Button */}
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/add-new-address')}
        >
          <Text style={styles.addButtonText}>Add New Address</Text>
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
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E0C8',
    top: 12,
    
  },
  addressIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5F2E',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 24,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1A5D1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#1A5D1A',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  mapToggle: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
