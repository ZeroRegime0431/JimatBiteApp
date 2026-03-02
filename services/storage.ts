// Storage service for uploading files to Firebase Storage
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Sanitize store name for use as a folder name
 * Converts to lowercase, replaces spaces and special chars with hyphens
 */
export const sanitizeStoreName = (storeName: string): string => {
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Get file extension from URI or MIME type
 */
const getFileExtension = (uri: string, mimeType?: string): string => {
  // Try to get extension from URI
  const uriParts = uri.split('.');
  if (uriParts.length > 1) {
    const ext = uriParts[uriParts.length - 1].toLowerCase();
    // Check if it's a valid common extension
    if (['jpg', 'jpeg', 'png', 'pdf', 'gif'].includes(ext)) {
      return ext;
    }
  }

  // Fallback to MIME type
  if (mimeType) {
    const mimeMap: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/pdf': 'pdf',
    };
    return mimeMap[mimeType] || 'jpg';
  }

  return 'jpg'; // Default fallback
};

/**
 * Convert URI to Blob for upload
 */
const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

/**
 * Upload merchant logo to Firebase Storage
 * @param storeName - Store name used to create folder
 * @param uri - Local file URI
 * @returns Download URL from Firebase Storage
 */
export const uploadMerchantLogo = async (
  storeName: string,
  uri: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!uri) {
      return { success: false, error: 'No file URI provided' };
    }

    const sanitizedName = sanitizeStoreName(storeName);
    const blob = await uriToBlob(uri);
    const extension = getFileExtension(uri, blob.type);
    
    // Create storage reference: merchants/{sanitized-store-name}/logo.{ext}
    const storageRef = ref(storage, `merchants/${sanitizedName}/logo.${extension}`);
    
    // Upload file
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { success: true, url: downloadURL };
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return { success: false, error: error.message || 'Failed to upload logo' };
  }
};

/**
 * Upload merchant business license to Firebase Storage
 * @param storeName - Store name used to create folder
 * @param uri - Local file URI
 * @returns Download URL from Firebase Storage
 */
export const uploadBusinessLicense = async (
  storeName: string,
  uri: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!uri) {
      return { success: false, error: 'No file URI provided' };
    }

    const sanitizedName = sanitizeStoreName(storeName);
    const blob = await uriToBlob(uri);
    const extension = getFileExtension(uri, blob.type);
    
    // Create storage reference: merchants/{sanitized-store-name}/business-license.{ext}
    const storageRef = ref(storage, `merchants/${sanitizedName}/business-license.${extension}`);
    
    // Upload file
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { success: true, url: downloadURL };
  } catch (error: any) {
    console.error('Error uploading business license:', error);
    return { success: false, error: error.message || 'Failed to upload business license' };
  }
};

/**
 * Upload merchant owner ID to Firebase Storage
 * @param storeName - Store name used to create folder
 * @param uri - Local file URI
 * @returns Download URL from Firebase Storage
 */
export const uploadOwnerID = async (
  storeName: string,
  uri: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!uri) {
      return { success: false, error: 'No file URI provided' };
    }

    const sanitizedName = sanitizeStoreName(storeName);
    const blob = await uriToBlob(uri);
    const extension = getFileExtension(uri, blob.type);
    
    // Create storage reference: merchants/{sanitized-store-name}/owner-id.{ext}
    const storageRef = ref(storage, `merchants/${sanitizedName}/owner-id.${extension}`);
    
    // Upload file
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { success: true, url: downloadURL };
  } catch (error: any) {
    console.error('Error uploading owner ID:', error);
    return { success: false, error: error.message || 'Failed to upload owner ID' };
  }
};

/**
 * Upload all merchant documents at once
 * @param storeName - Store name used to create folder
 * @param logoUri - Logo file URI (optional)
 * @param businessLicenseUri - Business license URI (optional)
 * @param ownerIDUri - Owner ID URI (optional)
 * @returns Object with all download URLs
 */
export const uploadMerchantDocuments = async (
  storeName: string,
  logoUri?: string,
  businessLicenseUri?: string,
  ownerIDUri?: string
): Promise<{
  success: boolean;
  logoURL?: string;
  businessLicenseURL?: string;
  ownerIDURL?: string;
  error?: string;
}> => {
  try {
    const results: {
      logoURL?: string;
      businessLicenseURL?: string;
      ownerIDURL?: string;
    } = {};

    // Upload logo if provided
    if (logoUri) {
      const logoResult = await uploadMerchantLogo(storeName, logoUri);
      if (logoResult.success && logoResult.url) {
        results.logoURL = logoResult.url;
      } else {
        return { success: false, error: logoResult.error || 'Failed to upload logo' };
      }
    }

    // Upload business license if provided
    if (businessLicenseUri) {
      const licenseResult = await uploadBusinessLicense(storeName, businessLicenseUri);
      if (licenseResult.success && licenseResult.url) {
        results.businessLicenseURL = licenseResult.url;
      } else {
        return { success: false, error: licenseResult.error || 'Failed to upload business license' };
      }
    }

    // Upload owner ID if provided
    if (ownerIDUri) {
      const ownerIDResult = await uploadOwnerID(storeName, ownerIDUri);
      if (ownerIDResult.success && ownerIDResult.url) {
        results.ownerIDURL = ownerIDResult.url;
      } else {
        return { success: false, error: ownerIDResult.error || 'Failed to upload owner ID' };
      }
    }

    return { success: true, ...results };
  } catch (error: any) {
    console.error('Error uploading merchant documents:', error);
    return { success: false, error: error.message || 'Failed to upload documents' };
  }
};
