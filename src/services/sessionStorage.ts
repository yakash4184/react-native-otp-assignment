import AsyncStorage from "@react-native-async-storage/async-storage";
import { SessionInfo } from "../types/auth";

const SESSION_STORAGE_KEY = "active_session";

export async function saveSession(session: SessionInfo): Promise<void> {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<SessionInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SessionInfo;
    if (!parsed?.email || !parsed?.startedAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}
