# y2b — 누구나 올리는 영상 사이트 설계

작성 2026-11-15

## 목적
유튜브처럼 **누구나 가입해서 영상을 올리고 보는 사이트**. 가입 → 채널 자동 생성 → 업로드 → 공개 → 다른 사람이 보고 구독·좋아요·댓글.

## 목표 / 비목표
- 목표: 업로드·재생·홈(최신·인기)·시청 페이지(조회수, 좋아요/싫어요, 댓글, 구독, 다음 영상)·채널·구독 피드·검색·시청 기록·내 영상 관리·신고 / 관리자 숨김·신고 처리
- 비목표: 라이브, 쇼츠, 재생목록, 알림, 수익화, 자막
- 실패로 보는 것: 업로드한 영상이 안 나오거나, 비공개 영상이 목록·검색에 노출되거나, 배포할 때 업로드 영상이 사라지는 것

## 제약
- 서버 tensweb.com, `/home/www/html/fa_app/app_y2b`, FastAPI + asyncpg, DB `a3_y2b`, 포트 15109, 도메인 `y2b.tensweb.com` (nginx 등록 완료)
- 2코어 / 3.8GB / 디스크 여유 38GB, **ffmpeg 없음**, nginx `client_max_body_size 50M`
- 서버 코드는 git 이 아니다 → 작업 전 `_backup/<날짜>_<내용>` 으로 복사
- 배포: 프런트는 `deploy.ps1` → `deploy_front.yml`. `wwwroot/assets`, `wwwroot/pages` 는 rsync, `wwwroot/public` 은 릴리스 심볼릭 링크. **`wwwroot/video` 는 배포가 건드리지 않는 영구 폴더**
- 모델은 `web/models/app/y2b/*.py` 에 만들고 테이블을 먼저 생성한 뒤 서버를 실행한다 (기존 `install.create_table_sql` / `create_index_sqls` 사용)

## 방식 (Approaches)
| | 방식 | 장단점 |
|---|---|---|
| A | 720p MP4 하나로 변환 | 모든 형식 재생, 변환 대기 수 분, ffmpeg 필요 |
| B | HLS 360/720/1080 | 유튜브식 적응 화질, 변환 시간·디스크 3배 |
| **C** | **변환 없이 MP4 만 허용** | 단순·부하 없음, 휴대폰 HEVC/MOV 는 거부 |

**결정(사용자): 실제 운영은 C, B 는 코드만 준비하고 끈다.**
- `web.json` 의 `"video": {"transcode": "none", "max_mb": 500}`. `"hls"` 로 바꾸고 ffmpeg 를 설치하면 B 가 동작.
- B 준비분: `library/y2b_transcode.py` (ffmpeg 명령 구성, 360/720/1080 HLS + master.m3u8, 상태 갱신), `shell/y2b_transcode_worker.py` (status='queued' 를 하나씩 처리하는 루프). 지금은 호출되지 않는다. 플레이어는 영상에 `hls_path` 가 있으면 hls.js 로, 없으면 MP4 로 재생하도록 분기만 둔다.

