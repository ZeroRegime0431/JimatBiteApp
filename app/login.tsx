// app/login.tsx
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

// ICONS
import FacebookSvg from '../assets/icons/facebook.svg';
import FingerprintSvg from '../assets/icons/fingerprint.svg';
import GoogleSvg from '../assets/icons/google.svg';

// Firebase Authentication
import { signIn } from '../services/auth';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // USER INPUT FIELDS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ERROR MESSAGE
  const [error, setError] = useState("");

  // LOGIN FUNCTION WITH FIREBASE
  const handleLogin = async () => {
    // Validate inputs
    if (email.trim() === "" || password.trim() === "") {
      setError("Please fill in both email and password ❌");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Attempt to sign in with Firebase
      const result = await signIn(email.trim(), password);

      if (result.success) {
        console.log('Login successful — navigating to home page');
        // Navigate to home page on successful login
        router.replace("/home-page");
      } else {
        // Show error message from Firebase
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* GREEN HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Log In</Text>
      </View>

      {/* WHITE BODY */}
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.welcomeTitle}>Welcome</Text>
        <Text style={styles.welcomeDescription}>
          Sign in to discover delicious meals, track your orders, and enjoy fast delivery from your favorite restaurants.
        </Text>

        {/* Email */}
        <Text style={styles.inputLabel}>Email or Mobile Number</Text>
        <TextInput
          style={styles.input}
          placeholder="example@example.com"
          placeholderTextColor="#7a7a7a"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <Text style={styles.inputLabel}>Password</Text>

        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            placeholder="***********"
            placeholderTextColor="#7a7a7a"
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showBtn}
          >
            <Text style={styles.showHideText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        {/* Error message (only shows when something is wrong) */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Forgot Password */}
        <Pressable onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotPassword}>Forget Password</Text>
        </Pressable>

        {/* Log In Button */}
        <Pressable 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View className="line" style={styles.line} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View className="line" style={styles.line} />
        </View>

        {/* Logos */}
        <View style={styles.socialRow}>
          <GoogleSvg width={40} height={40} />
          <FacebookSvg width={40} height={40} />
          <FingerprintSvg width={40} height={40} />
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Don’t have an account?{" "}
          <Text
            style={styles.signUpText}
            onPress={() => router.push("/signup")}
          >
            Sign Up
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FFC9",
  },

  // GREEN HEADER
  header: {
    height: 150,
    backgroundColor: "#F4FFC9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  backBtn: {
    position: "absolute",
    left: 20,
    top: 55,
  },

  backArrow: {
    fontSize: 26,
    color: "#1A5D1A",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A5D1A",
    textAlign: "center",
  },

  // WHITE BODY CARD
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -20,
  },

  bodyContent: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 30,
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A5D1A",
  },

  welcomeDescription: {
    color: "#666",
    marginTop: 5,
    marginBottom: 20,
    lineHeight: 18,
  },

  inputLabel: {
    marginTop: 10,
    fontWeight: "700",
    color: "#1A5D1A",
  },

  input: {
    backgroundColor: "#FFEFA3",
    padding: 14,
    borderRadius: 20,
    marginTop: 6,
  },

  // PASSWORD ROW
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEFA3",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 48,
    marginTop: 6,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  showBtn: {
    paddingHorizontal: 10,
  },

  showHideText: {
    fontSize: 14,
    color: "#1A5D1A",
    fontWeight: "700",
  },

  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 6,
    fontWeight: "600",
  },

  forgotPassword: {
    textAlign: "right",
    color: "#1A5D1A",
    marginTop: 6,
    marginBottom: 20,
    fontWeight: "600",
  },

  loginButton: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1A5D1A",
  },

  // DIVIDER
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },

  dividerText: {
    marginHorizontal: 10,
    color: "#666",
  },

  // SOCIAL LOGOS
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginBottom: 25,
  },

  socialIcon: {
    width: 55,
    height: 55,
    resizeMode: "contain",
  },

  footerText: {
    textAlign: "center",
    color: "#444",
    marginBottom: 30,
  },

  signUpText: {
    color: "#1A5D1A",
    fontWeight: "700",
  },
});
