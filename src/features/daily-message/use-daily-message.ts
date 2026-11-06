"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createDailyMessage } from "./select-message";
import type { DailyMessage, Mood, MessageType } from "./types";
import { koreanDate } from "../../lib/date";
import { runWithOptionalLock } from "../../lib/browser-lock";
import { readToday, saveMessage, STORAGE_KEY } from "../../lib/storage";

export function useDailyMessage() {
  const [result, setResult] = useState<DailyMessage | null>(null);
  const [ready, setReady] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const current = useRef<DailyMessage | null>(null);
  const busy = useRef(false);
  const observedDay = useRef("");

  const restore = useCallback(() => {
    const today = koreanDate();
    let restored: DailyMessage | null = null;
    let available = false;
    try {
      const read = readToday(window.localStorage, today);
      restored = read.message;
      available = read.available;
    } catch { /* Some browsers throw when accessing localStorage itself. */ }
    // Preserve an unsaved result in this tab if storage is blocked or full.
    const previous = current.current;
    current.current = restored
      ? (previous && JSON.stringify(previous) === JSON.stringify(restored) ? previous : restored)
      : (previous?.date === today ? previous : null);
    observedDay.current = today;
    setResult(current.current);
    setDate(today);
    setStorageWarning(!available || (!!current.current && !restored));
    setReady(true);
  }, []);

  useEffect(() => {
    restore();
    const interval = window.setInterval(() => {
      if (koreanDate() !== observedDay.current) restore();
    }, 1000);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) restore();
    };
    const onVisible = () => { if (document.visibilityState === "visible") restore(); };
    window.addEventListener("focus", restore);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", restore);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [restore]);

  async function draw(mood: Mood, type: MessageType) {
    if (busy.current || !ready) return;
    busy.current = true;
    setDrawing(true);
    setError("");
    const choose = () => {
      const today = koreanDate();
      let stored: DailyMessage | null = null;
      try { stored = readToday(window.localStorage, today).message; } catch { /* memory only */ }
      const existing = stored ?? (current.current?.date === today ? current.current : null);
      const message = existing ?? createDailyMessage(mood, type);
      let saved = !!stored;
      if (!existing) {
        try { saved = saveMessage(window.localStorage, message); } catch { saved = false; }
      }
      current.current = message;
      setResult(message);
      setDate(message.date);
      setStorageWarning(!saved);
    };
    try {
      // Coordinate draws in different tabs where Web Locks is supported.
      await runWithOptionalLock(navigator.locks, STORAGE_KEY, choose);
    } catch {
      setError("한마디를 꺼내지 못했어. 잠깐 뒤에 다시 눌러줘.");
    } finally {
      busy.current = false;
      setDrawing(false);
    }
  }
  return { result, ready, drawing, storageWarning, error, date, draw };
}
