# 아키텍처

## 결정

Next.js App Router + TypeScript + Tailwind CSS를 사용한다. `output: "export"`로 정적 HTML/CSS/JS를 `out/`에 생성한다. 런타임 서버, API Route와 환경변수는 없다.

```text
정적 페이지 / 브랜드 메타데이터
  └─ DailyMessageApp (UI, 선택, 복사)
      └─ useDailyMessage (복원, 중복 방지, 자정 갱신)
          ├─ createDailyMessage → selectMessage → messages.ts
          ├─ koreanDate (Asia/Seoul)
          └─ readToday / saveMessage → localStorage
```

## 책임

| 파일 | 역할 |
| --- | --- |
| src/config/brand.ts | 서비스명·슬로건·설명 원본 |
| src/app/layout.tsx | 한국어 문서, SEO·Open Graph·Twitter 메타데이터 |
| src/features/daily-message/daily-message.tsx | 선택·결과 화면, 복사와 복사 실패 안내 |
| src/features/daily-message/use-daily-message.ts | 일일 흐름과 브라우저 이벤트, 메모리 유지 |
| src/features/daily-message/types.ts | 기분·유형·저장 모델 |
| src/features/daily-message/messages.ts | 조합별 검수 문구 200개 |
| src/features/daily-message/select-message.ts | 순수 무작위 선택과 결과 생성 |
| src/lib/date.ts | 한국 시간 날짜 키와 표시 |
| src/lib/storage.ts | 저장 데이터 검증, 조회·저장 실패 처리 |

## 저장과 경계 조건

키는 `today-to-you:daily-message:v1`이며 `{ version: 1, date, mood, type, message }`를 저장한다. 날짜 키는 브라우저 로케일과 무관하게 한국 시간 `YYYY-MM-DD`로 만든다.

초기 HTML은 저장값 확인 상태로 내보내고, 마운트 후 브라우저 저장소를 읽어 화면 깜빡임과 수화 불일치를 피한다. 오늘 값이 있으면 새로 선택하지 않는다. 저장 전 다시 읽어 다른 탭의 기존 결과도 존중한다. 같은 탭의 중복 실행은 ref로 막는다. Web Locks에 접근할 수 있으면 탭 간 생성 구간을 직렬화한다. API가 없거나 잠금 획득이 차단되면 현재 탭에서 처리하며 탭 간 직렬화는 보장하지 않는다. 잠금 안에서 작업 자체가 실패했을 때는 중복 실행하지 않는다. storage 이벤트로 탭 간 결과를 반영한다.

열린 화면은 날짜를 매초 비교하고 날짜가 바뀔 때 저장값을 갱신한다. focus와 visibilitychange에서도 확인한다. 지난 날짜의 결과는 사용하지 않는다. 저장소가 막히거나 가득 차면 메모리 결과를 유지하며 사용자에게 한계를 알린다.

저장 데이터는 현재 카탈로그에 실제로 있는 문구인지 확인한다. 카탈로그를 수정해 기존 문구를 제거하면 그 문구의 저장 결과는 무효가 된다. 따라서 문구 제거 배포 시 같은 날 재선택이 가능해질 수 있다.

## 향후 확장

원격 방식 도입 시 선택 함수 경계를 비동기 제공 함수로 바꾸고 훅의 호출부를 조정한다. UI는 동일한 기분·유형·문구 모델을 사용한다. 그 시점에만 서버에서 Gemini 키를 관리하거나 DB를 연결한다. 아직 사용하지 않는 Repository 인터페이스나 SDK는 만들지 않는다.

AI_PROMPTS.md는 문서 초안이며 현재 번들·문구 선택에서 사용하지 않는다.

## 배포

`npm run build` → `out/` 정적 호스팅. Vercel에서 Next.js 프로젝트로 가져오고 빌드 명령은 `npm run build`, 출력 디렉터리는 `out`으로 설정한다. 환경변수는 필요 없다. 배포 및 외부 접근은 사용자 수락 이후에만 수행한다.

참고: [Next.js 공식 정적 내보내기 문서](https://nextjs.org/docs/app/guides/static-exports).
