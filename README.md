# app_y2b (y2b 웹)

누구나 가입해서 영상을 올리고 보는 유튜브형 영상 사이트의 **웹 프런트** (Vue 3 + Quasar 2 + Vite 멀티페이지).
서버는 `tensweb.com:/home/www/html/fa_app/app_y2b` (`y2b.tensweb.com`, 포트 15109).
설계 `docs/0001-y2b-video-site-design.html` · 구현 계획 `docs/0002-y2b-video-site-plan.html`

## 시작
```
npm install
npm run dev      # /api, /cache, /image, /video → https://y2b.tensweb.com 프록시
npm run build    # dist/
.\deploy.ps1     # 빌드 → 업로드 → 반영 (운영 화면이 바뀐다)
```
서버 API 를 nginx 를 거치지 않고 직접 부르려면 (서버가 떠 있고 nginx 반영 전일 때)
```
ssh -i <키> -N -L 15109:127.0.0.1:15109 ubuntu@tensweb.com     # 다른 창
Y2B_API=http://localhost:15109 npm run dev
```

## 화면
| 경로 | 화면 |
|---|---|
| `/user/main` | 홈 — 이번 주 인기, 최신 영상 |
| `/user/watch?v=<id>` | 시청 — 플레이어, 좋아요/싫어요, 구독, 공유, 신고, 설명, 댓글·답글, 다음 영상 |
| `/user/channel?c=<handle>` | 채널 — 정보, 구독, 영상(최신·인기) |
| `/user/upload` | 업로드 — MP4, 10MB 조각 업로드, 브라우저에서 썸네일·재생 시간 생성 |
| `/user/studio` | 내 영상 — 수정(제목·설명·썸네일·공개 범위), 삭제 |
| `/user/subscriptions` | 구독 채널과 새 영상 |
| `/user/history` | 시청 기록 |
| `/user/search?q=` | 검색 (제목·설명·채널명) |
| `/user/mypage` | 채널 설정 (이름·소개·프로필 사진), 로그아웃 |
| `/admin/app/y2b/main` | 관리자 — 요약, 신고 처리, 영상 숨김 |

## 구조
```
src/
  app/y2b/          api.js(서버 호출 전부) · format.js(표시 형식·상수) · boot.js(페이지 시작) · y2b.css
  components/y2b/   comY2bLayout(상단바·메뉴·로그인 팝업) · comVideoCard · comVideoPlayer(MP4/HLS) ·
                    comComments · comCommentItem · comReportDialog · comAvatar · comNeedLogin
  pages/user/*      위 표의 화면
  pages/admin/app/y2b/main
tools/new_page.mjs  페이지 뼈대 생성
```

## 페이지 추가 순서
1. `node tools/new_page.mjs user/xxx "제목 · y2b"` → `src/pages/user/xxx/comIndex.vue` 작성
2. 서버 `shell/y2b_page_controllers.py` 의 PAGES 에 추가하고 실행

## 배포 전 확인
- `deploy.ps1` 의 `app_y2b` 루트는 서버 쪽 `..\aca\deploy\vars\apps.yml` 에도 있어야 한다 (2026-11-15 기준 없음).
- nginx 가 15109 로 보내는지: `curl https://y2b.tensweb.com/api/user/app/y2b/home` 가 `{"success": 1 ...}`
