# CLAUDE.md — app_y2b 작업 지침

## 프로젝트
y2b 서비스의 **웹 프런트**. app_alba 보일러플레이트(계정·관리자·공통 컴포넌트·빌드/배포 골격)에서 시작했다.
- 서버: `y2b.tensweb.com` (FastAPI, 미정 — 확정되면 수정). API: `/api/user/app/y2b/*`, 로그인 `/api/account/user/login`

## 기술 스택
Vue 3 (Options API) · Quasar 2 · Vuex 4 · Vue Router 4 · mitt(`$emitter`) · Vite 7 멀티페이지

## 규칙
- 페이지 = `public/pages/<경로>/index.html` + `src/pages/<경로>/{index.js,App.vue,comIndex.vue}`
- 서버 호출은 `this.$c.io` 사용, 응답은 `{ success, message, error:{필드:메시지} }` 가정
- 컴포넌트 접두사: `com`(공통) / `el`(page_elements)
- Quasar 컴포넌트 우선, 커스텀 CSS 최소화. 주석은 WHY 가 필요할 때만 한국어로
