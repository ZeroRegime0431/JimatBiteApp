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

// Firebase
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [userDocId, setUserDocId] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Check if email exists in Firestore users collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No account found with this email address");
        setLoading(false);
        return;
      }

      // Get the user document ID
      const userDoc = querySnapshot.docs[0];
      setUserDocId(userDoc.id);

      // Generate 6-digit code
      const code = generateCode();
      setGeneratedCode(code);
      
      // For now, log to console (in production, send via email service)
      console.log('🔐 Password Reset Code:', code);
      console.log('📧 Sending to:', email.trim());
      
      setStep('code');
    } catch (err: any) {
      console.error('Send code error:', err);
      setError("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (verificationCode.trim() !== generatedCode) {
      setError("Invalid verification code. Please try again.");
      return;
    }

    setError("");
    setStep('password');
  };

  const handleSavePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill in both password fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Update password in Firestore user document
      const userRef = doc(db, 'users', userDocId);
      await updateDoc(userRef, {
        password: newPassword,
        updatedAt: new Date().toISOString()
      });

      console.log('✅ Password updated in Firestore');

      // Send Firebase Auth password reset email so user can update Auth password too
      try {
        await sendPasswordResetEmail(auth, email.trim());
        console.log('📧 Firebase Auth password reset email sent to:', email.trim());
        console.log('✅ Please check email and click the link to sync Firebase Auth password');
      } catch (emailError: any) {
        console.log('⚠️ Could not send Firebase Auth reset email:', emailError.code);
        
        // Try to create user in Auth with new password if they don't exist
        try {
          await createUserWithEmailAndPassword(auth, email.trim(), newPassword);
          console.log('✅ Created Firebase Auth user with new password');
        } catch (createError: any) {
          if (createError.code === 'auth/email-already-in-use') {
            console.log('ℹ️ Firebase Auth password will be synced on next login attempt');
          }
        }
      }

      console.log('✅ Password reset complete for:', email);
      
      // Navigate back to login
      router.replace('/login');
    } catch (err: any) {
      console.error('Save password error:', err);
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    const code = generateCode();
    setGeneratedCode(code);
    console.log('🔐 NEW Password Reset Code:', code);
    console.log('📧 Sending to:', email.trim());
    setVerificationCode("");
    setError("");
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
        {/* STEP 1: Email Input */}
        {step === 'email' && (
          <>
            <Text style={styles.description}>
              Enter your email address and we'll send you a verification code to reset your password.
            </Text>

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="example@example.com"
              placeholderTextColor="#7a7a7a"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1A5D1A" />
              ) : (
                <Text style={styles.buttonText}>Send Code</Text>
              )}
            </Pressable>
          </>
        )}

        {/* STEP 2: Code Verification */}
        {step === 'code' && (
          <>
            <Text style={styles.description}>
              Enter the 6-digit verification code sent to {email}
            </Text>

            <Text style={styles.inputLabel}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor="#7a7a7a"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable 
              style={styles.button} 
              onPress={handleVerifyCode}
            >
              <Text style={styles.buttonText}>Verify Code</Text>
            </Pressable>

            <Pressable 
              style={styles.resendButton} 
              onPress={handleResendCode}
            >
              <Text style={styles.resendText}>Resend Code</Text>
            </Pressable>
          </>
        )}

        {/* STEP 3: New Password */}
        {step === 'password' && (
          <>
            <Text style={styles.description}>
              Create a new password for your account.
            </Text>

            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor="#7a7a7a"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <Pressable 
                style={styles.toggleButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Text style={styles.toggleText}>
                  {showNewPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                placeholderTextColor="#7a7a7a"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable 
                style={styles.toggleButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.toggleText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSavePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1A5D1A" />
              ) : (
                <Text style={styles.buttonText}>Save Password</Text>
              )}
            </Pressable>
          </>
        )}
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

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFEFA9",
    borderRadius: 20,
    marginBottom: 15,
    paddingRight: 10,
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    height: 48,
    fontSize: 16,
    color: "#333",
  },

  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: "#1A5D1A",
  },

  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },

  // Button
  button: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A5D1A",
  },

  resendButton: {
    marginTop: 15,
    alignItems: 'center',
  },

  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});
