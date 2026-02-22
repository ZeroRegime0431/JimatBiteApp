# Merchant Signup Flow Documentation

## Overview
The merchant signup flow has been implemented as a 4-step registration process for restaurant/business owners to create accounts on the JimatBite platform.

## Navigation Flow

```
Login/Onboarding
    ↓
signup-selection.tsx (Choose Account Type)
    ↓
    ├─→ signup.tsx (Customer Signup) → Existing flow
    │
    └─→ Merchant Signup Flow (4 Steps):
        ├─→ merchant-signup-step1.tsx (Account Information)
        ├─→ merchant-signup-step2.tsx (Business Information)
        ├─→ merchant-signup-step3.tsx (Address & Fulfillment)
        └─→ merchant-signup-step4.tsx (Bank & Documents)
            └─→ Success → Login
```

## Files Created

### 1. **app/signup-selection.tsx**
- Entry point for signup
- Shows two options: Customer or Merchant account
- Clean UI with card-based selection

### 2. **app/merchant-signup-step1.tsx**
- **Fields:**
  - Full Name
  - Email
  - Password
  - Confirm Password
  - Mobile Number
- **Validation:**
  - All required fields
  - Email format validation
  - Password requirements (6+ chars, uppercase, lowercase, number, special character)
  - Password match confirmation

### 3. **app/merchant-signup-step2.tsx**
- **Fields:**
  - Store/Business Name
  - Business Type (Restaurant, Cafe, Bakery, Other)
  - Cuisine Tags (Bakery, Chinese, Western, Healthy, Noodle)
  - Store Phone (optional)
  - Logo Upload (UI placeholder)
- **Features:**
  - Multi-select cuisine tags
  - Radio button style business type selection

### 4. **app/merchant-signup-step3.tsx**
- **Fields:**
  - Address Line 1
  - Address Line 2 (optional)
  - Post Code
  - City
  - Fulfillment Methods (Pickup, Delivery, Both)
  - Business Hours (24/7 toggle or specific hours)
- **Features:**
  - Smart fulfillment selection (Both excludes individual options)
  - Toggle for 24-hour operation
  - Time input for open/close hours

### 5. **app/merchant-signup-step4.tsx**
- **Fields:**
  - Bank Name
  - Account Holder Name
  - Account Number
  - Business License Upload (UI placeholder)
  - Owner ID Upload (UI placeholder)
- **Features:**
  - Creates Firebase Auth account
  - Saves merchant profile to Firestore
  - Shows success alert with pending approval message

## Database Structure

### New Collection: `merchants`

```typescript
interface MerchantAccount {
  id: string;
  uid: string; // Firebase Auth UID
  
  // Step 1: Account Info
  fullName: string;
  email: string;
  mobileNumber?: string;
  
  // Step 2: Business Info
  storeName: string;
  businessType: string;
  cuisineTags: string[];
  storePhone?: string;
  logoURL?: string;
  
  // Step 3: Address & Fulfillment
  addressLine1: string;
  addressLine2?: string;
  postCode: string;
  city: string;
  fulfillmentMethods: ('pickup' | 'delivery' | 'both')[];
  businessHours: {
    isOpen24Hours: boolean;
    openTime?: string;
    closeTime?: string;
  };
  
  // Step 4: Bank & Documents
  bankDetails: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
  };
  documents: {
    businessLicense?: string;
    ownerID?: string;
  };
  
  // Status & Metadata
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';
  isVerified: boolean;
  rating?: number;
  totalOrders?: number;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}
```

## Database Functions Added

### In `services/database.ts`:

1. **createMerchantProfile(uid, data)** - Create new merchant account
2. **getMerchantProfile(uid)** - Retrieve merchant profile
3. **updateMerchantProfile(uid, data)** - Update merchant information
4. **getAllMerchants(filterStatus?)** - Get all merchants with optional status filter
5. **approveMerchantAccount(uid)** - Approve pending merchant account
6. **rejectMerchantAccount(uid)** - Reject pending merchant account

## User Flow

1. User navigates to signup
2. User selects "Merchant Account" from signup-selection screen
3. User completes 4-step registration:
   - Step 1: Personal account details
   - Step 2: Business information
   - Step 3: Location and operating details
   - Step 4: Banking and verification documents
4. Account is created with `status: 'pending'`
5. Admin reviews and approves/rejects the account
6. Merchant receives notification and can log in

## Implementation Notes

### Data Flow Between Steps
- Each step passes data via router params
- Step 4 collects all params and creates the final merchant profile
- Password is only used for Firebase Auth, not stored in Firestore

### Status Management
- **pending**: Initial status after signup, awaiting admin approval
- **approved**: Admin has verified the merchant
- **rejected**: Admin has rejected the application
- **active**: Approved merchant actively using the platform
- **suspended**: Temporarily disabled account

### Future Enhancements
- Implement actual file upload for logo and documents
- Add email verification
- Create admin dashboard for merchant approval
- Add merchant dashboard page
- Implement merchant menu management
- Add notification system for status updates

## Testing Checklist

- [ ] Navigate from login to signup selection
- [ ] Select merchant option
- [ ] Complete all 4 steps with valid data
- [ ] Test validation on each step
- [ ] Verify back button navigation
- [ ] Check merchant profile created in Firestore
- [ ] Verify Firebase Auth account created
- [ ] Test error handling for failed signup
- [ ] Check pending status set correctly
- [ ] Verify success alert and redirect to login

## To Update Existing Flows

Replace references to `/signup` with `/signup-selection` in:
- Login page
- Onboarding screens
- Any other entry points to the signup flow
