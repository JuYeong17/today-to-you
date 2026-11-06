import { messages } from "./messages.ts";
import { moods, messageTypes, type Mood, type MessageType, type DailyMessage } from "./types.ts";
import { koreanDate } from "../../lib/date.ts";

/** Only this provider needs replacing when a remote message source is introduced. */
export function selectMessage(mood: Mood, type: MessageType, random = Math.random): string {
  if (!moods.includes(mood) || !messageTypes.includes(type)) throw new Error("잘못된 선택이야.");
  const choices = messages[mood][type];
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("잘못된 난수야.");
  return choices[Math.floor(value * choices.length)];
}
export function createDailyMessage(mood: Mood, type: MessageType, now = new Date()): DailyMessage {
  return { version: 1, date: koreanDate(now), mood, type, message: selectMessage(mood, type) };
}
