// y2b API — 화면은 이 파일만 호출한다. 서버: /api/user/app/y2b/*, /api/admin/app/y2b/*
// 모든 함수는 서버 응답 data({success, message, error_code, ...})를 돌려주는 Promise.
import axios from 'axios'

const U = '/api/user/app/y2b'
const A = '/api/admin/app/y2b'
export const CHUNK = 10 * 1024 * 1024 // 서버 library/y2b.py CHUNK 와 같은 값

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

  // 조각 업로드. onProgress(0~1). 반환: finish 응답 또는 실패한 조각의 응답
  async upload(file, info, onProgress) {
    const chunks = Math.ceil(file.size / CHUNK)
    let token = ''
    for (let i = 0; i < chunks; i++) {
      const part = file.slice(i * CHUNK, (i + 1) * CHUNK)
      const r = await post(U + '/upload/chunk', { token, index: i, filename: file.name, total_size: file.size, chunk: part }, {
        onUploadProgress: (e) => onProgress && onProgress((i * CHUNK + (e.loaded || 0)) / file.size),
      })
      if (!r.success) return r
      token = r.token
    }
    onProgress && onProgress(1)
    return post(U + '/upload/finish', { token, ...info })
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
