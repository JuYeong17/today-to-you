"use client";

import { useEffect, useRef, useState } from "react";
import { brand } from "../../config/brand";
import { displayDate } from "../../lib/date";
import type { Mood, MessageType } from "./types";
import { useDailyMessage } from "./use-daily-message";

const moodOptions: { value: Mood; label: string; face: string }[] = [
  { value: "HAPPY", label: "행복", face: "◡" },
  { value: "NORMAL", label: "평범", face: "―" },
  { value: "TIRED", label: "지침", face: "﹏" },
  { value: "SAD", label: "우울", face: "︵" },
  { value: "EXCITED", label: "설렘", face: "◡" },
];
const typeOptions: { value: MessageType; label: string; description: string; icon: string }[] = [
  { value: "FORTUNE", label: "오늘의 운세", description: "어떤 하루가 기다릴까?", icon: "✧" },
  { value: "COMFORT", label: "오늘의 위로", description: "마음에 작은 쉼표 하나", icon: "♡" },
  { value: "REAL_TALK", label: "오늘의 팩폭", description: "따끔함 대신 가벼운 한 걸음", icon: "↗" },
  { value: "HUMOR", label: "오늘의 웃음", description: "피식, 웃고 가도 좋아", icon: "☺" },
];

function Letter({ opened = false }: { opened?: boolean }) {
  return <div className={`letter-art ${opened ? "opened" : ""}`} aria-hidden="true">
    <span className="spark spark-one">✦</span><span className="spark spark-two">✧</span>
    <div className="letter-paper"><span /><span /><b>♡</b></div>
    <div className="envelope"><div className="envelope-front" /><span className="seal">♥</span></div>
    <span className="letter-shadow" />
  </div>;
}

export function DailyMessageApp() {
  const [mood, setMood] = useState<Mood>("NORMAL");
  const [type, setType] = useState<MessageType>("COMFORT");
  const [copyStatus, setCopyStatus] = useState("");
  const { result, ready, drawing, storageWarning, error, date, draw } = useDailyMessage();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const drew = useRef(false);

  useEffect(() => {
    if (result && drew.current) {
      resultHeading.current?.focus();
      drew.current = false;
    }
    setCopyStatus("");
  }, [result]);

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.message);
      setCopyStatus("복사했어! 필요한 곳에 붙여넣어 봐.");
    } catch {
      setCopyStatus("복사가 어려워. 문구를 길게 누르거나 드래그해서 복사해줘.");
    }
  }

  return <div className="site-shell">
    <header className="site-header">
      <a href="/" className="wordmark" aria-label={`${brand.name} 홈`}><svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
        <rect x="3" y="7" width="26" height="19" rx="4" fill="var(--accent-soft)" stroke="currentColor" strokeWidth="1.7" />
        <path d="m5 9 9 7a3.2 3.2 0 0 0 4 0l9-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 23s-4-2.3-4-4.5a2.1 2.1 0 0 1 4-1 2.1 2.1 0 0 1 4 1C20 20.7 16 23 16 23Z" fill="currentColor" />
      </svg>{brand.name}<span className="wordmark-dot">.</span></a>
      <span className="header-note">하루에 한 번, 나를 위한 작은 시간</span>
      <span className="header-tag">A little note for you</span>
    </header>
    <main id="main-content" className="main-content">
      <div className="intro">
        <p className="eyebrow"><span /> TODAY, TO YOU</p>
        <h1>{brand.slogan}</h1>
        <p className="intro-copy">어떤 하루를 보내고 있어?<br />지금 너에게 어울리는 말을 한 장 꺼내봐.</p>
      </div>
      <section className={`message-panel ${result ? "has-result" : ""}`} aria-label={result ? "오늘 받은 한마디" : "오늘의 한마디 선택"}>
        <div className="panel-topline"><span>DAILY NOTE</span><span>{date ? displayDate(date) : "오늘의 작은 편지"}</span></div>
        <Letter opened={!!result} />
        {!ready ? <p className="restore-status" role="status">오늘의 편지함을 확인하고 있어…</p> : result ?
          <div className="result-content">
            <p className="small-label">오늘 너에게 도착한 말</p>
            <h2 ref={resultHeading} tabIndex={-1} className="result-heading">오늘의 한마디</h2>
            <blockquote key={result.message}>{result.message}</blockquote>
            <div className="result-tags"><span>{moodOptions.find((item) => item.value === result.mood)?.label}</span><span>{typeOptions.find((item) => item.value === result.type)?.label}</span></div>
            <button className="primary-button copy-button" onClick={copy}><span aria-hidden="true">▣</span> 문구 복사</button>
            <p className="copy-status" role="status">{copyStatus}</p>
            <div className="tomorrow-note"><span aria-hidden="true">☀</span><p>오늘의 한마디는 여기까지.<br /><strong>한국 시간 자정이 지나면 새 편지를 꺼낼 수 있어.</strong></p></div>
          </div> :
          <form onSubmit={(event) => { event.preventDefault(); drew.current = true; void draw(mood, type); }}>
            <fieldset disabled={drawing} className="mood-fieldset">
              <legend><span className="step-number">01</span>지금 기분은 어때?<span className="optional">선택하지 않으면 평범</span></legend>
              <div className="mood-options">{moodOptions.map((option) => <label key={option.value} className={`mood-option ${mood === option.value ? "selected" : ""}`}>
                <input type="radio" name="mood" value={option.value} checked={mood === option.value} onChange={() => setMood(option.value)} />
                <span className={`mood-face face-${option.value.toLowerCase()}`} aria-hidden="true"><i /><i /><b>{option.face}</b></span><span>{option.label}</span>
              </label>)}</div>
            </fieldset>
            <fieldset disabled={drawing} className="type-fieldset">
              <legend><span className="step-number">02</span>어떤 말이 필요해?</legend>
              <div className="type-options">{typeOptions.map((option) => <label key={option.value} className={`type-option ${type === option.value ? "selected" : ""}`}>
                <input type="radio" name="message-type" value={option.value} checked={type === option.value} onChange={() => setType(option.value)} />
                <span className="type-icon" aria-hidden="true">{option.icon}</span><span className="type-text"><strong>{option.label}</strong><small>{option.description}</small></span><span className="radio-indicator" aria-hidden="true" />
              </label>)}</div>
            </fieldset>
            <button className="primary-button" type="submit" disabled={!ready || drawing}>{drawing ? "너에게 줄 한마디를 고르는 중…" : "오늘의 한마디 뽑기"}<span aria-hidden="true">↗</span></button>
            <p className="draw-caption">가입 없이 가볍게, 하루에 한 장</p>
          </form>}
        {error && <p className="notice" role="alert">{error}</p>}
        {storageWarning && <p className="notice" role="status">브라우저에 저장할 수 없어. 지금 탭에서는 한마디를 유지하지만, 새로고침하면 사라질 수 있어.</p>}
      </section>
      <p className="below-panel"><span aria-hidden="true">♡</span> 오늘의 한마디가 작은 기분 전환이 되길.</p>
    </main>
    <footer><span>{brand.name}</span><p>{brand.englishName} · {brand.slogan}</p></footer>
  </div>;
}
