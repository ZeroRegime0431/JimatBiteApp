// app/forgot-password.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

// Firebase Authentication
import { resetPassword } from '../services/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await resetPassword(email.trim());

      if (result.success) {
        setSuccess("Password reset email sent! Check your inbox.");
        // Optionally navigate back after a delay
        setTimeout(() => {
          router.back();
        }, 3000);
      } else {
        setError(result.error || "Failed to send reset email");
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Forgot Password</Text>
      </View>

      {/* WHITE CARD */}
      <View style={styles.whiteCard}>
        <Text style={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        {/* Email */}
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="example@example.com"
          placeholderTextColor="#7a7a7a"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Error message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Success message */}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <Pressable 
          style={[styles.setPasswordButton, loading && styles.setPasswordButtonDisabled]} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1A5D1A" />
          ) : (
            <Text style={styles.setPasswordButtonText}>Send Reset Link</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

//////////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FFC9",
  },

  // HEADER
  header: {
    height: 150,
    backgroundColor: "#F4FFC9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingBottom: 10,
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
    fontWeight: "bold",
    color: "#1A5D1A",
    textAlign: "center",
  },

  // WHITE CARD CONTAINER
  whiteCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -30,
    paddingHorizontal: 25,
    paddingTop: 25,
  },

  description: {
    fontSize: 13,
    color: "#555",
    marginBottom: 20,
    lineHeight: 18,
  },

  inputLabel: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "700",
    color: "#1A5D1A",
  },

  input: {
    backgroundColor: "#FFEFA9",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 48,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },

  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },

  successText: {
    color: "#4CAF50",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },

  // Button
  setPasswordButton: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },

  setPasswordButtonDisabled: {
    opacity: 0.6,
  },

  setPasswordButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A5D1A",
  },
});
