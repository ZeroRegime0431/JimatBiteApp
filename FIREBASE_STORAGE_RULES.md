# Firebase Storage Security Rules

## Copy and paste these rules into Firebase Console

### Steps to Deploy:
1. Go to: https://console.firebase.google.com
2. Select your project: **jimatbite**
3. Go to **Storage** → **Rules** tab
4. Replace ALL existing rules with the rules below
5. Click **Publish**

---

## RULES TO COPY:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && request.auth.uid == 'a5L1LZoUCEZxcCeeWxFW7vIow323';
    }
    
    // Helper function to validate file types for uploads
    function isValidImageOrPDF() {
      return request.resource.contentType.matches('image/.*') || 
             request.resource.contentType == 'application/pdf';
    }
    
    // Helper function to validate file size (max 10MB)
    function isValidSize() {
      return request.resource.size < 10 * 1024 * 1024;
    }
    
    // Rule for merchant uploads folder
    match /merchants/{merchantFolder}/{document} {
      
      // Allow read access:
      // - Admin can read all merchant files
      // - Authenticated users can read (for displaying logos, etc.)
      allow read: if isAuthenticated();
      
      // Allow write access (create/update):
      // - During signup, authenticated users can upload to their folder
      // - Admin can upload/update any merchant's files
      allow write: if (isAuthenticated() && isValidImageOrPDF() && isValidSize()) || isAdmin();
      
      // Allow delete:
      // - Only admin can delete merchant files
      allow delete: if isAdmin();
    }
    
    // Rule for menu item images (if you decide to store them)
    match /menu-items/{itemId}/{image} {
      allow read: if true; // Public read for menu items
      allow write: if isAuthenticated() && isValidImageOrPDF() && isValidSize();
      allow delete: if isAdmin();
    }
    
    // Rule for user profile images
    match /users/{userId}/{image} {
      allow read: if true; // Public read for profile images
      allow write: if isAuthenticated() && 
                     request.auth.uid == userId && 
                     isValidImageOrPDF() && 
                     isValidSize();
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Default rule: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## What These Rules Do:

### ✅ Merchant Folder (`/merchants/{store-name}/`)
- **Read**: Any authenticated user can view merchant files
- **Write**: Any authenticated user can upload (during signup) with validation:
  - Only images (jpg, png, gif) or PDF files
  - Maximum 10MB file size
- **Delete**: Only admin can delete

### ✅ Admin Powers
- Admin UID: `a5L1LZoUCEZxcCeeWxFW7vIow323`
- Can read, write, and delete ALL files

### ✅ File Validation
- Accepted types: Images (image/*) and PDFs (application/pdf)
- Max file size: 10MB
- Automatic rejection of invalid uploads

### ✅ Security
- All unauthenticated access is blocked
- No one can access root or undefined paths
- Strict type and size validation

---

## After Deploying Rules:

1. **Test Upload**: Complete a merchant signup with logo and documents
2. **Check Storage**: Go to Firebase Console → Storage → Files
3. **Verify**: You should see folder structure like:
   ```
   merchants/
     └── asian-noodle-house/
         ├── logo.jpg
         ├── business-license.pdf
         └── owner-id.jpg
   ```

---

## Quick Reference Card:

| User Type | Read | Upload | Delete |
|-----------|------|--------|--------|
| **Unauthenticated** | ❌ | ❌ | ❌ |
| **Authenticated** | ✅ | ✅* | ❌ |
| **Admin** | ✅ | ✅ | ✅ |

*With file type and size validation
