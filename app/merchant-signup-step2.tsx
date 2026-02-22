// app/merchant-signup-step2.tsx
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

export default function MerchantSignupStep2() {
  const params = useLocalSearchParams();
  
  const [storeName, setStoreName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [logoUri, setLogoUri] = useState("");
  const [error, setError] = useState("");

  const cuisineTags = ["Bakery", "Chinese", "Western", "Healthy", "Noodle"];
  const businessTypes = ["Restaurant", "Cafe", "Bakery", "Other"];

  // Load data from params if returning from next step or previous step
  useEffect(() => {
    if (params.storeName) setStoreName(params.storeName as string);
    if (params.businessType) setBusinessType(params.businessType as string);
    if (params.storePhone) setStorePhone(params.storePhone as string);
    if (params.logoUri) setLogoUri(params.logoUri as string);
    if (params.cuisineTags) {
      try {
        setSelectedCuisines(JSON.parse(params.cuisineTags as string));
      } catch (e) {
        console.error('Error parsing cuisineTags:', e);
      }
    }
  }, []);

  const handleBack = () => {
    // Pass current data back when going to previous step
    router.push({
      pathname: "/merchant-signup-step1",
      params: {
        ...params,
        storeName: storeName.trim(),
        businessType: businessType.trim(),
        cuisineTags: JSON.stringify(selectedCuisines),
        storePhone: storePhone.trim(),
        logoUri: logoUri,
      }
    });
  };

  const pickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need media library permissions to upload your logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking logo:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleNext = () => {
    // Navigate to next step without validation, preserving all data
    router.push({
      pathname: "/merchant-signup-step3",
      params: {
        ...params,
        storeName: storeName.trim(),
        businessType: businessType.trim(),
        cuisineTags: JSON.stringify(selectedCuisines),
        storePhone: storePhone.trim(),
        logoUri: logoUri,
      }
    });
  };

  const handleContinue = () => {
    // Validation
    if (!storeName.trim()) {
      setError("Please enter your store/business name ❌");
      return;
    }

    if (!businessType.trim()) {
      setError("Please select a business type ❌");
      return;
    }

    if (selectedCuisines.length === 0) {
      setError("Please select at least one cuisine tag ❌");
      return;
    }

    setError("");

    // Navigate to next step with accumulated data
    router.push({
      pathname: "/merchant-signup-step3",
      params: {
        ...params,
        storeName: storeName.trim(),
        businessType: businessType.trim(),
        cuisineTags: JSON.stringify(selectedCuisines),
        storePhone: storePhone.trim(),
        logoUri: logoUri,
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Green header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </Pressable>  
        <Text style={styles.headerTitle}>Merchant Account</Text>
        <Pressable onPress={handleNext} style={styles.forwardButton}>
          <Text style={styles.forwardArrow}>{">"}</Text>
        </Pressable>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 2 OF 4</Text>
        </View>
      </View>

      {/* White body */}
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bodyContent}
        >
          <Text style={styles.label}>Store / Business Name</Text>
          <TextInput
            placeholder="eg. nasi kandar"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={storeName}
            onChangeText={setStoreName}
          />

          <Text style={styles.label}>Business Type</Text>
          <View style={styles.radioGroup}>
            {businessTypes.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.radioButton,
                  businessType === type && styles.radioButtonSelected
                ]}
                onPress={() => setBusinessType(type)}
              >
                <Text style={[
                  styles.radioText,
                  businessType === type && styles.radioTextSelected
                ]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Cuisine Tags</Text>
          <View style={styles.tagGroup}>
            {cuisineTags.map((cuisine) => (
              <Pressable
                key={cuisine}
                style={[
                  styles.tagButton,
                  selectedCuisines.includes(cuisine) && styles.tagButtonSelected
                ]}
                onPress={() => toggleCuisine(cuisine)}
              >
                <Text style={[
                  styles.tagText,
                  selectedCuisines.includes(cuisine) && styles.tagTextSelected
                ]}>
                  {cuisine}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Store Phone</Text>
          <TextInput
            placeholder="+ 123 456 789 (optional)"
            style={styles.input}
            placeholderTextColor="#9e8852"
            keyboardType="phone-pad"
            value={storePhone}
            onChangeText={setStorePhone}
          />

          <Text style={styles.label}>Logo Upload (Optional)</Text>
          <Pressable style={styles.uploadButton} onPress={pickLogo}>
            <Text style={styles.uploadButtonText}>
              {logoUri ? "✓ Logo Uploaded" : "📷 Choose Image"}
            </Text>
            <Text style={[styles.uploadHint, logoUri && { color: '#4CAF50' }]}>
              {logoUri ? "Tap to change logo" : "By uploading, you agree to\nTerms of Use and Privacy Policy"}
            </Text>
          </Pressable>

          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continue</Text>
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
  forwardButton: {
    position: "absolute",
    right: 24,
    top: 48,
    paddingVertical: 8,
    paddingLeft: 12,
  },
  forwardArrow: {
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#245B2A",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFECA9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#245B2A",
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  radioButton: {
    backgroundColor: "#FFECA9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  radioButtonSelected: {
    backgroundColor: "#FFF952",
    borderColor: "#4CAF50",
  },
  radioText: {
    fontSize: 14,
    color: "#556B2F",
    fontWeight: "500",
  },
  radioTextSelected: {
    color: "#245B2A",
    fontWeight: "700",
  },
  tagGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tagButton: {
    backgroundColor: "#FFECA9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tagButtonSelected: {
    backgroundColor: "#FFF952",
    borderColor: "#4CAF50",
  },
  tagText: {
    fontSize: 14,
    color: "#556B2F",
    fontWeight: "500",
  },
  tagTextSelected: {
    color: "#245B2A",
    fontWeight: "700",
  },
  uploadButton: {
    backgroundColor: "#FFECA9",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#9e8852",
    borderStyle: "dashed",
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#245B2A",
    fontWeight: "600",
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 10,
    color: "#777",
    textAlign: "center",
    lineHeight: 14,
  },
  termsLink: {
    color: "#245B2A",
    fontWeight: "600",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
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
