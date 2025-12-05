// app/signup.tsx
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const googleIcon = require("../assets/icons/google.png");
const facebookIcon = require("../assets/icons/facebook.png");
const fingerprintIcon = require("../assets/icons/fingerprint.png");


export default function SignupScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleSignup = () => {
    console.log("Sign Up pressed");
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
          <Text style={styles.label}>Full name</Text>
          <TextInput
            placeholder="Your name"
            style={styles.input}
            placeholderTextColor="#9e8852"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="************"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#9e8852"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="example@example.com"
            style={styles.input}
            placeholderTextColor="#9e8852"
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            placeholder="+ 123 456 789"
            style={styles.input}
            placeholderTextColor="#9e8852"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            placeholder="DD / MM / YYYY"
            style={styles.input}
            placeholderTextColor="#9e8852"
          />

          <Text style={styles.terms}>
            By continuing, you agree to{" "}
            <Text style={styles.termsLink}>Terms of Use</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          <Pressable style={styles.primaryButton} onPress={handleSignup}>
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </Pressable>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or sign up with</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialPressable}>
              <Image source={googleIcon} style={styles.socialIcon} />
            </Pressable>

            <Pressable style={styles.socialPressable}>
              <Image source={facebookIcon} style={styles.socialIcon} />
            </Pressable>

            <Pressable
              style={styles.socialPressable}
              onPress={handleGoToLogin} // or later: fingerprint flow
            >
              <Image source={fingerprintIcon} style={styles.socialIcon} />
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
