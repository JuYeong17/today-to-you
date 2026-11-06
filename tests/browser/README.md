# 로컬 브라우저 QA

추가 패키지나 외부 서비스 없이 실제 정적 빌드에서 예외 상황을 재현하는 도구다. 운영 코드에는 테스트 스위치나 테스트 경로를 추가하지 않는다.

```sh
npm run build
node tests/browser/prepare.mjs
python3 -m http.server 3000 --bind 127.0.0.1 --directory out
```

`http://127.0.0.1:3000/__qa/?qa=normal`에 접속한다. 아래 모드는 쿼리의 `qa` 값을 변경해 선택한다.

| 모드 | 재현 조건 |
| --- | --- |
| normal | 실제 브라우저 API, 저장 횟수 표시, 빠른 5회 제출 |
| midnight | 한국 시간 23:59:58 고정, 자정 이동·다음 날 focus 이벤트 버튼 |
| blocked | localStorage 접근과 Web Locks 요청이 SecurityError로 차단됨 |
| quota | localStorage 쓰기가 QuotaExceededError로 실패함 |
| corrupt | JSON이 손상된 저장값에서 시작 |
| copy-failure | 복사 요청이 NotAllowedError로 거부됨 |
| clipboard-missing | Clipboard API 미지원 |
| no-locks | Web Locks 미지원 |

자정 모드는 테스트 문서의 Date만 바꾸며 시스템 시계를 변경하지 않는다. 차단·권한·저장 한도는 테스트 문서 안에서 브라우저 API를 대체해 재현한다. 두 탭 테스트는 normal 모드로 실제 브라우저의 Web Locks와 공유 localStorage를 사용한다.

초기화 버튼은 localhost의 이 서비스 저장 키만 삭제한다. midnight·copy 관련 모드는 접속할 때 고정 문구를 저장한다. quota·blocked·corrupt 모드는 접속할 때 기존 결과를 지운다. 재방문 복원 테스트는 normal 모드에서 수행한다.

도구의 저장 횟수는 해당 문서에서 앱이 호출한 setItem 횟수이며 초기 fixture 저장은 제외한다. 새로고침하면 카운터가 초기화된다.

**테스트가 끝나면 서버를 종료하고 `npm run build`를 다시 실행한다.** 이 명령은 `out/`을 새로 생성해 `__qa` 테스트 파일을 제거한다. `out/__qa/`가 남아 있는 산출물은 배포하지 않는다. 이 도구는 수동 조작용 fixture이며 자동 E2E 테스트 실행기로 표기하지 않는다.
