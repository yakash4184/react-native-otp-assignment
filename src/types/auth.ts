export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 60;
export const MAX_OTP_ATTEMPTS = 3;

export type AuthStep = "LOGIN" | "OTP" | "SESSION";

export interface OtpEntry {
  code: string;
  expiresAt: number;
  attemptsUsed: number;
}

export type OtpStore = Map<string, OtpEntry>;

export type OtpValidationReason =
  | "OTP_VALID"
  | "OTP_NOT_FOUND"
  | "OTP_EXPIRED"
  | "OTP_INCORRECT"
  | "MAX_ATTEMPTS_REACHED";

export interface SessionInfo {
  email: string;
  startedAt: number;
}

export type AuthEventType =
  | "OTP_GENERATED"
  | "OTP_VALIDATION_SUCCESS"
  | "OTP_VALIDATION_FAILURE"
  | "LOGOUT"
  | "APP_TO_BACKGROUND"
  | "APP_TO_FOREGROUND";

export interface AuthEvent {
  type: AuthEventType;
  createdAt: number;
  payload: Record<string, unknown>;
}
