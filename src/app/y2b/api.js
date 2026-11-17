// y2b API — 화면은 이 파일만 호출한다. 서버: /api/user/app/y2b/*, /api/admin/app/y2b/*
// 모든 함수는 서버 응답 data({success, message, error_code, ...})를 돌려주는 Promise.
import axios from 'axios'

const U = '/api/user/app/y2b'
const A = '/api/admin/app/y2b'

// file_server 로 조각 하나 (원본 바이트, 쿠키 없이). 진행률 때문에 XHR. → {status, body} (연결 실패는 status 0)
function sendChunk(up, offset, blob, onLoaded) {
  return new Promise((resolve) => {
    const x = new XMLHttpRequest()
    const q = new URLSearchParams({ path: up.path, size: up.size, offset, t: up.t })
    x.open('POST', `${up.url}?${q}`)
    x.setRequestHeader('Content-Type', 'application/octet-stream')
    x.upload.onprogress = (e) => onLoaded(e.loaded || 0)
    x.onload = () => {
      let body = {}
      try { body = JSON.parse(x.responseText) || {} } catch (e) { /* 본문 없음 */ }
      resolve({ status: x.status, body })
    }
    x.onerror = x.ontimeout = () => resolve({ status: 0, body: {} })
    x.send(blob)
  })
}

const data = (p) => p.then((r) => r.data).catch(() => ({ success: 0, message: '서버에 연결할 수 없습니다' }))

function form(params) {
  const f = new FormData()
  for (const k in params) {
    const v = params[k]
    if (v === undefined || v === null) continue
    if (v instanceof Blob) f.append(k, v, v.name || k)
    else f.append(k, String(v))
  }
  return f
}

const get = (url, params) => data(axios.get(url, { params }))
const post = (url, params, opts) => data(axios.post(url, form(params || {}), opts))
const del = (url, params) => data(axios.delete(url, { params }))

export default {
  home: (page = 1) => get(U + '/home', { page }),
  search: (q, page = 1) => get(U + '/search', { q, page }),
  video: (id) => get(`${U}/videos/${id}`),
  view: (id) => post(`${U}/videos/${id}/view`),
  react: (id, value) => post(`${U}/videos/${id}/reaction`, { value }),
  comments: (id, parent_id = 0, page = 1) => get(`${U}/videos/${id}/comments`, { parent_id, page }),
  addComment: (id, content, parent_id = 0) => post(`${U}/videos/${id}/comments`, { content, parent_id }),
  delComment: (cid) => del(`${U}/comments/${cid}`),
  channel: (handle, sort = 'latest', page = 1) => get(`${U}/channels/${encodeURIComponent(handle)}`, { sort, page }),
  subscribe: (handle, on) => (on ? post : del)(`${U}/channels/${encodeURIComponent(handle)}/subscribe`),
  feed: (page = 1) => get(U + '/feed/subscriptions', { page }),
  history: (page = 1) => get(U + '/history', { page }),
  clearHistory: (video_id = 0) => del(U + '/history', { video_id }),
  report: (target_type, target_id, reason, memo) => post(U + '/reports', { target_type, target_id, reason, memo }),
  myChannel: () => get(U + '/me/channel'),
  saveChannel: (params) => post(U + '/me/channel', params),
  myVideos: () => get(U + '/me/videos'),
  saveVideo: (id, params) => post(`${U}/me/videos/${id}`, params),
  deleteVideo: (id) => del(`${U}/me/videos/${id}`),

  // 영상 업로드: y2b 서버에서 경로·업로드 토큰을 받고(start), 10MB 조각을 file_server 로 직접 보낸 뒤(이 서버를 거치지 않음) finish.
  // onProgress(0~1). 반환: finish 응답 또는 실패 응답({success:0, message})
  async upload(file, info, onProgress) {
    let up = await post(U + '/upload/start', { filename: file.name, size: file.size })
    if (!up.success) return up
    const fail = async (r) => {
      await post(U + '/upload/cancel', { token: up.token }) // 열린 업로드 한도(3개)를 바로 비운다
      return r
    }
    let offset = 0
    let retry = 0
    let renewed = false
    for (;;) {
      const end = Math.min(offset + up.chunk, file.size)
      const r = await sendChunk(up, offset, file.slice(offset, end), (n) => onProgress && onProgress((offset + n) / file.size))
      const received = r.body.detail && typeof r.body.detail.received === 'number' ? r.body.detail.received : -1
      if (r.status === 200) {
        retry = 0
        if (r.body.done) break
        offset = r.body.received
      } else if (r.status === 409 && received >= 0 && retry++ < 5) {
        offset = received // 이어 올리기 — file_server 가 받은 곳부터
      } else if (r.status === 403 && !renewed) {
        renewed = true // 업로드 토큰(6시간)이 끝났을 수 있다
        const n = await post(U + '/upload/renew', { token: up.token })
        if (!n.success) return fail(n)
        up = n
      } else if ((r.status === 0 || r.status >= 500) && retry++ < 5) {
        if (received >= 0) offset = received
        await new Promise((ok) => setTimeout(ok, 2000 * retry))
      } else {
        return fail({ success: 0, message: r.status === 0 ? '파일 서버에 연결할 수 없습니다' : `업로드에 실패했습니다 (${r.status})` })
      }
    }
    onProgress && onProgress(1)
    const r = await post(U + '/upload/finish', { token: up.token, ...info })
    return r.success ? r : fail(r)
  },

  admin: {
    videos: (params) => get(A + '/videos', params),
    hideVideo: (id, hidden) => post(`${A}/videos/${id}/hide`, { hidden: hidden ? 1 : 0 }),
    hideComment: (id, hidden) => post(`${A}/comments/${id}/hide`, { hidden: hidden ? 1 : 0 }),
    reports: (params) => get(A + '/reports', params),
    handleReport: (id, action) => post(`${A}/reports/${id}`, { action }),
    // 숨긴 영상도 볼 수 있는 관리자 전용 파일 주소
    mediaUrl: (id, kind = 'file') => `${A}/videos/${id}/media?kind=${kind}`,
  },
}
