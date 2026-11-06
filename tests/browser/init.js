/* Local browser QA fixture. Injected only into out/__qa/ by prepare.mjs. */
(() => {
  const mode = new URLSearchParams(location.search).get("qa") || "normal";
  const key = "today-to-you:daily-message:v1";
  const nativeStorage = window.localStorage;
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  let writes = 0;
  let virtualNow = new Date("2026-11-06T14:59:58Z").getTime();
  if (mode === "midnight") {
    const RealDate = Date;
    window.Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : [virtualNow])); }
      static now() { return virtualNow; }
    };
  }
  if (["midnight", "copy-failure", "clipboard-missing"].includes(mode)) {
    nativeSet.call(nativeStorage, key, JSON.stringify({ version: 1, date: mode === "midnight" ? "2026-11-06" : new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date()), mood: "TIRED", type: "COMFORT", message: "오늘은 조금 느리게 가도 괜찮아." }));
  } else if (["blocked", "quota", "corrupt"].includes(mode)) {
    nativeRemove.call(nativeStorage, key);
    if (mode === "corrupt") nativeSet.call(nativeStorage, key, "{broken");
  }
  Storage.prototype.setItem = function (name, value) {
    if (name === key) {
      writes++;
      if (mode === "quota") throw new DOMException("QA quota exceeded", "QuotaExceededError");
    }
    return nativeSet.call(this, name, value);
  };
  if (mode === "blocked") {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("QA storage blocked", "SecurityError"); } });
    Object.defineProperty(navigator, "locks", { value: { request() { return Promise.reject(new DOMException("QA locks blocked", "SecurityError")); } } });
  }
  if (mode === "copy-failure") Object.defineProperty(navigator, "clipboard", { value: { writeText() { return Promise.reject(new DOMException("QA clipboard denied", "NotAllowedError")); } } });
  if (mode === "clipboard-missing") Object.defineProperty(navigator, "clipboard", { value: undefined });
  if (mode === "no-locks") Object.defineProperty(navigator, "locks", { value: undefined });

  document.addEventListener("DOMContentLoaded", () => {
    const panel = document.createElement("aside");
    panel.setAttribute("aria-label", "로컬 QA 도구");
    panel.style.cssText = "position:relative;padding:16px;background:#edf5ff;color:#123;font:13px sans-serif;border:2px solid #456;z-index:20";
    const title = document.createElement("strong");
    title.textContent = `로컬 QA: ${mode}`;
    panel.append(title);
    const state = document.createElement("p");
    state.setAttribute("data-qa-state", "true");
    panel.append(state);
    function button(label, action) {
      const b = document.createElement("button"); b.textContent = label;
      b.style.cssText = "border:1px solid #456;border-radius:6px;padding:8px;margin:4px;background:white;color:#123";
      b.onclick = action; panel.append(b);
    }
    button("QA 저장 초기화", () => { nativeRemove.call(nativeStorage, key); location.reload(); });
    button("QA 자정으로 이동", () => { virtualNow = new Date("2026-11-06T15:00:00Z").getTime(); });
    button("QA 다음날 복귀", () => { virtualNow = new Date("2026-11-07T15:00:00Z").getTime(); window.dispatchEvent(new Event("focus")); });
    button("QA 빠르게 5회 제출", () => {
      const form = document.querySelector("form");
      for (let i = 0; i < 5; i++) form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    document.body.append(panel);
    function update() {
      let saved = "접근 불가";
      try { saved = window.localStorage.getItem(key) || "없음"; } catch {}
      state.textContent = `저장 시도: ${writes} / Web Locks: ${!!navigator.locks} / 시각: ${new Date().toISOString()} / 저장값: ${saved}`;
    }
    setInterval(update, 200); update();
  });
})();
