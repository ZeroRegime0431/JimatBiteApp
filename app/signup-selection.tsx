// app/signup-selection.tsx
import { router } from "expo-router";
import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function SignupSelectionScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleUserSignup = () => {
    router.push("/signup");
  };

  const handleMerchantSignup = () => {
    router.push("/merchant-signup-step1");
  };

  return (
    <View style={styles.container}>
      {/* Green header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      {/* White body */}
      <View style={styles.body}>
        <Text style={styles.subtitle}>Choose your account type</Text>
        
        {/* User/Customer Card */}
        <Pressable style={styles.card} onPress={handleUserSignup}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>👤</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Customer Account</Text>
            <Text style={styles.cardDescription}>
              Browse restaurants, order food, and track deliveries
            </Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </Pressable>

        {/* Merchant Card */}
        <Pressable style={styles.card} onPress={handleMerchantSignup}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>🏪</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Merchant Account</Text>
            <Text style={styles.cardDescription}>
              Register your restaurant and manage menu items
            </Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </Pressable>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.bottomLink}>Log in</Text>
          </Pressable>
        </View>
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
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    marginTop: -44,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#245B2A",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFECA9",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF952",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardIconText: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#245B2A",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#556B2F",
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 24,
    color: "#245B2A",
    fontWeight: "700",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
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
