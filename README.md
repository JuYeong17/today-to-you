# 오늘, 너에게

**너에게 건네는 한마디**

Today, To You · `today-to-you`

오늘의 기분과 듣고 싶은 말을 고르면 하루에 한 번 짧은 한국어 문구를 건네는 모바일 웹서비스입니다. 1차 MVP는 **사전 작성 문구 200개를 브라우저에서 무작위로 선택**합니다. AI 호출, 서버 API, 데이터베이스와 로그인은 없습니다.

## 주요 기능

- 기분 5가지 × 메시지 유형 4가지, 조합별 10개 문구
- 친구에게 카톡으로 보낼 법한 반말 한 문장, 공백 포함 45자 이내
- 한국 시간 기준 하루 한 번 뽑기와 같은 날 결과 복원
- localStorage 손상 복구, 저장 불가 안내, 동일 탭 중복 방지
- 결과 복사와 복사 실패 시 직접 선택 안내
- 코랄·크림 색상, 모바일 반응형, 키보드 조작과 모션 감소

브랜드 값은 `src/config/brand.ts`에서 관리하며 README, 메인 화면, SEO·Open Graph·Twitter 메타데이터에 동일하게 적용합니다.

## 기술 스택과 구조

Next.js App Router · React · TypeScript · Tailwind CSS · localStorage

```text
src/
  app/                       # 메인 페이지, 메타데이터, CSS
  config/brand.ts             # 브랜드 원본
  features/daily-message/
    daily-message.tsx        # 선택·결과·복사 UI
    use-daily-message.ts     # 일일 흐름, 복원, 중복 방지
    types.ts                 # 기분·유형·결과 모델
    messages.ts              # 사전 작성 문구 200개
    select-message.ts        # 문구 선택·결과 생성
  lib/
    date.ts                  # Asia/Seoul 날짜
    storage.ts               # 검증·저장·조회
tests/                      # 문구·선택·날짜·저장 테스트
docs/                       # 요구사항, 아키텍처, 로드맵, 미래 AI 초안
```

UI, 문구 데이터와 선택 로직, 저장소를 분리했습니다. 향후 공급 방식 변경은 문구 선택 경계에서 진행합니다. 현재 불필요한 SDK, ORM, Redis와 백엔드 계층을 추가하지 않습니다.

## 실행

Node.js 22.18 이상과 npm을 사용합니다. 외부 접근이 필요한 의존성 다운로드는 먼저 사용자 수락을 받습니다.

```sh
npm ci
npm run dev
```

개발 주소: `http://localhost:3000`

**환경변수나 API 키 설정은 필요하지 않습니다.** Gemini 설정과 SDK 설치도 없습니다. 외부 폰트와 분석 서비스도 사용하지 않습니다.

## 검증

```sh
npm test
npm run typecheck
npm run build
```

테스트는 전체 조합의 개수·45자 제한·중복, 선택 범위, 한국 시간 날짜 전환, 저장·복원·손상·접근 및 쓰기 오류를 검증합니다. 자연스러움과 정서적 안전은 별도 편집 검토가 필요합니다. UI는 모바일 폭, 기분·유형 선택, 뽑기·복사, 새로고침 복원, 저장소 차단 및 자정 전환도 확인합니다.

## Vercel 배포

`output: "export"` 설정으로 `npm run build` 시 `out/`에 정적 파일을 만듭니다. [Next.js 공식 정적 내보내기 가이드](https://nextjs.org/docs/app/guides/static-exports)를 기준으로 구성했습니다.

1. 사용자 수락 후 저장소를 Vercel 프로젝트로 가져옵니다.
2. 프레임워크는 Next.js, 빌드 명령은 `npm run build`, 출력 디렉터리는 `out`으로 설정합니다.
3. 환경변수 없이 배포하고 실제 주소에서 복사·재방문을 확인합니다.

현재 배포는 수행하지 않았습니다. 호스팅 요금과 상업적 이용 정책은 배포·수익화 전에 공식 문서로 확인해야 하며, 무료 플랜에서 광고 운영이 가능하다고 가정하지 않습니다. 실제 도메인 확정 후 canonical·공유 URL을 추가합니다.

## 저장과 이용 범위

하루 한 번은 한국 시간 자정과 이 브라우저 저장소 기준입니다. 다른 브라우저 사용, 저장 데이터 삭제와 기기 시계 변경을 막는 보안 제한이 아닙니다. 데이터는 외부 전송하지 않습니다.

저장소가 막혀 있으면 현재 탭에서만 유지하고 안내합니다. Web Locks를 사용할 수 있으면 서로 다른 탭의 뽑기를 직렬화합니다. 잠금이 없거나 접근이 차단되면 현재 탭에서 동작하며, 서로 다른 탭의 동시 충돌은 완전히 보장하지 않습니다. 카탈로그에서 제거된 문구의 저장 결과는 무효 처리됩니다.

## 문서와 다음 단계

- [출시 전 점검 결과](docs/VERIFICATION.md)
- [로컬 브라우저 QA 재현 방법](tests/browser/README.md)
- [개발 규칙](AGENTS.md)
- [요구사항](docs/REQUIREMENTS.md)
- [아키텍처](docs/ARCHITECTURE.md)
- [로드맵](docs/ROADMAP.md)
- [200개 문구 재검토 기록](docs/MESSAGE_REVIEW.md)
- [문구 최종 검수 및 변경 이유](docs/MESSAGE_FINAL_REVIEW.md)
- [미래 AI 프롬프트 초안](docs/AI_PROMPTS.md) — 현재 런타임 미사용

다음 단계는 사용자 피드백에 따른 문구 개선과 배포 검증입니다. 친구에게 보내기, Gemini 또는 DB 공급, 분석·광고는 이후 단계에서 검토합니다.
