# y2b 영상 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 누구나 가입해 MP4 를 올리고 보는 영상 사이트 (서버 FastAPI + 클라이언트 Vue/Quasar)

**Architecture:** 서버 `tensweb.com:/home/www/html/fa_app/app_y2b` 에 `models/app/y2b` 모델 9개, `library/y2b.py` 공통 모듈, `controllers/api/user/app/y2b/*`·`controllers/api/admin/app/y2b/*` API. 영상 파일은 영구 폴더 `wwwroot/video` 에 두고 nginx 가 정적 제공(Range 지원). 클라이언트는 기존 멀티페이지 구조에 페이지 9개 + 관리자 1개.

**Tech Stack:** Python 3.13.9 / FastAPI / asyncpg / PostgreSQL `a3_y2b` · Vue 3 Options API / Quasar 2 / Vite 7

**Spec:** `docs/superpowers/specs/2026-11-15-y2b-video-site-design.md`

## Global Constraints
- 테이블 접두사 `yt_`, 모델 파일은 `web/models/app/y2b/<테이블명에서 yt_ 뺀 이름>.py`, 기존 `model.Model` 형식(`__table__`, `__columns__`, `__index__`)
- 응답 `{success, message, error:{}}`, 실패는 `error_code` 포함
- `web.json` → `"video": {"transcode": "none", "max_mb": 500}`; transcode 가 `"hls"` 가 아니면 B 경로는 절대 호출되지 않는다
- 업로드 조각 10MB, MP4 만(`ftyp` 확인), 최대 500MB
- 서버 코드는 git 이 아님 → 작업 전 `_backup/20261115_before_y2b` 복사
- 서비스 TZ Asia/Seoul, 날짜는 `now()` naive 로컬값 저장 (alba 와 동일)
- 테스트 프레임워크가 없다 → 각 서버 태스크는 `shell/y2b_smoke.py`(httpx 로 127.0.0.1:15109 호출) 의 해당 단계를 추가해 검증

## Review Focus
1. private/unlisted 영상이 home·search·channel·feed 목록에 나오면 안 된다 → smoke: 비공개 업로드 후 목록 3종에서 없음 확인
2. 남의 영상 수정·삭제·남의 댓글 삭제 시도 → no_permission → smoke 에 포함
3. 조각 순서가 어긋나거나 중간 조각 누락 후 finish → `upload_incomplete` 로 거부, 임시파일 정리
4. MP4 가 아닌 파일(확장자만 .mp4) → `not_mp4` 거부
5. 관리자 숨김(is_hidden=1) 영상은 시청 페이지에서도 본인 외 `no_data` → smoke 에 포함

---

### Task 1: 서버 정리·설정
**Files:** 삭제 `web/library/alba*.py`, `web/controllers/{api/user/app,api/admin/app,admin/app}/alba`, `shell/__*alba*.py` · 수정 `web.json`
- [ ] `_backup/20261115_before_y2b/` 로 `web shell web.json` 복사
- [ ] 알바 파일 삭제, `grep -rl "alba" web shell` 결과가 없어야 함 (CLAUDE.md 는 Task 7 에서 갱신)
- [ ] `web.json` 에 video 설정 추가, `mkdir -p wwwroot/video wwwroot/tmp/y2b_upload`

### Task 2: 모델 + 테이블 생성
**Files:** Create `web/models/app/y2b/{channel,video,comment,reaction,subscription,view,history,report,upload}.py`, `shell/y2b_create_tables.py`
**Produces:** 각 모델 `Model(handler)` + `get_<name>(id)`, `insert_get_id`, `update(id, data)`, `delete(id)` (기본 CRUD 는 alba job.py 형식). 질의 메서드는 Task 4~6 에서 필요한 것만 추가.
- [ ] 컬럼은 spec "데이터" 절 그대로. unique 인덱스: channel.user_id, channel.handle, reaction(video_id,user_id), subscription(channel_id,user_id), view(video_id,user_id,session_key,view_date), history(user_id,video_id)
- [ ] `shell/y2b_create_tables.py` = alba 의 `__create_alba_tables.py` 를 y2b 경로로 (없는 테이블만 생성)
- [ ] 실행 → `yt_` 테이블 9개 생성 확인 (`psql -c "\dt yt_*"`)

### Task 3: 공통 모듈 + B 준비
**Files:** Create `web/library/y2b.py`, `web/library/y2b_transcode.py`, `shell/y2b_transcode_worker.py`
**Produces (`library/y2b.py`):** `now()`, `fail(self, code, msg, error=None)`, `ok(self, data)`, `out/outs/to_db`, `async auth(self) -> (user_id, err)`, `async ensure_channel(self, user_id) -> channel dict`, `async get_video_for(self, video_id, viewer_id) -> video|None` (hidden·private 규칙 적용), `video_cfg(self) -> {'transcode','max_mb'}`, `public_where(alias) -> str` (`visibility='public' and is_hidden=0 and status='ready'`)
**Produces (`y2b_transcode.py`):** `build_hls_cmd(src, out_dir) -> list[str]`, `async transcode(self, video_id)`; 상단 주석에 켜는 방법
- [ ] 작성 후 `python -c "import library.y2b, library.y2b_transcode"` 성공

