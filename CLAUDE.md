# CLAUDE.md — app_y2b 작업 지침

## 프로젝트
누구나 가입해서 영상을 올리고 보는 **y2b (유튜브형 영상 사이트)** 의 웹 프런트. app_alba 보일러플레이트에서 시작했다.
- 서버: `tensweb.com:/home/www/html/fa_app/app_y2b` (FastAPI, 포트 15109, DB a3_y2b, git 아님 — 서버의 CLAUDE.md 참고)
- 도메인 `y2b.tensweb.com`. API `/api/user/app/y2b/*`, 관리자 `/api/admin/app/y2b/*`, 로그인 `/api/account/user/login`
- 설계·계획 문서: `docs/0001-y2b-video-site-design.html`, `docs/0002-y2b-video-site-plan.html`. 새 문서는 `docs/000N-xxx.html`

## 기술 스택
Vue 3 (Options API) · Quasar 2 · Vuex 4 · mitt(`$emitter`) · Vite 7 멀티페이지 · hls.js(HLS 영상일 때만 동적 로드)

## 규칙
- 페이지 = `public/pages/<경로>/index.html` + `src/pages/<경로>/{index.js,App.vue,comIndex.vue}`. 뼈대는 `node tools/new_page.mjs user/xxx "제목"`,
  서버에도 페이지 컨트롤러가 있어야 한다 (서버 `shell/y2b_page_controllers.py` 의 PAGES)
- y2b 화면은 `src/app/y2b/boot.js` 로 시작하고 `comY2bLayout` 으로 감싼다. 서버 호출은 `src/app/y2b/api.js` 만 쓴다
- 표시 형식(조회수·n일 전·재생 시간)은 `src/app/y2b/format.js`, 색은 `src/app/y2b/y2b.css` 변수
- 로그인이 필요한 동작은 `this.$emitter.emit('login')` 으로 로그인 팝업
- 응답은 `{ success, message, error_code, error:{필드:메시지} }`
- 컴포넌트 접두사: `com`(공통) / `el`(page_elements). Quasar 컴포넌트 우선, 주석은 WHY 가 필요할 때만 한국어로

## 영상·파일 (file_server)
- 영상·썸네일·프로필 이미지는 모두 file_server(`sme0582.duckdns.org`, 앱 `y2b`)에 비공개로 있다. 연동 규칙은 `file_server/docs/0007-앱-연동-가이드.html`
- API 응답의 `file_path`·`thumbnail`·`avatar`·`channel_avatar`·`author_avatar`·`hls_path` 는 보기 토큰이 붙은 완성 주소(약 6시간 유효)다. 그대로 `src` 에 쓰고 저장하거나 고치지 않는다
- 업로드: `api.upload()` 가 `upload/start` → file_server `/api/upload/chunk` 로 10MB 조각 직접 전송(이어 올리기·토큰 갱신 `renew`) → `upload/finish`. 실패하면 `upload/cancel`.
  file_server 관리 화면에서 y2b 의 브라우저 업로드를 켜고 origins 에 사이트 주소(개발이면 `http://localhost:포트`)가 있어야 한다
- 썸네일·재생 시간은 브라우저가 canvas 로 만든다. MP4 그대로 재생하고, 주소가 만료되어 재생 오류가 나면 플레이어가 시청 정보를 다시 받아 이어서 재생한다
- HLS 는 나중에 file_server 업로드 옵션으로 붙인다. 플레이어는 `hls_path` 가 있으면 hls.js 로 재생하고 조각 요청에 범위 토큰을 붙인다
