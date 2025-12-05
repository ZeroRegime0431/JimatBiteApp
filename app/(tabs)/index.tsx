import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const handleLoginPress = () => {
    router.push("/login");
  };

  const handleSignupPress = () => {
    router.push("/signup");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("./logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.appName}>JimatBite</Text>

      {/* You can add a small subtitle here if you want */}
      {/* <Text style={styles.tagline}>Big Bites. Small Prices.</Text> */}

      <View style={styles.buttonContainer}>
        <Pressable style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </Pressable>

        <Pressable style={styles.signupButton} onPress={handleSignupPress}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FFD6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#245B2A",
    marginBottom: 32,
  },
  tagline: {
    fontSize: 14,
    color: "#7a8c6b",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: "#FFF952", // bright yellow
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#245B2A",
  },
  signupButton: {
    backgroundColor: "#FFE7C6", // beige
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#245B2A",
  },
});

