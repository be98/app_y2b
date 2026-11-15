// 학원 LMS 로그인 공유 로직.
// comLogin 페이지와 메인 화면의 LoginModal이 "같은 코드 경로"를 쓰도록 분리한다(중복 금지).
// UI(로딩/에러표시/페이지 이동)는 호출측이 담당하고, 여기서는 인증과 store/localStorage 세팅만 한다.

export function normalizeHost(host) {
  return String(host || '').replace(/^https?:\/\//i, '')
}

// 로그인 수행. 성공 시 store.state.user 와 localStorage(host/user_name)까지 세팅한다.
// 반환: { success:true } 또는 { success:false, error:{필드:메시지}, message:'' }
export async function login($c, store, form) {
  const host = normalizeHost(form.host)
  // 모바일 앱에는 dev 프록시가 없으므로 절대 host를 직접 지정한다. (브라우저에서는 건드리지 않음)
  if ($c.io.is_mobile) {
    $c.io.host = 'https://' + host
  }

  const res = await $c.io.post('/api/account/login', form)
  const data = res.data
  if (!data.success) {
    return { success: false, error: data.error || {}, message: data.message || '' }
  }

  window.localStorage.setItem('host', host)
  window.localStorage.setItem('user_name', form.user_name)

  const infoRes = await $c.io.get('/api/account/user/info', {})
  const info = infoRes.data
  if (info && info.success) {
    const u = store.state.user
    store.state.user_id = info.user_prof.user_id
    u.a_name = info.user_prof.a_name
    u.user_group_id = info.user_prof.user_group_id
    u.user_id = info.user_prof.user_id
    u.user_name = info.user_prof.user_name
  }
  return { success: true }
}
