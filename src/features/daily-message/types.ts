export const moods = ["HAPPY", "NORMAL", "TIRED", "SAD", "EXCITED"] as const;
export const messageTypes = ["FORTUNE", "COMFORT", "REAL_TALK", "HUMOR"] as const;
export type Mood = (typeof moods)[number];
export type MessageType = (typeof messageTypes)[number];
export type DailyMessage = {
  version: 1;
  date: string;
  mood: Mood;
  type: MessageType;
  message: string;
};
export type MessageCatalog = Record<Mood, Record<MessageType, readonly string[]>>;
