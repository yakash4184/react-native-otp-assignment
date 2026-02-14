import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthEvent, AuthEventType } from "../types/auth";

const ANALYTICS_STORAGE_KEY = "auth_events";
const MAX_EVENTS = 150;

async function readEvents(): Promise<AuthEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as AuthEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeEvents(events: AuthEvent[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Keep app flow alive even if storage write fails.
  }
}

export async function initializeAnalytics(): Promise<void> {
  const existing = await readEvents();
  if (!existing.length) {
    await writeEvents([]);
  }
}

export async function logAuthEvent(
  type: AuthEventType,
  payload: Record<string, unknown>
): Promise<AuthEvent> {
  const current = await readEvents();
  const nextEvent: AuthEvent = {
    type,
    createdAt: Date.now(),
    payload
  };

  const updated = [...current, nextEvent].slice(-MAX_EVENTS);
  await writeEvents(updated);

  return nextEvent;
}

export async function getRecentAuthEvents(limit: number = 8): Promise<AuthEvent[]> {
  const items = await readEvents();
  return items.slice(-limit).reverse();
}
