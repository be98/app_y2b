// 표시 형식 — 조회수 1.2천 / 3.4만, "3일 전", 재생 시간 1:02:03

export function count(n) {
  n = Number(n) || 0
  const unit = (v, u) => (v >= 10 ? Math.floor(v) : Math.floor(v * 10) / 10) + u
  if (n >= 1e8) return unit(n / 1e8, '억')
  if (n >= 1e4) return unit(n / 1e4, '만')
  if (n >= 1e3) return unit(n / 1e3, '천')
  return String(n)
}

// 서버 시각은 'YYYY-MM-DD HH:mm:ss' (Asia/Seoul)
export function parse(s) {
  if (!s) return null
  const d = new Date(String(s).replace(' ', 'T') + '+09:00')
  return isNaN(d) ? null : d
}

export function ago(s) {
  const d = parse(s)
  if (!d) return ''
  const sec = Math.max(0, (Date.now() - d.getTime()) / 1000)
  const steps = [[60, '초'], [60, '분'], [24, '시간'], [7, '일'], [4.35, '주'], [12, '개월']]
  let v = sec
  for (const [size, name] of steps) {
    if (v < size) return Math.floor(v) + name + ' 전'
    v /= size
  }
  return Math.floor(v) + '년 전'
}

export function date(s) {
  const d = parse(s)
  return d ? `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.` : ''
}

export function duration(sec) {
  sec = Math.max(0, Math.floor(Number(sec) || 0))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = String(sec % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export function bytes(n) {
  n = Number(n) || 0
  if (n >= 1024 ** 3) return (n / 1024 ** 3).toFixed(1) + 'GB'
  if (n >= 1024 ** 2) return (n / 1024 ** 2).toFixed(1) + 'MB'
  return Math.ceil(n / 1024) + 'KB'
}

export const VISIBILITY = [
  { value: 'public', label: '공개', icon: 'public', desc: '누구나 검색하고 볼 수 있습니다' },
  { value: 'unlisted', label: '일부 공개', icon: 'link', desc: '링크가 있는 사람만 볼 수 있습니다' },
  { value: 'private', label: '비공개', icon: 'lock', desc: '나만 볼 수 있습니다' },
]
export const visibilityLabel = (v) => (VISIBILITY.find((x) => x.value === v) || {}).label || v

export const REPORT_REASONS = [
  { value: 'spam', label: '스팸 또는 오해의 소지' },
  { value: 'sexual', label: '성적인 콘텐츠' },
  { value: 'violence', label: '폭력적이거나 혐오스러운 콘텐츠' },
  { value: 'hate', label: '증오 또는 괴롭힘' },
  { value: 'copyright', label: '저작권 침해' },
  { value: 'etc', label: '기타' },
]
export const reasonLabel = (v) => (REPORT_REASONS.find((x) => x.value === v) || {}).label || v

export const query = (name) => new URLSearchParams(location.search).get(name) || ''
export const watchUrl = (id) => '/user/watch?v=' + id
export const channelUrl = (handle) => '/user/channel?c=' + encodeURIComponent(handle)