## 결정된 동작
- **업로드 (C)**: 브라우저가 파일을 10MB 조각으로 나눠 `POST /api/user/app/y2b/upload/chunk` 로 보낸다 (nginx 50M 한도 유지). 마지막 조각 후 `.../upload/finish` 에서 합쳐 MP4 시그니처(`ftyp`)를 확인하고 `wwwroot/video/<yyyymm>/<랜덤32자>.mp4` 로 옮긴다. 확장자 mp4 / 500MB 초과는 거부.
- **썸네일·재생 시간**: 브라우저가 `<video>` + canvas 로 1초 지점을 캡처(jpg)하고 duration 을 읽어 함께 보낸다. 사용자가 이미지 파일로 바꿀 수 있다. (내 판단: ffmpeg 없이 C 를 돌리기 위해)
- **공개 범위**: public(목록·검색 노출) / unlisted(링크로만) / private(본인만). 파일명이 추측 불가한 랜덤이라 nginx 정적 제공으로 충분하다고 본다 (private 영상 파일 URL 을 알면 볼 수 있음 — 수용).
- **조회수**: 시청 페이지에서 5초 이상 재생되면 1회. 같은 사용자(비로그인은 세션)·같은 영상은 하루 1회.
- **채널**: 가입 후 첫 로그인 시 자동 생성 (이름 = 회원 이름, handle = `u<user_id>`). 채널명·소개·프로필 이미지 수정 가능.
- **댓글**: 1단계 답글까지. 본인 삭제, 관리자 숨김.
- **신고**: 영상·댓글 대상, 사유 선택 + 메모. 관리자가 처리(숨김/기각).
- **인기**: 최근 7일 업로드 중 조회수 + 좋아요×5 순.
- **검색**: 제목·설명·채널명 ilike (데이터가 적을 동안 충분, 나중에 tsvector).

## 데이터 (테이블 접두사 `yt_`)
- `yt_channel` channel_id, user_id(unique), name, handle(unique), description, avatar, subscriber_count, video_count, date_added
- `yt_video` video_id, channel_id, user_id, title, description, file_path, file_size, hls_path, duration, thumbnail, visibility, status(ready/queued/processing/failed), is_hidden, view_count, like_count, dislike_count, comment_count, date_added, date_modified
- `yt_comment` comment_id, video_id, user_id, parent_id, content, is_hidden, like_count, date_added
- `yt_reaction` video_id + user_id (unique), value(1/-1)
- `yt_subscription` channel_id + user_id (unique), date_added
- `yt_view` video_id, user_id, session_key, view_date (unique: video_id+user_id+session_key+view_date) — 조회수 중복 방지
- `yt_history` user_id + video_id (unique), date_watched
- `yt_report` report_id, target_type(video/comment), target_id, user_id, reason, memo, status(open/hidden/rejected), date_added, date_done
- `yt_upload` upload_id(랜덤), user_id, filename, total_size, received, date_added — 조각 업로드 진행 상태

## API
- 사용자 `/api/user/app/y2b/`: `home`, `videos/{video_id}`, `videos/{video_id}/view`, `.../reaction`, `.../comments`, `comments/{comment_id}`, `channels/{handle}`, `channels/{channel_id}/subscribe`, `me/channel`, `me/videos`, `me/videos/{video_id}`, `feed/subscriptions`, `history`, `search`, `upload/chunk`, `upload/finish`, `reports`
- 관리자 `/api/admin/app/y2b/`: `videos`, `videos/{id}/hide`, `comments/{id}/hide`, `reports`, `reports/{id}`
- 응답 `{success, message, error:{}}` (기존 규약)

## 화면 (클라이언트 `app_y2b`)
`/user/main`(홈) · `/user/watch?v=` · `/user/channel?c=` · `/user/upload` · `/user/studio`(내 영상) · `/user/subscriptions` · `/user/history` · `/user/search?q=` · `/user/mypage` · `/admin/app/y2b/main`(영상·신고 관리). 공통 상단바(로고, 검색, 업로드, 로그인/프로필)와 왼쪽 메뉴는 공통 컴포넌트. 각 페이지는 서버에 `controllers/user/<경로>/index.py` (render_html) 가 필요하다.

## 정리
- 서버의 알바 코드 삭제: `library/alba*.py`, `controllers/api/user/app/alba`, `controllers/api/admin/app/alba`, `controllers/admin/app/alba`, `shell/__*alba*.py` (백업 후)
- `../aca/deploy/vars/apps.yml` 에 app_y2b 항목이 없다 → 배포 전에 추가 필요 (aca 저장소, 사용자 확인 후)

## 빌더에게 남긴 것
컴포넌트 분할, 정확한 SQL, 스타일(Quasar 기본 + 다크/라이트), 에러 문구.
