# Address Management Feature - Setup Guide

## ✅ Implementation Complete

The address management feature has been successfully implemented with the following components:

### 📱 Pages Created

1. **`delivery-address.tsx`** - Main address list page
   - Displays all saved addresses
   - Shows empty state when no addresses exist
   - Delete functionality for each address
   - "Add New Address" button routes to the add page

2. **`add-new-address.tsx`** - Add new address page
   - Form with Name and Address fields
   - **Collapsible interactive map** - Users can show/hide it
   - Tap on map to select location
   - Drag marker to adjust location
   - "Use Current Location" button (requires permission)
   - Automatic reverse geocoding (coordinates → address)
   - Saves to Firestore with coordinates

3. **Homepage Integration**
   - Address button added below greeting section
   - Routes to delivery-address page
   - Green-themed design matching the app style

### 🗄️ Database Functions Added

All address functions added to `services/database.ts`:
- `addAddress()` - Save new address
- `getAddresses()` - Fetch user's addresses
- `getAddress()` - Get single address
- `updateAddress()` - Update existing address
- `deleteAddress()` - Remove address

### 📦 Dependencies Installed

- ✅ `expo-location` (~18.0.7) - GPS location services
- ✅ `react-native-maps` (1.18.0) - Interactive map component

### 🔧 Configuration Updated

**`app.json`** - Added location permissions:
- iOS location permission messages
- Android location permissions
- Google Maps API key placeholders
- expo-location plugin configured

## 🚀 Next Steps (IMPORTANT)

### 1. Get Google Maps API Keys

You need **Google Maps API keys** for the map to work:

#### For Android:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Maps SDK for Android**
4. Enable **Places API** (for geocoding)
5. Create credentials → API Key
6. Copy the key and replace in `app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ACTUAL_ANDROID_KEY_HERE"
       }
     }
   }
   ```

#### For iOS:
1. Same project in Google Cloud Console
2. Enable **Maps SDK for iOS**
3. Create another API Key (or use same)
4. Replace in `app.json`:
   ```json
   "ios": {
     "config": {
       "googleMapsApiKey": "YOUR_ACTUAL_IOS_KEY_HERE"
     }
   }
   ```

### 2. Build with EAS (Required)

**IMPORTANT**: Maps and Location **DO NOT work in Expo Go**. You must create a development build:

```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --profile development --platform android

# Build for iOS (requires Mac)
eas build --profile development --platform ios
```

### 3. Firestore Security Rules

Add these rules to your Firestore to secure address data:

```javascript
// Add to your firestore.rules file
match /addresses/{addressId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
}
```

### 4. Test the Feature

1. Run the development build on your device
2. Tap the "Delivery Address" button on homepage
3. Tap "Add New Address"
4. Grant location permission when prompted
5. Tap "Show Map" to reveal the interactive map
6. Tap anywhere on the map or drag the marker
7. The address field will auto-fill with the location
8. Enter a name (e.g., "Home", "Office")
9. Tap "Apply" to save

## 🎨 Features Implemented

### Interactive Map (Collapsible)
- ✅ Users can show/hide map using dropdown toggle
- ✅ Tap anywhere to set location
- ✅ Draggable marker
- ✅ "Use Current Location" button
- ✅ "Re-center to Current Location" button
- ✅ Automatic reverse geocoding (shows address from coordinates)
- ✅ Pan and zoom just like Google Maps

### Address Management
- ✅ Save multiple addresses (Home, Office, etc.)
- ✅ Each address has name, full address, and GPS coordinates
- ✅ Delete addresses with confirmation
- ✅ Empty state when no addresses exist
- ✅ Back navigation from all pages

### Design
- ✅ Matches app's green theme
- ✅ Clean, intuitive UI matching the provided mockup
- ✅ Smooth navigation flow

## 🔒 Permissions

The app now requests:
- **Location Permission** - To get user's current location
- Users can deny and still manually enter addresses
- Permission prompts are user-friendly

## 📝 Firestore Data Structure

Each address is stored as:
```javascript
{
  id: "auto-generated-id",
  userId: "user-uid",
  name: "Home",
  fullAddress: "778 Locust View Drive Oakland, CA",
  coordinates: {
    latitude: 37.8044,
    longitude: -122.2712
  },
  createdAt: Timestamp
}
```

## 🎯 Future Enhancements (Optional)

You can extend this feature with:
- Set default/primary address
- Edit existing addresses
- Show restaurants on the same map
- Calculate delivery radius
- Filter restaurants by distance
- Delivery fee calculation based on distance

## 🐛 Troubleshooting

### Map not showing?
- Install dependencies: `npm install`
- Build with EAS (not Expo Go)
- Check API keys in `app.json`
- Verify Google Cloud billing is enabled

### Location permission denied?
- Check app settings on device
- Location can be set manually by typing address

### Reverse geocoding not working?
- Enable **Geocoding API** in Google Cloud Console
- Check API key has proper permissions

---

**Status**: ✅ Fully Implemented and Ready to Test (after EAS build + API keys)
