import { moods, messageTypes, type DailyMessage } from "../features/daily-message/types.ts";
import { messages } from "../features/daily-message/messages.ts";

export const STORAGE_KEY = "today-to-you:daily-message:v1";
export type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type ReadResult = { message: DailyMessage | null; available: boolean };

export function isDailyMessage(value: unknown): value is DailyMessage {
  if (!value || typeof value !== "object") return false;
  const item = value as DailyMessage;
  if (item.version !== 1 || typeof item.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) return false;
  if (!moods.includes(item.mood) || !messageTypes.includes(item.type)) return false;
  return typeof item.message === "string" && (messages[item.mood][item.type] as readonly string[]).includes(item.message);
}
export function readToday(storage: StoragePort, date: string): ReadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { message: null, available: true };
    let value: unknown;
    try { value = JSON.parse(raw); } catch { storage.removeItem(STORAGE_KEY); return { message: null, available: true }; }
    if (!isDailyMessage(value)) {
      storage.removeItem(STORAGE_KEY);
      return { message: null, available: true };
    }
    return { message: value.date === date ? value : null, available: true };
  } catch { return { message: null, available: false }; }
}
export function saveMessage(storage: StoragePort, message: DailyMessage): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(message)); return true; }
  catch { return false; }
}
