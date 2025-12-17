// app/signup.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import FacebookSvg from '../assets/icons/facebook.svg';
import FingerprintSvg from '../assets/icons/fingerprint.svg';
import GoogleSvg from '../assets/icons/google.svg';

// Firebase Authentication
import { signUp } from '../services/auth';

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSignup = async () => {
    // Basic validation
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields (Name, Email, Password) ❌");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long ❌");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Create account with Firebase
      const result = await signUp(email.trim(), password, fullName.trim());

      if (result.success) {
        console.log('Signup successful — navigating to onboarding');
        // Navigate to onboarding for new users
        router.replace("/onboarding");
      } else {
        // Show error message from Firebase
        setError(result.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };
 
  return (
    <View style={styles.container}>
      {/* Green header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New Account</Text>
      </View>

      {/* White body */}
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bodyContent}
        >
          <Text style={styles.label}>Full name *</Text>
          <TextInput
            placeholder="Your name"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            placeholder="example@example.com"
            style={styles.input}
            placeholderTextColor="#9e8852"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordRow}>
            <TextInput
              placeholder="Minimum 6 characters"
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

          <Text style={styles.label}>Mobile Number (Optional)</Text>
          <TextInput
            placeholder="+ 123 456 789"
            style={styles.input}
            placeholderTextColor="#9e8852"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />

          <Text style={styles.label}>Date of birth (Optional)</Text>
          <TextInput
            placeholder="DD / MM / YYYY"
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholderTextColor="#9e8852"
          />

          <Text style={styles.terms}>
            By continuing, you agree to{" "}
            <Text style={styles.termsLink}>Terms of Use</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable 
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1A5D1A" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign Up</Text>
            )}
          </Pressable>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or sign up with</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialPressable}>
              <GoogleSvg width={40} height={40} />
            </Pressable>

            <Pressable style={styles.socialPressable}>
              <FacebookSvg width={40} height={40} />
            </Pressable>

            <Pressable
              style={styles.socialPressable}
              onPress={handleGoToLogin} // or later: fingerprint flow
            >
              <FingerprintSvg width={40} height={40} />
            </Pressable>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <Pressable onPress={handleGoToLogin}>
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
  },
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  bodyContent: {
    paddingBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#245B2A",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFECA9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#245B2A",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFECA9",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 40,
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
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "600",
  },
  terms: {
    fontSize: 11,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  termsLink: {
    color: "#245B2A",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#FFF952",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
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
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  orText: {
    marginHorizontal: 8,
    fontSize: 12,
    color: "#888",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  socialPressable: {
    marginHorizontal: 12,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    resizeMode: "contain",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
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
