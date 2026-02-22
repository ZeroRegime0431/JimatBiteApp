// app/merchant-signup-step4.tsx
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import { signUp } from '../services/auth';
import { createMerchantProfile } from '../services/database';

export default function MerchantSignupStep4() {
  const params = useLocalSearchParams();
  
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [businessLicenseUri, setBusinessLicenseUri] = useState("");
  const [ownerIDUri, setOwnerIDUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data from params if returning from any step
  useEffect(() => {
    if (params.bankName) setBankName(params.bankName as string);
    if (params.accountHolderName) setAccountHolderName(params.accountHolderName as string);
    if (params.accountNumber) setAccountNumber(params.accountNumber as string);
    if (params.businessLicenseUri) setBusinessLicenseUri(params.businessLicenseUri as string);
    if (params.ownerIDUri) setOwnerIDUri(params.ownerIDUri as string);
  }, []);

  const handleBack = () => {
    // Pass current data back when going to previous step
    router.push({
      pathname: "/merchant-signup-step3",
      params: {
        ...params,
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        businessLicenseUri: businessLicenseUri,
        ownerIDUri: ownerIDUri,
      }
    });
  };

  const pickBusinessLicense = async () => {
    try {
      // Show options: Image or PDF
      Alert.alert(
        'Select Document Type',
        'Choose how you want to upload your business license',
        [
          {
            text: 'Image (JPG/PNG)',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need media library permissions to upload documents.');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setBusinessLicenseUri(result.assets[0].uri);
              }
            }
          },
          {
            text: 'PDF Document',
            onPress: async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets && result.assets[0]) {
                setBusinessLicenseUri(result.assets[0].uri);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error picking business license:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const pickOwnerID = async () => {
    try {
      // Show options: Image or PDF
      Alert.alert(
        'Select Document Type',
        'Choose how you want to upload your owner ID',
        [
          {
            text: 'Image (JPG/PNG)',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need media library permissions to upload documents.');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setOwnerIDUri(result.assets[0].uri);
              }
            }
          },
          {
            text: 'PDF Document',
            onPress: async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets && result.assets[0]) {
                setOwnerIDUri(result.assets[0].uri);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error picking owner ID:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleContinue = async () => {
    // Validation
    if (!bankName.trim()) {
      setError("Please enter bank name (e.g., Maybank) ❌");
      return;
    }

    if (!accountHolderName.trim()) {
      setError("Please enter account holder name ❌");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter account number ❌");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Create Firebase Auth account
      const result = await signUp(
        params.email as string, 
        params.password as string, 
        params.fullName as string
      );

      if (result.success && result.user) {
        // Prepare merchant data from all steps
        const merchantData: any = {
          fullName: params.fullName as string,
          email: params.email as string,
          storeName: params.storeName as string,
          businessType: params.businessType as string,
          cuisineTags: JSON.parse(params.cuisineTags as string || "[]"),
          addressLine1: params.addressLine1 as string,
          postCode: params.postCode as string,
          city: params.city as string,
          fulfillmentMethods: JSON.parse(params.fulfillmentMethods as string || "[]"),
          businessHours: {
            isOpen24Hours: params.isOpen24Hours === "true",
          },
          bankDetails: {
            bankName: bankName.trim(),
            accountHolderName: accountHolderName.trim(),
            accountNumber: accountNumber.trim(),
          },
          status: 'pending' as const,
          isVerified: false,
        };

        // Add optional fields only if they have values
        if (params.mobileNumber && (params.mobileNumber as string).trim()) {
          merchantData.mobileNumber = (params.mobileNumber as string).trim();
        }
        
        if (params.dateOfBirth && (params.dateOfBirth as string).trim()) {
          merchantData.dateOfBirth = (params.dateOfBirth as string).trim();
        }
        
        if (params.countryCode && (params.countryCode as string).trim()) {
          merchantData.countryCode = (params.countryCode as string).trim();
        }
        
        if (params.storePhone && (params.storePhone as string).trim()) {
          merchantData.storePhone = (params.storePhone as string).trim();
        }
        
        if (params.addressLine2 && (params.addressLine2 as string).trim()) {
          merchantData.addressLine2 = (params.addressLine2 as string).trim();
        }

        if (params.logoUri && (params.logoUri as string).trim()) {
          merchantData.logoURL = (params.logoUri as string).trim();
        }

        // Add business hours details if not 24/7
        if (params.isOpen24Hours !== "true") {
          if (params.openTime) {
            merchantData.businessHours.openTime = params.openTime as string;
          }
          if (params.closeTime) {
            merchantData.businessHours.closeTime = params.closeTime as string;
          }
        }

        // Add documents if uploaded
        if (businessLicenseUri || ownerIDUri) {
          merchantData.documents = {};
          if (businessLicenseUri) {
            merchantData.documents.businessLicense = businessLicenseUri;
          }
          if (ownerIDUri) {
            merchantData.documents.ownerID = ownerIDUri;
          }
        }

        // Save merchant profile to Firestore
        const saveResult = await createMerchantProfile(result.user.uid, merchantData);

        if (saveResult.success) {
          Alert.alert(
            "Success! 🎉",
            "Your merchant account has been created! You can now access your merchant dashboard. Your account is pending approval from our team.",
            [
              {
                text: "Go to Dashboard",
                onPress: () => router.replace("/merchant-page")
              }
            ]
          );
        } else {
          setError(saveResult.error || "Failed to save merchant profile");
        }
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (err) {
      console.error('Merchant signup error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Green header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Merchant Account</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 4 OF 4</Text>
        </View>
      </View>

      {/* White body */}
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bodyContent}
        >
          <Text style={styles.sectionTitle}>Bank Details</Text>
          
          <Text style={styles.label}>Bank Name</Text>
          <TextInput
            placeholder="Eg. Maybank"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={bankName}
            onChangeText={setBankName}
          />

          <Text style={styles.label}>Account Holder Name</Text>
          <TextInput
            placeholder="Eg. Nasi Kandar Sdn Bhd"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
          />

          <Text style={styles.label}>Account Number</Text>
          <TextInput
            placeholder="Eg. 123456789012"
            style={styles.input}
            placeholderTextColor="#9e8852"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />

          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={styles.sectionSubtitle}>Upload verification documents</Text>

          <View style={styles.documentRow}>
            <View style={styles.documentItem}>
              <Pressable 
                style={[
                  styles.uploadButton,
                  businessLicenseUri && styles.uploadButtonSelected
                ]}
                onPress={pickBusinessLicense}
              >
                <Text style={styles.uploadIcon}>
                  {businessLicenseUri ? '✅' : '📄'}
                </Text>
                <Text style={styles.uploadText}>Business License</Text>
                {businessLicenseUri && (
                  <Text style={styles.uploadedText}>Uploaded</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.documentItem}>
              <Pressable 
                style={[
                  styles.uploadButton,
                  ownerIDUri && styles.uploadButtonSelected
                ]}
                onPress={pickOwnerID}
              >
                <Text style={styles.uploadIcon}>
                  {ownerIDUri ? '✅' : '🪪'}
                </Text>
                <Text style={styles.uploadText}>Owner ID</Text>
                {ownerIDUri && (
                  <Text style={styles.uploadedText}>Uploaded</Text>
                )}
              </Pressable>
            </View>
          </View>

          <Text style={styles.uploadNote}>
            By uploading, you agree to{"\n"}
            <Text style={styles.termsLink}>Terms of Use</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
            {"\n"}Please upload clear copies in JPG, PNG, or PDF format
          </Text>

          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable 
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#245B2A" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </Pressable>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.bottomLink}>Log in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const HEADER_HEIGHT = 170;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FFD4",
  },
  header: {
    height: HEADER_HEIGHT,
    paddingTop: 40,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 24,
    top: 48,
    paddingVertical: 8,
    paddingRight: 12,
  },
  backArrow: {
    fontSize: 26,
    color: "#245B2A",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#245B2A",
    top: -30,
  },
  stepIndicator: {
    position: "absolute",
    top: 92,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    marginTop: -44,
  },
  bodyContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#245B2A",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#777",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#245B2A",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFECA9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#245B2A",
  },
  documentRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  documentItem: {
    flex: 1,
  },
  uploadButton: {
    backgroundColor: "#FFECA9",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#9e8852",
    borderStyle: "dashed",
  },
  uploadButtonSelected: {
    backgroundColor: "#D4EDDA",
    borderColor: "#28A745",
    borderStyle: "solid",
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 12,
    color: "#245B2A",
    fontWeight: "600",
    textAlign: "center",
  },
  uploadedText: {
    fontSize: 10,
    color: "#28A745",
    fontWeight: "700",
    marginTop: 4,
  },
  uploadNote: {
    fontSize: 10,
    color: "#777",
    textAlign: "center",
    lineHeight: 14,
    marginBottom: 12,
  },
  termsLink: {
    color: "#245B2A",
    fontWeight: "600",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#FFF952",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#245B2A",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  bottomText: {
    fontSize: 13,
    color: "#555",
  },
  bottomLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#245B2A",
  },
});
