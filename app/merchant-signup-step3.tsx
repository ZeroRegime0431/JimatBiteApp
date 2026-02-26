// app/merchant-signup-step3.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";

export default function MerchantSignupStep3() {
  const params = useLocalSearchParams();
  
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postCode, setPostCode] = useState("");
  const [city, setCity] = useState("");
  const [selectedFulfillment, setSelectedFulfillment] = useState<string[]>([]);
  const [isOpen24Hours, setIsOpen24Hours] = useState(false);
  const [openTime, setOpenTime] = useState("10:00 AM");
  const [closeTime, setCloseTime] = useState("10:00 PM");
  const [error, setError] = useState("");

  const fulfillmentOptions = ["Pickup", "Delivery", "Both"];

  // Load data from params if returning from next step or previous step
  useEffect(() => {
    if (params.addressLine1) setAddressLine1(params.addressLine1 as string);
    if (params.addressLine2) setAddressLine2(params.addressLine2 as string);
    if (params.postCode) setPostCode(params.postCode as string);
    if (params.city) setCity(params.city as string);
    if (params.fulfillmentMethods) {
      try {
        setSelectedFulfillment(JSON.parse(params.fulfillmentMethods as string));
      } catch (e) {
        console.error('Error parsing fulfillmentMethods:', e);
      }
    }
    if (params.isOpen24Hours) setIsOpen24Hours(params.isOpen24Hours === "true");
    if (params.openTime) setOpenTime(params.openTime as string);
    if (params.closeTime) setCloseTime(params.closeTime as string);
  }, []);

  const handleBack = () => {
    // Pass current data back when going to previous step
    router.push({
      pathname: "/merchant-signup-step2",
      params: {
        ...params,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        postCode: postCode.trim(),
        city: city.trim(),
        fulfillmentMethods: JSON.stringify(selectedFulfillment),
        isOpen24Hours: isOpen24Hours.toString(),
        openTime: openTime,
        closeTime: closeTime,
      }
    });
  };

  const toggleFulfillment = (option: string) => {
    if (option === "Both") {
      // If "Both" is selected, clear others and set Both
      setSelectedFulfillment(["Both"]);
    } else {
      // Remove "Both" if individual option is selected
      const filtered = selectedFulfillment.filter(f => f !== "Both");
      if (filtered.includes(option)) {
        setSelectedFulfillment(filtered.filter(f => f !== option));
      } else {
        setSelectedFulfillment([...filtered, option]);
      }
    }
  };

  const handleNext = () => {
    // Navigate to next step without validation, preserving all data
    router.push({
      pathname: "/merchant-signup-step4",
      params: {
        ...params,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        postCode: postCode.trim(),
        city: city.trim(),
        fulfillmentMethods: JSON.stringify(selectedFulfillment),
        isOpen24Hours: isOpen24Hours.toString(),
        openTime: openTime,
        closeTime: closeTime,
      }
    });
  };

  const handleContinue = () => {
    // Validation
    if (!addressLine1.trim()) {
      setError("Please enter Address Line 1 (Street/Building) ❌");
      return;
    }

    if (!postCode.trim()) {
      setError("Please enter Post Code ❌");
      return;
    }

    if (!city.trim()) {
      setError("Please enter City ❌");
      return;
    }

    if (selectedFulfillment.length === 0) {
      setError("Please select at least one fulfillment method ❌");
      return;
    }

    setError("");

    // Navigate to next step with accumulated data
    router.push({
      pathname: "/merchant-signup-step4",
      params: {
        ...params,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        postCode: postCode.trim(),
        city: city.trim(),
        fulfillmentMethods: JSON.stringify(selectedFulfillment),
        isOpen24Hours: isOpen24Hours.toString(),
        openTime: openTime,
        closeTime: closeTime,
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
          <Text style={styles.stepText}>Step 3 OF 4</Text>
        </View>
      </View>

      {/* White body */}
      <View style={styles.body}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Address Line 1</Text>
          <TextInput
            placeholder="Street/Building"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={addressLine1}
            onChangeText={setAddressLine1}
          />

          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            placeholder="Street/Building (Optional)"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={addressLine2}
            onChangeText={setAddressLine2}
          />

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Post Code</Text>
              <TextInput
                placeholder="Eg. 47500"
                style={styles.input}
                placeholderTextColor="#9e8852"
                keyboardType="numeric"
                value={postCode}
                onChangeText={setPostCode}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>City</Text>
              <TextInput
                placeholder="Eg. Subang"
                style={styles.input}
                placeholderTextColor="#9e8852"
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <Text style={styles.label}>Fulfillment</Text>
          <View style={styles.fulfillmentGroup}>
            {fulfillmentOptions.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.fulfillmentButton,
                  selectedFulfillment.includes(option) && styles.fulfillmentButtonSelected
                ]}
                onPress={() => toggleFulfillment(option)}
              >
                <Text style={[
                  styles.fulfillmentText,
                  selectedFulfillment.includes(option) && styles.fulfillmentTextSelected
                ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Hours</Text>
          <View style={styles.hoursContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Same Hours Everyday</Text>
              <Switch
                value={isOpen24Hours}
                onValueChange={setIsOpen24Hours}
                trackColor={{ false: "#cccccc", true: "#4CAF50" }}
                thumbColor={isOpen24Hours ? "#FFF952" : "#f4f3f4"}
              />
            </View>
            
            {!isOpen24Hours && (
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Open</Text>
                  <TextInput
                    placeholder="10:00 AM"
                    style={styles.input}
                    placeholderTextColor="#9e8852"
                    value={openTime}
                    onChangeText={setOpenTime}
                  />
                </View>
                <Text style={styles.timeSeparator}>-</Text>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Close</Text>
                  <TextInput
                    placeholder="10:00 PM"
                    style={styles.input}
                    placeholderTextColor="#9e8852"
                    value={closeTime}
                    onChangeText={setCloseTime}
                  />
                </View>
              </View>
            )}

            {isOpen24Hours && (
              <Text style={styles.allDayText}>
                Open 24 hours, 7 days a week
              </Text>
            )}
          </View>

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
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  fulfillmentGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  fulfillmentButton: {
    flex: 1,
    backgroundColor: "#FFECA9",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  fulfillmentButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#245B2A",
  },
  fulfillmentText: {
    fontSize: 14,
    color: "#556B2F",
    fontWeight: "600",
  },
  fulfillmentTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  hoursContainer: {
    backgroundColor: "#FFECA9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: "#245B2A",
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: "#556B2F",
    marginBottom: 6,
    fontWeight: "600",
  },
  timeSeparator: {
    fontSize: 18,
    color: "#245B2A",
    fontWeight: "700",
    marginBottom: 14,
  },
  allDayText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
    textAlign: "center",
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
