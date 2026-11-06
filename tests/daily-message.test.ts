import test from "node:test";
import assert from "node:assert/strict";
import { messages } from "../src/features/daily-message/messages.ts";
import { moods, messageTypes, type Mood, type MessageType } from "../src/features/daily-message/types.ts";
import { selectMessage, createDailyMessage } from "../src/features/daily-message/select-message.ts";
import { koreanDate } from "../src/lib/date.ts";
import { readToday, saveMessage, STORAGE_KEY, type StoragePort } from "../src/lib/storage.ts";

function memoryStorage(): StoragePort {
  const data = new Map<string, string>();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); }, removeItem: (key) => { data.delete(key); } };
}
const now = new Date("2026-11-06T03:00:00Z");

test("all twenty combinations have ten distinct, short Korean sentences", () => {
  const all: string[] = [];
  for (const mood of moods) for (const type of messageTypes) {
    const choices = messages[mood][type];
    assert.equal(choices.length, 10, `${mood}/${type}`);
    assert.equal(new Set(choices).size, 10, `${mood}/${type} duplicates`);
    for (const text of choices) {
      assert.ok([...text].length <= 45, `${text}: ${[...text].length}`);
      assert.equal(text, text.trim());
      assert.match(text, /[가-힣]/u);
      assert.match(text, /^[^.!?\n]+[.!?]$/u);
      assert.doesNotMatch(text, /["'#]|\p{Extended_Pictographic}/u);
      assert.doesNotMatch(text, /(습니다|세요|해요|돼요|예요|이에요)[.!?]$/u);
      all.push(text);
    }
  }
  assert.equal(all.length, 200);
  assert.equal(new Set(all).size, 200);
});

test("random selection maps every bucket to the chosen combination", () => {
  for (const mood of moods) for (const type of messageTypes) {
    const choices = messages[mood][type];
    for (let i = 0; i < 10; i++) assert.equal(selectMessage(mood, type, () => (i + 0.5) / 10), choices[i]);
    assert.equal(selectMessage(mood, type, () => 0), choices[0]);
    assert.equal(selectMessage(mood, type, () => 0.999999), choices[9]);
  }
});

test("selection rejects unknown choices and invalid random values", () => {
  assert.throws(() => selectMessage("INVALID" as Mood, "COMFORT"));
  assert.throws(() => selectMessage("NORMAL", "INVALID" as MessageType));
  for (const random of [-1, 1, NaN, Infinity]) assert.throws(() => selectMessage("NORMAL", "COMFORT", () => random));
});

test("Korean date changes at 15:00 UTC, including year and leap day boundaries", () => {
  assert.equal(koreanDate(new Date("2026-11-06T14:59:59.999Z")), "2026-11-06");
  assert.equal(koreanDate(new Date("2026-11-06T15:00:00.000Z")), "2026-11-07");
  assert.equal(koreanDate(new Date("2026-12-31T15:00:00Z")), "2027-01-01");
  assert.equal(koreanDate(new Date("2028-02-28T15:00:00Z")), "2028-02-29");
  assert.equal(koreanDate(new Date("2026-11-06T00:00:00-08:00")), "2026-11-06");
});

test("result preserves mood/type and Korean calendar date", () => {
  const result = createDailyMessage("SAD", "REAL_TALK", now);
  assert.equal(result.version, 1);
  assert.equal(result.date, "2026-11-06");
  assert.equal(result.mood, "SAD");
  assert.equal(result.type, "REAL_TALK");
  assert.ok((messages.SAD.REAL_TALK as readonly string[]).includes(result.message));
});

test("same-day visits return exactly the saved result, next day returns none", () => {
  const storage = memoryStorage();
  assert.deepEqual(readToday(storage, "2026-11-06"), { message: null, available: true });
  const result = createDailyMessage("TIRED", "COMFORT", now);
  assert.equal(saveMessage(storage, result), true);
  for (let i = 0; i < 5; i++) assert.deepEqual(readToday(storage, "2026-11-06").message, result);
  assert.equal(readToday(storage, "2026-11-07").message, null);
});

test("corrupt JSON and untrusted saved data are discarded safely", () => {
  const storage = memoryStorage();
  const valid = createDailyMessage("NORMAL", "FORTUNE", now);
  for (const raw of ["{broken", "null", "[]", JSON.stringify({ ...valid, version: 2 }), JSON.stringify({ ...valid, mood: "BAD" }), JSON.stringify({ ...valid, type: "BAD" }), JSON.stringify({ ...valid, date: "bad" }), JSON.stringify({ ...valid, message: "任意" }), JSON.stringify({ ...valid, message: messages.SAD.COMFORT[0] })]) {
    storage.setItem(STORAGE_KEY, raw);
    assert.deepEqual(readToday(storage, "2026-11-06"), { message: null, available: true });
    assert.equal(storage.getItem(STORAGE_KEY), null);
  }
});

test("blocked storage and quota failures do not throw", () => {
  const blocked: StoragePort = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("QuotaExceededError"); }, removeItem() { throw new Error("SecurityError"); } };
  assert.deepEqual(readToday(blocked, "2026-11-06"), { message: null, available: false });
  assert.equal(saveMessage(blocked, createDailyMessage("HAPPY", "HUMOR", now)), false);
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, "{");
  assert.equal(readToday({ ...storage, removeItem() { throw new Error("blocked"); } }, "2026-11-06").available, false);
});
