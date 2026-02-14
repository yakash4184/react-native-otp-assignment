import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { LoginScreen } from "./screens/LoginScreen";
import { OtpScreen } from "./screens/OtpScreen";
import { SessionScreen } from "./screens/SessionScreen";
import {
  AuthEvent,
  AuthStep,
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRY_SECONDS,
  OTP_LENGTH,
  OtpStore,
  SessionInfo
} from "./types/auth";
import { getOtpMeta, sendOtp, validateOtp } from "./services/otpManager";
import { getRecentAuthEvents, initializeAnalytics, logAuthEvent } from "./services/analytics";
import { clearSession, loadSession, saveSession } from "./services/sessionStorage";
import { useOtpCountdown } from "./hooks/useOtpCountdown";
import { useSessionTimer } from "./hooks/useSessionTimer";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getOtpStatusMessage(reason: string): string {
  switch (reason) {
    case "OTP_EXPIRED":
      return "OTP expired. Please resend OTP.";
    case "MAX_ATTEMPTS_REACHED":
      return "Maximum attempts reached. Resend OTP to continue.";
    case "OTP_INCORRECT":
      return "Incorrect OTP. Try again.";
    case "OTP_NOT_FOUND":
      return "No OTP found for this email. Generate new OTP.";
    default:
      return "";
  }
}

