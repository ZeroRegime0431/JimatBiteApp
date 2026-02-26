// app/signup.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

// Firebase Authentication and Database
import { checkEmailVerified, resendVerificationEmail, signUp } from '../services/auth';
import { createUserProfile } from '../services/database';

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+60', name: 'Malaysia', maxLength: 10 });
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Country codes with max phone number lengths
  const countryCodes = [
    { code: '+60', name: 'Malaysia', maxLength: 10 },
    { code: '+65', name: 'Singapore', maxLength: 8 },
    { code: '+1', name: 'USA/Canada', maxLength: 10 },
    { code: '+44', name: 'United Kingdom', maxLength: 10 },
    { code: '+61', name: 'Australia', maxLength: 9 },
    { code: '+86', name: 'China', maxLength: 11 },
    { code: '+91', name: 'India', maxLength: 10 },
    { code: '+81', name: 'Japan', maxLength: 10 },
    { code: '+82', name: 'South Korea', maxLength: 10 },
    { code: '+62', name: 'Indonesia', maxLength: 11 },
    { code: '+66', name: 'Thailand', maxLength: 9 },
    { code: '+63', name: 'Philippines', maxLength: 10 },
    { code: '+84', name: 'Vietnam', maxLength: 10 },
    { code: '+49', name: 'Germany', maxLength: 11 },
    { code: '+33', name: 'France', maxLength: 9 },
    { code: '+971', name: 'UAE', maxLength: 9 },
    { code: '+966', name: 'Saudi Arabia', maxLength: 9 },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSignup = async () => {
    // Basic validation
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all required fields (Name, Email, Password, Confirm Password) ❌");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match ❌");
      return;
    }

    // Password policy validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long ❌");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase character ❌");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase character ❌");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one numeric character ❌");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character ❌");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Create account with Firebase
      const result = await signUp(email.trim(), password, fullName.trim());

      if (result.success && result.user) {
        // Save user profile to Firestore
        const profileData = {
          fullName: fullName.trim(),
          email: email.trim(),
          mobileNumber: mobileNumber.trim() || undefined,
          dateOfBirth: dateOfBirth.trim() || undefined,
        };
        
        await createUserProfile(result.user.uid, profileData);
        
        // Store user info and show verification screen
        setUserId(result.user.uid);
        setUserEmail(email.trim());
        setShowVerificationScreen(true);
        
        console.log('Signup successful — verification email sent');
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

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    setError("");
    
    try {
      const result = await checkEmailVerified();
      
      if (result.success && result.verified) {
        // Email is verified, navigate to onboarding
        console.log('Email verified — navigating to onboarding');
        router.replace("/onboarding");
      } else if (result.success && !result.verified) {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      } else {
        setError(result.error || "Failed to check verification status.");
      }
    } catch (err) {
      console.error('Check verification error:', err);
      setError("An error occurred while checking verification.");
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setError("");
    
    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        setError("✅ Verification email sent! Please check your inbox.");
      } else {
        setError(result.error || "Failed to resend verification email.");
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setError("An error occurred while resending email.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleDateConfirm = () => {
    const formattedDate = `${String(selectedDay).padStart(2, '0')} / ${String(selectedMonth).padStart(2, '0')} / ${selectedYear}`;
    setDateOfBirth(formattedDate);
    setDateModalVisible(false);
  };

  const handleCountrySelect = (country: typeof countryCodes[0]) => {
    setSelectedCountry(country);
    setCountryModalVisible(false);
    // Clear mobile number if it exceeds new country's max length
    if (mobileNumber.length > country.maxLength) {
      setMobileNumber('');
    }
  };

  const handleMobileNumberChange = (text: string) => {
    // Only allow digits and limit to country's max length
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly.length <= selectedCountry.maxLength) {
      setMobileNumber(digitsOnly);
    }
  };

  // Generate year options from 1970 to 2050
  const years = Array.from({ length: 81 }, (_, i) => 1970 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Show verification screen if user just signed up
  if (showVerificationScreen) {
    return (
      <View style={styles.container}>
        {/* Green header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Verify Your Email</Text>
        </View>

        {/* White body */}
        <View style={styles.body}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.verificationContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.emailIcon}>
              <Text style={styles.emailIconText}>📧</Text>
            </View>

            <Text style={styles.verificationTitle}>Check Your Email</Text>
            
            <Text style={styles.verificationText}>
              We've sent a verification link to:
            </Text>
            
            <Text style={styles.emailDisplay}>{userEmail}</Text>
            
            <Text style={styles.verificationText}>
              Please click the link in the email to verify your account. 
              After verifying, come back here and click "I've Verified My Email" to continue.
            </Text>

            {/* Error message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable 
              style={[styles.primaryButton, checkingVerification && styles.primaryButtonDisabled]} 
              onPress={handleCheckVerification}
              disabled={checkingVerification}
            >
              {checkingVerification ? (
                <ActivityIndicator color="#1A5D1A" />
              ) : (
                <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
              )}
            </Pressable>

            <Pressable 
              style={[styles.secondaryButton, resendingEmail && styles.secondaryButtonDisabled]} 
              onPress={handleResendVerification}
              disabled={resendingEmail}
            >
              {resendingEmail ? (
                <ActivityIndicator color="#245B2A" />
              ) : (
                <Text style={styles.secondaryButtonText}>Resend Verification Email</Text>
              )}
            </Pressable>

            <Text style={styles.verificationNote}>
              💡 Tip: Check your spam folder if you don't see the email.
            </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  }
 
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
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
          <Text style={styles.passwordRequirements}>
            Password must contain:
            {"\n"}• At least 6 characters
            {"\n"}• One uppercase letter (A-Z)
            {"\n"}• One lowercase letter (a-z)
            {"\n"}• One number (0-9)
            {"\n"}• One special character (!@#$%^&*)
          </Text>

          <Text style={styles.label}>Confirm Password *</Text>
          <View style={styles.passwordRow}>
            <TextInput
              placeholder="Re-enter your password"
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

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneInputContainer}>
            <Pressable 
              style={styles.countryCodeButton}
              onPress={() => setCountryModalVisible(true)}
            >
              <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </Pressable>
            <TextInput
              placeholder={`Enter ${selectedCountry.maxLength} digits`}
              style={styles.phoneInput}
              placeholderTextColor="#9e8852"
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={handleMobileNumberChange}
              maxLength={selectedCountry.maxLength}
            />
          </View>
          <Text style={styles.phoneHint}>
            {selectedCountry.name}: Max {selectedCountry.maxLength} digits
          </Text>

          <Text style={styles.label}>Date of birth</Text>
          <Pressable 
            style={styles.input}
            onPress={() => setDateModalVisible(true)}
          >
            <Text style={[styles.dateText, !dateOfBirth && styles.placeholderText]}>
              {dateOfBirth || "DD / MM / YYYY"}
            </Text>
          </Pressable>

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
        </KeyboardAvoidingView>
      </View>

      {/* Date of Birth Modal */}
      <Modal
        visible={dateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            
            <View style={styles.pickerRow}>
              {/* Day Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {days.map((day) => (
                    <Pressable
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedDay === day && styles.pickerItemTextSelected
                      ]}>
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {months.map((month) => (
                    <Pressable
                      key={month}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedMonth(month)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedMonth === month && styles.pickerItemTextSelected
                      ]}>
                        {month}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <Pressable
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedYear === year && styles.pickerItemTextSelected
                      ]}>
                        {year}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleDateConfirm}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Country Code Modal */}
      <Modal
        visible={countryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            
            <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
              {countryCodes.map((country) => (
                <Pressable
                  key={country.code + country.name}
                  style={[
                    styles.countryItem,
                    selectedCountry.code === country.code && styles.countryItemSelected
                  ]}
                  onPress={() => handleCountrySelect(country)}
                >
                  <Text style={styles.countryCodeInList}>{country.code}</Text>
                  <Text style={styles.countryName}>{country.name}</Text>
                  {selectedCountry.code === country.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setCountryModalVisible(false)}
            >
              <Text style={styles.modalButtonTextCancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  dateText: {
    fontSize: 14,
    color: "#245B2A",
    paddingVertical: 2,
  },
  placeholderText: {
    color: "#9e8852",
  },
  passwordRequirements: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countryCodeButton: {
    backgroundColor: "#FFECA9",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 85,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#245B2A",
  },
  dropdownArrow: {
    fontSize: 10,
    color: "#245B2A",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#FFECA9",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 14,
    color: "#245B2A",
  },
  phoneHint: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    marginBottom: 12,
  },
  countryList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#FFECA9",
  },
  countryItemSelected: {
    backgroundColor: "#FFF952",
  },
  countryCodeInList: {
    fontSize: 14,
    fontWeight: "600",
    color: "#245B2A",
    minWidth: 50,
  },
  countryName: {
    fontSize: 14,
    color: "#245B2A",
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: "#245B2A",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#245B2A",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#245B2A",
    marginBottom: 8,
    textAlign: "center",
  },
  picker: {
    height: 150,
    backgroundColor: "#FFECA9",
    borderRadius: 12,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  pickerItemSelected: {
    backgroundColor: "#FFF952",
  },
  pickerItemText: {
    fontSize: 14,
    color: "#245B2A",
  },
  pickerItemTextSelected: {
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalButtonCancel: {
    backgroundColor: "#E0E0E0",
  },
  modalButtonConfirm: {
    backgroundColor: "#FFF952",
  },
  modalButtonTextCancel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  modalButtonTextConfirm: {
    fontSize: 14,
    fontWeight: "600",
    color: "#245B2A",
  },
  verificationContent: {
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: "center",
  },
  emailIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F7FFD4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emailIconText: {
    fontSize: 50,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#245B2A",
    marginBottom: 16,
    textAlign: "center",
  },
  verificationText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  emailDisplay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#245B2A",
    marginBottom: 20,
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#245B2A",
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#245B2A",
  },
  verificationNote: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});
