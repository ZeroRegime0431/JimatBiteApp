# JimatBite App - Build Instructions

## Prerequisites
Before building, make sure you have:
- An Expo account (sign up at https://expo.dev)
- All dependencies installed: `npm install`

---

## 🚀 WHEN READY TO BUILD - RUN THESE COMMANDS:

### Step 1: Install EAS CLI (One-time setup)
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
Enter your Expo account credentials.

### Step 3: Build for Android (APK - For Testing/Direct Installation)
```bash
eas build --platform android --profile preview
```

**What happens:**
- Build takes 10-20 minutes
- You'll get a download link and QR code
- APK will be available for 30 days
- Can be installed directly on Android devices

### Step 4: Build for Production (Google Play Store)
```bash
eas build --platform android --profile production
```

**Note:** This creates an AAB (Android App Bundle) for Google Play Store submission.

---

## 📱 For iOS Build (Requires Apple Developer Account - $99/year)

### Development Build (Testing)
```bash
eas build --platform ios --profile preview
```

### Production Build (App Store)
```bash
eas build --platform ios --profile production
```

---

## 🔍 Check Build Status

### View builds in terminal:
```bash
eas build:list
```

### View builds online:
Go to: https://expo.dev/accounts/[your-account]/projects/JimatBiteApp/builds

---

## 📲 Install APK on Android Device

After build completes:
1. **Scan QR code** shown in terminal with your phone camera
2. **Or click download link** from your phone's browser
3. Download the APK file
4. Open APK and install (enable "Install from Unknown Sources" if prompted)

---

## 🎯 Build Profiles Explained

- **development**: For development with Expo Dev Client
- **preview**: Creates APK for testing (Android) or simulator build (iOS)
- **production**: Creates optimized build for store submission (AAB for Android, IPA for iOS)

---

## 🛠️ Current Configuration

**App Details:**
- Name: JimatBiteApp
- Package: com.jimatbite.app
- Version: 1.0.0
- Android Version Code: 1
- iOS Build Number: 1.0.0

**To update version:**
Edit `app.json` and increment:
- `version`: "1.0.0" → "1.0.1"
- `android.versionCode`: 1 → 2
- `ios.buildNumber`: "1.0.0" → "1.0.1"

---

## 📝 Notes

- First build may take longer (15-25 minutes)
- Subsequent builds are faster (10-15 minutes)
- APK download links expire after 30 days
- You can rebuild anytime with the same commands
- All builds are saved in your Expo dashboard

---

## 🆘 Troubleshooting

**Build fails?**
- Check your internet connection
- Make sure you're logged in: `eas whoami`
- Check build logs at expo.dev

**Can't install APK?**
- Enable "Install from Unknown Sources" in Android settings
- Check your device has enough storage

---

## ✅ Ready to Build?

When your app is complete, just run:
```bash
eas build --platform android --profile preview
```

And you'll get your installable APK! 🎉
