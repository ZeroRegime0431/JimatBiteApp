// app/merchant-signup-step1.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

export default function MerchantSignupStep1() {
  const params = useLocalSearchParams();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // Load data from params if returning from next step
  useEffect(() => {
    if (params.fullName) setFullName(params.fullName as string);
    if (params.email) setEmail(params.email as string);
    if (params.password) setPassword(params.password as string);
    if (params.mobileNumber) setMobileNumber(params.mobileNumber as string);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    // Navigate to next step without validation, preserving all data
    router.push({
      pathname: "/merchant-signup-step2",
      params: {
        ...params,
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
        mobileNumber: mobileNumber.trim(),
      }
    });
  };

  const handleContinue = () => {
    // Validation
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all required fields ❌");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address ❌");
      return;
    }

    // Password policy validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long ❌");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter ❌");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter ❌");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number ❌");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character ❌");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match ❌");
      return;
    }

    setError("");

    // Store data in navigation params and move to next step
    router.push({
      pathname: "/merchant-signup-step2",
      params: {
        ...params,
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
        mobileNumber: mobileNumber.trim(),
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
          <Text style={styles.stepText}>Step 1 OF 4</Text>
        </View>
      </View>

      {/* White body */}
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bodyContent}
        >
          <Text style={styles.label}>Full name</Text>
          <TextInput
            placeholder="example@example.com"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              placeholder="••••••••••••"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              placeholderTextColor="#9e8852"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showBtn}>
              <Text style={styles.showHideText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              placeholder="••••••••••••"
              secureTextEntry={!showConfirmPassword}
              style={styles.passwordInput}
              placeholderTextColor="#9e8852"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showBtn}>
              <Text style={styles.showHideText}>
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.passwordRequirements}>
            Password must contain:
            {"\n"}• At least 6 characters
            {"\n"}• One uppercase letter (A-Z)
            {"\n"}• One lowercase letter (a-z)
            {"\n"}• One number (0-9)
            {"\n"}• One special character (!@#$%^&*)
          </Text>

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            placeholder="+ 123 456 789"
            style={styles.input}
            placeholderTextColor="#9e8852"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="example@example.com"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.terms}>
            By continuing, you agree to{" "}
            <Text style={styles.termsLink}>Terms of Use</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

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
    marginBottom: 6,
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
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFECA9",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 46,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: "#245B2A",
  },
  showBtn: {
    paddingHorizontal: 8,
  },
  showHideText: {
    fontSize: 12,
    color: "#245B2A",
    fontWeight: "600",
  },
  passwordRequirements: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 16,
  },
  terms: {
    fontSize: 11,
    color: "#777",
    textAlign: "center",
    marginTop: 16,
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
    marginBottom: 12,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#FFF952",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
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
