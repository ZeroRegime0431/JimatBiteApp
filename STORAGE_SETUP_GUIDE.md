# Firebase Storage Setup for Merchant Uploads

## Overview
This implementation organizes merchant uploads in Firebase Storage using store names as folder identifiers.

## Folder Structure
```
merchants/
  ├── asian-noodle-house/
  │   ├── logo.jpg
  │   ├── business-license.pdf
  │   └── owner-id.jpg
  │
  ├── pizza-paradise/
  │   ├── logo.png
  │   ├── business-license.pdf
  │   └── owner-id.jpg
  │
  └── [other-merchant-folders]/
```

## Files Modified/Created

### 1. **services/storage.ts** (NEW)
Contains all storage upload functions:
- `sanitizeStoreName()` - Converts store names to folder-safe format
- `uploadMerchantLogo()` - Uploads logo to `merchants/{store-name}/logo.{ext}`
- `uploadBusinessLicense()` - Uploads license to `merchants/{store-name}/business-license.{ext}`
- `uploadOwnerID()` - Uploads ID to `merchants/{store-name}/owner-id.{ext}`
- `uploadMerchantDocuments()` - Batch upload all documents

### 2. **app/merchant-signup-step4.tsx** (MODIFIED)
Updated to:
- Import storage service
- Upload files to Firebase Storage before creating Firestore profile
- Store Firebase Storage download URLs instead of local URIs

### 3. **storage.rules** (NEW)
Security rules for Firebase Storage access control

## Deploying Security Rules

### Option 1: Using Firebase Console (Recommended for Testing)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **jimatbite**
3. Navigate to **Storage** → **Rules**
4. Copy the contents of `storage.rules` file
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Using Firebase CLI
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init storage

# Deploy storage rules
firebase deploy --only storage:rules
```

## Security Rules Explanation

### Key Features:
- ✅ **Admin Access**: Admin (UID: `a5L1LZoUCEZxcCeeWxFW7vIow323`) can read/write/delete all files
- ✅ **Merchant Uploads**: Authenticated users can upload files during signup
- ✅ **File Validation**: Only images (jpg, png, gif) and PDFs allowed
- ✅ **Size Limit**: Maximum 10MB per file
- ✅ **Read Access**: All authenticated users can read merchant files (for displaying logos)
- ❌ **Delete Restriction**: Only admin can delete merchant files

### Rule Breakdown:
```javascript
// Merchant folder rules
match /merchants/{merchantFolder}/{document} {
  allow read: if isAuthenticated();
  allow write: if (isAuthenticated() && isValidImageOrPDF() && isValidSize()) || isAdmin();
  allow delete: if isAdmin();
}
```

## Testing the Implementation

### Test Scenario 1: New Merchant Signup
1. Start the app: `npx expo start`
2. Go to merchant signup flow
3. Complete all 4 steps including:
   - Step 2: Upload a logo
   - Step 4: Upload business license and owner ID
4. Submit the form
5. Check Firebase Storage console - you should see:
   ```
   merchants/
     └── {sanitized-store-name}/
         ├── logo.{ext}
         ├── business-license.{ext}
         └── owner-id.{ext}
   ```

### Test Scenario 2: Verify Firestore URLs
1. After signup, go to Firestore console
2. Navigate to `merchants` collection
3. Find the newly created merchant document
4. Verify these fields contain Firebase Storage URLs:
   - `logoURL`: Should start with `https://firebasestorage.googleapis.com...`
   - `documents.businessLicense`: Should start with `https://firebasestorage.googleapis.com...`
   - `documents.ownerID`: Should start with `https://firebasestorage.googleapis.com...`

### Test Scenario 3: File Access
1. Log in as the merchant
2. Navigate to merchant profile or dashboard
3. Verify that the logo displays correctly
4. Admin should be able to view all merchant documents

## Store Name Sanitization Examples

The `sanitizeStoreName()` function converts store names to folder-safe format:

| Original Store Name | Sanitized Folder Name |
|--------------------|-----------------------|
| Asian Noodle House | asian-noodle-house |
| Pizza & Pasta Co. | pizza-pasta-co |
| Café Délicieux | cafe-delicieux |
| 123 Burger Bar! | 123-burger-bar |

## Important Notes

### Current Implementation
- Uses **store names** as folder identifiers
- Store names are sanitized (lowercase, hyphens replace special chars)

### Future Improvements
Consider migrating to UID-based folders for better uniqueness:
- Change folder structure to: `merchants/{uid}/`
- Update storage service to use UID instead of store name
- Benefit: No conflicts if merchants change store names

### File Types Supported
- **Images**: .jpg, .jpeg, .png, .gif
- **Documents**: .pdf

### File Size Limits
- Maximum: 10MB per file
- Adjust in `storage.rules` if needed:
  ```javascript
  function isValidSize() {
    return request.resource.size < 10 * 1024 * 1024; // 10MB
  }
  ```

## Troubleshooting

### Error: "Failed to upload files"
- Check internet connection
- Verify Firebase Storage is enabled in Firebase Console
- Ensure storage rules are deployed
- Check file size is under 10MB
- Verify file type is image or PDF

### Error: "Permission denied"
- Deploy the storage rules from `storage.rules` file
- Verify user is authenticated
- Check admin UID matches in rules

### Files not appearing in Firebase Console
- Clear cache and refresh Firebase Console
- Check the exact path: `merchants/{store-name}/`
- Verify upload completed successfully (check app logs)

## Cost Considerations

Firebase Storage pricing (as of 2024):
- **Storage**: $0.026/GB/month
- **Download**: $0.12/GB
- **Upload**: Free
- **Free tier**: 5GB storage, 1GB/day downloads

Estimated costs for 100 merchants:
- ~3 files per merchant × 2MB avg = 600MB = $0.016/month