### Task 4: 업로드·내 채널·내 영상 API
**Files:** `controllers/api/user/app/y2b/upload/{chunk,finish}.py`, `me/channel.py`, `me/videos/index.py`, `me/videos/{video_id}/index.py`
- [ ] chunk: Form(upload_id?, index, total, filename, total_size) + File → 첫 조각이면 yt_upload 생성·upload_id 반환, 조각은 `tmp/y2b_upload/<id>.<index>`
- [ ] finish: Form(upload_id, title, description, visibility, duration) + File(thumbnail jpg) → 조각 합치기·검증 → `wwwroot/video/<yyyymm>/<rand32>.mp4`, 썸네일 `.jpg` 같은 폴더, yt_video insert(status ready, transcode=hls 면 queued) → video_id
- [ ] me/videos GET 목록 / PUT 수정(title, description, visibility, thumbnail) / DELETE (파일까지 삭제, 카운트 갱신)
- [ ] smoke 단계 1: 로그인 → 업로드(소형 mp4) → 목록 → 수정 → 비MP4 거부

### Task 5: 시청·소셜 API
**Files:** `controllers/api/user/app/y2b/{home,search,history,reports}.py`, `videos/{video_id}/{index,view,reaction,comments}.py`, `comments/{comment_id}.py`, `channels/{handle}.py`, `channels/{channel_id}/subscribe.py`, `feed/subscriptions.py`
- [ ] home: `latest`(최신 24), `popular`(7일, view+like*5) / search q / feed / history GET·DELETE
- [ ] videos/{id}: 영상+채널+내 reaction+구독여부+next 12개 / view POST(하루 1회 규칙) / reaction POST value 1·-1·0 / comments GET·POST(parent_id) / comments/{id} DELETE(본인)
- [ ] channels/{handle}: 채널+public 영상 / subscribe POST·DELETE (자기 채널 구독 불가)
- [ ] reports POST(target_type, target_id, reason, memo)
- [ ] smoke 단계 2: Review Focus 1·2·5 포함

### Task 6: 관리자 API
**Files:** `library/y2b_admin.py`(admin_common 으로 auth), `controllers/api/admin/app/y2b/{videos/index.py, videos/{video_id}/hide.py, comments/{comment_id}/hide.py, reports/index.py, reports/{report_id}.py}`, `controllers/admin/app/y2b/main/index.py`
- [ ] hide POST hidden=1|0, reports GET status 필터, reports/{id} POST action=hide|reject
- [ ] smoke 단계 3

### Task 7: 페이지 컨트롤러·서비스 기동
**Files:** `controllers/user/{watch,channel,upload,studio,subscriptions,history,search,mypage}/index.py` (render_html), `CLAUDE.md` 갱신
- [ ] `sudo cp app_y2b.service /etc/systemd/system/ && systemctl enable --now app_y2b` → `curl 127.0.0.1:15109/api/system/health`
- [ ] smoke 전체 통과

### Task 8: 클라이언트 공통
**Files:** `src/app/y2b/api.js`, `src/app/y2b/format.js`(조회수 1.2천, n일 전, 0:00 시간), `src/components/y2b/{comY2bLayout,comVideoCard,comVideoPlayer}.vue`
- [ ] Layout: 상단바(로고→/user/main, 검색→/user/search?q=, 업로드, 로그인/프로필 메뉴) + 왼쪽 메뉴(홈·구독·기록·내 영상), 모바일 접힘
- [ ] Player: `hls_path` 있으면 hls.js(동적 import), 없으면 `<video src=file_path controls>`; 5초 재생 시 `view` emit

### Task 9: 사용자 페이지
**Files:** `public/pages/user/<p>/index.html` + `src/pages/user/<p>/{index.js,App.vue,comIndex.vue}` for main(수정), watch, channel, upload, studio, subscriptions, history, search, mypage(수정)
- [ ] upload: 파일 선택 → mp4·500MB 확인 → canvas 썸네일·duration → 10MB 조각 진행률 → 정보 입력 → finish
- [ ] `npm run build` 성공, `dist/public/pages/user/*` 9개

### Task 10: 관리자 페이지
**Files:** `src/pages/admin/app/y2b/main/comIndex.vue`(탭: 영상 / 신고)
- [ ] build 성공

### Task 11: 확인·배포 준비
- [ ] dev 서버로 실제 흐름(가입→업로드→시청→댓글→구독→신고→관리자 처리) 브라우저 확인 (ego-browser)
- [ ] 배포는 `../aca/deploy/vars/apps.yml` 에 app_y2b 추가가 필요 → 사용자 확인 후
