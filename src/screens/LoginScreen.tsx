import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

interface LoginScreenProps {
  email: string;
  emailError: string;
  helperText: string;
  onChangeEmail: (value: string) => void;
  onSendOtp: () => void;
}

export function LoginScreen({
  email,
  emailError,
  helperText,
  onChangeEmail,
  onSendOtp
}: LoginScreenProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <Text style={styles.step}>Step 1</Text>
      <Text style={styles.title}>Email Login</Text>
      <Text style={styles.subtitle}>Enter your email to receive 6-digit OTP.</Text>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={onChangeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
          placeholderTextColor="#8b97a3"
          style={styles.input}
        />
      </View>

      <Pressable style={styles.primaryButton} onPress={onSendOtp}>
        <Text style={styles.primaryButtonText}>Send OTP</Text>
      </Pressable>

      {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
      {!!helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12
  },
  step: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#5b6672"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f1720"
  },
  subtitle: {
    fontSize: 15,
    color: "#526071"
  },
  inputBlock: {
    gap: 6,
    marginTop: 10
  },
  label: {
    fontSize: 13,
    color: "#526071"
  },
  input: {
    borderWidth: 1,
    borderColor: "#cad3dc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f1720",
    backgroundColor: "#ffffff"
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#1f7a6b",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  },
  errorText: {
    color: "#c62828",
    fontSize: 14
  },
  helperText: {
    color: "#5b6672",
    fontSize: 13
  }
});
