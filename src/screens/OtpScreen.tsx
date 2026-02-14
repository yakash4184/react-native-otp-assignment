import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface OtpScreenProps {
  email: string;
  otpValue: string;
  otpStatusText: string;
  attemptsLeft: number;
  remainingSeconds: number;
  progressPercent: number;
  demoOtp: string;
  disableVerify: boolean;
  onChangeOtp: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
}

export function OtpScreen({
  email,
  otpValue,
  otpStatusText,
  attemptsLeft,
  remainingSeconds,
  progressPercent,
  demoOtp,
  disableVerify,
  onChangeOtp,
  onVerify,
  onResend,
  onChangeEmail
}: OtpScreenProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.step}>Step 2</Text>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>OTP sent to {email}</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Expires In</Text>
          <Text style={styles.infoValue}>{String(remainingSeconds).padStart(2, "0")}s</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Attempts Left</Text>
          <Text style={styles.infoValue}>{attemptsLeft}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <Text style={styles.label}>6-digit OTP</Text>
      <TextInput
        value={otpValue}
        onChangeText={onChangeOtp}
        keyboardType="number-pad"
        placeholder="000000"
        placeholderTextColor="#8b97a3"
        style={styles.input}
        maxLength={6}
      />

      <Pressable style={[styles.primaryButton, disableVerify && styles.disabled]} onPress={onVerify} disabled={disableVerify}>
        <Text style={styles.primaryButtonText}>Verify OTP</Text>
      </Pressable>

      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryButton} onPress={onResend}>
          <Text style={styles.secondaryButtonText}>Resend OTP</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onChangeEmail}>
          <Text style={styles.secondaryButtonText}>Change Email</Text>
        </Pressable>
      </View>

      {!!otpStatusText && <Text style={styles.errorText}>{otpStatusText}</Text>}
      <Text style={styles.helperText}>Demo OTP: {demoOtp || "------"}</Text>
    </View>
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
    fontSize: 14,
    color: "#526071"
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4
  },
  infoCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cad3dc",
    backgroundColor: "#ffffff",
    padding: 10
  },
  infoLabel: {
    fontSize: 12,
    color: "#526071"
  },
  infoValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f1720"
  },
  progressTrack: {
    marginTop: 2,
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "#dae2ea",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1f7a6b"
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
    fontSize: 20,
    letterSpacing: 4,
    color: "#0f1720",
    backgroundColor: "#ffffff"
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#1f7a6b",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },
  disabled: {
    opacity: 0.5
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bdd7d1",
    backgroundColor: "#ecf8f5",
    paddingVertical: 10,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#1f6055",
    fontSize: 14,
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