export default function AssignmentApp() {
  const otpStoreRef = useRef<OtpStore>(new Map());

  const [step, setStep] = useState<AuthStep>("LOGIN");
  const [emailInput, setEmailInput] = useState("");
  const [activeEmail, setActiveEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [helperText, setHelperText] = useState("");

  const [otpValue, setOtpValue] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_OTP_ATTEMPTS);
  const [demoOtp, setDemoOtp] = useState("");

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [logs, setLogs] = useState<AuthEvent[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const { remainingSeconds, isExpired } = useOtpCountdown(otpExpiresAt);
  const { formatted: sessionDuration } = useSessionTimer(session?.startedAt ?? Date.now(), Boolean(session));

  const progressPercent = useMemo(() => {
    const ratio = remainingSeconds / OTP_EXPIRY_SECONDS;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }, [remainingSeconds]);

  const disableVerify = useMemo(
    () => otpValue.length !== OTP_LENGTH || attemptsLeft <= 0 || isExpired,
    [attemptsLeft, isExpired, otpValue.length]
  );

  const refreshLogs = useCallback(async () => {
    const recent = await getRecentAuthEvents(8);
    setLogs(recent);
  }, []);

  const syncOtpMeta = useCallback(() => {
    if (!activeEmail) {
      return;
    }

    const meta = getOtpMeta(otpStoreRef.current, activeEmail);
    setOtpExpiresAt(meta.expiresAt);
    setAttemptsLeft(meta.attemptsLeft);

    if (!meta.exists && step === "OTP") {
      setOtpStatus("OTP_NOT_FOUND");
    }
  }, [activeEmail, step]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      await initializeAnalytics();

      const existingSession = await loadSession();
      if (!mounted) {
        return;
      }

      if (existingSession) {
        setSession(existingSession);
        setActiveEmail(existingSession.email);
        setStep("SESSION");
      }

      await refreshLogs();
      if (mounted) {
        setIsInitializing(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [refreshLogs]);

  useEffect(() => {
    if (step !== "OTP") {
      return undefined;
    }

    syncOtpMeta();
    const interval = setInterval(syncOtpMeta, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [step, syncOtpMeta]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "background") {
        await logAuthEvent("APP_TO_BACKGROUND", {});
      }

      if (state === "active") {
        await logAuthEvent("APP_TO_FOREGROUND", {});
      }

      await refreshLogs();
    });

    return () => {
      subscription.remove();
    };
  }, [refreshLogs]);

  const onSendOtp = useCallback(async () => {
    if (!isValidEmail(emailInput)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    const sent = sendOtp(otpStoreRef.current, emailInput);

    setActiveEmail(sent.email);
    setEmailInput(sent.email);
    setOtpExpiresAt(sent.expiresAt);
    setAttemptsLeft(sent.attemptsLeft);
    setOtpValue("");
    setOtpStatus("");
    setDemoOtp(sent.otpCode);
    setHelperText("OTP generated successfully.");
    setStep("OTP");

    await logAuthEvent("OTP_GENERATED", {
      email: sent.email,
      expiresAt: sent.expiresAt
    });
    await refreshLogs();
  }, [emailInput, refreshLogs]);

  const onVerifyOtp = useCallback(async () => {
    const result = validateOtp(otpStoreRef.current, activeEmail, otpValue);

    setAttemptsLeft(result.attemptsLeft);
    setOtpStatus(result.reason);

    if (!result.ok) {
      await logAuthEvent("OTP_VALIDATION_FAILURE", {
        email: activeEmail,
        reason: result.reason,
        attemptsLeft: result.attemptsLeft
      });
      await refreshLogs();
      return;
    }

    const nextSession: SessionInfo = {
      email: activeEmail,
      startedAt: Date.now()
    };

    setSession(nextSession);
    setStep("SESSION");
    setOtpValue("");
    setOtpStatus("");
    setDemoOtp("");

    await saveSession(nextSession);
    await logAuthEvent("OTP_VALIDATION_SUCCESS", {
      email: activeEmail
    });
    await refreshLogs();
  }, [activeEmail, otpValue, refreshLogs]);

  const onResendOtp = useCallback(async () => {
    if (!activeEmail) {
      return;
    }

    const sent = sendOtp(otpStoreRef.current, activeEmail);
    setOtpExpiresAt(sent.expiresAt);
    setAttemptsLeft(sent.attemptsLeft);
    setOtpValue("");
    setOtpStatus("");
    setDemoOtp(sent.otpCode);

    await logAuthEvent("OTP_GENERATED", {
      email: sent.email,
      expiresAt: sent.expiresAt,
      action: "resend"
    });
    await refreshLogs();
  }, [activeEmail, refreshLogs]);

  const onLogout = useCallback(async () => {
    if (session) {
      const durationSeconds = Math.floor((Date.now() - session.startedAt) / 1000);
      await logAuthEvent("LOGOUT", {
        email: session.email,
        durationSeconds
      });
    }

    await clearSession();
    await refreshLogs();

    setSession(null);
    setStep("LOGIN");
    setOtpExpiresAt(null);
    setAttemptsLeft(MAX_OTP_ATTEMPTS);
    setOtpStatus("");
    setOtpValue("");
    setHelperText("Logged out successfully.");
  }, [refreshLogs, session]);

  const onChangeEmail = useCallback(() => {
    setStep("LOGIN");
    setOtpValue("");
    setOtpStatus("");
  }, []);

  const onChangeOtpInput = useCallback((value: string) => {
    const numericOnly = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtpValue(numericOnly);
  }, []);

  const stepTitle = step === "LOGIN" ? "1. Email" : step === "OTP" ? "2. OTP" : "3. Session";

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading assignment app...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.badge}>React Native Assignment</Text>
          <Text style={styles.mainTitle}>Email + OTP Passwordless Auth</Text>
          <Text style={styles.mainSubtitle}>Current Step: {stepTitle}</Text>
        </View>

        <View style={styles.card}>
          {step === "LOGIN" && (
            <LoginScreen
              email={emailInput}
              emailError={emailError}
              helperText={helperText}
              onChangeEmail={setEmailInput}
              onSendOtp={onSendOtp}
            />
          )}

          {step === "OTP" && (
            <OtpScreen
              email={activeEmail}
              otpValue={otpValue}
              otpStatusText={isExpired ? "OTP expired. Please resend OTP." : getOtpStatusMessage(otpStatus)}
              attemptsLeft={attemptsLeft}
              remainingSeconds={remainingSeconds}
              progressPercent={progressPercent}
              demoOtp={demoOtp}
              disableVerify={disableVerify}
              onChangeOtp={onChangeOtpInput}
              onVerify={onVerifyOtp}
              onResend={onResendOtp}
              onChangeEmail={onChangeEmail}
            />
          )}

          {step === "SESSION" && session && (
            <SessionScreen
              email={session.email}
              startedAt={session.startedAt}
              duration={sessionDuration}
              logs={logs}
              onLogout={onLogout}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef3ef"
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16
  },
  header: {
    gap: 8
  },
  badge: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#145a4e",
    backgroundColor: "#d7f0ea",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    letterSpacing: 0.5
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#102128"
  },
  mainSubtitle: {
    fontSize: 14,
    color: "#5a6876"
  },
  card: {
    backgroundColor: "#f9fbff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d3dbe3",
    padding: 16
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    fontSize: 16,
    color: "#415063"
  }
});
