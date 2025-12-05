// app/setpassword.tsx
import { router } from "expo-router";
import React, { useState } from "react";


import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function SetPasswordScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Set Password</Text>
      </View>

      {/* WHITE CARD */}
      <View style={styles.whiteCard}>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>

        {/* Password */}
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            placeholder="***********"
            placeholderTextColor="#7a7a7a"
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

        {/* Confirm Password */}
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showConfirmPassword}
            placeholder="***********"
            placeholderTextColor="#7a7a7a"
          />

          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.showBtn}
          >
            <Text style={styles.showHideText}>
              {showConfirmPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        {/* Button */}
        <Pressable style={styles.createBtn}>
          <Text style={styles.createBtnText}>Create Password</Text>
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

  // PASSWORD ROW
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEFA9",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 48,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  showBtn: {
    paddingHorizontal: 8,
  },

  showHideText: {
    fontSize: 14,
    color: "#1A5D1A",
    fontWeight: "700",
  },

  // Button
  createBtn: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },

  createBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A5D1A",
  },
});
