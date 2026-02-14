import {
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRY_SECONDS,
  OTP_LENGTH,
  OtpStore,
  OtpValidationReason
} from "../types/auth";

const OTP_EXPIRY_MS = OTP_EXPIRY_SECONDS * 1000;

export interface SendOtpResult {
  email: string;
  otpCode: string;
  expiresAt: number;
  attemptsLeft: number;
}

export interface ValidateOtpResult {
  ok: boolean;
  reason: OtpValidationReason;
  attemptsLeft: number;
}

export interface OtpMeta {
  exists: boolean;
  expiresAt: number | null;
  attemptsLeft: number;
}

export function normalizeEmail(rawEmail: string): string {
  return rawEmail.trim().toLowerCase();
}

function generateOtpCode(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

function removeExpiredOtps(store: OtpStore, nowMs: number): void {
  for (const [email, value] of store.entries()) {
    if (nowMs > value.expiresAt) {
      store.delete(email);
    }
  }
}

export function sendOtp(store: OtpStore, rawEmail: string, nowMs: number = Date.now()): SendOtpResult {
  removeExpiredOtps(store, nowMs);

  const email = normalizeEmail(rawEmail);
  const otpCode = generateOtpCode();
  const expiresAt = nowMs + OTP_EXPIRY_MS;

  store.set(email, {
    code: otpCode,
    expiresAt,
    attemptsUsed: 0
  });

  return {
    email,
    otpCode,
    expiresAt,
    attemptsLeft: MAX_OTP_ATTEMPTS
  };
}

export function getOtpMeta(store: OtpStore, rawEmail: string, nowMs: number = Date.now()): OtpMeta {
  removeExpiredOtps(store, nowMs);

  const email = normalizeEmail(rawEmail);
  const otp = store.get(email);

  if (!otp) {
    return {
      exists: false,
      expiresAt: null,
      attemptsLeft: MAX_OTP_ATTEMPTS
    };
  }

  return {
    exists: true,
    expiresAt: otp.expiresAt,
    attemptsLeft: Math.max(0, MAX_OTP_ATTEMPTS - otp.attemptsUsed)
  };
}

export function validateOtp(
  store: OtpStore,
  rawEmail: string,
  otpInput: string,
  nowMs: number = Date.now()
): ValidateOtpResult {
  const email = normalizeEmail(rawEmail);
  const otp = store.get(email);

  if (!otp) {
    return {
      ok: false,
      reason: "OTP_NOT_FOUND",
      attemptsLeft: 0
    };
  }

  if (nowMs > otp.expiresAt) {
    store.delete(email);
    return {
      ok: false,
      reason: "OTP_EXPIRED",
      attemptsLeft: 0
    };
  }

  if (otp.attemptsUsed >= MAX_OTP_ATTEMPTS) {
    return {
      ok: false,
      reason: "MAX_ATTEMPTS_REACHED",
      attemptsLeft: 0
    };
  }

  if (otpInput.trim() === otp.code) {
    store.delete(email);
    return {
      ok: true,
      reason: "OTP_VALID",
      attemptsLeft: MAX_OTP_ATTEMPTS
    };
  }

  otp.attemptsUsed += 1;
  const attemptsLeft = Math.max(0, MAX_OTP_ATTEMPTS - otp.attemptsUsed);

  return {
    ok: false,
    reason: attemptsLeft === 0 ? "MAX_ATTEMPTS_REACHED" : "OTP_INCORRECT",
    attemptsLeft
  };
}
